import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateHotelToken } from '../middleware/hotelAuth';

const router = Router();
const authController = new AuthController();

// Hotel User Authentication Routes
// These routes handle authentication for all hotel users (admin, staff, etc.)

// Public routes
router.post('/login', authController.hotelAdminLogin); // Unified login for all hotel users
router.post('/register', authController.hotelRegister);
router.post('/refresh-token', authController.refreshToken);

// Protected routes
router.post('/logout', authenticateHotelToken, authController.logout);

export default router;