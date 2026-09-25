import { Router } from 'express';
import { createSale, cancelSale } from '../controllers/saleController';
import { authenticateBar } from '../middlewares/authMiddleware';


const router = Router();

router.post('/', authenticateBar, createSale);
router.delete('/:id', authenticateBar, cancelSale);

export default router;