import { Router } from 'express';
import { loginBar } from '../controllers/authController';

const router = Router();

// Route POST /api/auth/login
router.post('/login', loginBar);

export default router;