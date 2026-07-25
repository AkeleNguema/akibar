import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

// Enregistrer une dépense d'exploitation
export const createExpense = async (req: any, res: Response) => {
  try {
    const barId = req.bar.Id;
    const { motif, montant, categorie } = req.body;

    if (!motif || !montant) {
      return res.status(400).json({ message: "Motif et montant sont obligatoires." });
    }

    const expense = await prisma.expense.create({
      data: {
        barId,
        motif,
        montant: parseFloat(montant),
        categorie: categorie || "CHARGES"
      }
    });

    return res.status(201).json({ message: "Dépense enregistrée", expense });
  } catch (error: any) {
    return res.status(500).json({ message: "Erreur lors de l'enregistrement de la dépense", error: error.message });
  }
};

// Récupérer la liste des dépenses
export const getExpenses = async (req: any, res: Response) => {
  try {
    const barId = req.bar.id;
    const expenses = await prisma.expense.findMany({
      where: { barId },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json(expenses);
  } catch (error: any) {
    return res.status(500).json({ message: "Erreur lors de la récupération des dépenses", error: error.message });
  }
};

// Déclarer une casse ou une perte de stock
export const recordLoss = async (req: any, res: Response) => {
  try {
    const barId = req.bar.id;
    const { productId, quantite } = req.body;

    if (!productId || !quantite) {
      return res.status(400).json({ message: "Produit et quantité perdue requis." });
    }

    const updatedStock = await prisma.stock.update({
      where: {
        barId_productId: {
          barId,
          productId
        }
      },
      data: {
        quantiteBouteilles: { decrement: parseInt(quantite) }
      }
    });

    return res.status(200).json({ message: "Perte/casse enregistrée et stock mis à jour", stock: updatedStock });
  } catch (error: any) {
    return res.status(500).json({ message: "Erreur lors de l'enregistrement de la perte", error: error.message });
  }
};