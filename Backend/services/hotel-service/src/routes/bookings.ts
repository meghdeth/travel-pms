import express from 'express';
import { body, validationResult, query } from 'express-validator';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

const router = express.Router();

// Mock booking data - replace with actual database queries
let mockBookings = [
  {
    id: 'BK001',
    hotelId: 1,
    guestName: 'John Doe',
    guestEmail: 'john@email.com',
    guestPhone: '+1-555-0001',
    roomNumber: '101',
    roomType: 'Deluxe Room',
    checkIn: new Date('2024-08-25'),
    checkOut: new Date('2024-08-28'),
    guests: 2,
    nights: 3,
    baseAmount: 600,
    discountAmount: 0,
    taxAmount: 48,
    totalAmount: 648,
    status: 'confirmed',
    paymentStatus: 'paid',
    paymentMethod: 'credit_card',
    specialRequests: 'Late checkout requested',
    bookingSource: 'direct',
    createdAt: new Date('2024-08-20'),
    createdBy: 'USR001',
    voucherCode: null
  },
  {
    id: 'BK002',
    hotelId: 1,
    guestName: 'Jane Smith',
    guestEmail: 'jane@email.com',
    guestPhone: '+1-555-0002',
    roomNumber: '102',
    roomType: 'Suite',
    checkIn: new Date('2024-08-24'),
    checkOut: new Date('2024-08-26'),
    guests: 2,
    nights: 2,
    baseAmount: 700,
    discountAmount: 70,
    taxAmount: 50.4,
    totalAmount: 680.4,
    status: 'checked_in',
    paymentStatus: 'paid',
    paymentMethod: 'debit_card',
    specialRequests: 'Extra pillows',
    bookingSource: 'walk_in',
    createdAt: new Date('2024-08-24'),
    createdBy: 'USR002',
    voucherCode: 'WELCOME10'
  },
  {
    id: 'BK003',
    hotelId: 1,
    guestName: 'Bob Wilson',
    guestEmail: 'bob@email.com',
    guestPhone: '+1-555-0003',
    roomNumber: '201',
    roomType: 'Standard Room',
    checkIn: new Date('2024-08-26'),
    checkOut: new Date('2024-08-29'),
    guests: 1,
    nights: 3,
    baseAmount: 450,
    discountAmount: 0,
    taxAmount: 36,
    totalAmount: 486,
    status: 'pending',
    paymentStatus: 'pending',
    paymentMethod: null,
    specialRequests: null,
    bookingSource: 'online',
    createdAt: new Date('2024-08-22'),
    createdBy: 'SYSTEM',
    voucherCode: null
  }
];

// Mock services/add-ons
let mockServices = [
  { id: 1, name: 'Airport Transfer', price: 50, type: 'transport' },
  { id: 2, name: 'Breakfast', price: 25, type: 'meal' },
  { id: 3, name: 'Spa Treatment', price: 100, type: 'wellness' },
  { id: 4, name: 'Laundry Service', price: 30, type: 'service' }
];

// Middleware to verify token
const verifyToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
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
  return (req: express.Request & any, res: express.Response, next: express.NextFunction) => {
    if (!allowedRoles.includes(req.user?.role)) {
      return res.status(403).json({ success: false, message: 'Access denied. Insufficient permissions.' });
    }
    return next();
  };
};

// Generate booking ID
const generateBookingId = (): string => {
  const prefix = 'BK';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}${timestamp}${random}`;
};

// Get all bookings with filters
router.get('/', verifyToken, checkRole(['Hotel Admin', 'Manager', 'Front Desk', 'Finance Department']), [
  query('status').optional().isIn(['all', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'pending']),
  query('paymentStatus').optional().isIn(['all', 'paid', 'pending', 'partial', 'refunded']),
  query('dateFrom').optional().isISO8601(),
  query('dateTo').optional().isISO8601(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], (req: express.Request & any, res: express.Response) => {
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
      status = 'all', 
      paymentStatus = 'all', 
      dateFrom, 
      dateTo, 
      search,
      page = 1, 
      limit = 20 
    } = req.query;

    let filteredBookings = mockBookings.filter(booking => {
      // Filter by status
      if (status !== 'all' && booking.status !== status) return false;
      
      // Filter by payment status
      if (paymentStatus !== 'all' && booking.paymentStatus !== paymentStatus) return false;
      
      // Filter by date range
      if (dateFrom && booking.checkIn < new Date(dateFrom as string)) return false;
      if (dateTo && booking.checkOut > new Date(dateTo as string)) return false;
      
      // Search filter
      if (search) {
        const searchTerm = (search as string).toLowerCase();
        return (
          booking.guestName.toLowerCase().includes(searchTerm) ||
          booking.guestEmail.toLowerCase().includes(searchTerm) ||
          booking.id.toLowerCase().includes(searchTerm) ||
          booking.roomNumber.includes(searchTerm)
        );
      }
      
      return true;
    });

    // Sort by creation date (most recent first)
    filteredBookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Pagination
    const totalBookings = filteredBookings.length;
    const startIndex = (parseInt(page as string) - 1) * parseInt(limit as string);
    const endIndex = startIndex + parseInt(limit as string);
    const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

    // Calculate summary statistics
    const summary = {
      total: totalBookings,
      confirmed: filteredBookings.filter(b => b.status === 'confirmed').length,
      checkedIn: filteredBookings.filter(b => b.status === 'checked_in').length,
      checkedOut: filteredBookings.filter(b => b.status === 'checked_out').length,
      pending: filteredBookings.filter(b => b.status === 'pending').length,
      cancelled: filteredBookings.filter(b => b.status === 'cancelled').length,
      totalRevenue: filteredBookings
        .filter(b => b.paymentStatus === 'paid')
        .reduce((sum, b) => sum + b.totalAmount, 0),
      pendingPayments: filteredBookings
        .filter(b => b.paymentStatus === 'pending')
        .reduce((sum, b) => sum + b.totalAmount, 0)
    };

  return res.json({
      success: true,
      data: {
        bookings: paginatedBookings,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: totalBookings,
          pages: Math.ceil(totalBookings / parseInt(limit as string))
        },
        summary
      }
  });
  } catch (error) {
    logger.error('Get bookings error:', error);
  return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get booking by ID
router.get('/:id', verifyToken, checkRole(['Hotel Admin', 'Manager', 'Front Desk', 'Finance Department', 'Booking Agent']), (req: express.Request & any, res: express.Response) => {
  try {
    const bookingId = req.params.id;
    const booking = mockBookings.find(b => b.id === bookingId);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Add calculated fields
    const bookingWithExtras = {
      ...booking,
      daysUntilCheckIn: Math.ceil((booking.checkIn.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
      daysUntilCheckOut: Math.ceil((booking.checkOut.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
      canCheckIn: booking.status === 'confirmed' && new Date() >= booking.checkIn,
      canCheckOut: booking.status === 'checked_in'
    };

  return res.json({
      success: true,
      data: bookingWithExtras
    });
  } catch (error) {
    logger.error('Get booking error:', error);
  return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Create new booking
router.post('/', verifyToken, checkRole(['Hotel Admin', 'Manager', 'Front Desk', 'Booking Agent']), [
  body('guestName').isLength({ min: 2, max: 100 }).trim(),
  body('guestEmail').isEmail().normalizeEmail(),
  body('guestPhone').matches(/^[+]?[1-9][\d\s\-\(\)]{8,15}$/),
  body('roomType').isLength({ min: 2, max: 50 }),
  body('checkIn').isISO8601(),
  body('checkOut').isISO8601(),
  body('guests').isInt({ min: 1, max: 10 }),
  body('baseAmount').isFloat({ min: 0 })
], (req: express.Request & any, res: express.Response) => {
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
      guestName, guestEmail, guestPhone, roomNumber, roomType,
      checkIn, checkOut, guests, baseAmount, discountAmount = 0,
      specialRequests, voucherCode, paymentMethod, services = []
    } = req.body;

    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    if (checkInDate >= checkOutDate) {
      return res.status(400).json({ success: false, message: 'Check-out date must be after check-in date' });
    }

    if (checkInDate < new Date()) {
      return res.status(400).json({ success: false, message: 'Check-in date cannot be in the past' });
    }

    // Calculate nights and amounts
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    const servicesAmount = services.reduce((sum: number, serviceId: number) => {
      const service = mockServices.find(s => s.id === serviceId);
      return sum + (service ? service.price : 0);
    }, 0);
    
    const subtotal = baseAmount + servicesAmount - discountAmount;
    const taxAmount = subtotal * 0.08; // 8% tax
    const totalAmount = subtotal + taxAmount;

    const newBooking = {
      id: generateBookingId(),
      hotelId: req.user.hotelId || 1,
      guestName,
      guestEmail,
      guestPhone,
      roomNumber: roomNumber || 'TBD', // To Be Determined during check-in
      roomType,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      nights,
      baseAmount,
      discountAmount,
      taxAmount: Math.round(taxAmount * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
      status: 'confirmed' as const,
      paymentStatus: paymentMethod ? 'paid' : 'pending' as const,
      paymentMethod,
      specialRequests,
      bookingSource: 'staff' as const,
      createdAt: new Date(),
      createdBy: req.user.userId,
      voucherCode,
      services
    };

  mockBookings.push(newBooking);

    logger.info(`New booking created: ${newBooking.id} by ${req.user.userId}`);

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.to(`hotel-${newBooking.hotelId}`).emit('booking-created', {
        bookingId: newBooking.id,
        guestName: newBooking.guestName,
        checkIn: newBooking.checkIn,
        roomType: newBooking.roomType
      });
    }

  return res.status(201).json({ success: true, message: 'Booking created successfully', data: newBooking });
  } catch (error) {
    logger.error('Create booking error:', error);
  return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Update booking
router.put('/:id', verifyToken, checkRole(['Hotel Admin', 'Manager', 'Front Desk', 'Booking Agent']), [
  body('guestName').optional().isLength({ min: 2, max: 100 }).trim(),
  body('guestEmail').optional().isEmail().normalizeEmail(),
  body('guestPhone').optional().matches(/^[+]?[1-9][\d\s\-\(\)]{8,15}$/),
  body('checkIn').optional().isISO8601(),
  body('checkOut').optional().isISO8601(),
  body('guests').optional().isInt({ min: 1, max: 10 }),
  body('status').optional().isIn(['confirmed', 'checked_in', 'checked_out', 'cancelled'])
], (req: express.Request & any, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const bookingId = req.params.id;
    const bookingIndex = mockBookings.findIndex(b => b.id === bookingId);
    
    if (bookingIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const currentBooking = mockBookings[bookingIndex];
    const { checkIn, checkOut, baseAmount, discountAmount, services, ...otherUpdates } = req.body;

    // Recalculate amounts if relevant fields changed
    let updatedBooking = { ...currentBooking, ...otherUpdates };
    
    if (checkIn || checkOut || baseAmount !== undefined || discountAmount !== undefined || services) {
      const newCheckIn = checkIn ? new Date(checkIn) : currentBooking.checkIn;
      const newCheckOut = checkOut ? new Date(checkOut) : currentBooking.checkOut;
      const newBaseAmount = baseAmount !== undefined ? baseAmount : currentBooking.baseAmount;
      const newDiscountAmount = discountAmount !== undefined ? discountAmount : currentBooking.discountAmount;
  const newServices = services || (currentBooking as any).services || [];

      if (newCheckIn >= newCheckOut) {
        return res.status(400).json({
          success: false,
          message: 'Check-out date must be after check-in date'
        });
      }

      const nights = Math.ceil((newCheckOut.getTime() - newCheckIn.getTime()) / (1000 * 60 * 60 * 24));
      const servicesAmount = newServices.reduce((sum: number, serviceId: number) => {
        const service = mockServices.find(s => s.id === serviceId);
        return sum + (service ? service.price : 0);
      }, 0);
      
      const subtotal = newBaseAmount + servicesAmount - newDiscountAmount;
      const taxAmount = subtotal * 0.08;
      const totalAmount = subtotal + taxAmount;

      updatedBooking = {
        ...updatedBooking,
        checkIn: newCheckIn,
        checkOut: newCheckOut,
        nights,
        baseAmount: newBaseAmount,
        discountAmount: newDiscountAmount,
        taxAmount: Math.round(taxAmount * 100) / 100,
        totalAmount: Math.round(totalAmount * 100) / 100,
        services: newServices
      };
    }

    updatedBooking.updatedAt = new Date();
    updatedBooking.updatedBy = req.user.userId;

    mockBookings[bookingIndex] = updatedBooking;

    logger.info(`Booking updated: ${bookingId} by ${req.user.userId}`);

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.to(`hotel-${updatedBooking.hotelId}`).emit('booking-updated', {
        bookingId,
        guestName: updatedBooking.guestName,
        status: updatedBooking.status
      });
    }

  return res.json({ success: true, message: 'Booking updated successfully', data: updatedBooking });
  } catch (error) {
    logger.error('Update booking error:', error);
  return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Check-in guest
router.post('/:id/checkin', verifyToken, checkRole(['Hotel Admin', 'Manager', 'Front Desk']), [
  body('roomNumber').isLength({ min: 1, max: 10 }).trim(),
  body('actualCheckInTime').optional().isISO8601()
], (req: express.Request & any, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const bookingId = req.params.id;
    const { roomNumber, actualCheckInTime, notes } = req.body;
    
    const bookingIndex = mockBookings.findIndex(b => b.id === bookingId);
    if (bookingIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const booking = mockBookings[bookingIndex];
    
    if (booking.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Only confirmed bookings can be checked in'
      });
    }

    const updatedBooking = {
      ...booking,
      status: 'checked_in' as const,
      roomNumber,
      actualCheckIn: actualCheckInTime ? new Date(actualCheckInTime) : new Date(),
      checkInNotes: notes,
      checkedInBy: req.user.userId,
      updatedAt: new Date()
    };

    mockBookings[bookingIndex] = updatedBooking;

    logger.info(`Guest checked in: ${bookingId} to room ${roomNumber} by ${req.user.userId}`);

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.to(`hotel-${updatedBooking.hotelId}`).emit('guest-checked-in', {
        bookingId,
        guestName: updatedBooking.guestName,
        roomNumber
      });
    }

  return res.json({ success: true, message: 'Guest checked in successfully', data: updatedBooking });
  } catch (error) {
    logger.error('Check-in error:', error);
  return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Check-out guest
router.post('/:id/checkout', verifyToken, checkRole(['Hotel Admin', 'Manager', 'Front Desk']), [
  body('actualCheckOutTime').optional().isISO8601(),
  body('finalAmount').optional().isFloat({ min: 0 }),
  body('additionalCharges').optional().isArray()
], (req: express.Request & any, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const bookingId = req.params.id;
    const { actualCheckOutTime, finalAmount, additionalCharges = [], notes } = req.body;
    
    const bookingIndex = mockBookings.findIndex(b => b.id === bookingId);
    if (bookingIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const booking = mockBookings[bookingIndex];
    
    if (booking.status !== 'checked_in') {
      return res.status(400).json({
        success: false,
        message: 'Only checked-in guests can be checked out'
      });
    }

    // Calculate final amount with additional charges
    const additionalTotal = additionalCharges.reduce((sum: number, charge: any) => sum + (charge.amount || 0), 0);
    const calculatedFinalAmount = finalAmount !== undefined ? finalAmount : booking.totalAmount + additionalTotal;

    const updatedBooking = {
      ...booking,
      status: 'checked_out' as const,
      actualCheckOut: actualCheckOutTime ? new Date(actualCheckOutTime) : new Date(),
      finalAmount: calculatedFinalAmount,
      additionalCharges,
      checkOutNotes: notes,
      checkedOutBy: req.user.userId,
      updatedAt: new Date()
    };

    mockBookings[bookingIndex] = updatedBooking;

    logger.info(`Guest checked out: ${bookingId} from room ${booking.roomNumber} by ${req.user.userId}`);

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.to(`hotel-${updatedBooking.hotelId}`).emit('guest-checked-out', {
        bookingId,
        guestName: updatedBooking.guestName,
        roomNumber: updatedBooking.roomNumber
      });
    }

  return res.json({ success: true, message: 'Guest checked out successfully', data: updatedBooking });
  } catch (error) {
    logger.error('Check-out error:', error);
  return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Cancel booking
router.post('/:id/cancel', verifyToken, checkRole(['Hotel Admin', 'Manager', 'Front Desk']), [
  body('reason').isLength({ min: 5, max: 200 }).trim(),
  body('refundAmount').optional().isFloat({ min: 0 })
], (req: express.Request & any, res: express.Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const bookingId = req.params.id;
    const { reason, refundAmount = 0, notes } = req.body;
    
    const bookingIndex = mockBookings.findIndex(b => b.id === bookingId);
    if (bookingIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const booking = mockBookings[bookingIndex];
    
    if (['checked_out', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel this booking'
      });
    }

    const updatedBooking = {
      ...booking,
      status: 'cancelled' as const,
      cancellationReason: reason,
      refundAmount,
      cancellationNotes: notes,
      cancelledAt: new Date(),
      cancelledBy: req.user.userId,
      paymentStatus: refundAmount > 0 ? 'refunded' as const : booking.paymentStatus,
      updatedAt: new Date()
    };

    mockBookings[bookingIndex] = updatedBooking;

    logger.info(`Booking cancelled: ${bookingId} by ${req.user.userId}. Reason: ${reason}`);

    // Emit socket event for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.to(`hotel-${updatedBooking.hotelId}`).emit('booking-cancelled', {
        bookingId,
        guestName: updatedBooking.guestName,
        reason
      });
    }

  return res.json({ success: true, message: 'Booking cancelled successfully', data: updatedBooking });
  } catch (error) {
    logger.error('Cancel booking error:', error);
  return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get available services/add-ons
router.get('/services/available', verifyToken, (req: express.Request, res: express.Response) => {
  try {
  return res.json({ success: true, data: mockServices });
  } catch (error) {
    logger.error('Get services error:', error);
  return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;