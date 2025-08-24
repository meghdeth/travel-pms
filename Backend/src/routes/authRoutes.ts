import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/super-admin/login', authController.superAdminLogin);
router.post('/vendor/login', authController.vendorLogin);
router.post('/vendor/register', authController.vendorRegister);
router.post('/user/register', authController.userRegister);
router.post('/user/login', authController.userLogin);
router.post('/refresh-token', authController.refreshToken);

// Note: Hotel authentication routes moved to /hotel/user/ endpoints
// Note: Logout routes are now handled by specific user type endpoints (e.g., /hotel/user/logout)

export default router;