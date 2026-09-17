import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middlewares/authMiddleware';

export const createSale = async (req: AuthRequest, res: Response): Promise<void> => {
  console.log("createSale payload:", req.body); // Log pour diagnostiquer le payload envoyé par le frontend
  const barId = req.barId;
  const { items, paymentMode, nomClient, totalAmount: frontendTotal, syncId } = req.body;

  if (!barId) {
    res.status(401).json({ error: 'Bar non identifié.' });
    return;
  }

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
        const saleItemsData = [];

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

          if (!stock || stock.quantiteBouteilles < item.quantite) {
            throw new Error(`Stock insuffisant pour: ${product.nom}`);
          }

          // Calcul des prix
          const prixUnitaireVente = product.prixVenteBouteille;
          const prixUnitaireAchat = product.prixAchatCasier / product.bouteillesParCasier;
          calculatedTotal += prixUnitaireVente * item.quantite;

          // Déduire les bouteilles vendues du stock
          await tx.stock.update({
            where: { id: stock.id },
            data: {
              quantiteBouteilles: { decrement: item.quantite },
            },
          });

          saleItemsData.push({
            productId: item.productId,
            quantite: item.quantite,
            prixUnitaireVente,
            prixUnitaireAchat,
            typeVente: 'VENTE',
          });
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
            items: {
              create: saleItemsData,
            },
          },
          include: {
            items: true,
          },
        });

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
    console.error('Erreur lors de la vente:', error);
    res.status(400).json({ error: error.message || 'Erreur lors de la vente.' });
  }
};