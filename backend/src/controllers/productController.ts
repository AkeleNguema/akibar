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
        { nom: 'Castel 65cl', categorie: 'Bière', modeConditionnement: 'CASIER', bouteillesParCasier: 24, prixAchatCasier: 10000, prixAchatUnitaire: null, prixVenteBouteille: 600, seuilStockBas: 24 },
        { nom: 'Régab 65cl', categorie: 'Bière', modeConditionnement: 'CASIER', bouteillesParCasier: 24, prixAchatCasier: 10000, prixAchatUnitaire: null, prixVenteBouteille: 600, seuilStockBas: 24 },
        { nom: 'Coca-Cola 60cl', categorie: 'Soda', modeConditionnement: 'CASIER', bouteillesParCasier: 24, prixAchatCasier: 9000, prixAchatUnitaire: null, prixVenteBouteille: 500, seuilStockBas: 24 },
        { nom: 'Andza 1.5L', categorie: 'Eau', modeConditionnement: 'CASIER', bouteillesParCasier: 12, prixAchatCasier: 6000, prixAchatUnitaire: null, prixVenteBouteille: 800, seuilStockBas: 12 },
        { nom: 'Bordeaux Rouge', categorie: 'Vin rouge', modeConditionnement: 'UNITE', bouteillesParCasier: null, prixAchatCasier: null, prixAchatUnitaire: 2000, prixVenteBouteille: 3000, seuilStockBas: 6 }
      ];

      for (const prod of defaultCatalogue) {
        const createdProd = await prisma.product.create({
          data: {
            barId,
            nom: prod.nom,
            categorie: prod.categorie,
            modeConditionnement: prod.modeConditionnement,
            bouteillesParCasier: prod.bouteillesParCasier,
            prixAchatCasier: prod.prixAchatCasier,
            prixAchatUnitaire: prod.prixAchatUnitaire,
            prixVenteBouteille: prod.prixVenteBouteille,
            seuilStockBas: prod.seuilStockBas
          }
        });
        const initialStock = prod.modeConditionnement === 'UNITE' 
          ? 50 
          : (prod.bouteillesParCasier || 24) * 2;

        await prisma.stock.create({
          data: {
            barId,
            productId: createdProd.id,
            quantiteBouteilles: initialStock,
            casiersVides: 0
          }
        });
      }

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
  const { nom, categorie, modeConditionnement, bouteillesParCasier, prixAchatCasier, prixAchatUnitaire, prixVenteBouteille, seuilStockBas } = req.body;
  
  try {
    const newProduct = await prisma.product.create({
      data: {
        barId,
        nom,
        categorie,
        modeConditionnement: modeConditionnement || 'CASIER',
        bouteillesParCasier: modeConditionnement === 'UNITE' ? null : Number(bouteillesParCasier),
        prixAchatCasier: modeConditionnement === 'UNITE' ? null : Number(prixAchatCasier),
        prixAchatUnitaire: modeConditionnement === 'UNITE' ? Number(prixAchatUnitaire) : null,
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
  const { nom, categorie, modeConditionnement, bouteillesParCasier, prixAchatCasier, prixAchatUnitaire, prixVenteBouteille, seuilStockBas } = req.body;
  
  try {
    const updated = await prisma.product.update({
      where: { id },
      data: {
        nom,
        categorie,
        modeConditionnement: modeConditionnement || 'CASIER',
        bouteillesParCasier: modeConditionnement === 'UNITE' ? null : Number(bouteillesParCasier),
        prixAchatCasier: modeConditionnement === 'UNITE' ? null : Number(prixAchatCasier),
        prixAchatUnitaire: modeConditionnement === 'UNITE' ? Number(prixAchatUnitaire) : null,
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