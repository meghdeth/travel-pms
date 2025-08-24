import express from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { logger } from '../utils/logger';

const router = express.Router();

// Mock booking data
let bookings = [
  {
    id: 1,
    userId: 1,
    hotelId: 1,
    roomId: 1,
    checkIn: '2024-03-01',
    checkOut: '2024-03-05',
    guests: 2,
    totalAmount: 800,
    status: 'confirmed',
    paymentStatus: 'paid',
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    userId: 1,
    hotelId: 2,
    roomId: 3,
    checkIn: '2024-04-10',
    checkOut: '2024-04-15',
    guests: 1,
    totalAmount: 600,
    status: 'pending',
    paymentStatus: 'pending',
    createdAt: new Date().toISOString()
  }
];

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
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Get all bookings for user
router.get('/', verifyToken, (req: any, res) => {
  try {
    const userBookings = bookings.filter(booking => booking.userId === req.user.userId);
    
    res.json({
      success: true,
      data: userBookings
    });
  } catch (error) {
    logger.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get booking by ID
router.get('/:id', verifyToken, (req: any, res) => {
  try {
    const bookingId = parseInt(req.params.id);
    const booking = bookings.find(b => b.id === bookingId && b.userId === req.user.userId);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    logger.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new booking
router.post('/', [
  verifyToken,
  body('hotelId').isInt({ min: 1 }),
  body('roomId').isInt({ min: 1 }),
  body('checkIn').isISO8601(),
  body('checkOut').isISO8601(),
  body('guests').isInt({ min: 1, max: 10 })
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

    const { hotelId, roomId, checkIn, checkOut, guests, specialRequests } = req.body;

    // Verify hotel and room availability (call hotel service)
    try {
      const hotelServiceUrl = process.env.HOTEL_SERVICE_URL || 'http://localhost:3003';
      const roomResponse = await axios.get(`${hotelServiceUrl}/api/rooms/${roomId}`);
      
      if (!roomResponse.data.success) {
        return res.status(400).json({
          success: false,
          message: 'Room not found'
        });
      }

      // Check availability (simplified)
      const room = roomResponse.data.data;
      if (room.capacity < guests) {
        return res.status(400).json({
          success: false,
          message: 'Room capacity exceeded'
        });
      }
    } catch (error) {
      logger.error('Hotel service communication error:', error);
      // Continue with booking creation even if hotel service is down
    }

    // Calculate total amount (simplified)
    const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
    const pricePerNight = 200; // Mock price
    const totalAmount = nights * pricePerNight;

    // Create booking
    const newBooking = {
      id: bookings.length + 1,
      userId: req.user.userId,
      hotelId,
      roomId,
      checkIn,
      checkOut,
      guests,
      specialRequests,
      totalAmount,
      status: 'pending',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString()
    };

    bookings.push(newBooking);

    logger.info(`New booking created: ${newBooking.id} by user ${req.user.userId}`);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: newBooking
    });
  } catch (error) {
    logger.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update booking
router.put('/:id', [
  verifyToken,
  body('checkIn').optional().isISO8601(),
  body('checkOut').optional().isISO8601(),
  body('guests').optional().isInt({ min: 1, max: 10 })
], (req: any, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const bookingId = parseInt(req.params.id);
    const bookingIndex = bookings.findIndex(b => b.id === bookingId && b.userId === req.user.userId);
    
    if (bookingIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const booking = bookings[bookingIndex];
    
    // Check if booking can be modified
    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify this booking'
      });
    }

    // Update booking
    const updatedBooking = {
      ...booking,
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    bookings[bookingIndex] = updatedBooking;

    logger.info(`Booking updated: ${bookingId} by user ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: updatedBooking
    });
  } catch (error) {
    logger.error('Update booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Cancel booking
router.delete('/:id', verifyToken, (req: any, res) => {
  try {
    const bookingId = parseInt(req.params.id);
    const bookingIndex = bookings.findIndex(b => b.id === bookingId && b.userId === req.user.userId);
    
    if (bookingIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const booking = bookings[bookingIndex];
    
    // Check if booking can be cancelled
    if (booking.status === 'cancelled' || booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel this booking'
      });
    }

    // Update booking status
    bookings[bookingIndex] = {
      ...booking,
      status: 'cancelled',
      updatedAt: new Date().toISOString()
    };

    logger.info(`Booking cancelled: ${bookingId} by user ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    logger.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Search available rooms
router.get('/search/rooms', [
  body('checkIn').isISO8601(),
  body('checkOut').isISO8601(),
  body('guests').isInt({ min: 1, max: 10 })
], async (req, res) => {
  try {
    const { checkIn, checkOut, guests, location } = req.query;

    // Call hotel service to search for available rooms
    try {
      const hotelServiceUrl = process.env.HOTEL_SERVICE_URL || 'http://localhost:3003';
      const searchResponse = await axios.get(`${hotelServiceUrl}/api/rooms/search`, {
        params: { checkIn, checkOut, guests, location }
      });
      
      res.json(searchResponse.data);
    } catch (error) {
      logger.error('Hotel service search error:', error);
      
      // Return mock data if hotel service is unavailable
      res.json({
        success: true,
        data: [
          {
            id: 1,
            hotelId: 1,
            hotelName: 'Grand Hotel',
            roomType: 'Deluxe Room',
            capacity: 2,
            pricePerNight: 200,
            available: true
          },
          {
            id: 2,
            hotelId: 2,
            hotelName: 'City Inn',
            roomType: 'Standard Room',
            capacity: 1,
            pricePerNight: 150,
            available: true
          }
        ]
      });
    }
  } catch (error) {
    logger.error('Search rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;