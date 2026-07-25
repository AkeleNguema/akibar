import { Router } from 'express';
import { getBarProducts } from '../controllers/productController';
import { authenticateBar } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authenticateBar, getBarProducts);

export default router;