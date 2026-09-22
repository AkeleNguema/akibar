import { Router } from 'express';
import { getAllBars, createBar, updateBar, deleteBar } from '../controllers/adminController';
import { requireSuperAdmin } from '../middlewares/authMiddleware';

const router = Router();

router.use(requireSuperAdmin);

router.get('/bars', getAllBars);
router.post('/bars', createBar);
router.patch('/bars/:id', updateBar);
router.delete('/bars/:id', deleteBar);

export default router;
