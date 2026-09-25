import { Router } from 'express';
import { createDebt, getActiveDebts, payDebt, deleteDebt } from '../controllers/debtController';
import { authenticateBar } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateBar);
router.post('/', createDebt);
router.get('/', getActiveDebts);
router.patch('/:id/pay', payDebt);
router.delete('/:id', deleteDebt);

export default router;