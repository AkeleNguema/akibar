import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middlewares/authMiddleware';

const MASK_NAMES = [
  'KIDUMU', 'PUNU', 'FANG', 'KOTA', 'TSOGO',
  'MBETE', 'MAHONGWE', 'BATEKE', 'VUVI', 'SIRA'
];

export const getTables = async (req: AuthRequest, res: Response): Promise<void> => {
  const barId = req.barId;

  if (!barId) {
    res.status(401).json({ error: 'Bar non identifié.' });
    return;
  }

  try {
    let tables = await prisma.table.findMany({
      where: { barId },
      orderBy: { nom: 'asc' },
    });

    if (tables.length === 0) {
      // Create default tables
      const newTables = MASK_NAMES.map(nom => ({
        barId,
        nom,
        status: 'LIBRE',
      }));

      await prisma.table.createMany({
        data: newTables,
      });

      tables = await prisma.table.findMany({
        where: { barId },
        orderBy: { nom: 'asc' },
      });
    }

    res.status(200).json(tables);
  } catch (error: any) {
    console.error('Erreur getTables:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des tables.' });
  }
};

export const updateTableCart = async (req: AuthRequest, res: Response): Promise<void> => {
  const barId = req.barId;
  const { id } = req.params;
  const { cart } = req.body;

  if (!barId) {
    res.status(401).json({ error: 'Bar non identifié.' });
    return;
  }

  try {
    const updatedTable = await prisma.table.update({
      where: { id },
      data: {
        currentCart: cart,
        status: cart && cart.length > 0 ? 'EN_ATTENTE' : 'LIBRE',
      },
    });

    res.status(200).json(updatedTable);
  } catch (error: any) {
    console.error('Erreur updateTableCart:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la table.' });
  }
};

export const freeTable = async (req: AuthRequest, res: Response): Promise<void> => {
  const barId = req.barId;
  const { id } = req.params;

  if (!barId) {
    res.status(401).json({ error: 'Bar non identifié.' });
    return;
  }

  try {
    const updatedTable = await prisma.table.update({
      where: { id },
      data: {
        currentCart: null,
        status: 'LIBRE',
      },
    });

    res.status(200).json(updatedTable);
  } catch (error: any) {
    console.error('Erreur freeTable:', error);
    res.status(500).json({ error: 'Erreur lors de la libération de la table.' });
  }
};
