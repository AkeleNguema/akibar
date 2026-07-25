import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getBarProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  const barId = req.barId;

  try {
    const stocks = await prisma.stock.findMany({
      where: { barId },
      include: {
        product: true,
      },
    });

    res.json(stocks);
  } catch (error) {
    console.error('Erreur lors de la récupération du stock:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des produits.' });
  }
};