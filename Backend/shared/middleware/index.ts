import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { validationResult } from 'express-validator';
import { 
  HTTP_STATUS, 
  ERROR_CODES, 
  ERROR_MESSAGES, 
  RATE_LIMITS,
  USER_ROLES,
  ENVIRONMENTS
} from '../constants';
import { User, ServiceError } from '../types';

// Extended Request interface to include user
export interface AuthenticatedRequest extends Request {
  user?: User;
  service?: string;
}

// JWT Authentication Middleware
export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: ERROR_MESSAGES.UNAUTHORIZED,
      error: ERROR_CODES.TOKEN_INVALID
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err: any, decoded: any) => {
    if (err) {
      const errorCode = err.name === 'TokenExpiredError' ? ERROR_CODES.TOKEN_EXPIRED : ERROR_CODES.TOKEN_INVALID;
      const errorMessage = err.name === 'TokenExpiredError' ? ERROR_MESSAGES.TOKEN_EXPIRED : ERROR_MESSAGES.TOKEN_INVALID;
      
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: errorMessage,
        error: errorCode
      });
    }

    req.user = decoded as User;
    next();
  });
};

// Optional Authentication Middleware (doesn't fail if no token)
export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret', (err: any, decoded: any) => {
    if (!err) {
      req.user = decoded as User;
    }
    next();
  });
};

// Role-based Authorization Middleware
export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
        error: ERROR_CODES.UNAUTHORIZED
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS,
        error: ERROR_CODES.INSUFFICIENT_PERMISSIONS
      });
    }

    next();
  };
};

// Admin Only Middleware
export const adminOnly = authorize(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN);

// Super Admin Only Middleware
export const superAdminOnly = authorize(USER_ROLES.SUPER_ADMIN);

// Vendor or Admin Middleware
export const vendorOrAdmin = authorize(USER_ROLES.VENDOR, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN);

// Service-to-Service Authentication
export const authenticateService = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const serviceToken = req.headers['x-service-token'] as string;
  const serviceName = req.headers['x-service-name'] as string;

  if (!serviceToken || !serviceName) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Service authentication required',
      error: ERROR_CODES.UNAUTHORIZED
    });
  }

  // Verify service token (in production, use proper service authentication)
  const expectedToken = process.env.SERVICE_AUTH_TOKEN;
  if (!expectedToken || serviceToken !== expectedToken) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: 'Invalid service token',
      error: ERROR_CODES.TOKEN_INVALID
    });
  }

  req.service = serviceName;
  next();
};

// Validation Error Handler
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: ERROR_MESSAGES.VALIDATION_FAILED,
      error: ERROR_CODES.VALIDATION_ERROR,
      details: errors.array().map((error: any) => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

// Rate Limiting Middleware
export const createRateLimit = (options?: Partial<typeof RATE_LIMITS.GENERAL>) => {
  const defaultOptions = RATE_LIMITS.GENERAL;
  
  return rateLimit({
    windowMs: options?.windowMs || defaultOptions.windowMs,
    max: options?.max || defaultOptions.max,
    message: {
      success: false,
      message: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
      error: ERROR_CODES.RATE_LIMIT_EXCEEDED
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
        success: false,
        message: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
        error: ERROR_CODES.RATE_LIMIT_EXCEEDED
      });
    }
  });
};

// Specific rate limiters
export const authRateLimit = createRateLimit(RATE_LIMITS.AUTH);
export const searchRateLimit = createRateLimit(RATE_LIMITS.SEARCH);
export const bookingRateLimit = createRateLimit(RATE_LIMITS.BOOKING);
export const generalRateLimit = createRateLimit(RATE_LIMITS.GENERAL);

// Security Middleware
export const securityMiddleware = () => {
  return [
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"]
        }
      },
      crossOriginEmbedderPolicy: false
    })
  ];
};

// CORS Middleware
export const corsMiddleware = () => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004'
  ];

  return cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-Service-Token',
      'X-Service-Name'
    ]
  });
};

// Compression Middleware
export const compressionMiddleware = () => {
  return compression({
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return compression.filter(req, res);
    },
    threshold: 1024 // Only compress responses larger than 1KB
  });
};

// Request Logging Middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const { method, url, ip } = req;
  const userAgent = req.get('User-Agent') || '';

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    
    console.log(`${method} ${url} ${statusCode} ${duration}ms - ${ip} - ${userAgent}`);
  });

  next();
};

// Error Handling Middleware
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = {
      statusCode: HTTP_STATUS.NOT_FOUND,
      message,
      error: ERROR_CODES.RESOURCE_NOT_FOUND
    };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = {
      statusCode: HTTP_STATUS.CONFLICT,
      message,
      error: ERROR_CODES.RESOURCE_ALREADY_EXISTS
    };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val: any) => val.message).join(', ');
    error = {
      statusCode: HTTP_STATUS.BAD_REQUEST,
      message,
      error: ERROR_CODES.VALIDATION_ERROR
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = ERROR_MESSAGES.TOKEN_INVALID;
    error = {
      statusCode: HTTP_STATUS.UNAUTHORIZED,
      message,
      error: ERROR_CODES.TOKEN_INVALID
    };
  }

  if (err.name === 'TokenExpiredError') {
    const message = ERROR_MESSAGES.TOKEN_EXPIRED;
    error = {
      statusCode: HTTP_STATUS.UNAUTHORIZED,
      message,
      error: ERROR_CODES.TOKEN_EXPIRED
    };
  }

  res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: error.message || ERROR_MESSAGES.INTERNAL_ERROR,
    error: error.error || ERROR_CODES.INTERNAL_SERVER_ERROR,
    ...(process.env.NODE_ENV === ENVIRONMENTS.DEVELOPMENT && { stack: err.stack })
  });
};

// Not Found Middleware
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    error: ERROR_CODES.RESOURCE_NOT_FOUND
  });
};

// Health Check Middleware
export const healthCheck = (req: Request, res: Response) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Service is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || ENVIRONMENTS.DEVELOPMENT
  });
};

// Request ID Middleware
export const requestId = (req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers['x-request-id'] || 
    `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  req.headers['x-request-id'] = requestId as string;
  res.setHeader('X-Request-ID', requestId);
  
  next();
};

// Async Error Handler Wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Pagination Middleware
export const pagination = (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  // Validate pagination parameters
  if (page < 1 || limit < 1 || limit > 100) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: 'Invalid pagination parameters',
      error: ERROR_CODES.VALIDATION_ERROR
    });
  }

  req.query.page = page.toString();
  req.query.limit = limit.toString();
  req.query.skip = skip.toString();

  next();
};

// Content Type Validation
export const validateContentType = (allowedTypes: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentType = req.headers['content-type'];
    
    if (!contentType || !allowedTypes.some(type => contentType.includes(type))) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: `Content-Type must be one of: ${allowedTypes.join(', ')}`,
        error: ERROR_CODES.VALIDATION_ERROR
      });
    }

    next();
  };
};

// File Upload Validation
export const validateFileUpload = (options: {
  maxSize?: number;
  allowedTypes?: string[];
  required?: boolean;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { maxSize = 5 * 1024 * 1024, allowedTypes = [], required = false } = options;
    
    if (required && (!req.file && !req.files)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'File upload is required',
        error: ERROR_CODES.VALIDATION_ERROR
      });
    }

    const files = req.files ? (Array.isArray(req.files) ? req.files : [req.files]) : 
                  req.file ? [req.file] : [];

    for (const file of files) {
      if (file.size > maxSize) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: `File size exceeds maximum allowed size of ${maxSize} bytes`,
          error: ERROR_CODES.VALIDATION_ERROR
        });
      }

      if (allowedTypes.length > 0 && !allowedTypes.includes(file.mimetype)) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
          error: ERROR_CODES.VALIDATION_ERROR
        });
      }
    }

    next();
  };
};

// Export all middleware as a single object
export const middleware = {
  authenticateToken,
  optionalAuth,
  authorize,
  adminOnly,
  superAdminOnly,
  vendorOrAdmin,
  authenticateService,
  handleValidationErrors,
  createRateLimit,
  authRateLimit,
  searchRateLimit,
  bookingRateLimit,
  generalRateLimit,
  securityMiddleware,
  corsMiddleware,
  compressionMiddleware,
  requestLogger,
  errorHandler,
  notFound,
  healthCheck,
  requestId,
  asyncHandler,
  pagination,
  validateContentType,
  validateFileUpload
};