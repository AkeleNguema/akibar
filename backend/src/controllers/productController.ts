import { Response } from 'express';
import { prisma } from '../config/prisma';

export const getBarProducts = async (req: any, res: Response): Promise<void> => {
  const barId = req.barId || req.bar?.id;

  if (!barId) {
    res.status(401).json({ error: 'Établissement non authentifié.' });
    return;
  }

  try {
    let products = await prisma.product.findMany({
      where: { barId },
      include: {
        stocks: {
          where: { barId }
        }
      }
    });

    if (products.length === 0) {
      const defaultCatalogue = [
        { nom: 'Régab', categorie: 'Bières', bouteillesParCasier: 24, prixAchatCasier: 10000, prixVenteBouteille: 600, seuilStockBas: 2 },
        { nom: 'Castel', categorie: 'Bières', bouteillesParCasier: 24, prixAchatCasier: 12000, prixVenteBouteille: 700, seuilStockBas: 2 },
        { nom: '33 Export', categorie: 'Bières', bouteillesParCasier: 24, prixAchatCasier: 10000, prixVenteBouteille: 600, seuilStockBas: 2 },
        { nom: 'Beaufort', categorie: 'Bières', bouteillesParCasier: 24, prixAchatCasier: 12000, prixVenteBouteille: 700, seuilStockBas: 2 },
        { nom: 'Coca Cola', categorie: 'Sucreries', bouteillesParCasier: 24, prixAchatCasier: 9000, prixVenteBouteille: 500, seuilStockBas: 2 },
        { nom: 'Fanta', categorie: 'Sucreries', bouteillesParCasier: 24, prixAchatCasier: 9000, prixVenteBouteille: 500, seuilStockBas: 2 },
        { nom: 'Djino', categorie: 'Sucreries', bouteillesParCasier: 24, prixAchatCasier: 9000, prixVenteBouteille: 500, seuilStockBas: 2 },
      ];

      await prisma.product.createMany({
        data: defaultCatalogue.map(p => ({
          ...p,
          barId
        }))
      });

      products = await prisma.product.findMany({
        where: { barId },
        include: {
          stocks: {
            where: { barId }
          }
        }
      });
    }

    res.json(products);
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des produits.' });
  }
};