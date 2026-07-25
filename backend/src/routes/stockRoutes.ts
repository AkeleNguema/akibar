import { Router } from 'express';
import { supplyStock, getStockStatus } from '../controllers/stockController';
import { authenticateBar } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateBar);

router.get('/', getStockStatus);
router.post('/supply', supplyStock);

export default router;