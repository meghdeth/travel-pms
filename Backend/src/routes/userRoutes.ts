import { Router } from 'express';
import { authenticateToken } from '@/middleware/auth';

const router = Router();

// Placeholder routes - to be implemented
router.get('/profile', authenticateToken, (req, res) => {
  res.json({ message: 'User Profile - Coming Soon' });
});

export default router;