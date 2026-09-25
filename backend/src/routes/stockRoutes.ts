import { Router } from 'express';
import { supplyStock, getStockStatus, returnEmptyCrates, manualStockAdjustment } from '../controllers/stockController';
import { authenticateBar } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateBar);

router.get('/', getStockStatus);
router.post('/supply', supplyStock);
router.post('/return-crates', returnEmptyCrates);
router.post('/manual-adjustment', manualStockAdjustment);

export default router;