import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middlewares/authMiddleware';

// Enregistrer une dépense d'exploitation
export const createExpense = async (req: AuthRequest, res: Response) => {
  console.log("createExpense payload:", req.body); // Log pour debugger
  try {
    const barId = req.barId; // FIX: c'était req.bar.Id ce qui causait une erreur "undefined"
    if (!barId) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    // Le frontend ExpenseManager envoie { description, amount }
    // L'ancien code s'attendait à { motif, montant, categorie }
    const { description, amount, categorie, motif, montant } = req.body;
    
    const finalMotif = description || motif;
    const finalMontant = amount !== undefined ? amount : montant;

    if (!finalMotif || finalMontant === undefined) {
      return res.status(400).json({ message: "Motif et montant sont obligatoires." });
    }

    const expense = await prisma.expense.create({
      data: {
        barId,
        motif: finalMotif,
        montant: parseFloat(finalMontant),
        categorie: categorie || "CHARGES"
      }
    });

    return res.status(201).json({ message: "Dépense enregistrée", expense });
  } catch (error: any) {
    console.error("Erreur createExpense:", error);
    return res.status(500).json({ message: "Erreur lors de l'enregistrement de la dépense", error: error.message });
  }
};

// Récupérer la liste des dépenses
export const getExpenses = async (req: AuthRequest, res: Response) => {
  try {
    const barId = req.barId; // FIX: req.barId
    if (!barId) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    const expenses = await prisma.expense.findMany({
      where: { barId },
      orderBy: { createdAt: 'desc' }
    });

    // Mapper pour le frontend qui attend { id, description, amount, date, createdAt }
    const mappedExpenses = expenses.map(e => ({
      id: e.id,
      description: e.motif,
      amount: e.montant,
      date: e.createdAt.toISOString(),
      createdAt: e.createdAt.toISOString()
    }));

    return res.status(200).json(mappedExpenses);
  } catch (error: any) {
    console.error("Erreur getExpenses:", error);
    return res.status(500).json({ message: "Erreur lors de la récupération des dépenses", error: error.message });
  }
};

// Déclarer une casse ou une perte de stock
export const recordLoss = async (req: AuthRequest, res: Response) => {
  try {
    const barId = req.barId; // FIX: req.barId
    if (!barId) {
      return res.status(401).json({ message: "Non autorisé" });
    }
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
    console.error("Erreur recordLoss:", error);
    return res.status(500).json({ message: "Erreur lors de l'enregistrement de la perte", error: error.message });
  }
};