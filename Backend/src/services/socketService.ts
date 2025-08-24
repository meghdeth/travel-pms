import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from '@/utils/logger';
import { JWTPayload } from '@/types/auth';

export const setupSocketIO = (io: Server) => {
  // Authentication middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
      socket.data.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;
    logger.info(`User connected: ${user.email} (${user.userType})`);

    // Join user to their specific room based on role
    if (user.userType === 'vendor' && user.vendorId) {
      socket.join(`vendor_${user.vendorId}`);
    } else if (user.userType === 'hotel_staff' && user.hotelId) {
      socket.join(`hotel_${user.hotelId}`);
    } else if (user.userType === 'super_admin') {
      socket.join('super_admin');
    }

    // Handle booking notifications
    socket.on('booking_update', (data) => {
      // Broadcast to relevant users based on hotel/vendor
      if (data.hotelId) {
        socket.to(`hotel_${data.hotelId}`).emit('booking_notification', data);
      }
    });

    // Handle real-time room availability updates
    socket.on('room_availability_update', (data) => {
      if (data.hotelId) {
        socket.to(`hotel_${data.hotelId}`).emit('room_availability_changed', data);
      }
    });

    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${user.email}`);
    });
  });

  return io;
};