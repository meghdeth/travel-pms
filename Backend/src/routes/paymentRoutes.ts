import { Router } from 'express';
import { authenticateToken } from '@/middleware/auth';

const router = Router();

// Placeholder routes - to be implemented
router.get('/methods', authenticateToken, (req, res) => {
  res.json({ message: 'Payment Methods - Coming Soon' });
});

export default router;