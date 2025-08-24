import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import db from '../config/database';
import { logger } from '../utils/logger';
import {
  requirePermission,
  requireRoleLevel,
  RoleLevel,
  PERMISSIONS,
  ROLE_HIERARCHY
} from '../middleware/roleMiddleware';
import {
  generateUserId,
  canCreateRole,
  ROLE_DIGITS
} from '../utils/idGenerator';

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

// Get all staff members (Admin+ level required)
router.get('/', [
  verifyToken,
  requireRoleLevel(RoleLevel.ADMIN)
], async (req: any, res) => {
  try {
    const { hotelId, role, status, search } = req.query;
    
    let query = db('hotel_users')
      .select([
        'hotel_user_id',
        'hotel_id', 
        'email',
        'first_name',
        'last_name',
        'phone',
        'role',
        'permissions',
        'status',
        'last_login',
        'created_at',
        'created_by'
      ]);

    // Filter by hotel if specified (system admins can see all)
    if (hotelId && req.user.hotelId !== '0000000000') {
      query = query.where('hotel_id', hotelId);
    } else if (req.user.hotelId !== '0000000000') {
      // Non-system admins can only see their hotel's staff
      query = query.where('hotel_id', req.user.hotelId);
    }
    
    if (role) {
      query = query.where('role', role);
    }
    
    if (status) {
      query = query.where('status', status);
    }

    if (search) {
      query = query.where(function() {
        this.where('first_name', 'like', `%${search}%`)
            .orWhere('last_name', 'like', `%${search}%`)
            .orWhere('email', 'like', `%${search}%`);
      });
    }

    const staff = await query.orderBy('created_at', 'desc');
    
    // Parse permissions JSON for each staff member
    const safeStaff = staff.map(member => ({
      ...member,
      permissions: typeof member.permissions === 'string' 
        ? JSON.parse(member.permissions) 
        : member.permissions,
      fullName: `${member.first_name} ${member.last_name}`
    }));

    res.json({
      success: true,
      data: safeStaff,
      summary: {
        total: safeStaff.length,
        active: safeStaff.filter(s => s.status === 'active').length,
        inactive: safeStaff.filter(s => s.status === 'inactive').length
      }
    });
  } catch (error) {
    logger.error('Get staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get staff member by ID
router.get('/:userId', [
  verifyToken,
  requireRoleLevel(RoleLevel.ADMIN)
], async (req: any, res) => {
  try {
    const { userId } = req.params;
    
    let query = db('hotel_users')
      .where('hotel_user_id', userId)
      .first();

    // Non-system admins can only see their hotel's staff
    if (req.user.hotelId !== '0000000000') {
      query = query.where('hotel_id', req.user.hotelId);
    }
    
    const staff = await query;
    
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }

    // Parse permissions and add full name
    const safeStaff = {
      ...staff,
      permissions: typeof staff.permissions === 'string' 
        ? JSON.parse(staff.permissions) 
        : staff.permissions,
      fullName: `${staff.first_name} ${staff.last_name}`
    };

    res.json({
      success: true,
      data: safeStaff
    });
  } catch (error) {
    logger.error('Get staff member error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new staff member (Admin+ level required with role restrictions)
router.post('/', [
  verifyToken,
  requireRoleLevel(RoleLevel.ADMIN),
  body('email').isEmail().normalizeEmail(),
  body('firstName').isLength({ min: 2, max: 50 }).trim(),
  body('lastName').isLength({ min: 2, max: 50 }).trim(),
  body('phone').optional().matches(/^\+?[\d\s\-\(\)]{8,15}$/),
  body('role').isIn(Object.keys(ROLE_HIERARCHY)),
  body('password').isLength({ min: 6, max: 100 }),
  body('hotelId').optional().isLength({ min: 10, max: 10 })
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

    const { email, firstName, lastName, phone, role, password, hotelId } = req.body;
    
    // Check role creation permissions
    if (!canCreateRole(req.user.role, role)) {
      return res.status(403).json({
        success: false,
        message: `${req.user.role} cannot create ${role} users. Only GOD Admin and Super Admin can create admin roles.`
      });
    }
    
    // Check if email already exists
    const existingUser = await db('hotel_users').where({ email }).first();
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    // Determine target hotel
    const targetHotelId = hotelId || req.user.hotelId;
    
    // System admins can create users for any hotel, others only their own
    if (req.user.hotelId !== '0000000000' && targetHotelId !== req.user.hotelId) {
      return res.status(403).json({
        success: false,
        message: 'Cannot create staff for other hotels'
      });
    }

    // Verify hotel exists
    const hotel = await db('hotels').where('hotel_id', targetHotelId).first();
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }
    
    // Generate user ID with proper format
    const userId = await generateUserId(targetHotelId, role);
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Get default permissions for role
    const defaultPermissions = {
      level: role,
      role_level: ROLE_DIGITS[role as keyof typeof ROLE_DIGITS],
      created_by_role: req.user.role
    };
    
    const newStaff = {
      hotel_user_id: userId,
      hotel_id: targetHotelId,
      email,
      password: hashedPassword,
      first_name: firstName,
      last_name: lastName,
      phone: phone || null,
      role,
      permissions: JSON.stringify(defaultPermissions),
      status: 'active',
      created_by: req.user.userId,
      created_at: new Date()
    };
    
    await db('hotel_users').insert(newStaff);
    
    logger.info(`New staff member created: ${userId} (${role}) by ${req.user.email} (${req.user.role})`);

    // Remove password from response
    const { password: _, ...safeData } = newStaff;
    const responseData = {
      ...safeData,
      permissions: defaultPermissions,
      fullName: `${firstName} ${lastName}`
    };

    res.status(201).json({
      success: true,
      message: 'Staff member created successfully',
      data: responseData
    });
  } catch (error) {
    logger.error('Create staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update staff member (Admin+ level required)
router.put('/:userId', [
  verifyToken,
  requireRoleLevel(RoleLevel.ADMIN),
  body('email').optional().isEmail().normalizeEmail(),
  body('firstName').optional().isLength({ min: 2, max: 50 }).trim(),
  body('lastName').optional().isLength({ min: 2, max: 50 }).trim(),
  body('phone').optional().matches(/^\+?[\d\s\-\(\)]{8,15}$/),
  body('role').optional().isIn(Object.keys(ROLE_HIERARCHY)),
  body('status').optional().isIn(['active', 'inactive'])
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

    const { userId } = req.params;
    const { email, firstName, lastName, phone, role, status } = req.body;
    
    // Find existing staff member
    let query = db('hotel_users').where('hotel_user_id', userId);
    
    // Non-system admins can only update their hotel's staff
    if (req.user.hotelId !== '0000000000') {
      query = query.where('hotel_id', req.user.hotelId);
    }
    
    const existingStaff = await query.first();
    
    if (!existingStaff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }
    
    // Check role update permissions
    if (role && role !== existingStaff.role) {
      if (!canCreateRole(req.user.role, role)) {
        return res.status(403).json({
          success: false,
          message: `${req.user.role} cannot assign ${role} role. Only GOD Admin and Super Admin can assign admin roles.`
        });
      }
    }
    
    // Check if new email already exists (excluding current user)
    if (email && email !== existingStaff.email) {
      const emailExists = await db('hotel_users')
        .where({ email })
        .where('hotel_user_id', '!=', userId)
        .first();
        
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }
    
    // Prevent self-deactivation
    if (status === 'inactive' && userId === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own account'
      });
    }
    
    // Build update object
    const updateData: any = {
      updated_at: new Date()
    };
    
    if (email) updateData.email = email;
    if (firstName) updateData.first_name = firstName;
    if (lastName) updateData.last_name = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (role) updateData.role = role;
    if (status) updateData.status = status;
    
    // Update permissions if role changed
    if (role && role !== existingStaff.role) {
      const newPermissions = {
        level: role,
        role_level: ROLE_DIGITS[role as keyof typeof ROLE_DIGITS],
        updated_by_role: req.user.role,
        previous_role: existingStaff.role
      };
      updateData.permissions = JSON.stringify(newPermissions);
    }
    
    await db('hotel_users')
      .where('hotel_user_id', userId)
      .update(updateData);
    
    logger.info(`Staff member updated: ${userId} by ${req.user.email} (${req.user.role})`);

    res.json({
      success: true,
      message: 'Staff member updated successfully',
      data: {
        userId,
        updatedFields: Object.keys(updateData).filter(key => key !== 'updated_at'),
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Update staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete/Deactivate staff member (Admin+ level required)
router.delete('/:userId', [
  verifyToken,
  requireRoleLevel(RoleLevel.ADMIN)
], async (req: any, res) => {
  try {
    const { userId } = req.params;
    
    // Find existing staff member
    let query = db('hotel_users').where('hotel_user_id', userId);
    
    // Non-system admins can only delete their hotel's staff
    if (req.user.hotelId !== '0000000000') {
      query = query.where('hotel_id', req.user.hotelId);
    }
    
    const existingStaff = await query.first();
    
    if (!existingStaff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }
    
    // Prevent self-deletion
    if (userId === req.user.userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }
    
    // Check deletion permissions (cannot delete same or higher level roles)
    const currentUserLevel = ROLE_HIERARCHY[req.user.role];
    const targetUserLevel = ROLE_HIERARCHY[existingStaff.role];
    
    if (targetUserLevel <= currentUserLevel && req.user.role !== 'GOD Admin') {
      return res.status(403).json({
        success: false,
        message: `Cannot delete ${existingStaff.role}. Insufficient permissions.`
      });
    }
    
    // Soft delete - deactivate instead of removing
    await db('hotel_users')
      .where('hotel_user_id', userId)
      .update({
        status: 'inactive',
        updated_at: new Date()
      });
    
    logger.info(`Staff member deactivated: ${userId} (${existingStaff.role}) by ${req.user.email} (${req.user.role})`);

    res.json({
      success: true,
      message: 'Staff member deactivated successfully',
      data: {
        userId,
        name: `${existingStaff.first_name} ${existingStaff.last_name}`,
        role: existingStaff.role,
        deactivatedBy: req.user.role
      }
    });
  } catch (error) {
    logger.error('Delete staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Reset staff member password (Admin+ level required)
router.post('/:userId/reset-password', [
  verifyToken,
  requireRoleLevel(RoleLevel.ADMIN),
  body('newPassword').isLength({ min: 6, max: 100 })
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

    const { userId } = req.params;
    const { newPassword } = req.body;
    
    // Find existing staff member
    let query = db('hotel_users').where('hotel_user_id', userId);
    
    // Non-system admins can only reset passwords for their hotel's staff
    if (req.user.hotelId !== '0000000000') {
      query = query.where('hotel_id', req.user.hotelId);
    }
    
    const existingStaff = await query.first();
    
    if (!existingStaff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await db('hotel_users')
      .where('hotel_user_id', userId)
      .update({
        password: hashedPassword,
        updated_at: new Date()
      });
    
    logger.info(`Password reset for staff member: ${userId} by ${req.user.email} (${req.user.role})`);

    res.json({
      success: true,
      message: 'Password reset successfully',
      data: {
        userId,
        resetBy: req.user.role,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get available roles and their permissions
router.get('/roles/available', [
  verifyToken,
  requireRoleLevel(RoleLevel.ADMIN)
], async (req: any, res) => {
  try {
    const userRoleLevel = ROLE_HIERARCHY[req.user.role];
    
    // Filter roles based on what the current user can create
    const availableRoles = Object.entries(ROLE_HIERARCHY)
      .filter(([role, level]) => canCreateRole(req.user.role, role))
      .map(([role, level]) => ({
        name: role,
        level,
        digit: ROLE_DIGITS[role as keyof typeof ROLE_DIGITS],
        canCreate: true
      }));

    res.json({
      success: true,
      data: {
        availableRoles,
        currentUserRole: req.user.role,
        currentUserLevel: userRoleLevel
      }
    });
  } catch (error) {
    logger.error('Get available roles error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;