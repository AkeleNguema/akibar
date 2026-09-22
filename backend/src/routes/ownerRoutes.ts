import { Router } from 'express';
import { getOwnerDashboardStats } from '../controllers/ownerController';
import { authenticateBar, requireRole } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateBar);
// Seuls les propriétaires et super admins ont accès
router.use(requireRole(['PROPRIETAIRE', 'SUPER_ADMIN']));

router.get('/dashboard', getOwnerDashboardStats);

export default router;
