import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middlewares/authMiddleware';

// Obtenir le résumé théorique de la journée en cours
export const getDailySummary = async (req: AuthRequest, res: Response) => {
  try {
    const barId = req.barId; // FIX: auth middleware sets req.barId
    if (!barId) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const cashSalesAgg = await prisma.sale.aggregate({
      where: { barId, createdAt: { gte: startOfDay }, paymentMode: "ESPECES" },
      _sum: { totalAmount: true }
    });

    const mmSalesAgg = await prisma.sale.aggregate({
      where: { barId, createdAt: { gte: startOfDay }, paymentMode: { in: ["AIRTEL_MONEY", "MOOV_MONEY"] } },
      _sum: { totalAmount: true }
    });

    const debtSalesAgg = await prisma.sale.aggregate({
      where: { barId, createdAt: { gte: startOfDay }, paymentMode: "ARDOISE" },
      _sum: { totalAmount: true }
    });

    const cashSales = cashSalesAgg._sum.totalAmount || 0;
    const mobileMoneySales = mmSalesAgg._sum.totalAmount || 0;
    const debtSales = debtSalesAgg._sum.totalAmount || 0;
    const totalSales = cashSales + mobileMoneySales + debtSales;

    const expensesAgg = await prisma.expense.aggregate({
      where: { barId, createdAt: { gte: startOfDay } },
      _sum: { montant: true }
    });

    const totalExpenses = expensesAgg._sum.montant || 0;
    const expectedCash = cashSales - totalExpenses; // Le cash attendu = ventes espèces - dépenses du jour

    return res.status(200).json({
      totalSales,
      totalExpenses,
      cashSales,
      mobileMoneySales,
      debtSales,
      expectedCash,
      date: new Date().toISOString()
    });
  } catch (error: any) {
    console.error("Erreur getDailySummary:", error);
    return res.status(500).json({ message: "Erreur lors du calcul du bilan journalier", error: error.message });
  }
};

// Valider la clôture Z
export const createClosure = async (req: AuthRequest, res: Response) => {
  try {
    const barId = req.barId;
    if (!barId) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    // Le frontend envoie `actualCash` (et `comments`), le backend l'ancien code voulait `montantReel`
    const { actualCash, montantReel, comments } = req.body;
    const finalMontantReel = actualCash !== undefined ? actualCash : montantReel;

    if (finalMontantReel === undefined) {
      return res.status(400).json({ message: "Le montant réel compté est obligatoire." });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const cashSalesAgg = await prisma.sale.aggregate({
      where: { barId, createdAt: { gte: startOfDay }, paymentMode: "ESPECES" },
      _sum: { totalAmount: true }
    });

    const expensesAgg = await prisma.expense.aggregate({
      where: { barId, createdAt: { gte: startOfDay } },
      _sum: { montant: true }
    });

    const cashSales = cashSalesAgg._sum.totalAmount || 0;
    const totalExpenses = expensesAgg._sum.montant || 0;
    
    const montantAttendu = cashSales - totalExpenses;
    const ecart = parseFloat(finalMontantReel) - montantAttendu;

    const closure = await prisma.cashClosing.create({
      data: {
        barId,
        montantAttendu,
        montantReel: parseFloat(finalMontantReel),
        ecart,
      }
    });

    // 💡 Optionnel: si commentaires fournis, on pourrait les loguer
    if (comments) {
      await prisma.auditLog.create({
         data: { barId, action: "CLOTURE_JOURNEE", details: `Commentaire: ${comments}` }
      });
    }

    return res.status(201).json({ message: "Clôture de caisse enregistrée avec succès", closure });
  } catch (error: any) {
    console.error("Erreur createClosure:", error);
    return res.status(500).json({ message: "Erreur lors de la clôture de caisse", error: error.message });
  }
};