import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { HotelJWTPayload, HotelAuthRequest } from '../types/auth';

// Export types for use in other modules
export { HotelAuthRequest };
import { HotelUser } from '../models/HotelUser';
import { Hotel } from '../models/Hotel';
import { tokenBlacklistService } from '../services/TokenBlacklistService';

// Authenticate hotel user token
export const authenticateHotelToken = (req: HotelAuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  // Check if token is blacklisted
  if (tokenBlacklistService.isTokenBlacklisted(token)) {
    return res.status(401).json({ message: 'Token has been invalidated' });
  }

  jwt.verify(token, process.env.JWT_SECRET!, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    
    const payload = decoded as HotelJWTPayload;
    
    // Verify this is a hotel user token
    if (!payload.hotel_user_id || !payload.hotel_id) {
      return res.status(403).json({ message: 'Invalid hotel user token' });
    }

    // In authenticateHotelToken function, around line 35-45
    try {
      // Check HotelUser table for the user
      const hotelUser = await HotelUser.query()
        .findOne({ hotel_user_id: payload.hotel_user_id })
        .where('status', 'active');
      
      if (hotelUser) {
          // Only update last login if it's been more than 5 minutes since last update
          const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
          if (!hotelUser.last_login || hotelUser.last_login < fiveMinutesAgo) {
            await HotelUser.query()
              .findOne({ hotel_user_id: payload.hotel_user_id })
              .patch({ last_login: new Date() });
          }
      } else {
        return res.status(403).json({ message: 'Hotel user not found or inactive' });
      }

      // Verify hotel exists and is active
      const hotel = await Hotel.query()
        .findOne({ hotel_id: payload.hotel_id })
        .where('status', 'active');

      if (!hotel) {
        return res.status(403).json({ message: 'Hotel not found or inactive' });
      }

      req.hotelUser = payload;
      req.hotel = hotel;
      next();
    } catch (error) {
      console.error('Hotel token verification error:', error);
      return res.status(500).json({ message: 'Internal server error during authentication' });
    }
  });
};

// Require specific hotel roles
export const requireHotelRole = (roles: string[]) => {
  return async (req: HotelAuthRequest, res: Response, next: NextFunction) => {
    if (!req.hotelUser) {
      console.log('DEBUG: No hotelUser in request');
      return res.status(403).json({ message: 'Hotel authentication required' });
    }

    try {
      const userRole = req.hotelUser.role;
      console.log('DEBUG: User role:', userRole, 'Required roles:', roles);
      
      // Check if user has any of the required roles
      const hasPermission = roles.includes(userRole);
      console.log('DEBUG: Has permission:', hasPermission);
      
      if (!hasPermission) {
        console.log('DEBUG: Permission denied');
        return res.status(403).json({ 
          message: 'Insufficient permissions',
          required: roles,
          userRole: userRole
        });
      }
      
      console.log('DEBUG: Permission granted, proceeding');
      next();
    } catch (error) {
      console.error('Hotel role check error:', error);
      return res.status(500).json({ message: 'Internal server error during authorization' });
    }
  };
};

// Require specific permissions
export const requireHotelPermission = (permissions: string[]) => {
  return async (req: HotelAuthRequest, res: Response, next: NextFunction) => {
    if (!req.hotelUser) {
      return res.status(403).json({ message: 'Hotel authentication required' });
    }

    try {
      const userPermissions = req.hotelUser.permissions || [];
      
      // Check if user has any of the required permissions
      const hasPermission = permissions.some(permission => 
        userPermissions.includes(permission)
      );
      
      if (!hasPermission) {
        return res.status(403).json({ 
          message: 'Insufficient permissions',
          required: permissions,
          userPermissions: userPermissions
        });
      }
      
      next();
    } catch (error) {
      console.error('Hotel permission check error:', error);
      return res.status(500).json({ message: 'Internal server error during authorization' });
    }
  };
};

// Admin-only access (role code 1)
export const requireHotelAdmin = requireHotelRole(['1']);

// Manager and above access (roles 1, 2)
export const requireHotelManager = requireHotelRole(['1', '2']);

// Front desk and above access
export const requireHotelFrontDesk = requireHotelRole([
  '1',
  '2',
  '6',
  '4'
]);

// Staff access (all roles except guest)
export const requireHotelStaff = requireHotelRole([
  '1',
  '2', 
  '6',
  '7',
  '8',
  '9',
  '10'
]);

// Verify hotel ownership (user belongs to the hotel)
export const verifyHotelOwnership = (req: HotelAuthRequest, res: Response, next: NextFunction) => {
  if (!req.hotelUser) {
    return res.status(403).json({ message: 'Hotel authentication required' });
  }

  const hotelIdFromParams = req.params.hotel_id || req.body.hotel_id;
  const userHotelId = req.hotelUser.hotel_id;

  console.log('DEBUG verifyHotelOwnership:', {
    hotelIdFromParams,
    userHotelId,
    paramsType: typeof hotelIdFromParams,
    userType: typeof userHotelId,
    areEqual: hotelIdFromParams === userHotelId,
    areEqualLoose: hotelIdFromParams == userHotelId
  });

  if (hotelIdFromParams && hotelIdFromParams !== userHotelId) {
    return res.status(403).json({ 
      message: 'Access denied: You can only access your own hotel data',
      debug: {
        hotelIdFromParams,
        userHotelId,
        paramsType: typeof hotelIdFromParams,
        userType: typeof userHotelId
      }
    });
  }

  next();
};

// Combined middleware for hotel authentication with role check
export const hotelAuth = {
  authenticate: authenticateHotelToken,
  requireRole: requireHotelRole,
  requirePermission: requireHotelPermission,
  requireAdmin: requireHotelAdmin,
  requireManager: requireHotelManager,
  requireStaff: requireHotelStaff,
  verifyOwnership: verifyHotelOwnership
};