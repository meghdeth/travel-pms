import express from 'express';
import { body, validationResult } from 'express-validator';
import db from '../config/database';
import { logger } from '../utils/logger';
import {
  requirePermission,
  requireRoleLevel,
  validateHotelStatusChange,
  RoleLevel,
  PERMISSIONS
} from '../middleware/roleMiddleware';
import { generateHotelId } from '../utils/idGenerator';

const router = express.Router();

// Middleware to verify token
const verifyToken = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hotel_jwt_secret_key_2024') as any;
    req.user = {
      userId: decoded.userId,
      hotelId: decoded.hotelId,
      email: decoded.email,
      role: decoded.role,
      firstName: decoded.firstName,
      lastName: decoded.lastName
    };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Get all hotels (public endpoint with optional filters)
router.get('/', async (req, res) => {
  try {
    const { city, country, rating, status } = req.query;
    let query = db('hotels').select([
      'hotel_id',
      'name',
      'description', 
      'address',
      'city',
      'state',
      'country',
      'postal_code',
      'phone',
      'email',
      'star_rating',
      'status',
      'is_featured',
      'avg_rating',
      'total_reviews',
      'created_at'
    ]);

    // Default to active hotels only for public view
    if (!status) {
      query = query.where('status', 'active');
    } else if (status === 'all') {
      // Show all statuses only for authenticated admin users
      // This would need additional auth check in production
      query = query.whereIn('status', ['active', 'inactive', 'delisted']);
    }
    
    if (city) {
      query = query.where('city', 'like', `%${city}%`);
    }
    
    if (country) {
      query = query.where('country', 'like', `%${country}%`);
    }
    
    if (rating) {
      query = query.where('star_rating', '>=', parseFloat(rating as string));
    }

    const hotels = await query;
    
    res.json({
      success: true,
      data: hotels
    });
  } catch (error) {
    logger.error('Get hotels error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get hotel by ID
router.get('/:hotelId', async (req, res) => {
  try {
    const { hotelId } = req.params;
    
    const hotel = await db('hotels')
      .where({ hotel_id: hotelId, status: 'active' })
      .first();
    
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }
    
    // Get hotel rooms
    const rooms = await db('rooms')
      .where({ hotel_id: hotelId, status: 'available' })
      .select();
    
    res.json({
      success: true,
      data: {
        ...hotel,
        rooms
      }
    });
  } catch (error) {
    logger.error('Get hotel error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update hotel status (deactivate/delist/delete) - Role-based permissions
router.patch('/:hotelId/status', [
  verifyToken,
  validateHotelStatusChange(),
  body('status').isIn(['active', 'inactive', 'delisted', 'deleted']),
  body('reason').optional().isString()
], async (req: any, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { hotelId } = req.params;
    const { status, reason } = req.body;
    
    // The validation middleware already checked permissions and hotel existence
    const validation = req.hotelStatusValidation;
    
    await db('hotels')
      .where({ hotel_id: hotelId })
      .update({
        status,
        updated_at: new Date()
      });

    // Log the status change
    await db('hotel_status_logs').insert({
      hotel_id: hotelId,
      previous_status: validation.originalStatus,
      new_status: status,
      changed_by: req.user.userId,
      reason: reason || 'No reason provided',
      created_at: new Date()
    }).catch(() => {
      // Table might not exist, log to console instead
      logger.info(`Hotel ${hotelId} status changed from ${validation.originalStatus} to ${status} by ${req.user.email} (${req.user.role})`);
    });

    const statusMessages = {
      'active': 'Hotel activated successfully',
      'inactive': 'Hotel deactivated successfully (can be reversed by Admin+)',
      'delisted': 'Hotel delisted permanently (only Super Admin+ can modify)',
      'deleted': 'Hotel deleted permanently (only GOD Admin can perform this action)'
    };

    res.json({
      success: true,
      message: statusMessages[status as keyof typeof statusMessages],
      data: {
        hotelId,
        previousStatus: validation.originalStatus,
        newStatus: status,
        changedBy: req.user.role,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Update hotel status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new hotel (Admin+ level required)
router.post('/', [
  verifyToken,
  requireRoleLevel(RoleLevel.ADMIN),
  body('name').isLength({ min: 2, max: 100 }),
  body('description').isLength({ min: 10, max: 500 }),
  body('address').isLength({ min: 5, max: 200 }),
  body('city').isLength({ min: 2, max: 50 }),
  body('country').isLength({ min: 2, max: 50 }),
  body('phone').matches(/^\+?[\d\s\-\(\)]+$/)
], async (req: any, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      name,
      description,
      address,
      city,
      state,
      country,
      postal_code,
      phone,
      email,
      star_rating,
      check_in_time,
      check_out_time
    } = req.body;

    // Generate hotel ID using proper format
    const hotelId = await generateHotelId();

    const newHotel = {
      hotel_id: hotelId,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description,
      address,
      city,
      state: state || '',
      country,
      postal_code: postal_code || '',
      phone,
      email: email || '',
      star_rating: star_rating || 0,
      check_in_time: check_in_time || '15:00:00',
      check_out_time: check_out_time || '11:00:00',
      status: 'active',
      is_featured: false,
      avg_rating: 0,
      total_reviews: 0,
      created_at: new Date()
    };

    const [insertId] = await db('hotels').insert(newHotel);

    logger.info(`New hotel created: ${hotelId} by user ${req.user.email} (${req.user.role})`);

    res.status(201).json({
      success: true,
      message: 'Hotel created successfully',
      data: { ...newHotel, id: insertId }
    });
  } catch (error) {
    logger.error('Create hotel error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update hotel information (Admin+ level required)
router.put('/:hotelId', [
  verifyToken,
  requireRoleLevel(RoleLevel.ADMIN),
  body('name').optional().isLength({ min: 2, max: 100 }),
  body('description').optional().isLength({ min: 10, max: 500 }),
  body('address').optional().isLength({ min: 5, max: 200 }),
  body('city').optional().isLength({ min: 2, max: 50 }),
  body('country').optional().isLength({ min: 2, max: 50 })
], async (req: any, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { hotelId } = req.params;
    
    const hotel = await db('hotels').where({ hotel_id: hotelId }).first();
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    // Remove status from update data (use separate endpoint for status changes)
    const { status, ...updateData } = req.body;
    
    const updatedHotel = {
      ...updateData,
      updated_at: new Date()
    };

    await db('hotels')
      .where({ hotel_id: hotelId })
      .update(updatedHotel);

    logger.info(`Hotel updated: ${hotelId} by user ${req.user.email} (${req.user.role})`);

    res.json({
      success: true,
      message: 'Hotel updated successfully',
      data: updatedHotel
    });
  } catch (error) {
    logger.error('Update hotel error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all hotels with admin permissions (shows all statuses)
router.get('/admin/all', [
  verifyToken,
  requireRoleLevel(RoleLevel.ADMIN)
], async (req: any, res) => {
  try {
    const { status, search } = req.query;
    
    let query = db('hotels').select();
    
    if (status) {
      query = query.where('status', status);
    }
    
    if (search) {
      query = query.where(function() {
        this.where('name', 'like', `%${search}%`)
            .orWhere('city', 'like', `%${search}%`)
            .orWhere('country', 'like', `%${search}%`);
      });
    }

    const hotels = await query.orderBy('created_at', 'desc');
    
    res.json({
      success: true,
      data: hotels,
      summary: {
        total: hotels.length,
        active: hotels.filter(h => h.status === 'active').length,
        inactive: hotels.filter(h => h.status === 'inactive').length,
        delisted: hotels.filter(h => h.status === 'delisted').length,
        deleted: hotels.filter(h => h.status === 'deleted').length
      }
    });
  } catch (error) {
    logger.error('Get admin hotels error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;