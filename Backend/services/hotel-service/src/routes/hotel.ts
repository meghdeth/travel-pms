import express from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

const router = express.Router();

// Mock hotel data
let hotels = [
  {
    id: 1,
    vendorId: 1,
    name: 'Grand Hotel',
    description: 'Luxury hotel in the city center',
    address: '123 Main St, City Center',
    city: 'New York',
    country: 'USA',
    rating: 4.5,
    amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant'],
    images: [],
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    vendorId: 1,
    name: 'City Inn',
    description: 'Comfortable stay near business district',
    address: '456 Business Ave, Downtown',
    city: 'New York',
    country: 'USA',
    rating: 4.0,
    amenities: ['WiFi', 'Business Center', 'Restaurant'],
    images: [],
    status: 'active',
    createdAt: new Date().toISOString()
  }
];

// Mock room data
let rooms = [
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
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Get all hotels
router.get('/', (req, res) => {
  try {
    const { city, country, rating } = req.query;
    let filteredHotels = hotels.filter(hotel => hotel.status === 'active');
    
    if (city) {
      filteredHotels = filteredHotels.filter(hotel => 
        hotel.city.toLowerCase().includes((city as string).toLowerCase())
      );
    }
    
    if (country) {
      filteredHotels = filteredHotels.filter(hotel => 
        hotel.country.toLowerCase().includes((country as string).toLowerCase())
      );
    }
    
    if (rating) {
      filteredHotels = filteredHotels.filter(hotel => hotel.rating >= parseFloat(rating as string));
    }
    
    res.json({
      success: true,
      data: filteredHotels
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
router.get('/:id', (req, res) => {
  try {
    const hotelId = parseInt(req.params.id);
    const hotel = hotels.find(h => h.id === hotelId && h.status === 'active');
    
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }
    
    // Get hotel rooms
    const hotelRooms = rooms.filter(room => room.hotelId === hotelId && room.status === 'available');
    
    res.json({
      success: true,
      data: {
        ...hotel,
        rooms: hotelRooms
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

// Create new hotel (vendor only)
router.post('/', [
  verifyToken,
  body('name').isLength({ min: 2, max: 100 }),
  body('description').isLength({ min: 10, max: 500 }),
  body('address').isLength({ min: 5, max: 200 }),
  body('city').isLength({ min: 2, max: 50 }),
  body('country').isLength({ min: 2, max: 50 })
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

    const { name, description, address, city, country, amenities } = req.body;

    // Check if user is vendor
    if (req.user.role !== 'vendor' && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Vendor role required.'
      });
    }

    const newHotel = {
      id: hotels.length + 1,
      vendorId: req.user.userId,
      name,
      description,
      address,
      city,
      country,
      rating: 0,
      amenities: amenities || [],
      images: [],
      status: 'active',
      createdAt: new Date().toISOString()
    };

    hotels.push(newHotel);

    logger.info(`New hotel created: ${newHotel.id} by user ${req.user.userId}`);

    res.status(201).json({
      success: true,
      message: 'Hotel created successfully',
      data: newHotel
    });
  } catch (error) {
    logger.error('Create hotel error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update hotel
router.put('/:id', [
  verifyToken,
  body('name').optional().isLength({ min: 2, max: 100 }),
  body('description').optional().isLength({ min: 10, max: 500 }),
  body('address').optional().isLength({ min: 5, max: 200 }),
  body('city').optional().isLength({ min: 2, max: 50 }),
  body('country').optional().isLength({ min: 2, max: 50 })
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

    const hotelId = parseInt(req.params.id);
    const hotelIndex = hotels.findIndex(h => h.id === hotelId);
    
    if (hotelIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    const hotel = hotels[hotelIndex];
    
    // Check if user owns the hotel or is super admin
    if (hotel.vendorId !== req.user.userId && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updatedHotel = {
      ...hotel,
      ...req.body,
      updatedAt: new Date().toISOString()
    };

    hotels[hotelIndex] = updatedHotel;

    logger.info(`Hotel updated: ${hotelId} by user ${req.user.userId}`);

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

// Delete hotel
router.delete('/:id', verifyToken, (req: any, res) => {
  try {
    const hotelId = parseInt(req.params.id);
    const hotelIndex = hotels.findIndex(h => h.id === hotelId);
    
    if (hotelIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    const hotel = hotels[hotelIndex];
    
    // Check if user owns the hotel or is super admin
    if (hotel.vendorId !== req.user.userId && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Soft delete
    hotels[hotelIndex] = {
      ...hotel,
      status: 'deleted',
      deletedAt: new Date().toISOString()
    };

    logger.info(`Hotel deleted: ${hotelId} by user ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Hotel deleted successfully'
    });
  } catch (error) {
    logger.error('Delete hotel error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get hotels by vendor
router.get('/vendor/:vendorId', (req, res) => {
  try {
    const vendorId = parseInt(req.params.vendorId);
    const vendorHotels = hotels.filter(hotel => 
      hotel.vendorId === vendorId && hotel.status === 'active'
    );
    
    res.json({
      success: true,
      data: vendorHotels
    });
  } catch (error) {
    logger.error('Get vendor hotels error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;