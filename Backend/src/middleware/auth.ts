/// <reference path="../types/express.d.ts" />
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { JWTPayload } from '../types/auth';
import { HotelUser } from '../models/HotelUser';
import { Role } from '../models/Role';
import { tokenBlacklistService } from '../services/TokenBlacklistService';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  // Check if token is blacklisted
  if (tokenBlacklistService.isTokenBlacklisted(token)) {
    return res.status(401).json({ message: 'Token has been invalidated' });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    
    req.user = decoded as JWTPayload;
    next();
  });
};

export const requireRole = (roles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(403).json({ message: 'Authentication required' });
    }

    try {
      // Handle role mapping for different user types
      let userRoles: string[] = [];
      
      switch (req.user.userType) {
        case 'super_admin':
          userRoles = ['super_admin'];
          break;
        case 'vendor':
          userRoles = ['vendor'];
          break;
        case 'admin':
          // For hotel admin users, we need to check their actual role from database
          const hotelUser = await HotelUser.query()
            .findById(req.user.id);
          
          if (hotelUser) {
            // Map hotel users to hotel_admin for route access based on their role
             if (hotelUser.role === 'Hotel Admin' || hotelUser.role === 'Manager') { // Admin or Manager
              userRoles = ['admin', 'hotel_admin'];
            } else {
              userRoles = ['admin'];
            }
          } else {
            userRoles = ['admin'];
          }
          break;
        case 'user':
          userRoles = ['user', 'guest'];
          break;
        default:
          userRoles = [req.user.userType];
      }

      // Check if user has any of the required roles
      const hasPermission = roles.some(role => userRoles.includes(role));
      
      if (!hasPermission) {
        return res.status(403).json({ 
          message: 'Insufficient permissions',
          required: roles,
          userRoles: userRoles
        });
      }
      
      next();
    } catch (error) {
      console.error('Role check error:', error);
      return res.status(500).json({ message: 'Internal server error during authorization' });
    }
  };
};