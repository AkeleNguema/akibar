import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

export const createDebt = async (req: any, res: Response) => {
  console.log("createDebt payload:", req.body); // Log de la requête
  try {
    const barId = req.bar?.id || req.bar?.Id || req.body.barId || req.barId;
    
    // Support des deux formats (depuis CashRegister ou DebtManager)
    const { nomClient, clientNom, clientName, customerName, montant, amount, totalAmount, note, notes, items } = req.body;

    const name = nomClient || clientNom || clientName || customerName;
    const finalAmount = Number(totalAmount || amount || montant);
    const finalNotes = note || notes;

    if (!barId) {
      return res.status(401).json({ message: "Établissement non identifié." });
    }

    if (!name || isNaN(finalAmount) || finalAmount <= 0) {
      return res.status(400).json({ message: "Le nom du client et un montant valide sont requis." });
    }

    // Validation stricte sur les items si fournis
    if (items !== undefined && (!Array.isArray(items) || items.length === 0)) {
      return res.status(400).json({ message: "La liste des produits (items) doit contenir au moins un produit valide." });
    }

    const saleResult = await prisma.$transaction(async (tx) => {
      const saleItemsData = [];
      let calculatedAmount = finalAmount;

      if (items && Array.isArray(items) && items.length > 0) {
        calculatedAmount = 0;
        for (const item of items) {
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (!product) throw new Error(`Produit introuvable: ${item.productId}`);

          const stock = await tx.stock.findFirst({ where: { barId, productId: item.productId } });
          if (!stock || stock.quantiteBouteilles < item.quantite) {
            throw new Error(`Stock insuffisant pour: ${product.nom}`);
          }

          const prixUnitaireVente = product.prixVenteBouteille;
          const prixUnitaireAchat = product.prixAchatCasier / product.bouteillesParCasier;
          calculatedAmount += prixUnitaireVente * item.quantite;

          await tx.stock.update({
            where: { id: stock.id },
            data: { quantiteBouteilles: { decrement: item.quantite } },
          });

          saleItemsData.push({
            productId: item.productId,
            quantite: item.quantite,
            prixUnitaireVente,
            prixUnitaireAchat,
            typeVente: 'VENTE',
          });
        }
      }

      const newDebt = await tx.sale.create({
        data: {
          barId,
          totalAmount: calculatedAmount, // FIX: totalAmount au lieu de montantTotal
          paymentMode: "ARDOISE",
          nomClient: name,
          status: "EN_ATTENTE",
          items: saleItemsData.length > 0 ? { create: saleItemsData } : undefined
        },
        include: { items: true }
      });

      return newDebt;
    });

    console.log("createDebt success:", saleResult); // Log de la réponse
    return res.status(201).json(saleResult);
  } catch (error: any) {
    console.error("Erreur createDebt:", error);
    return res.status(400).json({ message: "Erreur lors de la création de l'ardoise", error: error.message });
  }
};

// 2. Récupérer toutes les ventes sous forme d'ardoises (non payées)
export const getActiveDebts = async (req: any, res: Response) => {
  try {
    const barId = req.bar?.id || req.bar?.Id || req.query.barId || req.barId;

    if (!barId) {
      return res.status(401).json({ message: "Établissement non identifié." });
    }

    const activeDebts = await prisma.sale.findMany({
      where: {
        barId,
        paymentMode: "ARDOISE",
        status: "EN_ATTENTE"
      },
      include: {
        items: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Mapper pour correspondre au type Debt attendu par le frontend DebtManager.tsx
    const mappedDebts = activeDebts.map(sale => ({
      id: sale.id,
      customerName: sale.nomClient,
      amount: sale.totalAmount,
      remainingAmount: sale.totalAmount, // Simplification pour l'instant
      status: sale.status === 'EN_ATTENTE' ? 'UNPAID' : sale.status === 'PARTIEL' ? 'PARTIAL' : 'PAID',
      notes: '',
      createdAt: sale.createdAt.toISOString(),
      items: sale.items.map(item => ({
        productName: item.product.nom,
        quantity: item.quantite,
        unitPrice: item.prixUnitaireVente,
        subtotal: item.quantite * item.prixUnitaireVente
      }))
    }));

    return res.status(200).json(mappedDebts);
  } catch (error: any) {
    console.error("Erreur getActiveDebts:", error);
    return res.status(500).json({ message: "Erreur lors de la récupération des ardoises", error: error.message });
  }
};

// 3. Marquer une ardoise comme réglée
export const payDebt = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { paymentMode } = req.body; // ESPECES, AIRTEL_MONEY, MOOV_MONEY

    const saleExistante = await prisma.sale.findUnique({
      where: { id }
    });

    if (!saleExistante) {
      return res.status(404).json({ message: "Ardoise introuvable" });
    }

    const updatedSale = await prisma.sale.update({
      where: { id },
      data: {
        status: "PAYE",
        paymentMode: paymentMode || saleExistante.paymentMode,
        paidAt: new Date()
      }
    });

    return res.status(200).json({ message: "Ardoise réglée avec succès", sale: updatedSale });
  } catch (error: any) {
    console.error("Erreur payDebt:", error);
    return res.status(500).json({ message: "Erreur lors du règlement de l'ardoise", error: error.message });
  }
};

export const deleteDebt = async (req: any, res: Response) => {
  try {
    const barId = req.barId || req.bar?.id;
    const { id } = req.params;
    const { reason } = req.body;

    if (!barId) {
      return res.status(401).json({ message: "Établissement non identifié." });
    }

    const sale = await prisma.sale.findUnique({ where: { id } });
    if (!sale || sale.barId !== barId) {
      return res.status(404).json({ message: "Ardoise introuvable" });
    }

    await prisma.$transaction(async (tx) => {
      await tx.sale.delete({ where: { id } });
      await tx.auditLog.create({
        data: {
          barId,
          action: 'EFFACEMENT_ARDOISE',
          details: JSON.stringify({ debtId: id, client: sale.nomClient, amount: sale.totalAmount, reason })
        }
      });
    });

    return res.status(200).json({ message: "Ardoise effacée avec succès" });
  } catch (error: any) {
    console.error("Erreur deleteDebt:", error);
    return res.status(500).json({ message: "Erreur lors de l'effacement de l'ardoise", error: error.message });
  }
};