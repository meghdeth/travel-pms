import { body, param, query, ValidationChain } from 'express-validator';

// Common validation patterns
export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[+]?[1-9]\d{1,14}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  objectId: /^[0-9a-fA-F]{24}$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  coordinates: {
    latitude: /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$/,
    longitude: /^[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/
  }
};

// User validation schemas
export const UserValidation = {
  register: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('password')
      .matches(ValidationPatterns.password)
      .withMessage('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    body('firstName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('First name must be between 2 and 50 characters'),
    body('lastName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Last name must be between 2 and 50 characters'),
    body('phone')
      .optional()
      .matches(ValidationPatterns.phone)
      .withMessage('Please provide a valid phone number'),
    body('role')
      .optional()
      .isIn(['user', 'vendor', 'admin', 'super_admin'])
      .withMessage('Invalid role specified')
  ],

  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],

  updateProfile: [
    body('firstName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('First name must be between 2 and 50 characters'),
    body('lastName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Last name must be between 2 and 50 characters'),
    body('phone')
      .optional()
      .matches(ValidationPatterns.phone)
      .withMessage('Please provide a valid phone number'),
    body('dateOfBirth')
      .optional()
      .isISO8601()
      .withMessage('Please provide a valid date of birth')
  ],

  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .matches(ValidationPatterns.password)
      .withMessage('New password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character')
  ]
};

// Vendor validation schemas
export const VendorValidation = {
  create: [
    body('businessName')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Business name must be between 2 and 100 characters'),
    body('businessType')
      .isIn(['hotel', 'restaurant', 'tour_operator', 'transport', 'other'])
      .withMessage('Invalid business type'),
    body('contactEmail')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid contact email'),
    body('contactPhone')
      .matches(ValidationPatterns.phone)
      .withMessage('Please provide a valid contact phone number'),
    body('address')
      .trim()
      .isLength({ min: 10, max: 200 })
      .withMessage('Address must be between 10 and 200 characters'),
    body('city')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('City must be between 2 and 50 characters'),
    body('state')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('State must be between 2 and 50 characters'),
    body('country')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Country must be between 2 and 50 characters'),
    body('zipCode')
      .trim()
      .isLength({ min: 3, max: 10 })
      .withMessage('Zip code must be between 3 and 10 characters'),
    body('website')
      .optional()
      .matches(ValidationPatterns.url)
      .withMessage('Please provide a valid website URL')
  ],

  update: [
    param('id')
      .matches(ValidationPatterns.objectId)
      .withMessage('Invalid vendor ID'),
    body('businessName')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Business name must be between 2 and 100 characters'),
    body('businessType')
      .optional()
      .isIn(['hotel', 'restaurant', 'tour_operator', 'transport', 'other'])
      .withMessage('Invalid business type'),
    body('contactEmail')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid contact email'),
    body('contactPhone')
      .optional()
      .matches(ValidationPatterns.phone)
      .withMessage('Please provide a valid contact phone number')
  ]
};

// Hotel validation schemas
export const HotelValidation = {
  create: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Hotel name must be between 2 and 100 characters'),
    body('description')
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Description must be between 10 and 1000 characters'),
    body('address')
      .trim()
      .isLength({ min: 10, max: 200 })
      .withMessage('Address must be between 10 and 200 characters'),
    body('city')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('City must be between 2 and 50 characters'),
    body('state')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('State must be between 2 and 50 characters'),
    body('country')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Country must be between 2 and 50 characters'),
    body('zipCode')
      .trim()
      .isLength({ min: 3, max: 10 })
      .withMessage('Zip code must be between 3 and 10 characters'),
    body('latitude')
      .optional()
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitude must be between -90 and 90'),
    body('longitude')
      .optional()
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitude must be between -180 and 180'),
    body('starRating')
      .isInt({ min: 1, max: 5 })
      .withMessage('Star rating must be between 1 and 5'),
    body('amenities')
      .optional()
      .isArray()
      .withMessage('Amenities must be an array'),
    body('amenities.*')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Each amenity must be between 1 and 50 characters'),
    body('checkInTime')
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Check-in time must be in HH:MM format'),
    body('checkOutTime')
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Check-out time must be in HH:MM format')
  ],

  update: [
    param('id')
      .matches(ValidationPatterns.objectId)
      .withMessage('Invalid hotel ID'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Hotel name must be between 2 and 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Description must be between 10 and 1000 characters'),
    body('starRating')
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage('Star rating must be between 1 and 5')
  ]
};

// Room validation schemas
export const RoomValidation = {
  create: [
    body('hotelId')
      .matches(ValidationPatterns.objectId)
      .withMessage('Invalid hotel ID'),
    body('roomNumber')
      .trim()
      .isLength({ min: 1, max: 10 })
      .withMessage('Room number must be between 1 and 10 characters'),
    body('type')
      .isIn(['single', 'double', 'twin', 'triple', 'quad', 'suite', 'deluxe', 'presidential'])
      .withMessage('Invalid room type'),
    body('capacity')
      .isInt({ min: 1, max: 10 })
      .withMessage('Capacity must be between 1 and 10'),
    body('pricePerNight')
      .isFloat({ min: 0 })
      .withMessage('Price per night must be a positive number'),
    body('amenities')
      .optional()
      .isArray()
      .withMessage('Amenities must be an array'),
    body('size')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Room size must be a positive number'),
    body('bedType')
      .optional()
      .isIn(['single', 'double', 'queen', 'king', 'twin', 'sofa_bed'])
      .withMessage('Invalid bed type'),
    body('maxOccupancy')
      .isInt({ min: 1, max: 10 })
      .withMessage('Max occupancy must be between 1 and 10')
  ],

  update: [
    param('id')
      .matches(ValidationPatterns.objectId)
      .withMessage('Invalid room ID'),
    body('roomNumber')
      .optional()
      .trim()
      .isLength({ min: 1, max: 10 })
      .withMessage('Room number must be between 1 and 10 characters'),
    body('type')
      .optional()
      .isIn(['single', 'double', 'twin', 'triple', 'quad', 'suite', 'deluxe', 'presidential'])
      .withMessage('Invalid room type'),
    body('pricePerNight')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Price per night must be a positive number'),
    body('status')
      .optional()
      .isIn(['available', 'occupied', 'maintenance', 'out_of_order'])
      .withMessage('Invalid room status')
  ],

  search: [
    query('checkIn')
      .isISO8601()
      .withMessage('Check-in date must be a valid date'),
    query('checkOut')
      .isISO8601()
      .withMessage('Check-out date must be a valid date'),
    query('guests')
      .optional()
      .isInt({ min: 1, max: 10 })
      .withMessage('Number of guests must be between 1 and 10'),
    query('minPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Minimum price must be a positive number'),
    query('maxPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Maximum price must be a positive number'),
    query('roomType')
      .optional()
      .isIn(['single', 'double', 'twin', 'triple', 'quad', 'suite', 'deluxe', 'presidential'])
      .withMessage('Invalid room type')
  ]
};

// Booking validation schemas
export const BookingValidation = {
  create: [
    body('hotelId')
      .matches(ValidationPatterns.objectId)
      .withMessage('Invalid hotel ID'),
    body('roomId')
      .matches(ValidationPatterns.objectId)
      .withMessage('Invalid room ID'),
    body('checkInDate')
      .isISO8601()
      .withMessage('Check-in date must be a valid date'),
    body('checkOutDate')
      .isISO8601()
      .withMessage('Check-out date must be a valid date'),
    body('guests')
      .isInt({ min: 1, max: 10 })
      .withMessage('Number of guests must be between 1 and 10'),
    body('guestDetails')
      .isArray({ min: 1 })
      .withMessage('Guest details must be provided'),
    body('guestDetails.*.firstName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Guest first name must be between 2 and 50 characters'),
    body('guestDetails.*.lastName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Guest last name must be between 2 and 50 characters'),
    body('guestDetails.*.email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Guest email must be valid'),
    body('guestDetails.*.phone')
      .optional()
      .matches(ValidationPatterns.phone)
      .withMessage('Guest phone must be valid'),
    body('specialRequests')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Special requests must not exceed 500 characters')
  ],

  update: [
    param('id')
      .matches(ValidationPatterns.objectId)
      .withMessage('Invalid booking ID'),
    body('checkInDate')
      .optional()
      .isISO8601()
      .withMessage('Check-in date must be a valid date'),
    body('checkOutDate')
      .optional()
      .isISO8601()
      .withMessage('Check-out date must be a valid date'),
    body('guests')
      .optional()
      .isInt({ min: 1, max: 10 })
      .withMessage('Number of guests must be between 1 and 10'),
    body('status')
      .optional()
      .isIn(['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show'])
      .withMessage('Invalid booking status')
  ]
};

// Common parameter validations
export const CommonValidation = {
  objectId: [
    param('id')
      .matches(ValidationPatterns.objectId)
      .withMessage('Invalid ID format')
  ],

  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('sort')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Sort field must be between 1 and 50 characters'),
    query('order')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Order must be either asc or desc')
  ],

  search: [
    query('q')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Search query must be between 1 and 100 characters')
  ],

  dateRange: [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid date'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid date')
  ]
};

// Custom validation functions
export const CustomValidators = {
  isAfterDate: (dateField: string) => {
    return body(dateField).custom((value, { req }) => {
      const checkInDate = new Date(req.body.checkInDate || req.body.startDate);
      const checkOutDate = new Date(value);
      
      if (checkOutDate <= checkInDate) {
        throw new Error('Check-out date must be after check-in date');
      }
      return true;
    });
  },

  isValidDateRange: () => {
    return body('checkOutDate').custom((value, { req }) => {
      const checkInDate = new Date(req.body.checkInDate);
      const checkOutDate = new Date(value);
      const maxStayDays = 30; // Maximum stay duration
      
      const daysDifference = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDifference > maxStayDays) {
        throw new Error(`Maximum stay duration is ${maxStayDays} days`);
      }
      return true;
    });
  },

  isNotPastDate: (dateField: string) => {
    return body(dateField).custom((value) => {
      const inputDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (inputDate < today) {
        throw new Error('Date cannot be in the past');
      }
      return true;
    });
  },

  isUniqueEmail: (userModel: any) => {
    return body('email').custom(async (value, { req }) => {
      const existingUser = await userModel.findOne({ 
        email: value,
        _id: { $ne: req.params.id } // Exclude current user when updating
      });
      
      if (existingUser) {
        throw new Error('Email already exists');
      }
      return true;
    });
  }
};

// Validation result handler
export const handleValidationErrors = (req: any, res: any, next: any) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((error: any) => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

// Sanitization helpers
export const Sanitizers = {
  trimAndEscape: (fields: string[]) => {
    return fields.map(field => 
      body(field)
        .trim()
        .escape()
    );
  },

  normalizeEmail: (field: string = 'email') => {
    return body(field)
      .normalizeEmail({
        gmail_remove_dots: false,
        gmail_remove_subaddress: false,
        outlookdotcom_remove_subaddress: false,
        yahoo_remove_subaddress: false,
        icloud_remove_subaddress: false
      });
  },

  toUpperCase: (fields: string[]) => {
    return fields.map(field => 
      body(field)
        .customSanitizer(value => value ? value.toUpperCase() : value)
    );
  },

  toLowerCase: (fields: string[]) => {
    return fields.map(field => 
      body(field)
        .customSanitizer(value => value ? value.toLowerCase() : value)
    );
  }
};