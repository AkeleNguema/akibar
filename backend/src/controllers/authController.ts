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

    let role = 'GERANT';
    let isMatch = await bcrypt.compare(pin, bar.pinHash);

    if (!isMatch && bar.pinProprietaireHash) {
      isMatch = await bcrypt.compare(pin, bar.pinProprietaireHash);
      if (isMatch) {
        role = 'PROPRIETAIRE';
      }
    }

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