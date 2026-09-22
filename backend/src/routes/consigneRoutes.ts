import { Router } from 'express';
import { getConsignes, createConsigne, updateConsigne, deleteConsigne } from '../controllers/consigneController';
import { authenticateBar } from '../middlewares/authMiddleware';

const router = Router();

// On protège les routes avec l'authentification
router.use(authenticateBar);

// Les routes définies selon la demande (note: si ce routeur est monté sur /api/consignes, les endpoints seront accessibles via /api/consignes/consignes. 
// S'il est monté sur /api, ils seront accessibles via /api/consignes)
router.get('/', getConsignes);
router.post('/', createConsigne);
router.put('/:id', updateConsigne);
router.delete('/:id', deleteConsigne);

// Routes demandées spécifiquement avec le chemin complet (pour assurer la compatibilité)
router.get('/consignes', getConsignes);
router.post('/consignes', createConsigne);
router.put('/consignes/:id', updateConsigne);
router.delete('/consignes/:id', deleteConsigne);

export default router;
