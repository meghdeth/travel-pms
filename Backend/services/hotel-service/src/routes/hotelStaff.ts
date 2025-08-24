import express from 'express';

// Extend Request type to include user placed by verifyToken middleware
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import db from '../config/database';
import { logger } from '../utils/logger';
import { verifyToken } from './auth';
import { RoleLevel, ROLE_HIERARCHY } from '../middleware/roleMiddleware';

const router = express.Router({ mergeParams: true });

// Get staff member (hotel scoped)
router.get('/:hotelId/staff/:staffId', verifyToken, async (req: express.Request, res: express.Response) => {
  try {
    const { hotelId, staffId } = req.params;
    // Only allow if token hotel matches or system admin
    if (req.user.hotelId !== '0000000000' && req.user.hotelId !== hotelId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const staff = await db('staff').where({ staff_id: staffId, hotel_id: hotelId }).first();
  if (!staff) return res.status(404).json({ success: false, message: 'Staff not found' });

  return res.json({ success: true, data: { ...staff, permissions: JSON.parse(staff.permissions) } });
  } catch (error) {
  logger.error('Get hotel staff error:', error);
  return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Create new staff under hotel
router.post('/:hotelId/staff', [
  verifyToken,
  body('email').isEmail().normalizeEmail(),
  body('firstName').isLength({ min: 2 }).trim(),
  body('lastName').isLength({ min: 1 }).trim(),
  body('role').isString(),
  body('password').isLength({ min: 6 })
], async (req: express.Request, res: express.Response) => {
  try {
    const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { hotelId } = req.params;
    // Only Hotel Admin (or higher) can create staff
    const userRole = req.user?.role;
    const userLevel = ROLE_HIERARCHY[userRole];
    if (userLevel === undefined || userLevel > RoleLevel.ADMIN) {
      return res.status(403).json({ success: false, message: 'Only Hotel Admin or higher can create staff' });
    }
    if (req.user.hotelId !== '0000000000' && req.user.hotelId !== hotelId) {
      return res.status(403).json({ success: false, message: 'Cannot create staff for other hotel' });
    }

    const { email, firstName, lastName, phone, role, password } = req.body;

    const existing = await db('staff').where({ hotel_id: hotelId, email }).first();
  if (existing) return res.status(400).json({ success: false, message: 'Email exists' });

    const hashed = await bcrypt.hash(password, 10);
  const countRow: any = await db('staff').count('id as count').first();
  const seq = typeof countRow?.count === 'number' ? countRow.count : parseInt(countRow?.count || '0', 10);
  const staffId = `S${hotelId}${String(seq + 1).padStart(5, '0')}`;

    const perms = { role, created_by: req.user.userId };

    const newStaff = {
      staff_id: staffId,
      hotel_id: hotelId,
      email,
      password: hashed,
      first_name: firstName,
      last_name: lastName,
      phone: phone || null,
      role,
      permissions: JSON.stringify(perms),
      status: 'active'
    };

    await db('staff').insert(newStaff);
  logger.info(`Created staff ${staffId} for hotel ${hotelId} by ${req.user.userId}`);

  return res.status(201).json({ success: true, data: { ...newStaff, password: undefined, permissions: perms } });
  } catch (error) {
  logger.error('Create hotel staff error:', error);
  return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Update staff
router.put('/:hotelId/staff/:staffId', [
  verifyToken,
  body('email').optional().isEmail().normalizeEmail(),
  body('firstName').optional().isLength({ min: 2 }).trim(),
  body('lastName').optional().isLength({ min: 1 }).trim(),
  body('role').optional().isString(),
  body('status').optional().isIn(['active','inactive'])
], async (req: express.Request, res: express.Response) => {
  try {

    const { hotelId, staffId } = req.params;
    // Only Hotel Admin (or higher) can update staff
    const userRole = req.user?.role;
    const userLevel = ROLE_HIERARCHY[userRole];
    if (userLevel === undefined || userLevel > RoleLevel.ADMIN) {
      return res.status(403).json({ success: false, message: 'Only Hotel Admin or higher can update staff' });
    }
    if (req.user.hotelId !== '0000000000' && req.user.hotelId !== hotelId) return res.status(403).json({ success: false, message: 'Forbidden' });

    const existing = await db('staff').where({ staff_id: staffId, hotel_id: hotelId }).first();
  if (!existing) return res.status(404).json({ success: false, message: 'Staff not found' });

  const updateData: any = {};
    const { email, firstName, lastName, phone, role, status } = req.body;
    if (email) updateData.email = email;
    if (firstName) updateData.first_name = firstName;
    if (lastName) updateData.last_name = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (role) updateData.role = role;
    if (status) updateData.status = status;
    updateData.updated_at = new Date();

  await db('staff').where({ staff_id: staffId }).update(updateData);
  logger.info(`Updated staff ${staffId}`);
  return res.json({ success: true, message: 'Updated', data: { staffId, ...updateData } });
  } catch (error) {
  logger.error('Update hotel staff error:', error);
  return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Delete staff (soft)
router.delete('/:hotelId/staff/:staffId', verifyToken, async (req: express.Request, res: express.Response) => {
  try {
    const { hotelId, staffId } = req.params;
    // Only Hotel Admin (or higher) can delete staff
    const userRole = req.user?.role;
    const userLevel = ROLE_HIERARCHY[userRole];
    if (userLevel === undefined || userLevel > RoleLevel.ADMIN) {
      return res.status(403).json({ success: false, message: 'Only Hotel Admin or higher can delete staff' });
    }
    if (req.user.hotelId !== '0000000000' && req.user.hotelId !== hotelId) return res.status(403).json({ success: false, message: 'Forbidden' });

    const existing = await db('staff').where({ staff_id: staffId, hotel_id: hotelId }).first();
  if (!existing) return res.status(404).json({ success: false, message: 'Staff not found' });

  await db('staff').where({ staff_id: staffId }).update({ status: 'inactive', updated_at: new Date() });
  logger.info(`Deactivated staff ${staffId}`);
  return res.json({ success: true, message: 'Staff deactivated' });
  } catch (error) {
  logger.error('Delete hotel staff error:', error);
  return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// PATCH status endpoint - only Manager of the same hotel can update status
router.patch('/:hotelId/staff/:staffId/status', [
  verifyToken,
  body('status').isIn(['active', 'inactive', 'suspended'])
], async (req: express.Request, res: express.Response) => {
  try {
    const { hotelId, staffId } = req.params;
    const user = req.user;
  if (!user) return res.status(401).json({ success: false, message: 'Authentication required' });

    // Only Manager role can update status and must belong to same hotel
    if (user.role !== 'Manager' || user.hotelId !== hotelId) {
      return res.status(403).json({ success: false, message: 'Only Manager of this hotel can change staff status' });
    }

    const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { status } = req.body as any;
    const existing = await db('staff').where({ staff_id: staffId, hotel_id: hotelId }).first();
  if (!existing) return res.status(404).json({ success: false, message: 'Staff not found' });

  await db('staff').where({ staff_id: staffId }).update({ status, updated_at: new Date() });
  logger.info(`Manager ${user.userId} updated status for ${staffId} to ${status}`);
  return res.json({ success: true, message: 'Status updated', data: { staffId, status } });
  } catch (error) {
  logger.error('Update status error:', error);
  return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Frontend-compatible endpoints (using /users instead of /staff)
// Get all hotel users (staff and admins)
router.get('/:hotelId/users', verifyToken, async (req: express.Request, res: express.Response) => {
  try {
    const { hotelId } = req.params;
    
    // Only allow if token hotel matches or system admin
    if (req.user.hotelId !== '0000000000' && req.user.hotelId !== hotelId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    // Get both staff and hotel admins
    const staff = await db('staff')
      .where({ hotel_id: hotelId, status: 'active' })
      .select('staff_id as hotel_user_id', 'email', 'first_name', 'last_name', 'phone', 'role', 'status', 'last_login', 'created_at', 'updated_at', 'hotel_id');
    
    const admins = await db('hotel_admins')
      .where({ hotel_id: hotelId, status: 'active' })
      .select('admin_id as hotel_user_id', 'email', 'first_name', 'last_name', 'phone', 'role', 'status', 'last_login', 'created_at', 'updated_at', 'hotel_id');

    const allUsers = [...staff, ...admins];
    
    logger.info(`Retrieved ${allUsers.length} users for hotel ${hotelId}`);
    return res.json({ success: true, data: allUsers });
  } catch (error) {
    logger.error('Get hotel users error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get user statistics
router.get('/:hotelId/users/statistics', verifyToken, async (req: express.Request, res: express.Response) => {
  try {
    const { hotelId } = req.params;
    
    // Only allow if token hotel matches or system admin
    if (req.user.hotelId !== '0000000000' && req.user.hotelId !== hotelId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    // Get statistics from both tables
    const staffStats = await db('staff')
      .where({ hotel_id: hotelId })
      .select('status', 'role')
      .count('* as count')
      .groupBy('status', 'role');
    
    const adminStats = await db('hotel_admins')
      .where({ hotel_id: hotelId })
      .select('status', 'role')
      .count('* as count')
      .groupBy('status', 'role');

    // Combine and calculate totals
    const allStats = [...staffStats, ...adminStats];
    
    let totalStaff = 0;
    let activeStaff = 0;
    let inactiveStaff = 0;
    let suspendedStaff = 0;
    const roleDistribution: { [key: string]: number } = {};

    allStats.forEach((stat: any) => {
      const count = parseInt(stat.count);
      totalStaff += count;
      
      if (stat.status === 'active') activeStaff += count;
      else if (stat.status === 'inactive') inactiveStaff += count;
      else if (stat.status === 'suspended') suspendedStaff += count;
      
      roleDistribution[stat.role] = (roleDistribution[stat.role] || 0) + count;
    });

    const statistics = {
      totalStaff,
      activeStaff,
      inactiveStaff,
      suspendedStaff,
      roleDistribution: Object.entries(roleDistribution).map(([role, count]) => ({ role, count }))
    };

    return res.json({ success: true, data: statistics });
  } catch (error) {
    logger.error('Get hotel user statistics error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Create new user (staff)
router.post('/:hotelId/users', [
  verifyToken,
  body('email').isEmail().normalizeEmail(),
  body('firstName').isLength({ min: 2 }).trim(),
  body('lastName').isLength({ min: 1 }).trim(),
  body('role').isString(),
  body('password').isLength({ min: 6 })
], async (req: express.Request, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { hotelId } = req.params;
    // Only Hotel Admin (or higher) can create staff
    const userRole = req.user?.role;
    const userLevel = ROLE_HIERARCHY[userRole];
    if (userLevel === undefined || userLevel > RoleLevel.ADMIN) {
      return res.status(403).json({ success: false, message: 'Only Hotel Admin or higher can create staff' });
    }
    if (req.user.hotelId !== '0000000000' && req.user.hotelId !== hotelId) {
      return res.status(403).json({ success: false, message: 'Cannot create staff for other hotel' });
    }

    const { email, firstName, lastName, phone, role, password } = req.body;

    // Check if user already exists in either table
    const existingStaff = await db('staff').where({ hotel_id: hotelId, email }).first();
    const existingAdmin = await db('hotel_admins').where({ hotel_id: hotelId, email }).first();
    if (existingStaff || existingAdmin) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);
    
    // If role is Hotel Admin, create in hotel_admins table
    if (role === 'Hotel Admin') {
      const countRow: any = await db('hotel_admins').count('id as count').first();
      const seq = typeof countRow?.count === 'number' ? countRow.count : parseInt(countRow?.count || '0', 10);
      const adminId = `HA${hotelId}${String(seq + 1).padStart(5, '0')}`;

      const newAdmin = {
        admin_id: adminId,
        hotel_id: hotelId,
        email,
        password: hashed,
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
        role,
        permissions: JSON.stringify({ role, created_by: req.user.userId }),
        status: 'active'
      };

      await db('hotel_admins').insert(newAdmin);
      logger.info(`Created hotel admin ${adminId} for hotel ${hotelId} by ${req.user.userId}`);

      return res.status(201).json({ 
        success: true, 
        data: { 
          ...newAdmin, 
          hotel_user_id: adminId,
          password: undefined, 
          permissions: JSON.parse(newAdmin.permissions) 
        }
      });
    } else {
      // Create in staff table
      const countRow: any = await db('staff').count('id as count').first();
      const seq = typeof countRow?.count === 'number' ? countRow.count : parseInt(countRow?.count || '0', 10);
      const staffId = `S${hotelId}${String(seq + 1).padStart(5, '0')}`;

      const newStaff = {
        staff_id: staffId,
        hotel_id: hotelId,
        email,
        password: hashed,
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
        role,
        permissions: JSON.stringify({ role, created_by: req.user.userId }),
        status: 'active'
      };

      await db('staff').insert(newStaff);
      logger.info(`Created staff ${staffId} for hotel ${hotelId} by ${req.user.userId}`);

      return res.status(201).json({ 
        success: true, 
        data: { 
          ...newStaff, 
          hotel_user_id: staffId,
          password: undefined, 
          permissions: JSON.parse(newStaff.permissions) 
        }
      });
    }
  } catch (error) {
    logger.error('Create hotel user error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Update user
router.put('/:hotelId/users/:userId', [
  verifyToken,
  body('email').optional().isEmail().normalizeEmail(),
  body('firstName').optional().isLength({ min: 2 }).trim(),
  body('lastName').optional().isLength({ min: 1 }).trim(),
  body('role').optional().isString(),
  body('status').optional().isIn(['active','inactive','suspended'])
], async (req: express.Request, res: express.Response) => {
  try {
    const { hotelId, userId } = req.params;
    
    // Only Hotel Admin (or higher) can update users
    const userRole = req.user?.role;
    const userLevel = ROLE_HIERARCHY[userRole];
    if (userLevel === undefined || userLevel > RoleLevel.ADMIN) {
      return res.status(403).json({ success: false, message: 'Only Hotel Admin or higher can update users' });
    }
    if (req.user.hotelId !== '0000000000' && req.user.hotelId !== hotelId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    // Find user in either table
    let existing = await db('staff').where({ staff_id: userId, hotel_id: hotelId }).first();
    let isStaff = true;
    
    if (!existing) {
      existing = await db('hotel_admins').where({ admin_id: userId, hotel_id: hotelId }).first();
      isStaff = false;
    }
    
    if (!existing) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updateData: any = {};
    const { email, firstName, lastName, phone, role, status } = req.body;
    
    if (email) updateData.email = email;
    if (firstName) updateData.first_name = firstName;
    if (lastName) updateData.last_name = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (role) updateData.role = role;
    if (status) updateData.status = status;
    updateData.updated_at = new Date();

    const tableName = isStaff ? 'staff' : 'hotel_admins';
    const idField = isStaff ? 'staff_id' : 'admin_id';
    
    await db(tableName).where({ [idField]: userId }).update(updateData);
    
    logger.info(`Updated ${tableName} ${userId}`);
    return res.json({ 
      success: true, 
      message: 'Updated', 
      data: { 
        hotel_user_id: userId,
        ...updateData 
      } 
    });
  } catch (error) {
    logger.error('Update hotel user error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Delete user (soft delete)
router.delete('/:hotelId/users/:userId', verifyToken, async (req: express.Request, res: express.Response) => {
  try {
    const { hotelId, userId } = req.params;
    
    // Only Hotel Admin (or higher) can delete users
    const userRole = req.user?.role;
    const userLevel = ROLE_HIERARCHY[userRole];
    if (userLevel === undefined || userLevel > RoleLevel.ADMIN) {
      return res.status(403).json({ success: false, message: 'Only Hotel Admin or higher can delete users' });
    }
    if (req.user.hotelId !== '0000000000' && req.user.hotelId !== hotelId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    // Find user in either table
    let existing = await db('staff').where({ staff_id: userId, hotel_id: hotelId }).first();
    let isStaff = true;
    
    if (!existing) {
      existing = await db('hotel_admins').where({ admin_id: userId, hotel_id: hotelId }).first();
      isStaff = false;
    }
    
    if (!existing) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const tableName = isStaff ? 'staff' : 'hotel_admins';
    const idField = isStaff ? 'staff_id' : 'admin_id';
    
    await db(tableName).where({ [idField]: userId }).update({ 
      status: 'inactive', 
      updated_at: new Date() 
    });
    
    logger.info(`Deactivated ${tableName} ${userId}`);
    return res.json({ success: true, message: 'User deactivated' });
  } catch (error) {
    logger.error('Delete hotel user error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;
