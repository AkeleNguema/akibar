import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_akibar_key';

export interface AuthRequest extends Request {
  barId?: string;
  role?: string;
  nomBar?: string;
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
    const decoded = jwt.verify(token, JWT_SECRET) as { barId?: string, role?: string, nomBar?: string };
    
    // Support "Mode assistance" pour le SUPER_ADMIN
    if (decoded.role === 'SUPER_ADMIN' && req.headers['x-assistance-bar-id']) {
      req.barId = req.headers['x-assistance-bar-id'] as string;
    } else {
      req.barId = decoded.barId;
    }
    
    req.role = decoded.role;
    req.nomBar = decoded.nomBar;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token invalide ou expiré.' });
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.role || !allowedRoles.includes(req.role)) {
      res.status(403).json({ error: 'Accès refusé. Rôle insuffisant.' });
      return;
    }
    next();
  };
};

export const requireSuperAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Accès non autorisé.' });
    return;
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { role?: string };
    if (decoded.role !== 'SUPER_ADMIN') {
      res.status(403).json({ error: 'Accès refusé. Réservé au Super Admin.' });
      return;
    }
    req.role = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token invalide ou expiré.' });
  }
};