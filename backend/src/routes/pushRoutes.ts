import { Router } from 'express';
import { subscribePush, sendTestPush } from '../controllers/pushController';
import { authenticateBar } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticateBar);
router.post('/subscribe', subscribePush);
router.post('/test', sendTestPush);

export default router;
