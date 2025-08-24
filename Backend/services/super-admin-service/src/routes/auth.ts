import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

const router = express.Router();

// Temporary in-memory user store (replace with database)
const superAdminUsers = [
  {
    id: 1,
    email: 'admin@travelpms.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    name: 'Super Admin',
    role: 'super_admin'
  }
];

// Login validation rules
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

// Generate JWT token
const generateToken = (userId: number, email: string, role: string) => {
  return jwt.sign(
    { userId, email, role },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// Generate refresh token
const generateRefreshToken = (userId: number) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

// @route   POST /api/v1/auth/login
// @desc    Super admin login
// @access  Public
router.post('/login', loginValidation, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { email, password } = req.body;

  // Find user
  const user = superAdminUsers.find(u => u.email === email);
  if (!user) {
    logger.warn(`Failed login attempt for email: ${email}`);
    throw createError('Invalid credentials', 401);
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    logger.warn(`Failed login attempt for email: ${email} - invalid password`);
    throw createError('Invalid credentials', 401);
  }

  // Generate tokens
  const token = generateToken(user.id, user.email, user.role);
  const refreshToken = generateRefreshToken(user.id);

  logger.info(`Successful login for super admin: ${email}`);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      token,
      refreshToken
    }
  });
}));

// @route   POST /api/v1/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw createError('Refresh token is required', 400);
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
    const user = superAdminUsers.find(u => u.id === decoded.userId);

    if (!user) {
      throw createError('Invalid refresh token', 401);
    }

    const newToken = generateToken(user.id, user.email, user.role);
    const newRefreshToken = generateRefreshToken(user.id);

    res.json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    throw createError('Invalid refresh token', 401);
  }
}));

// @route   POST /api/v1/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', asyncHandler(async (req, res) => {
  // In a real implementation, you would invalidate the token
  // For now, we'll just return a success message
  logger.info('Super admin logged out');
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
}));

// @route   GET /api/v1/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    throw createError('No token provided', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = superAdminUsers.find(u => u.id === decoded.userId);

    if (!user) {
      throw createError('User not found', 404);
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    });
  } catch (error) {
    throw createError('Invalid token', 401);
  }
}));

export default router;