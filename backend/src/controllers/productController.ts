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
      where: { barId, isActive: true },
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
        where: { barId, isActive: true },
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

export const addProduct = async (req: any, res: Response): Promise<void> => {
  const barId = req.barId || req.bar?.id;
  if (!barId) {
    res.status(401).json({ error: 'Établissement non authentifié.' });
    return;
  }
  const { nom, categorie, bouteillesParCasier, prixAchatCasier, prixVenteBouteille, seuilStockBas } = req.body;
  
  try {
    const newProduct = await prisma.product.create({
      data: {
        barId,
        nom,
        categorie,
        bouteillesParCasier: Number(bouteillesParCasier),
        prixAchatCasier: Number(prixAchatCasier),
        prixVenteBouteille: Number(prixVenteBouteille),
        seuilStockBas: Number(seuilStockBas) || 12
      }
    });
    
    await prisma.stock.create({
      data: {
        barId,
        productId: newProduct.id,
        quantiteBouteilles: 0,
        casiersVides: 0
      }
    });
    
    res.status(201).json(newProduct);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Une boisson avec ce nom existe déjà.' });
      return;
    }
    console.error(error);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

export const updateProduct = async (req: any, res: Response): Promise<void> => {
  const barId = req.barId || req.bar?.id;
  if (!barId) {
    res.status(401).json({ error: 'Établissement non authentifié.' });
    return;
  }
  const id = req.params.id;
  const { nom, categorie, bouteillesParCasier, prixAchatCasier, prixVenteBouteille, seuilStockBas } = req.body;
  
  try {
    const updated = await prisma.product.update({
      where: { id },
      data: {
        nom,
        categorie,
        bouteillesParCasier: Number(bouteillesParCasier),
        prixAchatCasier: Number(prixAchatCasier),
        prixVenteBouteille: Number(prixVenteBouteille),
        seuilStockBas: Number(seuilStockBas)
      }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

export const deleteProduct = async (req: any, res: Response): Promise<void> => {
  const barId = req.barId || req.bar?.id;
  if (!barId) {
    res.status(401).json({ error: 'Établissement non authentifié.' });
    return;
  }
  const id = req.params.id;
  try {
    await prisma.product.update({
      where: { id },
      data: { isActive: false }
    });
    res.json({ message: 'Boisson désactivée avec succès.' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};