import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { logger } from '../utils/logger';

const router = express.Router();

// Mock user data (in production, this would be in a database)
let users = [
  {
    id: 1,
    email: 'admin@hotel.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'super_admin',
    name: 'Hotel Admin',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    email: 'vendor@hotel.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'vendor',
    name: 'Hotel Vendor',
    isActive: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    email: 'manager@hotel.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'hotel_manager',
    name: 'Hotel Manager',
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

// Store for refresh tokens (in production, use Redis or database)
let refreshTokens: string[] = [];

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = users.find(u => u.email === email && u.isActive);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        service: 'hotel-service'
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, service: 'hotel-service' },
      process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    // Store refresh token
    refreshTokens.push(refreshToken);

    logger.info(`User logged in: ${user.email} (${user.role})`);

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
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Register (for hotel managers and staff)
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').isLength({ min: 2, max: 50 }),
  body('role').isIn(['hotel_manager', 'hotel_staff'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password, name, role } = req.body;

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: users.length + 1,
      email,
      password: hashedPassword,
      name,
      role,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    logger.info(`New user registered: ${email} (${role})`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role
        }
      }
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Refresh token
router.post('/refresh', [
  body('refreshToken').notEmpty()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { refreshToken } = req.body;

    // Check if refresh token exists
    if (!refreshTokens.includes(refreshToken)) {
      return res.status(403).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    try {
      // Verify refresh token
      const decoded = jwt.verify(
        refreshToken, 
        process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret'
      ) as any;

      // Find user
      const user = users.find(u => u.id === decoded.userId && u.isActive);
      if (!user) {
        return res.status(403).json({
          success: false,
          message: 'User not found'
        });
      }

      // Generate new access token
      const accessToken = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role,
          service: 'hotel-service'
        },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
      );

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken
        }
      });
    } catch (jwtError) {
      return res.status(403).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Logout
router.post('/logout', [
  body('refreshToken').notEmpty()
], (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    // Remove refresh token
    refreshTokens = refreshTokens.filter(token => token !== refreshToken);
    
    logger.info('User logged out');
    
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get current user
router.get('/me', (req: any, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
      const user = users.find(u => u.id === decoded.userId && u.isActive);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
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
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;