import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middlewares/authMiddleware';

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

export const createBar = async (req: AuthRequest, res: Response) => {
  try {
    const { id, nomBar, pinGerant, pinProprietaire, pinServeur } = req.body;

    if (!id || !nomBar || !pinGerant) {
      return res.status(400).json({ error: 'ID, nom et PIN Gérant requis.' });
    }

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
    
    if (pinGerant) {
      data.pinHash = await bcrypt.hash(pinGerant, 10);
    }
    if (pinProprietaire) {
      data.pinProprietaireHash = await bcrypt.hash(pinProprietaire, 10);
    }
    if (pinServeur) {
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
