import express from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

const router = express.Router();

// Mock voucher data - replace with actual database queries
let mockVouchers: any[] = [
  {
    id: 1,
    hotelId: 1,
    code: 'WELCOME10',
    name: 'Welcome Discount',
    type: 'discount',
    value: 10,
    valueType: 'percentage',
    description: '10% off on first booking',
    validFrom: new Date('2024-08-01'),
    validUntil: new Date('2024-12-31'),
    usageLimit: 100,
    usedCount: 25,
    minBookingAmount: 100,
    maxDiscountAmount: 50,
    applicableRoomTypes: [],
    status: 'active',
    createdAt: new Date('2024-08-01'),
    createdBy: 'USR001'
  },
  {
    id: 2,
    hotelId: 1,
    code: 'MEAL50',
    name: 'Complimentary Meal',
    type: 'meal',
    value: 50,
    valueType: 'fixed',
    description: '$50 meal voucher',
    validFrom: new Date('2024-08-01'),
    validUntil: new Date('2024-12-31'),
    usageLimit: 50,
    usedCount: 12,
    minBookingAmount: 200,
    maxDiscountAmount: null,
    applicableRoomTypes: ['Suite', 'Deluxe Room'],
    status: 'active',
    createdAt: new Date('2024-08-01'),
    createdBy: 'USR001'
  },
  {
    id: 3,
    hotelId: 1,
    code: 'SUMMER2024',
    name: 'Summer Special',
    type: 'discount',
    value: 25,
    valueType: 'percentage',
    description: '25% off summer bookings',
    validFrom: new Date('2024-06-01'),
    validUntil: new Date('2024-08-31'),
    usageLimit: 200,
    usedCount: 180,
    minBookingAmount: 150,
    maxDiscountAmount: 100,
    applicableRoomTypes: [],
    status: 'active',
    createdAt: new Date('2024-05-15'),
    createdBy: 'USR001'
  }
];

// Mock voucher usage history
let voucherUsageHistory: any[] = [
  {
    id: 1,
    voucherId: 1,
    bookingId: 'BK001',
    guestName: 'John Doe',
    guestEmail: 'john@email.com',
    usedAt: new Date('2024-08-20'),
    discountAmount: 20,
    originalAmount: 200,
    finalAmount: 180
  },
  {
    id: 2,
    voucherId: 2,
    bookingId: 'BK002',
    guestName: 'Jane Smith',
    guestEmail: 'jane@email.com',
    usedAt: new Date('2024-08-21'),
    discountAmount: 50,
    originalAmount: 300,
    finalAmount: 250
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

// Role-based access control
const checkRole = (allowedRoles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }
    next();
  };
};

// Generate unique voucher code
const generateVoucherCode = (length: number = 8): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Get all vouchers
router.get('/', verifyToken, checkRole(['Hotel Admin', 'Manager', 'Finance Department']), (req: any, res: any) => {
  try {
    const { hotelId, status, type } = req.query;
    
    let filteredVouchers = mockVouchers.filter(voucher => {
      if (hotelId && voucher.hotelId !== parseInt(hotelId as string)) return false;
      if (status && voucher.status !== status) return false;
      if (type && voucher.type !== type) return false;
      return true;
    });

    // Add usage statistics
    const vouchersWithStats = filteredVouchers.map(voucher => ({
      ...voucher,
      usagePercentage: voucher.usageLimit ? Math.round((voucher.usedCount / voucher.usageLimit) * 100) : 0,
      remainingUses: voucher.usageLimit ? voucher.usageLimit - voucher.usedCount : null,
      isExpired: new Date() > voucher.validUntil,
      daysUntilExpiry: Math.ceil((voucher.validUntil.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    }));

    res.json({
      success: true,
      data: vouchersWithStats
    });
  } catch (error) {
    logger.error('Get vouchers error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get voucher by ID
router.get('/:id', verifyToken, checkRole(['Hotel Admin', 'Manager', 'Finance Department', 'Front Desk', 'Booking Agent']), (req: any, res: any) => {
  try {
    const voucherId = parseInt(req.params.id);
    const voucher = mockVouchers.find(v => v.id === voucherId);
    
    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Voucher not found'
      });
    }

    // Get usage history for this voucher
    const usageHistory = voucherUsageHistory.filter(usage => usage.voucherId === voucherId);

    const voucherWithDetails = {
      ...voucher,
      usagePercentage: voucher.usageLimit ? Math.round((voucher.usedCount / voucher.usageLimit) * 100) : 0,
      remainingUses: voucher.usageLimit ? voucher.usageLimit - voucher.usedCount : null,
      isExpired: new Date() > voucher.validUntil,
      daysUntilExpiry: Math.ceil((voucher.validUntil.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
      usageHistory
    };

    res.json({
      success: true,
      data: voucherWithDetails
    });
  } catch (error) {
    logger.error('Get voucher error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Validate voucher code (for booking process)
router.post('/validate', verifyToken, [
  body('code').isLength({ min: 1, max: 20 }).trim(),
  body('bookingAmount').isNumeric().isFloat({ min: 0 }),
  body('roomType').optional().isString()
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

    const { code, bookingAmount, roomType } = req.body;
    
    const voucher = mockVouchers.find(v => 
      v.code.toLowerCase() === code.toLowerCase() && 
      v.status === 'active'
    );
    
    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: 'Invalid voucher code'
      });
    }

    // Check if voucher is expired
    if (new Date() > voucher.validUntil) {
      return res.status(400).json({
        success: false,
        message: 'Voucher has expired'
      });
    }

    // Check if voucher is not yet valid
    if (new Date() < voucher.validFrom) {
      return res.status(400).json({
        success: false,
        message: 'Voucher is not yet valid'
      });
    }

    // Check usage limit
    if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
      return res.status(400).json({
        success: false,
        message: 'Voucher usage limit exceeded'
      });
    }

    // Check minimum booking amount
    if (bookingAmount < voucher.minBookingAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum booking amount of $${voucher.minBookingAmount} required`
      });
    }

    // Check applicable room types
    if (voucher.applicableRoomTypes.length > 0 && roomType && !voucher.applicableRoomTypes.includes(roomType)) {
      return res.status(400).json({
        success: false,
        message: 'Voucher not applicable for this room type'
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (voucher.valueType === 'percentage') {
      discountAmount = (bookingAmount * voucher.value) / 100;
      if (voucher.maxDiscountAmount) {
        discountAmount = Math.min(discountAmount, voucher.maxDiscountAmount);
      }
    } else {
      discountAmount = voucher.value;
    }

    const finalAmount = Math.max(0, bookingAmount - discountAmount);

    res.json({
      success: true,
      data: {
        voucher: {
          id: voucher.id,
          code: voucher.code,
          name: voucher.name,
          type: voucher.type,
          description: voucher.description
        },
        discount: {
          originalAmount: bookingAmount,
          discountAmount: Math.round(discountAmount * 100) / 100,
          finalAmount: Math.round(finalAmount * 100) / 100,
          savings: Math.round(discountAmount * 100) / 100
        }
      }
    });
  } catch (error) {
    logger.error('Validate voucher error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create new voucher
router.post('/', verifyToken, checkRole(['Hotel Admin', 'Manager']), [
  body('name').isLength({ min: 3, max: 100 }).trim(),
  body('type').isIn(['discount', 'meal']),
  body('value').isNumeric().isFloat({ min: 0.01 }),
  body('valueType').isIn(['percentage', 'fixed']),
  body('description').isLength({ min: 10, max: 500 }).trim(),
  body('validFrom').isISO8601(),
  body('validUntil').isISO8601(),
  body('usageLimit').optional().isInt({ min: 1 }),
  body('minBookingAmount').optional().isFloat({ min: 0 }),
  body('maxDiscountAmount').optional().isFloat({ min: 0 })
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

    const { 
      name, type, value, valueType, description, validFrom, validUntil, 
      usageLimit, minBookingAmount, maxDiscountAmount, applicableRoomTypes,
      customCode
    } = req.body;

    // Validate dates
    if (new Date(validFrom) >= new Date(validUntil)) {
      return res.status(400).json({
        success: false,
        message: 'Valid until date must be after valid from date'
      });
    }

    // Generate or validate voucher code
    let voucherCode = customCode || generateVoucherCode();
    
    // Check if code already exists
    const existingVoucher = mockVouchers.find(v => v.code.toLowerCase() === voucherCode.toLowerCase());
    if (existingVoucher) {
      if (customCode) {
        return res.status(400).json({
          success: false,
          message: 'Voucher code already exists'
        });
      } else {
        // Generate new code if auto-generated one conflicts
        voucherCode = generateVoucherCode(10);
      }
    }

    const newVoucher = {
      id: mockVouchers.length + 1,
      hotelId: req.user.hotelId || 1,
      code: voucherCode,
      name,
      type,
      value,
      valueType,
      description,
      validFrom: new Date(validFrom),
      validUntil: new Date(validUntil),
      usageLimit: usageLimit || null,
      usedCount: 0,
      minBookingAmount: minBookingAmount || 0,
      maxDiscountAmount: maxDiscountAmount || null,
      applicableRoomTypes: applicableRoomTypes || [],
      status: 'active' as const,
      createdAt: new Date(),
      createdBy: req.user.userId
    };

    mockVouchers.push(newVoucher);

    logger.info(`New voucher created: ${newVoucher.code} by ${req.user.userId}`);

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.to(`hotel-${newVoucher.hotelId}`).emit('voucher-created', {
        voucherId: newVoucher.id,
        code: newVoucher.code,
        name: newVoucher.name
      });
    }

    res.status(201).json({
      success: true,
      message: 'Voucher created successfully',
      data: newVoucher
    });
  } catch (error) {
    logger.error('Create voucher error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update voucher
router.put('/:id', verifyToken, checkRole(['Hotel Admin', 'Manager']), [
  body('name').optional().isLength({ min: 3, max: 100 }).trim(),
  body('value').optional().isNumeric().isFloat({ min: 0.01 }),
  body('description').optional().isLength({ min: 10, max: 500 }).trim(),
  body('validFrom').optional().isISO8601(),
  body('validUntil').optional().isISO8601(),
  body('usageLimit').optional().isInt({ min: 1 }),
  body('status').optional().isIn(['active', 'inactive'])
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

    const voucherId = parseInt(req.params.id);
    const voucherIndex = mockVouchers.findIndex(v => v.id === voucherId);
    
    if (voucherIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Voucher not found'
      });
    }

    const currentVoucher = mockVouchers[voucherIndex];
    
    // Validate dates if provided
    const validFrom = req.body.validFrom ? new Date(req.body.validFrom) : currentVoucher.validFrom;
    const validUntil = req.body.validUntil ? new Date(req.body.validUntil) : currentVoucher.validUntil;
    
    if (validFrom >= validUntil) {
      return res.status(400).json({
        success: false,
        message: 'Valid until date must be after valid from date'
      });
    }

    const updatedVoucher = {
      ...currentVoucher,
      ...req.body,
      validFrom,
      validUntil,
      updatedAt: new Date(),
      updatedBy: req.user.userId
    };

    mockVouchers[voucherIndex] = updatedVoucher;

    logger.info(`Voucher updated: ${voucherId} by ${req.user.userId}`);

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.to(`hotel-${updatedVoucher.hotelId}`).emit('voucher-updated', {
        voucherId,
        code: updatedVoucher.code,
        status: updatedVoucher.status
      });
    }

    res.json({
      success: true,
      message: 'Voucher updated successfully',
      data: updatedVoucher
    });
  } catch (error) {
    logger.error('Update voucher error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete voucher (soft delete)
router.delete('/:id', verifyToken, checkRole(['Hotel Admin', 'Manager']), (req: any, res: any) => {
  try {
    const voucherId = parseInt(req.params.id);
    const voucherIndex = mockVouchers.findIndex(v => v.id === voucherId);
    
    if (voucherIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Voucher not found'
      });
    }

    // Soft delete - set status to inactive
    mockVouchers[voucherIndex] = {
      ...mockVouchers[voucherIndex],
      status: 'inactive' as const,
      deactivatedAt: new Date(),
      deactivatedBy: req.user.userId
    };

    logger.info(`Voucher deleted: ${voucherId} by ${req.user.userId}`);

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.to(`hotel-${mockVouchers[voucherIndex].hotelId}`).emit('voucher-deleted', {
        voucherId,
        code: mockVouchers[voucherIndex].code
      });
    }

    res.json({
      success: true,
      message: 'Voucher deleted successfully'
    });
  } catch (error) {
    logger.error('Delete voucher error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get voucher usage analytics
router.get('/analytics/usage', verifyToken, checkRole(['Hotel Admin', 'Manager', 'Finance Department']), (req: any, res: any) => {
  try {
    const { period = 'month', voucherId } = req.query;
    
    let filteredUsage = voucherUsageHistory;
    
    // Filter by specific voucher if provided
    if (voucherId) {
      filteredUsage = filteredUsage.filter(usage => usage.voucherId === parseInt(voucherId as string));
    }
    
    // Filter by time period
    let startDate: Date;
    const endDate = new Date();
    
    switch (period) {
      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      default:
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
    }
    
    filteredUsage = filteredUsage.filter(usage => 
      usage.usedAt >= startDate && usage.usedAt <= endDate
    );
    
    // Calculate analytics
    const totalUses = filteredUsage.length;
    const totalSavings = filteredUsage.reduce((sum, usage) => sum + usage.discountAmount, 0);
    const averageSavings = totalUses > 0 ? totalSavings / totalUses : 0;
    
    // Most used vouchers
    const voucherUsageCount = filteredUsage.reduce((acc, usage) => {
      acc[usage.voucherId] = (acc[usage.voucherId] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    const mostUsedVouchers = Object.entries(voucherUsageCount)
      .map(([vId, count]) => {
        const voucher = mockVouchers.find(v => v.id === parseInt(vId));
        return voucher ? {
          voucherId: parseInt(vId),
          code: voucher.code,
          name: voucher.name,
          usageCount: count
        } : null;
      })
      .filter(item => item !== null)
  .sort((a: any, b: any) => (b?.usageCount || 0) - (a?.usageCount || 0))
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        summary: {
          totalUses,
          totalSavings: Math.round(totalSavings * 100) / 100,
          averageSavings: Math.round(averageSavings * 100) / 100
        },
        mostUsedVouchers,
        usageHistory: filteredUsage.sort((a, b) => b.usedAt.getTime() - a.usedAt.getTime())
      }
    });
  } catch (error) {
    logger.error('Get voucher analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;