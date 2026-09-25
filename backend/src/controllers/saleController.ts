import { Response } from 'express';
import { prisma } from '../config/prisma';
import { Prisma } from '@prisma/client';
import { AuthRequest } from '../middlewares/authMiddleware';
import { notifyStockAlert } from '../services/notificationService';

export const createSale = async (req: AuthRequest, res: Response): Promise<void> => {
  console.log("createSale payload:", req.body); // Log pour diagnostiquer le payload envoyé par le frontend
  const barIdRaw = req.barId;
  const { items, paymentMode, nomClient, totalAmount: frontendTotal, syncId, tableId, consigneCasiers } = req.body;

  if (!barIdRaw) {
    res.status(401).json({ error: 'Bar non identifié.' });
    return;
  }
  const barId = barIdRaw; // Typé comme string strict

  // Le frontend CashRegister envoie 'items'
  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: 'Panier vide ou invalide.' });
    return;
  }

  try {
    // 💡 IDEMPOTENCE: Si un syncId est fourni, vérifier si la vente n'existe pas déjà
    if (syncId) {
      const existingSale = await prisma.sale.findUnique({
        where: { syncId },
        include: { items: true }
      });

      if (existingSale) {
        console.log(`Vente déjà enregistrée (syncId: ${syncId}). Renvoi de la réponse précédente.`);
        res.status(200).json({
          message: 'Vente déjà synchronisée.',
          data: { sale: existingSale },
        });
        return;
      }
    }

    const saleResult = await prisma.$transaction(
      async (tx) => {
        let calculatedTotal = 0;
        const saleItemsData: any[] = [];

        // Boucle sur les articles du panier
        for (const item of items) {
          const product = await tx.product.findUnique({
            where: { id: item.productId },
          });

          if (!product) {
            throw new Error(`Produit introuvable: ${item.productId}`);
          }

          const stock = await tx.stock.findFirst({
            where: { barId, productId: item.productId },
          });

          const quantite = Number(item.quantite);
          if (isNaN(quantite) || quantite <= 0) {
            throw new Error(`Quantité invalide pour le produit: ${item.productId}`);
          }

          if (!stock || stock.quantiteBouteilles < quantite) {
            throw new Error(`Stock insuffisant pour: ${product.nom}`);
          }

          // Calcul des prix
          const prixUnitaireVente = product.prixVenteBouteille;
          const prixUnitaireAchat = product.bouteillesParCasier > 0 ? (product.prixAchatCasier / product.bouteillesParCasier) : 0;
          calculatedTotal += prixUnitaireVente * quantite;

          // Déduire les bouteilles vendues du stock
          const newStock = stock.quantiteBouteilles - quantite;
          await tx.stock.update({
            where: { id: stock.id },
            data: {
              quantiteBouteilles: newStock,
            },
          });

          if (newStock <= product.seuilStockBas) {
            await notifyStockAlert(barId, product.nom, newStock);
          }

          saleItemsData.push({
            productId: item.productId,
            quantite: quantite,
            prixUnitaireVente,
            prixUnitaireAchat,
            typeVente: item.typeVente || 'VENTE',
          });

          if (item.typeVente && item.typeVente !== 'VENTE') {
            await tx.auditLog.create({
              data: {
                barId,
                action: `DECLARATION_${item.typeVente}`,
                details: `${quantite}x ${product.nom} déclaré comme ${item.typeVente}`
              }
            });
            // Pour perte/casse/offert, on ne compte pas ça dans le total de la vente
            calculatedTotal -= (prixUnitaireVente * quantite);
          }
        }
        
        // S'assurer que le total n'est pas négatif
        calculatedTotal = Math.max(0, calculatedTotal);

        // Ajout montant consigne si applicable
        if (consigneCasiers && Number(consigneCasiers) > 0) {
          if (!nomClient) throw new Error("Le nom du client est requis pour enregistrer une consigne.");
          calculatedTotal += Number(consigneCasiers) * 2000; // 2000 FCFA par casier
        }

        // Créer la vente principale avec tous les articles
        const sale = await tx.sale.create({
          data: {
            barId,
            totalAmount: calculatedTotal,
            paymentMode: paymentMode || 'ESPECES',
            status: paymentMode === 'ARDOISE' ? 'EN_ATTENTE' : 'PAYE',
            nomClient: nomClient || null,
            syncId: syncId || null,
            tableId: tableId || null,
            items: {
              create: saleItemsData,
            },
          },
          include: {
            items: true,
          },
        });

        if (consigneCasiers && Number(consigneCasiers) > 0 && nomClient) {
          await tx.consigne.create({
            data: {
              barId,
              nomClient: nomClient,
              nombreCasiers: Number(consigneCasiers),
              statut: 'EN_COURS'
            }
          });
        }

        // Si la vente provient d'une table, libérer la table
        if (tableId) {
          await tx.table.update({
            where: { id: tableId },
            data: {
              status: 'LIBRE',
              currentCart: Prisma.JsonNull,
            },
          });
        }

        return { sale };
      },
      {
        maxWait: 10000,
        timeout: 15000,
      }
    );

    res.status(201).json({
      message: 'Vente enregistrée avec succès !',
      data: saleResult,
    });
  } catch (error: any) {
    console.error('Erreur complète lors de la vente:', error);
    res.status(400).json({ error: error.message || 'Erreur lors de la vente.', details: error.stack });
  }
};

export const cancelSale = async (req: AuthRequest, res: Response): Promise<void> => {
  const barId = req.barId;
  const { id } = req.params;
  const { reason } = req.body;

  if (!barId) {
    res.status(401).json({ error: 'Non autorisé' });
    return;
  }

  try {
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: { items: true }
    });

    if (!sale || sale.barId !== barId) {
      res.status(404).json({ error: 'Vente introuvable' });
      return;
    }

    await prisma.$transaction(async (tx) => {
      // Restaurer le stock
      for (const item of sale.items) {
        const stock = await tx.stock.findFirst({
          where: { barId, productId: item.productId }
        });
        if (stock) {
          await tx.stock.update({
            where: { id: stock.id },
            data: { quantiteBouteilles: { increment: item.quantite } }
          });
        }
      }

      await tx.sale.delete({ where: { id } });

      await tx.auditLog.create({
        data: {
          barId,
          action: 'ANNULATION_VENTE',
          details: JSON.stringify({ saleId: id, total: sale.totalAmount, reason })
        }
      });
    });

    res.status(200).json({ message: 'Vente annulée avec succès' });
  } catch (error: any) {
    console.error('Erreur cancelSale:', error);
    res.status(500).json({ error: 'Erreur lors de l\'annulation de la vente' });
  }
};