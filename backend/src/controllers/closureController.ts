import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

// Obtenir le résumé théorique de la journée en cours
export const getDailySummary = async (req: any, res: Response) => {
  try {
    const barId = req.bar.id;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const sales = await prisma.sale.aggregate({
      where: {
        barId,
        createdAt: { gte: startOfDay },
        paymentMode: "ESPECES"
      },
      _sum: { totalAmount: true }
    });

    const expenses = await prisma.expense.aggregate({
      where: {
        barId,
        createdAt: { gte: startOfDay }
      },
      _sum: { montant: true }
    });

    const totalVentes = sales._sum.totalAmount || 0;
    const totalDepenses = expenses._sum.montant || 0;
    const montantAttendu = totalVentes - totalDepenses;

    return res.status(200).json({
      totalVentes,
      totalDepenses,
      montantAttendu
    });
  } catch (error: any) {
    return res.status(500).json({ message: "Erreur lors du calcul du bilan journalier", error: error.message });
  }
};

// Valider la clôture Z
export const createClosure = async (req: any, res: Response) => {
  try {
    const barId = req.bar.Id;
    const { montantReel } = req.body;

    if (montantReel === undefined) {
      return res.status(400).json({ message: "Le montant réel compté est obligatoire." });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const sales = await prisma.sale.aggregate({
      where: {
        barId,
        createdAt: { gte: startOfDay },
        paymentMode: "ESPECES"
      },
      _sum: { totalAmount: true }
    });

    const expenses = await prisma.expense.aggregate({
      where: {
        barId,
        createdAt: { gte: startOfDay }
      },
      _sum: { montant: true }
    });

    const montantAttendu = (sales._sum.totalAmount || 0) - (expenses._sum.montant || 0);
    const ecart = parseFloat(montantReel) - montantAttendu;

    const closure = await prisma.cashClosing.create({
      data: {
        barId,
        montantAttendu,
        montantReel: parseFloat(montantReel),
        ecart
      }
    });

    return res.status(201).json({ message: "Clôture de caisse enregistrée avec succès", closure });
  } catch (error: any) {
    return res.status(500).json({ message: "Erreur lors de la clôture de caisse", error: error.message });
  }
};