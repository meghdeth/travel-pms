import express from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

const router = express.Router();

// Mock room data (shared with hotel routes)
let rooms: any[] = [
  {
    id: 1,
    hotelId: 1,
    roomNumber: '101',
    roomType: 'Deluxe Room',
    capacity: 2,
    pricePerNight: 200,
    amenities: ['King Bed', 'City View', 'Mini Bar'],
    images: [],
    status: 'available',
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    hotelId: 1,
    roomNumber: '102',
    roomType: 'Suite',
    capacity: 4,
    pricePerNight: 350,
    amenities: ['King Bed', 'Sofa Bed', 'Ocean View', 'Balcony'],
    images: [],
    status: 'available',
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    hotelId: 2,
    roomNumber: '201',
    roomType: 'Standard Room',
    capacity: 1,
    pricePerNight: 150,
    amenities: ['Single Bed', 'Work Desk'],
    images: [],
    status: 'available',
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
  return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Get all rooms
router.get('/', (req: any, res: any) => {
  try {
    const { hotelId, roomType, capacity, available } = req.query;
    let filteredRooms = rooms;
    
    if (hotelId) {
      filteredRooms = filteredRooms.filter(room => room.hotelId === parseInt(hotelId as string));
    }
    
    if (roomType) {
      filteredRooms = filteredRooms.filter(room => 
        room.roomType.toLowerCase().includes((roomType as string).toLowerCase())
      );
    }
    
    if (capacity) {
      filteredRooms = filteredRooms.filter(room => room.capacity >= parseInt(capacity as string));
    }
    
    if (available === 'true') {
      filteredRooms = filteredRooms.filter(room => room.status === 'available');
    }
    
    res.json({
      success: true,
      data: filteredRooms
    });
  } catch (error) {
    logger.error('Get rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get room by ID
router.get('/:id', (req: any, res: any) => {
  try {
    const roomId = parseInt(req.params.id);
    const room = rooms.find(r => r.id === roomId);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    res.json({
      success: true,
      data: room
    });
  } catch (error) {
    logger.error('Get room error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Search available rooms
router.get('/search', (req: any, res: any) => {
  try {
    const { checkIn, checkOut, guests, location } = req.query;
    
    // Simple availability check (in real implementation, check against bookings)
    let availableRooms = rooms.filter(room => 
      room.status === 'available' && 
      room.capacity >= parseInt(guests as string || '1')
    );
    
    // Add mock hotel information
    const roomsWithHotelInfo = availableRooms.map(room => ({
      ...room,
      hotelName: room.hotelId === 1 ? 'Grand Hotel' : 'City Inn',
      hotelLocation: room.hotelId === 1 ? 'City Center' : 'Downtown',
      available: true
    }));
    
    res.json({
      success: true,
      data: roomsWithHotelInfo
    });
  } catch (error) {
    logger.error('Search rooms error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new room (vendor only)
router.post('/', [
  verifyToken,
  body('hotelId').isInt({ min: 1 }),
  body('roomNumber').isLength({ min: 1, max: 10 }),
  body('roomType').isLength({ min: 2, max: 50 }),
  body('capacity').isInt({ min: 1, max: 10 }),
  body('pricePerNight').isFloat({ min: 0 })
], (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { hotelId, roomNumber, roomType, capacity, pricePerNight, amenities } = req.body;

    // Check if user is vendor or super admin
    if (req.user.role !== 'vendor' && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Vendor role required.'
      });
    }

    // Check if room number already exists for this hotel
    const existingRoom = rooms.find(r => r.hotelId === hotelId && r.roomNumber === roomNumber);
    if (existingRoom) {
      return res.status(400).json({
        success: false,
        message: 'Room number already exists for this hotel'
      });
    }

    const newRoom = {
      id: rooms.length + 1,
      hotelId,
      roomNumber,
      roomType,
      capacity,
      pricePerNight,
      amenities: amenities || [],
      images: [],
      status: 'available',
      createdAt: new Date().toISOString()
    };

    rooms.push(newRoom);

    logger.info(`New room created: ${newRoom.id} for hotel ${hotelId} by user ${req.user.userId}`);

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      data: newRoom
    });
  } catch (error) {
    logger.error('Create room error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update room
router.put('/:id', [
  verifyToken,
  body('roomNumber').optional().isLength({ min: 1, max: 10 }),
  body('roomType').optional().isLength({ min: 2, max: 50 }),
  body('capacity').optional().isInt({ min: 1, max: 10 }),
  body('pricePerNight').optional().isFloat({ min: 0 })
], (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const roomId = parseInt(req.params.id);
    const roomIndex = rooms.findIndex(r => r.id === roomId);
    
    if (roomIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    const room = rooms[roomIndex];
    
    // Check if user has permission (vendor owns hotel or super admin)
    if (req.user.role !== 'super_admin') {
      // In real implementation, check if user owns the hotel
      // For now, allow vendors to edit any room
      if (req.user.role !== 'vendor') {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    const updatedRoom = {
      ...room,
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    rooms[roomIndex] = updatedRoom;

    logger.info(`Room updated: ${roomId} by user ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Room updated successfully',
      data: updatedRoom
    });
  } catch (error) {
    logger.error('Update room error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete room
router.delete('/:id', verifyToken, (req: any, res: any) => {
  try {
    const roomId = parseInt(req.params.id);
    const roomIndex = rooms.findIndex(r => r.id === roomId);
    
    if (roomIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    const room = rooms[roomIndex];
    
    // Check if user has permission
    if (req.user.role !== 'super_admin' && req.user.role !== 'vendor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Soft delete
    rooms[roomIndex] = {
      ...room,
      status: 'deleted',
      deletedAt: new Date().toISOString()
    };

    logger.info(`Room deleted: ${roomId} by user ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    logger.error('Delete room error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update room status
router.patch('/:id/status', [
  verifyToken,
  body('status').isIn(['available', 'occupied', 'maintenance', 'out_of_order'])
], (req: any, res: any) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const roomId = parseInt(req.params.id);
    const { status } = req.body;
    const roomIndex = rooms.findIndex(r => r.id === roomId);
    
    if (roomIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }

    rooms[roomIndex] = {
      ...rooms[roomIndex],
      status,
      updatedAt: new Date().toISOString()
    };

    logger.info(`Room status updated: ${roomId} to ${status} by user ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Room status updated successfully',
      data: rooms[roomIndex]
    });
  } catch (error) {
    logger.error('Update room status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;