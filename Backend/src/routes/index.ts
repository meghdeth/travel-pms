import { Router } from 'express';
import authRoutes from './authRoutes';
import superAdminRoutes from './superAdminRoutes';
import vendorRoutes from './vendorRoutes';
import hotelRoutes from './hotelRoutes';
import userRoutes from './userRoutes';
import bookingRoutes from './bookingRoutes';
import paymentRoutes from './paymentRoutes';
import uploadRoutes from './uploadRoutes';

const router = Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/super-admin', superAdminRoutes);
router.use('/vendor', vendorRoutes);
router.use('/hotel', hotelRoutes); // All hotel operations including authentication and user management
router.use('/user', userRoutes);
router.use('/booking', bookingRoutes);
router.use('/payment', paymentRoutes);
router.use('/upload', uploadRoutes);

export default router;