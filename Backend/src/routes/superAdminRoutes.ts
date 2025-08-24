import { Router } from 'express';
import { authenticateToken, requireRole } from '@/middleware/auth';

const router = Router();

// Placeholder routes - to be implemented
router.get('/dashboard', authenticateToken, requireRole(['super_admin']), (req, res) => {
  res.json({ message: 'Super Admin Dashboard - Coming Soon' });
});

export default router;