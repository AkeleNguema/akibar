import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getOwnerDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  const barId = req.barId;

  if (!barId) {
    res.status(401).json({ error: 'Non autorisé' });
    return;
  }

  try {
    const now = new Date();
    
    // Dates pour filtres
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)); // Lundi
    weekStart.setHours(0, 0, 0, 0);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const last30Days = new Date(now);
    last30Days.setDate(now.getDate() - 30);
    last30Days.setHours(0, 0, 0, 0);

    // CA Journalier
    const dailySales = await prisma.sale.aggregate({
      where: { barId, createdAt: { gte: todayStart } },
      _sum: { totalAmount: true }
    });

    // CA Hebdomadaire
    const weeklySales = await prisma.sale.aggregate({
      where: { barId, createdAt: { gte: weekStart } },
      _sum: { totalAmount: true }
    });

    // CA Mensuel
    const monthlySales = await prisma.sale.aggregate({
      where: { barId, createdAt: { gte: monthStart } },
      _sum: { totalAmount: true }
    });

    // Ventes et calcul bénéfice (30 derniers jours)
    const recentSaleItems = await prisma.saleItem.findMany({
      where: {
        sale: {
          barId,
          createdAt: { gte: last30Days }
        }
      },
      include: { product: true }
    });

    let netProfit30Days = 0;
    const topProductsMap: Record<string, { nom: string; qty: number; revenue: number }> = {};

    recentSaleItems.forEach(item => {
      // Benefice net: (PrixVente - PrixAchat) * quantite
      const profit = (item.prixUnitaireVente - item.prixUnitaireAchat) * item.quantite;
      netProfit30Days += profit;

      if (!topProductsMap[item.productId]) {
        topProductsMap[item.productId] = { nom: item.product.nom, qty: 0, revenue: 0 };
      }
      topProductsMap[item.productId].qty += item.quantite;
      topProductsMap[item.productId].revenue += item.prixUnitaireVente * item.quantite;
    });

    const topProducts = Object.values(topProductsMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    // Ardoises en cours (Créances)
    const pendingDebts = await prisma.sale.aggregate({
      where: { barId, paymentMode: 'ARDOISE', status: 'EN_ATTENTE' },
      _sum: { totalAmount: true }
    });

    // Valeur marchande du stock
    const stocks = await prisma.stock.findMany({
      where: { barId },
      include: { product: true }
    });

    let stockValue = 0;
    stocks.forEach(stock => {
      stockValue += stock.quantiteBouteilles * stock.product.prixVenteBouteille;
    });

    const totalCashIn = await prisma.sale.aggregate({
      where: { barId, paymentMode: { in: ['ESPECES', 'AIRTEL_MONEY', 'MOOV_MONEY'] }, status: 'PAYE' },
      _sum: { totalAmount: true }
    });

    const totalExpenses = await prisma.expense.aggregate({
      where: { barId },
      _sum: { montant: true }
    });

    const availableCash = (totalCashIn._sum.totalAmount || 0) - (totalExpenses._sum.montant || 0);

    // Historique des clôtures (les 10 dernières)
    const recentClosures = await prisma.cashClosing.findMany({
      where: { barId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Evolution des ventes par jour (30 derniers jours)
    const salesEvolutionRaw = await prisma.$queryRaw<any[]>`
      SELECT DATE("createdAt") as date, SUM("totalAmount") as total
      FROM "Sale"
      WHERE "barId" = ${barId} AND "createdAt" >= ${last30Days}
      GROUP BY DATE("createdAt")
      ORDER BY DATE("createdAt") ASC
    `;

    res.json({
      dailySales: dailySales._sum.totalAmount || 0,
      weeklySales: weeklySales._sum.totalAmount || 0,
      monthlySales: monthlySales._sum.totalAmount || 0,
      netProfit30Days,
      pendingDebts: pendingDebts._sum.totalAmount || 0,
      stockValue,
      availableCash,
      topProducts,
      recentClosures,
      salesEvolution: salesEvolutionRaw
    });

  } catch (error) {
    console.error('Erreur getOwnerDashboardStats:', error);
    res.status(500).json({ error: 'Erreur lors du chargement des statistiques propriétaire.' });
  }
};
