import { Router } from 'express';
import { getDailySummary, createClosure, getDailyDetails } from '../controllers/closureController';
import { authenticateBar } from '../middlewares/authMiddleware';


const router = Router();


router.use(authenticateBar);

router.get('/daily', getDailySummary);
router.get('/daily-details', getDailyDetails);
router.post('/validate', createClosure);

export default router;