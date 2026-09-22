import { Router } from 'express';
import { loginBar, loginSuperAdmin } from '../controllers/authController';

const router = Router();

// Route POST /api/auth/login
router.post('/login', loginBar);
router.post('/super-admin', loginSuperAdmin);

export default router;