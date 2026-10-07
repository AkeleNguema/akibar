import { Router } from 'express';
import { getBarProducts, addProduct, updateProduct, deleteProduct } from '../controllers/productController';
import { authenticateBar } from '../middlewares/authMiddleware';

const router = Router();

router.get('/', authenticateBar, getBarProducts);
router.post('/', authenticateBar, addProduct);
router.put('/:id', authenticateBar, updateProduct);
router.delete('/:id', authenticateBar, deleteProduct);

export default router;