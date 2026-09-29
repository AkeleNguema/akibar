import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_akibar_key';

export const loginBar = async (req: Request, res: Response): Promise<void> => {
  const { barId, pin } = req.body;

  console.log(`[AUTH] 1. loginBar - Requête reçue pour barId: ${barId}`);
  console.log("LOGIN ATTEMPT - barId:", barId, "type:", typeof barId, "pin:", pin);

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
    console.log(`[AUTH] 2. loginBar - Interrogation de Prisma pour barId: ${barId}...`);
    const bar = await prisma.bar.findFirst({
      where: { id: barId },
    });
    console.log(`[AUTH] 3. loginBar - Réponse Prisma :`, bar ? "Bar trouvé" : "Non trouvé");

    if (!bar) {
      res.status(404).json({ error: 'Bar introuvable.' });
      return;
    }

    console.log(`[AUTH] 4. loginBar - Vérification du code PIN Gérant...`);
    // Only check for Gerant or Serveur in this route
    let role = 'GERANT';
    let isMatch = await bcrypt.compare(pin, bar.pinHash);

    if (!isMatch && bar.pinServeurHash) {
      console.log(`[AUTH] 5. loginBar - Vérification du code PIN Serveur...`);
      isMatch = await bcrypt.compare(pin, bar.pinServeurHash);
      if (isMatch) {
        role = 'SERVEUR';
      }
    }

    if (!isMatch) {
      console.log(`[AUTH] 6. loginBar - Code PIN incorrect.`);
      res.status(401).json({ error: 'Code PIN incorrect.' });
      return;
    }

    console.log(`[AUTH] 7. loginBar - Génération du token JWT...`);
    // Génération du token JWT contenant l'ID du bar et le rôle
    const token = jwt.sign({ barId: bar.id, nomBar: bar.nomBar, role }, JWT_SECRET, {
      expiresIn: '7d',
    });

    console.log(`[AUTH] 8. loginBar - Token généré, envoi de la réponse.`);
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.json({
      message: 'Connexion réussie !',
      bar: {
        id: bar.id,
        nomBar: bar.nomBar,
        role,
      },
    });
  } catch (error: any) {
    console.error(`[AUTH] ERREUR. loginBar - Exception capturée :`);
    console.error('Login error (FULL):');
    console.dir(error, { depth: null });
    console.error('Error message:', error.message);
    res.status(500).json({ error: 'Erreur serveur lors de la connexion.' });
  }
};

export const loginSuperAdmin = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;
  console.log(`[AUTH] 1. loginSuperAdmin - Requête reçue pour username: ${username}`);
  
  const adminUser = process.env.SUPER_ADMIN_USER;
  const adminPass = process.env.SUPER_ADMIN_PASS;

  if (adminUser && adminPass && username === adminUser && password === adminPass) {
    console.log(`[AUTH] 2. loginSuperAdmin - Identifiants corrects, génération JWT...`);
    const token = jwt.sign({ role: 'SUPER_ADMIN' }, JWT_SECRET, { expiresIn: '1d' });
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', maxAge: 24 * 60 * 60 * 1000 });
    res.json({ message: 'Connexion Super Admin réussie', user: { role: 'SUPER_ADMIN' } });
  } else {
    console.log(`[AUTH] 2. loginSuperAdmin - Identifiants incorrects.`);
    res.status(401).json({ error: 'Identifiants Super Admin incorrects.' });
  }
};

export const ownerLogin = async (req: Request, res: Response): Promise<void> => {
  const { barId, pin } = req.body;
  
  console.log(`[AUTH] 1. ownerLogin - Requête reçue pour barId: ${barId}`);

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
    console.log(`[AUTH] 2. ownerLogin - Interrogation de Prisma pour barId: ${barId}...`);
    const bar = await prisma.bar.findFirst({
      where: { id: barId },
    });
    console.log(`[AUTH] 3. ownerLogin - Réponse Prisma :`, bar ? "Bar trouvé" : "Non trouvé");

    if (!bar) {
      res.status(404).json({ error: 'Bar introuvable.' });
      return;
    }

    if (!bar.pinProprietaireHash) {
      console.log(`[AUTH] 4. ownerLogin - Aucun code PIN propriétaire configuré.`);
      res.status(401).json({ error: 'Aucun code PIN propriétaire configuré pour ce bar.' });
      return;
    }

    console.log(`[AUTH] 5. ownerLogin - Vérification du PIN Propriétaire...`);
    const isMatch = await bcrypt.compare(pin, bar.pinProprietaireHash);

    if (!isMatch) {
      console.log(`[AUTH] 6. ownerLogin - Code PIN propriétaire incorrect.`);
      res.status(401).json({ error: 'Code PIN propriétaire incorrect.' });
      return;
    }

    console.log(`[AUTH] 7. ownerLogin - Génération du token JWT...`);
    const token = jwt.sign({ id: bar.id, barId: bar.id, nomBar: bar.nomBar, role: 'PROPRIETAIRE' }, JWT_SECRET, {
      expiresIn: '7d',
    });

    console.log(`[AUTH] 8. ownerLogin - Token généré, envoi de la réponse.`);
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.json({
      message: 'Connexion Propriétaire réussie !',
      bar: {
        id: bar.id,
        nomBar: bar.nomBar,
        role: 'PROPRIETAIRE',
      },
    });
  } catch (error: any) {
    console.error(`[AUTH] ERREUR. ownerLogin - Exception capturée :`);
    console.error('Owner Login error:', error.message, error.stack);
    res.status(500).json({ error: 'Erreur serveur lors de la connexion.' });
  }
};

export const logout = (req: Request, res: Response): void => {
  res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' });
  res.json({ message: 'Déconnexion réussie.' });
};

export const getMe = (req: any, res: Response): void => {
  const token = req.cookies.token;
  if (!token) {
    res.json({ user: null });
    return;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    res.json({ user: decoded });
  } catch (error) {
    res.json({ user: null });
  }
};