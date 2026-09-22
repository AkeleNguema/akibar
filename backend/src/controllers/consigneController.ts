import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middlewares/authMiddleware';

export const getConsignes = async (req: AuthRequest, res: Response) => {
  try {
    const consignes = await prisma.consigne.findMany({
      where: { barId: req.barId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(consignes);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des consignes.' });
  }
};

export const createConsigne = async (req: AuthRequest, res: Response) => {
  const { nomClient, nombreCasiers } = req.body;
  
  if (!nomClient || !nombreCasiers) {
    return res.status(400).json({ error: 'Nom et nombre de casiers requis.' });
  }

  try {
    const consigne = await prisma.consigne.create({
      data: {
        barId: req.barId as string,
        nomClient,
        nombreCasiers: Number(nombreCasiers),
        statut: 'EN_COURS'
      }
    });
    res.status(201).json(consigne);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création de la consigne.' });
  }
};

export const updateConsigne = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { statut } = req.body;

  try {
    const consigneExistante = await prisma.consigne.findUnique({ where: { id: id as string } });
    if (!consigneExistante || consigneExistante.barId !== req.barId) {
      return res.status(404).json({ error: 'Consigne non trouvée ou non autorisée.' });
    }

    const consigne = await prisma.consigne.update({
      where: { id: id as string },
      data: { statut }
    });
    res.json(consigne);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour.' });
  }
};

export const deleteConsigne = async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  try {
    const consigneExistante = await prisma.consigne.findUnique({ where: { id: id as string } });
    if (!consigneExistante || consigneExistante.barId !== req.barId) {
      return res.status(404).json({ error: 'Consigne non trouvée ou non autorisée.' });
    }

    await prisma.consigne.delete({
      where: { id: id as string }
    });
    res.json({ message: 'Consigne supprimée avec succès.' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression de la consigne.' });
  }
};
