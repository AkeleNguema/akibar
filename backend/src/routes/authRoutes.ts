import { Router } from 'express';
import { loginBar, loginSuperAdmin, ownerLogin, logout, getMe } from '../controllers/authController';

const router = Router();

// Route POST /api/auth/login
router.post('/login', loginBar);
router.post('/super-admin', loginSuperAdmin);
router.post('/owner-login', ownerLogin);
router.post('/logout', logout);
router.get('/me', getMe);

export default router;