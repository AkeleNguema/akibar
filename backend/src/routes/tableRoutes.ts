import { Router } from 'express';
import { getTables, updateTableCart, freeTable } from '../controllers/tableController';
import { authenticateBar } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authenticateBar, getTables);
router.put('/:id/cart', authenticateBar, updateTableCart);
router.put('/:id/free', authenticateBar, freeTable);

export default router;
