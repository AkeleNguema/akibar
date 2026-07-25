import { Router } from 'express';
import { getDailySummary, createClosure } from '../controllers/closureController';
import { authenticateBar } from '../middlewares/authMiddleware';


const router = Router();


router.use(authenticateBar);

router.get('/summary', getDailySummary);
router.post('/', createClosure);

export default router;