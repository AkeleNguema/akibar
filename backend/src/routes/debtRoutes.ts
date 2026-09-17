import { Router } from 'express';
import { createDebt, getActiveDebts, payDebt } from '../controllers/debtController';
import { authenticateBar } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateBar);
router.post('/', createDebt);
router.get('/', getActiveDebts);
router.patch('/:id/pay', payDebt);

export default router;