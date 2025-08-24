// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
} as const;

// User Roles
export const USER_ROLES = {
  USER: 'user',
  VENDOR: 'vendor',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
} as const;

// User Status
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  PENDING: 'pending',
  VERIFIED: 'verified'
} as const;

// Vendor Business Types
export const BUSINESS_TYPES = {
  HOTEL: 'hotel',
  RESTAURANT: 'restaurant',
  TOUR_OPERATOR: 'tour_operator',
  TRANSPORT: 'transport',
  OTHER: 'other'
} as const;

// Vendor Status
export const VENDOR_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended',
  ACTIVE: 'active',
  INACTIVE: 'inactive'
} as const;

// Hotel Star Ratings
export const STAR_RATINGS = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5
} as const;

// Hotel Status
export const HOTEL_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  MAINTENANCE: 'maintenance',
  SUSPENDED: 'suspended'
} as const;

// Room Types
export const ROOM_TYPES = {
  SINGLE: 'single',
  DOUBLE: 'double',
  TWIN: 'twin',
  TRIPLE: 'triple',
  QUAD: 'quad',
  SUITE: 'suite',
  DELUXE: 'deluxe',
  PRESIDENTIAL: 'presidential'
} as const;

// Room Status
export const ROOM_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  MAINTENANCE: 'maintenance',
  OUT_OF_ORDER: 'out_of_order',
  CLEANING: 'cleaning'
} as const;

// Bed Types
export const BED_TYPES = {
  SINGLE: 'single',
  DOUBLE: 'double',
  QUEEN: 'queen',
  KING: 'king',
  TWIN: 'twin',
  SOFA_BED: 'sofa_bed'
} as const;

// Booking Status
export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CHECKED_IN: 'checked_in',
  CHECKED_OUT: 'checked_out',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
  REFUNDED: 'refunded'
} as const;

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded'
} as const;

// Payment Methods
export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  PAYPAL: 'paypal',
  STRIPE: 'stripe',
  BANK_TRANSFER: 'bank_transfer',
  CASH: 'cash',
  WALLET: 'wallet'
} as const;

// Currency Codes (ISO 4217)
export const CURRENCIES = {
  USD: 'USD',
  EUR: 'EUR',
  GBP: 'GBP',
  JPY: 'JPY',
  AUD: 'AUD',
  CAD: 'CAD',
  CHF: 'CHF',
  CNY: 'CNY',
  INR: 'INR',
  KRW: 'KRW'
} as const;

// File Types
export const FILE_TYPES = {
  IMAGE: 'image',
  DOCUMENT: 'document',
  VIDEO: 'video',
  AUDIO: 'audio'
} as const;

// Allowed Image Extensions
export const ALLOWED_IMAGE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.svg'
] as const;

// Allowed Document Extensions
export const ALLOWED_DOCUMENT_EXTENSIONS = [
  '.pdf',
  '.doc',
  '.docx',
  '.txt',
  '.rtf'
] as const;

// File Size Limits (in bytes)
export const FILE_SIZE_LIMITS = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  VIDEO: 100 * 1024 * 1024, // 100MB
  AUDIO: 50 * 1024 * 1024 // 50MB
} as const;

// Socket.IO Events
export const SOCKET_EVENTS = {
  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  
  // Booking events
  BOOKING_CREATED: 'booking:created',
  BOOKING_UPDATED: 'booking:updated',
  BOOKING_CANCELLED: 'booking:cancelled',
  BOOKING_CONFIRMED: 'booking:confirmed',
  
  // Room events
  ROOM_STATUS_CHANGED: 'room:status_changed',
  ROOM_AVAILABILITY_UPDATED: 'room:availability_updated',
  
  // Payment events
  PAYMENT_PROCESSING: 'payment:processing',
  PAYMENT_COMPLETED: 'payment:completed',
  PAYMENT_FAILED: 'payment:failed',
  
  // Notification events
  NOTIFICATION_SENT: 'notification:sent',
  
  // Admin events
  VENDOR_STATUS_CHANGED: 'vendor:status_changed',
  HOTEL_STATUS_CHANGED: 'hotel:status_changed'
} as const;

// API Rate Limits
export const RATE_LIMITS = {
  GENERAL: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5 // limit each IP to 5 auth requests per windowMs
  },
  SEARCH: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30 // limit each IP to 30 search requests per minute
  },
  BOOKING: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10 // limit each IP to 10 booking requests per 5 minutes
  }
} as const;

// Cache TTL (Time To Live) in seconds
export const CACHE_TTL = {
  SHORT: 300, // 5 minutes
  MEDIUM: 1800, // 30 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400 // 24 hours
} as const;

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1
} as const;

// Date Formats
export const DATE_FORMATS = {
  ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  DATE_ONLY: 'YYYY-MM-DD',
  TIME_ONLY: 'HH:mm:ss',
  DISPLAY: 'MMM DD, YYYY',
  DISPLAY_WITH_TIME: 'MMM DD, YYYY HH:mm'
} as const;

// Time Zones
export const TIMEZONES = {
  UTC: 'UTC',
  EST: 'America/New_York',
  PST: 'America/Los_Angeles',
  GMT: 'Europe/London',
  CET: 'Europe/Paris',
  JST: 'Asia/Tokyo',
  IST: 'Asia/Kolkata',
  AEST: 'Australia/Sydney'
} as const;

// Email Templates
export const EMAIL_TEMPLATES = {
  WELCOME: 'welcome',
  EMAIL_VERIFICATION: 'email_verification',
  PASSWORD_RESET: 'password_reset',
  BOOKING_CONFIRMATION: 'booking_confirmation',
  BOOKING_CANCELLATION: 'booking_cancellation',
  PAYMENT_RECEIPT: 'payment_receipt',
  VENDOR_APPROVAL: 'vendor_approval',
  VENDOR_REJECTION: 'vendor_rejection'
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  BOOKING: 'booking',
  PAYMENT: 'payment',
  SYSTEM: 'system'
} as const;

// Log Levels
export const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  HTTP: 'http',
  VERBOSE: 'verbose',
  DEBUG: 'debug',
  SILLY: 'silly'
} as const;

// Service Names
export const SERVICES = {
  SUPER_ADMIN: 'super-admin-service',
  VENDOR: 'vendor-service',
  HOTEL: 'hotel-service',
  BOOKING: 'booking-service'
} as const;

// Service Ports
export const SERVICE_PORTS = {
  SUPER_ADMIN: 3001,
  VENDOR: 3002,
  HOTEL: 3003,
  BOOKING: 3004
} as const;

// Environment Types
export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
  TEST: 'test'
} as const;

// Database Collections
export const COLLECTIONS = {
  USERS: 'users',
  VENDORS: 'vendors',
  HOTELS: 'hotels',
  ROOMS: 'rooms',
  BOOKINGS: 'bookings',
  PAYMENTS: 'payments',
  REVIEWS: 'reviews',
  NOTIFICATIONS: 'notifications',
  AUDIT_LOGS: 'audit_logs',
  REFRESH_TOKENS: 'refresh_tokens'
} as const;

// Error Codes
export const ERROR_CODES = {
  // Authentication errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // Resource errors
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  
  // Business logic errors
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  OPERATION_NOT_ALLOWED: 'OPERATION_NOT_ALLOWED',
  BOOKING_NOT_AVAILABLE: 'BOOKING_NOT_AVAILABLE',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  
  // System errors
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED'
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  RETRIEVED: 'Resource retrieved successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  REGISTRATION_SUCCESS: 'Registration successful',
  PASSWORD_RESET_SUCCESS: 'Password reset successful',
  EMAIL_VERIFIED: 'Email verified successfully',
  BOOKING_CONFIRMED: 'Booking confirmed successfully',
  PAYMENT_PROCESSED: 'Payment processed successfully'
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  TOKEN_EXPIRED: 'Token has expired',
  TOKEN_INVALID: 'Invalid token',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
  ALREADY_EXISTS: 'Resource already exists',
  VALIDATION_FAILED: 'Validation failed',
  INTERNAL_ERROR: 'Internal server error',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable',
  RATE_LIMIT_EXCEEDED: 'Too many requests, please try again later',
  BOOKING_UNAVAILABLE: 'Booking is not available for the selected dates',
  PAYMENT_FAILED: 'Payment processing failed',
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions to perform this action'
} as const;

// Regular Expressions
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[+]?[1-9]\d{1,14}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  OBJECT_ID: /^[0-9a-fA-F]{24}$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  LATITUDE: /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$/,
  LONGITUDE: /^[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/,
  TIME_24H: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  DATE_ISO: /^\d{4}-\d{2}-\d{2}$/,
  DATETIME_ISO: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/
} as const;

// Default Values
export const DEFAULTS = {
  PAGINATION_LIMIT: 10,
  PAGINATION_PAGE: 1,
  SEARCH_LIMIT: 20,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours
  TOKEN_EXPIRY: '24h',
  REFRESH_TOKEN_EXPIRY: '7d',
  PASSWORD_RESET_EXPIRY: '1h',
  EMAIL_VERIFICATION_EXPIRY: '24h',
  BOOKING_EXPIRY_MINUTES: 15,
  DEFAULT_TIMEZONE: 'UTC',
  DEFAULT_CURRENCY: 'USD',
  DEFAULT_LANGUAGE: 'en'
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_CACHING: true,
  ENABLE_RATE_LIMITING: true,
  ENABLE_LOGGING: true,
  ENABLE_METRICS: true,
  ENABLE_EMAIL_NOTIFICATIONS: true,
  ENABLE_SMS_NOTIFICATIONS: false,
  ENABLE_PUSH_NOTIFICATIONS: true,
  ENABLE_REAL_TIME_UPDATES: true,
  ENABLE_FILE_UPLOADS: true,
  ENABLE_PAYMENT_PROCESSING: true
} as const;

// API Versions
export const API_VERSIONS = {
  V1: 'v1',
  V2: 'v2'
} as const;

// Content Types
export const CONTENT_TYPES = {
  JSON: 'application/json',
  XML: 'application/xml',
  FORM_DATA: 'multipart/form-data',
  URL_ENCODED: 'application/x-www-form-urlencoded',
  TEXT: 'text/plain',
  HTML: 'text/html'
} as const;

// Export all constants as a single object for convenience
export const CONSTANTS = {
  HTTP_STATUS,
  USER_ROLES,
  USER_STATUS,
  BUSINESS_TYPES,
  VENDOR_STATUS,
  STAR_RATINGS,
  HOTEL_STATUS,
  ROOM_TYPES,
  ROOM_STATUS,
  BED_TYPES,
  BOOKING_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  CURRENCIES,
  FILE_TYPES,
  ALLOWED_IMAGE_EXTENSIONS,
  ALLOWED_DOCUMENT_EXTENSIONS,
  FILE_SIZE_LIMITS,
  SOCKET_EVENTS,
  RATE_LIMITS,
  CACHE_TTL,
  PAGINATION,
  DATE_FORMATS,
  TIMEZONES,
  EMAIL_TEMPLATES,
  NOTIFICATION_TYPES,
  LOG_LEVELS,
  SERVICES,
  SERVICE_PORTS,
  ENVIRONMENTS,
  COLLECTIONS,
  ERROR_CODES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  REGEX_PATTERNS,
  DEFAULTS,
  FEATURE_FLAGS,
  API_VERSIONS,
  CONTENT_TYPES
} as const;