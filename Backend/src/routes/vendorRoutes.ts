import { Router } from 'express';
import { authenticateToken, requireRole } from '@/middleware/auth';

const router = Router();

// Placeholder routes - to be implemented
router.get('/dashboard', authenticateToken, requireRole(['vendor']), (req, res) => {
  res.json({ message: 'Vendor Dashboard - Coming Soon' });
});

export default router;