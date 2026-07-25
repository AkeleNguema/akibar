import { Router } from 'express';
import { createExpense, getExpenses, recordLoss } from '../controllers/expenseController';
import { authenticateBar } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateBar);

router.get('/', getExpenses);
router.post('/', createExpense);
router.post('/loss', recordLoss);

export default router;