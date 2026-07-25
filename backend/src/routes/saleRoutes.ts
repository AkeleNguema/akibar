import { Router } from 'express';
import { createSale } from '../controllers/saleController';
import { authenticateBar } from '../middlewares/authMiddleware';


const router = Router();

router.post('/', authenticateBar, createSale);


export default router;