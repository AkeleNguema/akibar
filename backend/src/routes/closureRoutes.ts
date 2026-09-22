import { Router } from 'express';
import { getDailySummary, createClosure, getDailyDetails, getFinancialReport } from '../controllers/closureController';
import { authenticateBar } from '../middlewares/authMiddleware';


const router = Router();


router.use(authenticateBar);

router.get('/daily', getDailySummary);
router.get('/daily-details', getDailyDetails);
router.get('/report', getFinancialReport);
router.post('/validate', createClosure);

export default router;