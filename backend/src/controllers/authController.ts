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
  const pinRegex = /^\d{4}$/;
  if (!pinRegex.test(pin)) {
    res.status(400).json({ error: 'Le code PIN doit contenir exactement 4 chiffres.' });
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

    // Only check for Gerant or Serveur in this route
    let role = 'GERANT';
    let isMatch = await bcrypt.compare(pin, bar.pinHash);

    if (!isMatch && bar.pinServeurHash) {
      isMatch = await bcrypt.compare(pin, bar.pinServeurHash);
      if (isMatch) {
        role = 'SERVEUR';
      }
    }

    if (!isMatch) {
      res.status(401).json({ error: 'Code PIN incorrect.' });
      return;
    }

    // Génération du token JWT contenant l'ID du bar et le rôle
    const token = jwt.sign({ barId: bar.id, nomBar: bar.nomBar, role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      message: 'Connexion réussie !',
      token,
      bar: {
        id: bar.id,
        nomBar: bar.nomBar,
        role,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error.message, error.stack);
    res.status(500).json({ error: 'Erreur serveur lors de la connexion.' });
  }
};

export const loginSuperAdmin = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;
  const adminUser = process.env.SUPER_ADMIN_USER;
  const adminPass = process.env.SUPER_ADMIN_PASS;

  if (adminUser && adminPass && username === adminUser && password === adminPass) {
    const token = jwt.sign({ role: 'SUPER_ADMIN' }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ message: 'Connexion Super Admin réussie', token, user: { role: 'SUPER_ADMIN' } });
  } else {
    res.status(401).json({ error: 'Identifiants Super Admin incorrects.' });
  }
};

export const ownerLogin = async (req: Request, res: Response): Promise<void> => {
  const { barId, pin } = req.body;
  
  if (!barId || !pin) {
    res.status(400).json({ error: 'Identifiant du bar et code PIN requis.' });
    return;
  }
  const pinRegex = /^\d{4}$/;
  if (!pinRegex.test(pin)) {
    res.status(400).json({ error: 'Le code PIN doit contenir exactement 4 chiffres.' });
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

    if (!bar.pinProprietaireHash) {
      res.status(401).json({ error: 'Aucun code PIN propriétaire configuré pour ce bar.' });
      return;
    }

    const isMatch = await bcrypt.compare(pin, bar.pinProprietaireHash);

    if (!isMatch) {
      res.status(401).json({ error: 'Code PIN propriétaire incorrect.' });
      return;
    }

    const token = jwt.sign({ barId: bar.id, nomBar: bar.nomBar, role: 'PROPRIETAIRE' }, JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      message: 'Connexion Propriétaire réussie !',
      token,
      bar: {
        id: bar.id,
        nomBar: bar.nomBar,
        role: 'PROPRIETAIRE',
      },
    });
  } catch (error: any) {
    console.error('Owner Login error:', error.message, error.stack);
    res.status(500).json({ error: 'Erreur serveur lors de la connexion.' });
  }
};