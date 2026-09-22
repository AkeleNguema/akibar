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

    const lastClosing = await prisma.cashClosing.findFirst({
      where: { barId },
      orderBy: { createdAt: 'desc' }
    });
    
    // Si pas de clôture précédente, on prend le début de la journée, sinon la date de la dernière clôture
    const startSession = lastClosing ? lastClosing.createdAt : (() => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d;
    })();

    const cashSalesAgg = await prisma.sale.aggregate({
      where: { 
        barId, 
        paymentMode: "ESPECES",
        OR: [
          { createdAt: { gt: startSession } },
          { paidAt: { gt: startSession } }
        ]
      },
      _sum: { totalAmount: true }
    });

    const mmSalesAgg = await prisma.sale.aggregate({
      where: { barId, createdAt: { gt: startSession }, paymentMode: { in: ["AIRTEL_MONEY", "MOOV_MONEY"] } },
      _sum: { totalAmount: true }
    });

    const debtSalesAgg = await prisma.sale.aggregate({
      where: { barId, createdAt: { gt: startSession }, paymentMode: "ARDOISE" },
      _sum: { totalAmount: true }
    });

    const cashSales = cashSalesAgg._sum.totalAmount || 0;
    const mobileMoneySales = mmSalesAgg._sum.totalAmount || 0;
    const debtSales = debtSalesAgg._sum.totalAmount || 0;
    const totalSales = cashSales + mobileMoneySales + debtSales;

    const expensesAgg = await prisma.expense.aggregate({
      where: { barId, createdAt: { gt: startSession } },
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

    const lastClosing = await prisma.cashClosing.findFirst({
      where: { barId },
      orderBy: { createdAt: 'desc' }
    });
    const startSession = lastClosing ? lastClosing.createdAt : (() => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d;
    })();

    const cashSalesAgg = await prisma.sale.aggregate({
      where: { 
        barId, 
        paymentMode: "ESPECES",
        OR: [
          { createdAt: { gt: startSession } },
          { paidAt: { gt: startSession } }
        ]
      },
      _sum: { totalAmount: true }
    });

    const expensesAgg = await prisma.expense.aggregate({
      where: { barId, createdAt: { gt: startSession } },
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

    // Lier toutes les ventes sans cashClosingId à cette clôture (les ventes de cette session)
    await prisma.sale.updateMany({
      where: { barId, cashClosingId: null },
      data: { cashClosingId: closure.id }
    });

    // Lier toutes les dépenses sans cashClosingId à cette clôture
    await prisma.expense.updateMany({
      where: { barId, cashClosingId: null },
      data: { cashClosingId: closure.id }
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

// Obtenir le détail des opérations de la journée en cours
export const getDailyDetails = async (req: AuthRequest, res: Response) => {
  try {
    const barId = req.barId;
    if (!barId) {
      return res.status(401).json({ message: "Non autorisé" });
    }

    const lastClosing = await prisma.cashClosing.findFirst({
      where: { barId },
      orderBy: { createdAt: 'desc' }
    });
    const startSession = lastClosing ? lastClosing.createdAt : (() => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d;
    })();

    const cashSales = await prisma.sale.findMany({
      where: { 
        barId, 
        paymentMode: "ESPECES",
        OR: [
          { createdAt: { gt: startSession } },
          { paidAt: { gt: startSession } }
        ]
      },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    });

    const debtSales = await prisma.sale.findMany({
      where: { barId, createdAt: { gt: startSession }, paymentMode: "ARDOISE" },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    });

    const expenses = await prisma.expense.findMany({
      where: { barId, createdAt: { gt: startSession } },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({
      cashSales,
      debtSales,
      expenses
    });
  } catch (error: any) {
    console.error("Erreur getDailyDetails:", error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

// Obtenir le rapport financier sur une période
export const getFinancialReport = async (req: AuthRequest, res: Response) => {
  try {
    const barId = req.barId;
    if (!barId) return res.status(401).json({ message: "Non autorisé" });

    const { startDate, endDate } = req.query;
    
    // Si pas de dates fournies, on prend par défaut les 30 derniers jours
    const start = startDate ? new Date(startDate as string) : new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate ? new Date(endDate as string) : new Date();

    const cashSales = await prisma.sale.aggregate({
      where: { barId, createdAt: { gte: start, lte: end }, paymentMode: "ESPECES" },
      _sum: { totalAmount: true }
    });

    const mobileMoneySales = await prisma.sale.aggregate({
      where: { barId, createdAt: { gte: start, lte: end }, paymentMode: { in: ["AIRTEL_MONEY", "MOOV_MONEY"] } },
      _sum: { totalAmount: true }
    });

    const debtSales = await prisma.sale.aggregate({
      where: { barId, createdAt: { gte: start, lte: end }, paymentMode: "ARDOISE" },
      _sum: { totalAmount: true }
    });

    const expenses = await prisma.expense.aggregate({
      where: { barId, createdAt: { gte: start, lte: end } },
      _sum: { montant: true }
    });

    const journal = await prisma.sale.findMany({
      where: { barId, createdAt: { gte: start, lte: end } },
      orderBy: { createdAt: 'desc' },
      include: { items: true }
    });

    return res.status(200).json({
      period: { start, end },
      cashSales: cashSales._sum.totalAmount || 0,
      mobileMoneySales: mobileMoneySales._sum.totalAmount || 0,
      debtSales: debtSales._sum.totalAmount || 0,
      expenses: expenses._sum.montant || 0,
      journal
    });
  } catch (error: any) {
    console.error("Erreur getFinancialReport:", error);
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};