import { Router } from 'express';
import { loginBar, loginSuperAdmin, ownerLogin } from '../controllers/authController';

const router = Router();

// Route POST /api/auth/login
router.post('/login', loginBar);
router.post('/super-admin', loginSuperAdmin);
router.post('/owner-login', ownerLogin);

export default router;