import express from 'express';
import { body, validationResult } from 'express-validator';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import axios from 'axios';

const router = express.Router();

// Middleware to verify super admin token
const verifyToken = asyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    throw createError('No token provided', 401);
  }

  // In a real implementation, verify JWT token here
  // For now, we'll just pass through
  next();
});

// Apply auth middleware to all routes
router.use(verifyToken);

// @route   GET /api/v1/super-admin/dashboard
// @desc    Get super admin dashboard data
// @access  Private (Super Admin)
router.get('/dashboard', asyncHandler(async (req, res) => {
  try {
    // Fetch data from all services
    const [vendorStats, hotelStats, bookingStats] = await Promise.allSettled([
      axios.get(`${process.env.VENDOR_SERVICE_URL}/api/v1/stats`),
      axios.get(`${process.env.HOTEL_SERVICE_URL}/api/v1/stats`),
      axios.get(`${process.env.BOOKING_SERVICE_URL}/api/v1/stats`)
    ]);

    const dashboardData = {
      vendors: {
        total: vendorStats.status === 'fulfilled' ? vendorStats.value.data.total : 0,
        active: vendorStats.status === 'fulfilled' ? vendorStats.value.data.active : 0,
        pending: vendorStats.status === 'fulfilled' ? vendorStats.value.data.pending : 0
      },
      hotels: {
        total: hotelStats.status === 'fulfilled' ? hotelStats.value.data.total : 0,
        active: hotelStats.status === 'fulfilled' ? hotelStats.value.data.active : 0,
        pending: hotelStats.status === 'fulfilled' ? hotelStats.value.data.pending : 0
      },
      bookings: {
        total: bookingStats.status === 'fulfilled' ? bookingStats.value.data.total : 0,
        today: bookingStats.status === 'fulfilled' ? bookingStats.value.data.today : 0,
        revenue: bookingStats.status === 'fulfilled' ? bookingStats.value.data.revenue : 0
      },
      systemHealth: {
        vendorService: vendorStats.status === 'fulfilled',
        hotelService: hotelStats.status === 'fulfilled',
        bookingService: bookingStats.status === 'fulfilled'
      }
    };

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    logger.error('Error fetching dashboard data:', error);
    res.json({
      success: true,
      data: {
        vendors: { total: 0, active: 0, pending: 0 },
        hotels: { total: 0, active: 0, pending: 0 },
        bookings: { total: 0, today: 0, revenue: 0 },
        systemHealth: {
          vendorService: false,
          hotelService: false,
          bookingService: false
        }
      }
    });
  }
}));

// @route   GET /api/v1/super-admin/vendors
// @desc    Get all vendors
// @access  Private (Super Admin)
router.get('/vendors', asyncHandler(async (req, res) => {
  try {
    const response = await axios.get(`${process.env.VENDOR_SERVICE_URL}/api/v1/vendors`, {
      headers: {
        'Authorization': req.headers.authorization
      }
    });
    res.json(response.data);
  } catch (error) {
    logger.error('Error fetching vendors:', error);
    throw createError('Failed to fetch vendors', 500);
  }
}));

// @route   POST /api/v1/super-admin/vendors
// @desc    Create new vendor
// @access  Private (Super Admin)
router.post('/vendors', [
  body('name').notEmpty().withMessage('Vendor name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').notEmpty().withMessage('Phone number is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  try {
    const response = await axios.post(`${process.env.VENDOR_SERVICE_URL}/api/v1/vendors`, req.body, {
      headers: {
        'Authorization': req.headers.authorization,
        'Content-Type': 'application/json'
      }
    });
    
    logger.info(`New vendor created: ${req.body.name}`);
    res.status(201).json(response.data);
  } catch (error) {
    logger.error('Error creating vendor:', error);
    throw createError('Failed to create vendor', 500);
  }
}));

// @route   PUT /api/v1/super-admin/vendors/:id/status
// @desc    Update vendor status
// @access  Private (Super Admin)
router.put('/vendors/:id/status', [
  body('status').isIn(['active', 'inactive', 'suspended']).withMessage('Invalid status')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  try {
    const response = await axios.put(
      `${process.env.VENDOR_SERVICE_URL}/api/v1/vendors/${req.params.id}/status`,
      req.body,
      {
        headers: {
          'Authorization': req.headers.authorization,
          'Content-Type': 'application/json'
        }
      }
    );
    
    logger.info(`Vendor ${req.params.id} status updated to ${req.body.status}`);
    res.json(response.data);
  } catch (error) {
    logger.error('Error updating vendor status:', error);
    throw createError('Failed to update vendor status', 500);
  }
}));

// @route   GET /api/v1/super-admin/system/health
// @desc    Get system health status
// @access  Private (Super Admin)
router.get('/system/health', asyncHandler(async (req, res) => {
  const services = [
    { name: 'vendor', url: process.env.VENDOR_SERVICE_URL },
    { name: 'hotel', url: process.env.HOTEL_SERVICE_URL },
    { name: 'booking', url: process.env.BOOKING_SERVICE_URL }
  ];

  const healthChecks = await Promise.allSettled(
    services.map(async (service) => {
      try {
        const response = await axios.get(`${service.url}/health`, { timeout: 5000 });
        return {
          service: service.name,
          status: 'healthy',
          responseTime: response.headers['x-response-time'] || 'N/A',
          timestamp: new Date().toISOString()
        };
      } catch (error) {
        return {
          service: service.name,
          status: 'unhealthy',
          error: error.message,
          timestamp: new Date().toISOString()
        };
      }
    })
  );

  const results = healthChecks.map(result => 
    result.status === 'fulfilled' ? result.value : result.reason
  );

  res.json({
    success: true,
    data: {
      overall: results.every(r => r.status === 'healthy') ? 'healthy' : 'degraded',
      services: results,
      timestamp: new Date().toISOString()
    }
  });
}));

// @route   GET /api/v1/super-admin/analytics
// @desc    Get system analytics
// @access  Private (Super Admin)
router.get('/analytics', asyncHandler(async (req, res) => {
  try {
    // Fetch analytics from all services
    const [vendorAnalytics, hotelAnalytics, bookingAnalytics] = await Promise.allSettled([
      axios.get(`${process.env.VENDOR_SERVICE_URL}/api/v1/analytics`),
      axios.get(`${process.env.HOTEL_SERVICE_URL}/api/v1/analytics`),
      axios.get(`${process.env.BOOKING_SERVICE_URL}/api/v1/analytics`)
    ]);

    const analytics = {
      vendors: vendorAnalytics.status === 'fulfilled' ? vendorAnalytics.value.data : {},
      hotels: hotelAnalytics.status === 'fulfilled' ? hotelAnalytics.value.data : {},
      bookings: bookingAnalytics.status === 'fulfilled' ? bookingAnalytics.value.data : {},
      timestamp: new Date().toISOString()
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    logger.error('Error fetching analytics:', error);
    throw createError('Failed to fetch analytics', 500);
  }
}));

export default router;