import express from 'express';
import { body, validationResult } from 'express-validator';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import axios from 'axios';

const router = express.Router();

// Mock vendor data (replace with database)
const vendors = [
  {
    id: 1,
    name: 'Luxury Hotels Group',
    email: 'contact@luxuryhotels.com',
    phone: '+1234567890',
    address: '123 Business St, City, State',
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    totalHotels: 15,
    totalBookings: 1250
  },
  {
    id: 2,
    name: 'Budget Stay Chain',
    email: 'info@budgetstay.com',
    phone: '+1234567891',
    address: '456 Commerce Ave, City, State',
    status: 'active',
    createdAt: '2024-02-01T10:00:00Z',
    totalHotels: 8,
    totalBookings: 890
  }
];

// Middleware to verify token
const verifyToken = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    throw createError('No token provided', 401);
  }

  // In a real implementation, verify JWT token here
  // For now, we'll just pass through
  next();
});

// @route   GET /api/v1/vendors
// @desc    Get all vendors
// @access  Private
router.get('/vendors', verifyToken, asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, search } = req.query;
  
  let filteredVendors = [...vendors];
  
  // Filter by status
  if (status) {
    filteredVendors = filteredVendors.filter(v => v.status === status);
  }
  
  // Search by name or email
  if (search) {
    const searchTerm = search.toString().toLowerCase();
    filteredVendors = filteredVendors.filter(v => 
      v.name.toLowerCase().includes(searchTerm) || 
      v.email.toLowerCase().includes(searchTerm)
    );
  }
  
  // Pagination
  const startIndex = (Number(page) - 1) * Number(limit);
  const endIndex = startIndex + Number(limit);
  const paginatedVendors = filteredVendors.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    data: {
      vendors: paginatedVendors,
      pagination: {
        current: Number(page),
        pages: Math.ceil(filteredVendors.length / Number(limit)),
        total: filteredVendors.length
      }
    }
  });
}));

// @route   GET /api/v1/vendors/:id
// @desc    Get vendor by ID
// @access  Private
router.get('/vendors/:id', verifyToken, asyncHandler(async (req, res) => {
  const vendor = vendors.find(v => v.id === parseInt(req.params.id));
  
  if (!vendor) {
    throw createError('Vendor not found', 404);
  }
  
  res.json({
    success: true,
    data: { vendor }
  });
}));

// @route   POST /api/v1/vendors
// @desc    Create new vendor
// @access  Private
router.post('/vendors', [
  body('name').notEmpty().withMessage('Vendor name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('address').notEmpty().withMessage('Address is required')
], verifyToken, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { name, email, phone, address } = req.body;
  
  // Check if vendor with email already exists
  const existingVendor = vendors.find(v => v.email === email);
  if (existingVendor) {
    throw createError('Vendor with this email already exists', 400);
  }
  
  const newVendor = {
    id: vendors.length + 1,
    name,
    email,
    phone,
    address,
    status: 'pending',
    createdAt: new Date().toISOString(),
    totalHotels: 0,
    totalBookings: 0
  };
  
  vendors.push(newVendor);
  
  logger.info(`New vendor created: ${name}`);
  
  res.status(201).json({
    success: true,
    message: 'Vendor created successfully',
    data: { vendor: newVendor }
  });
}));

// @route   PUT /api/v1/vendors/:id
// @desc    Update vendor
// @access  Private
router.put('/vendors/:id', [
  body('name').optional().notEmpty().withMessage('Vendor name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().notEmpty().withMessage('Phone number cannot be empty'),
  body('address').optional().notEmpty().withMessage('Address cannot be empty')
], verifyToken, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const vendorIndex = vendors.findIndex(v => v.id === parseInt(req.params.id));
  
  if (vendorIndex === -1) {
    throw createError('Vendor not found', 404);
  }
  
  const { name, email, phone, address } = req.body;
  
  // Check if email is being changed and if it already exists
  if (email && email !== vendors[vendorIndex].email) {
    const existingVendor = vendors.find(v => v.email === email && v.id !== parseInt(req.params.id));
    if (existingVendor) {
      throw createError('Vendor with this email already exists', 400);
    }
  }
  
  // Update vendor
  vendors[vendorIndex] = {
    ...vendors[vendorIndex],
    ...(name && { name }),
    ...(email && { email }),
    ...(phone && { phone }),
    ...(address && { address })
  };
  
  logger.info(`Vendor updated: ${vendors[vendorIndex].name}`);
  
  res.json({
    success: true,
    message: 'Vendor updated successfully',
    data: { vendor: vendors[vendorIndex] }
  });
}));

// @route   PUT /api/v1/vendors/:id/status
// @desc    Update vendor status
// @access  Private
router.put('/vendors/:id/status', [
  body('status').isIn(['active', 'inactive', 'suspended', 'pending']).withMessage('Invalid status')
], verifyToken, asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const vendorIndex = vendors.findIndex(v => v.id === parseInt(req.params.id));
  
  if (vendorIndex === -1) {
    throw createError('Vendor not found', 404);
  }
  
  const { status } = req.body;
  vendors[vendorIndex].status = status;
  
  logger.info(`Vendor ${req.params.id} status updated to ${status}`);
  
  res.json({
    success: true,
    message: 'Vendor status updated successfully',
    data: { vendor: vendors[vendorIndex] }
  });
}));

// @route   DELETE /api/v1/vendors/:id
// @desc    Delete vendor
// @access  Private
router.delete('/vendors/:id', verifyToken, asyncHandler(async (req, res) => {
  const vendorIndex = vendors.findIndex(v => v.id === parseInt(req.params.id));
  
  if (vendorIndex === -1) {
    throw createError('Vendor not found', 404);
  }
  
  const deletedVendor = vendors.splice(vendorIndex, 1)[0];
  
  logger.info(`Vendor deleted: ${deletedVendor.name}`);
  
  res.json({
    success: true,
    message: 'Vendor deleted successfully'
  });
}));

// @route   GET /api/v1/vendors/:id/hotels
// @desc    Get hotels for a vendor
// @access  Private
router.get('/vendors/:id/hotels', verifyToken, asyncHandler(async (req, res) => {
  try {
    // Forward request to hotel service
    const response = await axios.get(
      `${process.env.HOTEL_SERVICE_URL}/api/v1/hotels?vendorId=${req.params.id}`,
      {
        headers: {
          'Authorization': req.headers.authorization
        }
      }
    );
    
    res.json(response.data);
  } catch (error) {
    logger.error('Error fetching vendor hotels:', error);
    throw createError('Failed to fetch vendor hotels', 500);
  }
}));

export default router;