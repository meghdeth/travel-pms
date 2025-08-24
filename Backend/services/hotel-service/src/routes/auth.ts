import express from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { logger } from '../utils/logger';
import db from '../config/database';

const router = express.Router();

// Hotel Admin Login
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

    // Admin-only login: check hotel_admins table
    const user: any = await db('hotel_admins').where({ email, status: 'active' }).first();

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    // Update last_login for admin
    await db('hotel_admins').where({ id: user.id }).update({ last_login: new Date() });

    // Generate JWT token (admin)
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }
    
  // Avoid strict SignOptions typing issues from jsonwebtoken types by casting to any
  const signOptions = { expiresIn: process.env.JWT_EXPIRES_IN || '24h' } as any;
    
    const token = jwt.sign(
      {
        userId: user.admin_id,
        hotelId: user.hotel_id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name
      },
      jwtSecret,
      signOptions
    );

    logger.info(`Admin logged in: ${user.email}`);

    return res.json({ success: true, message: 'Login successful', data: { token, user: {
      id: user.admin_id,
      hotelId: user.hotel_id,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name
    }}});
  } catch (error) {
    logger.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Staff login - separate endpoint
router.post('/staff/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 1 })
], async (req: express.Request, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });

    const { email, password } = req.body;
    const user: any = await db('staff').where({ email, status: 'active' }).first();
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    await db('staff').where({ id: user.id }).update({ last_login: new Date() });

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not configured');
    }
    
  // Avoid strict SignOptions typing issues from jsonwebtoken types by casting to any
  const staffSignOptions = { expiresIn: process.env.JWT_EXPIRES_IN || '24h' } as any;
    
    const token = jwt.sign(
      {
        userId: user.staff_id,
        hotelId: user.hotel_id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name
      },
      jwtSecret,
      staffSignOptions
    );

    logger.info(`Staff logged in: ${user.email}`);

    return res.json({ success: true, message: 'Staff login successful', data: { token, user: {
      id: user.staff_id,
      hotelId: user.hotel_id,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name
    }}});
  } catch (error) {
    logger.error('Staff login error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Register (ONLY for creating hotel admins - staff creation is done through admin panel)
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').isLength({ min: 2, max: 50 }),
  body('lastName').isLength({ min: 2, max: 50 }),
  body('role').isIn(['Hotel Admin']).withMessage('Only Hotel Admin can register directly')
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

    const { email, password, firstName, lastName, role, hotelId } = req.body;

    // Check if user already exists in either table
    const existsAdmin = await db('hotel_admins').where({ email }).first();
    const existsStaff = await db('staff').where({ email }).first();
    if (existsAdmin || existsStaff) {
  return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const targetHotelId = hotelId || process.env.DEFAULT_HOTEL_ID || '1000000000';

    // Only allow Hotel Admin registration through this endpoint
    if (role !== 'Hotel Admin') {
      return res.status(400).json({ 
        success: false, 
        message: 'Only Hotel Admin can register directly. Staff must be created through admin panel.' 
      });
    }

    // Create hotel admin
    const countRow: any = await db('hotel_admins').count('id as count').first();
    const seq = typeof countRow?.count === 'number' ? countRow.count : parseInt(countRow?.count || '0', 10);
    const adminId = `HA${targetHotelId}${String(seq + 1).padStart(5, '0')}`;

    await db('hotel_admins').insert({
      admin_id: adminId,
      hotel_id: targetHotelId,
      email,
      password: hashedPassword,
      first_name: firstName,
      last_name: lastName,
      role,
      permissions: JSON.stringify({ can_manage_users: true }),
      status: 'active'
    });

    logger.info(`New hotel admin registered: ${email}`);

    return res.status(201).json({ 
      success: true, 
      message: 'Hotel admin registered', 
      data: { id: adminId, email, role, firstName, lastName } 
    });
  } catch (error) {
    logger.error('Registration error:', error);
    return res.status(500).json({
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
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
    }
    
    const decoded = jwt.verify(token, jwtSecret);
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
    // Try admin table first
    let user = await db('hotel_admins').where({ admin_id: req.user.userId, status: 'active' }).first();
    let source: 'admin' | 'staff' = 'admin';
    if (!user) {
      user = await db('staff').where({ staff_id: req.user.userId, status: 'active' }).first();
      source = 'staff';
    }

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    return res.json({ success: true, data: {
      id: source === 'admin' ? user.admin_id : user.staff_id,
      hotelId: user.hotel_id,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
      permissions: typeof user.permissions === 'string' ? JSON.parse(user.permissions) : user.permissions
    }});
  } catch (error) {
    logger.error('Get user error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;