import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middlewares/authMiddleware';

export const generateBarId = (name: string): string => {
  const cleanName = name.replace(/\s+/g, '');
  let letters = '';
  if (cleanName.length < 3) {
    letters = cleanName.toUpperCase() + 'X'.repeat(3 - cleanName.length);
  } else {
    const midIndex = Math.floor(cleanName.length / 2);
    letters = cleanName.substring(midIndex - 1, midIndex + 2).toUpperCase();
  }
  const randomNum = Math.floor(Math.random() * (99 - 10 + 1)) + 10;
  return `${letters}${randomNum}bar`;
};

export const getAllBars = async (req: AuthRequest, res: Response) => {
  try {
    const bars = await prisma.bar.findMany({
      select: {
        id: true,
        nomBar: true,
        createdAt: true,
        status: true,
        pinProprietaireHash: true,
      },
      where: {
        status: { not: 'ARCHIVED' } // Optional: don't show archived by default, or show all? We can just send all and filter in UI.
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedBars = bars.map(bar => ({
      id: bar.id,
      nomBar: bar.nomBar,
      createdAt: bar.createdAt,
      status: bar.status,
      userCount: bar.pinProprietaireHash ? 2 : 1
    }));

    res.status(200).json(formattedBars);
  } catch (error: any) {
    res.status(500).json({ error: 'Erreur lors de la récupération des bars.' });
  }
};

//authentification bar
export const createBar = async (req: AuthRequest, res: Response) => {
  try {
    const { nomBar, pinGerant, pinProprietaire, pinServeur } = req.body;

    if (!nomBar || !pinGerant) {
      return res.status(400).json({ error: 'Nom et PIN Gérant requis.' });
    }

    const pinRegex = /^\d{4}$/;
    if (!pinRegex.test(pinGerant)) {
      return res.status(400).json({ error: 'Le PIN Gérant doit contenir exactement 4 chiffres.' });
    }
    if (pinProprietaire && !pinRegex.test(pinProprietaire)) {
      return res.status(400).json({ error: 'Le PIN Propriétaire doit contenir exactement 4 chiffres.' });
    }
    if (pinServeur && !pinRegex.test(pinServeur)) {
      return res.status(400).json({ error: 'Le PIN Serveur doit contenir exactement 4 chiffres.' });
    }

    const existingBar = await prisma.bar.findFirst({
      where: { nomBar: { equals: nomBar, mode: 'insensitive' } }
    });
    if (existingBar) {
      return res.status(400).json({ error: 'Un bar avec ce nom existe déjà.' });
    }

    const id = generateBarId(nomBar);

    const pinHash = await bcrypt.hash(pinGerant, 10);
    let pinProprietaireHash = null;
    let pinServeurHash = null;

    if (pinProprietaire) {
      pinProprietaireHash = await bcrypt.hash(pinProprietaire, 10);
    }
    if (pinServeur) {
      pinServeurHash = await bcrypt.hash(pinServeur, 10);
    }

    const newBar = await prisma.bar.create({
      data: {
        id,
        nomBar,
        pinHash,
        pinProprietaireHash,
        pinServeurHash,
        status: 'ACTIVE'
      }
    });

    const defaultProducts = [
      { nom: 'Castel 65cl', categorie: 'Bière', modeConditionnement: 'CASIER', bouteillesParCasier: 24, prixAchatCasier: 10000, prixAchatUnitaire: null, prixVenteBouteille: 600, seuilStockBas: 24 },
      { nom: 'Régab 65cl', categorie: 'Bière', modeConditionnement: 'CASIER', bouteillesParCasier: 24, prixAchatCasier: 10000, prixAchatUnitaire: null, prixVenteBouteille: 600, seuilStockBas: 24 },
      { nom: 'Coca-Cola 60cl', categorie: 'Soda', modeConditionnement: 'CASIER', bouteillesParCasier: 24, prixAchatCasier: 9000, prixAchatUnitaire: null, prixVenteBouteille: 500, seuilStockBas: 24 },
      { nom: 'Fanta 60cl', categorie: 'Soda', modeConditionnement: 'CASIER', bouteillesParCasier: 24, prixAchatCasier: 9000, prixAchatUnitaire: null, prixVenteBouteille: 500, seuilStockBas: 24 },
      { nom: 'Andza 1.5L', categorie: 'Eau', modeConditionnement: 'CASIER', bouteillesParCasier: 12, prixAchatCasier: 6000, prixAchatUnitaire: null, prixVenteBouteille: 800, seuilStockBas: 12 },
      { nom: 'Awa 1.5L', categorie: 'Eau', modeConditionnement: 'CASIER', bouteillesParCasier: 12, prixAchatCasier: 6000, prixAchatUnitaire: null, prixVenteBouteille: 800, seuilStockBas: 12 },
      { nom: 'Bordeaux Rouge', categorie: 'Vin rouge', modeConditionnement: 'UNITE', bouteillesParCasier: null, prixAchatCasier: null, prixAchatUnitaire: 2000, prixVenteBouteille: 3000, seuilStockBas: 6 },
      { nom: 'Martini Rouge', categorie: 'Vermouth', modeConditionnement: 'UNITE', bouteillesParCasier: null, prixAchatCasier: null, prixAchatUnitaire: 4000, prixVenteBouteille: 6000, seuilStockBas: 6 },
      { nom: 'JB', categorie: 'Whisky', modeConditionnement: 'UNITE', bouteillesParCasier: null, prixAchatCasier: null, prixAchatUnitaire: 6600, prixVenteBouteille: 10000, seuilStockBas: 6 },
      { nom: 'Havana Club', categorie: 'Rhum', modeConditionnement: 'UNITE', bouteillesParCasier: null, prixAchatCasier: null, prixAchatUnitaire: 5800, prixVenteBouteille: 8000, seuilStockBas: 6 },
      { nom: 'Mojito (Maison)', categorie: 'Cocktail', modeConditionnement: 'UNITE', bouteillesParCasier: null, prixAchatCasier: null, prixAchatUnitaire: 2000, prixVenteBouteille: 3500, seuilStockBas: 10 },
      { nom: 'Virgin Mojito', categorie: 'Mocktail', modeConditionnement: 'UNITE', bouteillesParCasier: null, prixAchatCasier: null, prixAchatUnitaire: 1500, prixVenteBouteille: 2500, seuilStockBas: 10 },
      { nom: 'Chardonnay Blanc', categorie: 'Vin blanc', modeConditionnement: 'UNITE', bouteillesParCasier: null, prixAchatCasier: null, prixAchatUnitaire: 2500, prixVenteBouteille: 3500, seuilStockBas: 6 },
      { nom: "Cabernet d'Anjou", categorie: 'Rosé', modeConditionnement: 'UNITE', bouteillesParCasier: null, prixAchatCasier: null, prixAchatUnitaire: 2500, prixVenteBouteille: 3500, seuilStockBas: 6 }
    ];

    for (const prod of defaultProducts) {
      const createdProd = await prisma.product.create({
        data: {
          barId: newBar.id,
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
      await prisma.stock.create({
        data: {
          barId: newBar.id,
          productId: createdProd.id,
          quantiteBouteilles: 0,
          casiersVides: 0
        }
      });
    }

    res.status(201).json({ message: 'Bar créé avec succès', bar: newBar });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Cet identifiant de bar existe déjà.' });
    }
    res.status(500).json({ error: 'Erreur lors de la création du bar.' });
  }
};

export const updateBar = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { nomBar, status, pinGerant, pinProprietaire, pinServeur } = req.body;

    const data: any = {};
    if (nomBar) data.nomBar = nomBar;
    if (status) data.status = status;

    const pinRegex = /^\d{4}$/;

    if (pinGerant) {
      if (!pinRegex.test(pinGerant)) return res.status(400).json({ error: 'Le PIN Gérant doit contenir exactement 4 chiffres.' });
      data.pinHash = await bcrypt.hash(pinGerant, 10);
    }
    if (pinProprietaire) {
      if (!pinRegex.test(pinProprietaire)) return res.status(400).json({ error: 'Le PIN Propriétaire doit contenir exactement 4 chiffres.' });
      data.pinProprietaireHash = await bcrypt.hash(pinProprietaire, 10);
    }
    if (pinServeur) {
      if (!pinRegex.test(pinServeur)) return res.status(400).json({ error: 'Le PIN Serveur doit contenir exactement 4 chiffres.' });
      data.pinServeurHash = await bcrypt.hash(pinServeur, 10);
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'Aucune donnée fournie pour mise à jour.' });
    }

    await prisma.bar.update({
      where: { id },
      data
    });

    res.status(200).json({ message: 'Bar mis à jour avec succès.' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Bar introuvable.' });
    }
    res.status(500).json({ error: 'Erreur lors de la mise à jour.' });
  }
};

export const deleteBar = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    // Soft delete instead of real delete
    await prisma.bar.update({
      where: { id },
      data: { status: 'ARCHIVED' }
    });
    res.status(200).json({ message: 'Bar archivé avec succès.' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Bar introuvable.' });
    }
    res.status(500).json({ error: 'Erreur lors de la suppression (archivage).' });
  }
};
