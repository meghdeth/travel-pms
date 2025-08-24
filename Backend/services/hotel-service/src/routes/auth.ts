import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { logger } from '../utils/logger';
import db from '../config/database';

const router = express.Router();

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 1 })
], async (req: express.Request, res: express.Response) => {
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

    // Find user in database
    const user = await db('hotel_users')
      .where({ email, status: 'active' })
      .first();
      
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await db('hotel_users')
      .where({ id: user.id })
      .update({ last_login: new Date() });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.hotel_user_id,
        hotelId: user.hotel_id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    logger.info(`User logged in: ${user.email}`);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.hotel_user_id,
          hotelId: user.hotel_id,
          email: user.email,
          role: user.role,
          firstName: user.first_name,
          lastName: user.last_name
        }
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

// Register (for creating new hotel staff)
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').isLength({ min: 2, max: 50 }),
  body('lastName').isLength({ min: 2, max: 50 }),
  body('role').isIn(['Hotel Admin', 'Manager', 'Front Desk', 'Finance Department', 'Maintenance', 'Kitchen'])
], async (req: express.Request, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password, firstName, lastName, role } = req.body;

    // Check if user already exists
    const existingUser = await db('hotel_users')
      .where({ email })
      .first();
      
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate hotel_user_id (simplified for demo)
    const userCount = await db('hotel_users').count('id as count').first();
    const sequence = String((userCount?.count as number) + 1).padStart(5, '0');
    const hotelUserId = `1410000000000${sequence}`; // Front desk role example

    // Create new user
    const [newUserId] = await db('hotel_users').insert({
      hotel_user_id: hotelUserId,
      hotel_id: '1000000000', // Default hotel for demo
      email,
      password: hashedPassword,
      first_name: firstName,
      last_name: lastName,
      role,
      permissions: JSON.stringify({
        can_manage_users: role === 'Hotel Admin',
        can_manage_rooms: ['Hotel Admin', 'Manager'].includes(role),
        can_manage_bookings: ['Hotel Admin', 'Manager', 'Front Desk'].includes(role),
        can_view_reports: ['Hotel Admin', 'Manager', 'Finance Department'].includes(role),
        can_manage_settings: role === 'Hotel Admin'
      }),
      status: 'active'
    });

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: hotelUserId,
        email,
        role,
        firstName,
        lastName
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

// Verify token middleware
export const verifyToken = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Get current user
router.get('/me', verifyToken, async (req: any, res: any) => {
  try {
    const user = await db('hotel_users')
      .where({ hotel_user_id: req.user.userId, status: 'active' })
      .first();
      
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: user.hotel_user_id,
        hotelId: user.hotel_id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        permissions: JSON.parse(user.permissions)
      }
    });
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;