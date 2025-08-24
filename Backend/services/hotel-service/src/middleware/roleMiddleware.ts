import { Request, Response, NextFunction } from 'express';
import db from '../config/database';
import { logger } from '../utils/logger';

// Role hierarchy levels
export enum RoleLevel {
  GOD_ADMIN = 0,        // Can do everything, including permanent delete
  SUPER_ADMIN = 1,      // Can do everything except delete, can delist hotels (permanent)
  ADMIN = 2,            // Can do everything except delist, can deactivate hotels (reversible)
  MANAGER = 3,          // Hotel operations
  STAFF = 4             // Limited access based on department
}

// Role mappings
export const ROLE_HIERARCHY: { [key: string]: RoleLevel } = {
  'GOD Admin': RoleLevel.GOD_ADMIN,
  'Super Admin': RoleLevel.SUPER_ADMIN,
  'Hotel Admin': RoleLevel.ADMIN,
  'Manager': RoleLevel.MANAGER,
  'Finance Department': RoleLevel.STAFF,
  'Front Desk': RoleLevel.STAFF,
  'Booking Agent': RoleLevel.STAFF,
  'Gatekeeper': RoleLevel.STAFF,
  'Support': RoleLevel.STAFF,
  'Tech Support': RoleLevel.STAFF,
  'Service Boy': RoleLevel.STAFF,
  'Maintenance': RoleLevel.STAFF,
  'Kitchen': RoleLevel.STAFF
};

// Permission definitions
export const PERMISSIONS = {
  // Hotel management
  HOTEL_CREATE: 'hotel.create',
  HOTEL_READ: 'hotel.read',
  HOTEL_UPDATE: 'hotel.update',
  HOTEL_DELETE: 'hotel.delete',           // GOD Admin only - permanent delete
  HOTEL_DELIST: 'hotel.delist',           // Super Admin+ - permanent delist (cannot be reversed)
  HOTEL_DEACTIVATE: 'hotel.deactivate',   // Admin+ - temporary deactivate (can be reversed)
  
  // Staff management  
  STAFF_CREATE: 'staff.create',
  STAFF_READ: 'staff.read',
  STAFF_UPDATE: 'staff.update',
  STAFF_DELETE: 'staff.delete',
  
  // Booking management
  BOOKING_CREATE: 'booking.create',
  BOOKING_READ: 'booking.read',
  BOOKING_UPDATE: 'booking.update',
  BOOKING_DELETE: 'booking.delete',
  
  // Reports and analytics
  REPORTS_FULL: 'reports.full',
  REPORTS_FINANCIAL: 'reports.financial',
  REPORTS_OPERATIONAL: 'reports.operational',
  
  // System administration
  SYSTEM_CONFIG: 'system.config',
  SYSTEM_LOGS: 'system.logs'
};

// Role-based permissions mapping
export const ROLE_PERMISSIONS: { [key in RoleLevel]: string[] } = {
  [RoleLevel.GOD_ADMIN]: [
    // GOD Admin has ALL permissions
    ...Object.values(PERMISSIONS)
  ],
  
  [RoleLevel.SUPER_ADMIN]: [
    // Everything except permanent delete
    PERMISSIONS.HOTEL_CREATE,
    PERMISSIONS.HOTEL_READ,
    PERMISSIONS.HOTEL_UPDATE,
    PERMISSIONS.HOTEL_DELIST,     // Can delist (permanent)
    PERMISSIONS.HOTEL_DEACTIVATE,
    PERMISSIONS.STAFF_CREATE,
    PERMISSIONS.STAFF_READ,
    PERMISSIONS.STAFF_UPDATE,
    PERMISSIONS.STAFF_DELETE,
    PERMISSIONS.BOOKING_CREATE,
    PERMISSIONS.BOOKING_READ,
    PERMISSIONS.BOOKING_UPDATE,
    PERMISSIONS.BOOKING_DELETE,
    PERMISSIONS.REPORTS_FULL,
    PERMISSIONS.SYSTEM_CONFIG,
    PERMISSIONS.SYSTEM_LOGS
  ],
  
  [RoleLevel.ADMIN]: [
    // Everything except delist and delete
    PERMISSIONS.HOTEL_CREATE,
    PERMISSIONS.HOTEL_READ,
    PERMISSIONS.HOTEL_UPDATE,
    PERMISSIONS.HOTEL_DEACTIVATE, // Can only deactivate (reversible)
    PERMISSIONS.STAFF_CREATE,
    PERMISSIONS.STAFF_READ,
    PERMISSIONS.STAFF_UPDATE,
    PERMISSIONS.STAFF_DELETE,
    PERMISSIONS.BOOKING_CREATE,
    PERMISSIONS.BOOKING_READ,
    PERMISSIONS.BOOKING_UPDATE,
    PERMISSIONS.BOOKING_DELETE,
    PERMISSIONS.REPORTS_FULL
  ],
  
  [RoleLevel.MANAGER]: [
    PERMISSIONS.HOTEL_READ,
    PERMISSIONS.HOTEL_UPDATE,
    PERMISSIONS.STAFF_READ,
    PERMISSIONS.STAFF_UPDATE,
    PERMISSIONS.BOOKING_CREATE,
    PERMISSIONS.BOOKING_READ,
    PERMISSIONS.BOOKING_UPDATE,
    PERMISSIONS.REPORTS_OPERATIONAL,
    PERMISSIONS.REPORTS_FINANCIAL
  ],
  
  [RoleLevel.STAFF]: [
    // Department-specific permissions handled separately
    PERMISSIONS.HOTEL_READ,
    PERMISSIONS.BOOKING_READ
  ]
};

// Department-specific permissions for staff roles
export const DEPARTMENT_PERMISSIONS: { [key: string]: string[] } = {
  'Finance Department': [
    ...ROLE_PERMISSIONS[RoleLevel.STAFF],
    PERMISSIONS.REPORTS_FINANCIAL,
    PERMISSIONS.BOOKING_READ,
    PERMISSIONS.BOOKING_UPDATE
  ],
  'Front Desk': [
    ...ROLE_PERMISSIONS[RoleLevel.STAFF],
    PERMISSIONS.BOOKING_CREATE,
    PERMISSIONS.BOOKING_READ,
    PERMISSIONS.BOOKING_UPDATE,
    PERMISSIONS.BOOKING_DELETE
  ],
  'Booking Agent': [
    ...ROLE_PERMISSIONS[RoleLevel.STAFF],
    PERMISSIONS.BOOKING_CREATE,
    PERMISSIONS.BOOKING_READ,
    PERMISSIONS.BOOKING_UPDATE
  ],
  'Support': [
    ...ROLE_PERMISSIONS[RoleLevel.STAFF],
    PERMISSIONS.BOOKING_READ
  ],
  'Tech Support': [
    ...ROLE_PERMISSIONS[RoleLevel.STAFF],
    PERMISSIONS.SYSTEM_LOGS
  ],
  'Maintenance': [
    ...ROLE_PERMISSIONS[RoleLevel.STAFF],
    PERMISSIONS.HOTEL_READ
  ],
  'Kitchen': [
    ...ROLE_PERMISSIONS[RoleLevel.STAFF],
    PERMISSIONS.BOOKING_READ
  ],
  'Service Boy': [
    ...ROLE_PERMISSIONS[RoleLevel.STAFF],
    PERMISSIONS.BOOKING_READ
  ],
  'Gatekeeper': [
    ...ROLE_PERMISSIONS[RoleLevel.STAFF],
    PERMISSIONS.BOOKING_READ
  ]
};

// Get user permissions based on role
export function getUserPermissions(role: string): string[] {
  const roleLevel = ROLE_HIERARCHY[role];
  
  if (roleLevel !== undefined && roleLevel <= RoleLevel.MANAGER) {
    return ROLE_PERMISSIONS[roleLevel];
  }
  
  // For staff roles, check department-specific permissions
  return DEPARTMENT_PERMISSIONS[role] || ROLE_PERMISSIONS[RoleLevel.STAFF];
}

// Check if user has specific permission
export function hasPermission(userRole: string, permission: string): boolean {
  const permissions = getUserPermissions(userRole);
  return permissions.includes(permission);
}

// Middleware to check permissions
export function requirePermission(permission: string) {
  return async (req: any, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const userRole = req.user.role;
      
      if (!hasPermission(userRole, permission)) {
        logger.warn(`Permission denied: User ${req.user.email} (${userRole}) attempted to access ${permission}`);
        
        return res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          required: permission,
          userRole: userRole
        });
      }

      next();
    } catch (error) {
      logger.error('Permission check error:', error);
      res.status(500).json({
        success: false,
        message: 'Permission check failed'
      });
    }
  };
}

// Middleware to check role level
export function requireRoleLevel(minimumLevel: RoleLevel) {
  return async (req: any, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const userRole = req.user.role;
      const userLevel = ROLE_HIERARCHY[userRole];
      
      if (userLevel === undefined || userLevel > minimumLevel) {
        logger.warn(`Role level denied: User ${req.user.email} (${userRole}, level ${userLevel}) needs minimum level ${minimumLevel}`);
        
        return res.status(403).json({
          success: false,
          message: 'Insufficient role level',
          required: minimumLevel,
          current: userLevel,
          userRole: userRole
        });
      }

      next();
    } catch (error) {
      logger.error('Role level check error:', error);
      res.status(500).json({
        success: false,
        message: 'Role level check failed'
      });
    }
  };
}

// Hotel status management middleware
export function validateHotelStatusChange() {
  return async (req: any, res: Response, next: NextFunction) => {
    try {
      const { status } = req.body;
      const userRole = req.user.role;
      const hotelId = req.params.hotelId || req.body.hotelId;
      
      if (!status || !hotelId) {
        return next();
      }

      // Check current hotel status
      const hotel = await db('hotels').where({ hotel_id: hotelId }).first();
      if (!hotel) {
        return res.status(404).json({
          success: false,
          message: 'Hotel not found'
        });
      }

      // Prevent overriding delisted status
      if (hotel.status === 'delisted' && status !== 'delisted') {
        const userLevel = ROLE_HIERARCHY[userRole];
        
        if (userLevel > RoleLevel.SUPER_ADMIN) {
          return res.status(403).json({
            success: false,
            message: 'Cannot restore delisted hotel. Only Super Admin or GOD Admin can modify delisted hotels.',
            currentStatus: hotel.status,
            attemptedStatus: status
          });
        }
      }

      // Check permission for status changes
      if (status === 'delisted' && !hasPermission(userRole, PERMISSIONS.HOTEL_DELIST)) {
        return res.status(403).json({
          success: false,
          message: 'Only Super Admin or GOD Admin can delist hotels permanently'
        });
      }

      if (status === 'deleted' && !hasPermission(userRole, PERMISSIONS.HOTEL_DELETE)) {
        return res.status(403).json({
          success: false,
          message: 'Only GOD Admin can permanently delete hotels'
        });
      }

      req.hotelStatusValidation = {
        originalStatus: hotel.status,
        newStatus: status,
        canModify: true
      };

      next();
    } catch (error) {
      logger.error('Hotel status validation error:', error);
      res.status(500).json({
        success: false,
        message: 'Status validation failed'
      });
    }
  };
}

export default {
  requirePermission,
  requireRoleLevel,
  validateHotelStatusChange,
  hasPermission,
  getUserPermissions,
  PERMISSIONS,
  RoleLevel
};