import { Router } from 'express';
import { authenticateToken } from '@/middleware/auth';

const router = Router();

// Placeholder routes - to be implemented
router.get('/', authenticateToken, (req, res) => {
  res.json({ message: 'Booking System - Coming Soon' });
});

export default router;