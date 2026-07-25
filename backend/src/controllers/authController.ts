import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_akibar_key';

export const loginBar = async (req: Request, res: Response): Promise<void> => {
  const { barId, pin } = req.body;

  if (!barId || !pin) {
    res.status(400).json({ error: 'Identifiant du bar et code PIN requis.' });
    return;
  }

  try {
    const bar = await prisma.bar.findUnique({
      where: { id: barId },
    });

    if (!bar) {
      res.status(404).json({ error: 'Bar introuvable.' });
      return;
    }

    const isMatch = await bcrypt.compare(pin, bar.pinHash);
    if (!isMatch) {
      res.status(401).json({ error: 'Code PIN incorrect.' });
      return;
    }

    // Génération du token JWT contenant l'ID du bar
    const token = jwt.sign({ barId: bar.id, nomBar: bar.nomBar }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      message: 'Connexion réussie !',
      token,
      bar: {
        id: bar.id,
        nomBar: bar.nomBar,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la connexion.' });
  }
};