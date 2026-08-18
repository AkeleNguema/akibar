import { Response } from 'express';
import { prisma } from '../config/prisma';

export const getBarProducts = async (req: any, res: Response): Promise<void> => {
  const barId = req.barId || req.bar?.id;

  if (!barId) {
    res.status(401).json({ error: 'Établissement non authentifié.' });
    return;
  }

  try {
    const products = await prisma.product.findMany({
      where: { barId },
      include: {
        stocks: {
          where: { barId }
        }
      }
    });

    res.json(products);
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des produits.' });
  }
};