import { Router } from 'express';
import { getActiveDebts, payDebt } from '../controllers/debtController';
import { authenticateBar } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateBar);
router.get('/', getActiveDebts);
router.patch('/:id/pay', payDebt);

export default router;