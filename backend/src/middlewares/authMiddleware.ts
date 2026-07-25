import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_akibar_key';

export interface AuthRequest extends Request {
  barId?: string;
}

export const authenticateBar = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Accès non autorisé. Token manquant.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { barId: string };
    req.barId = decoded.barId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token invalide ou expiré.' });
  }
};