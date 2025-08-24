import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

interface CustomError extends Error {
  statusCode?: number;
  code?: string | number;
  path?: string;
  value?: any;
  errors?: any;
  keyValue?: any;
}

const errorHandler = (err: CustomError, req: Request, res: Response, next: NextFunction) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error(err.message, {
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { name: 'CastError', message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { name: 'DuplicateError', message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors || {}).map((val: any) => val.message).join(', ');
    error = { name: 'ValidationError', message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { name: 'JsonWebTokenError', message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { name: 'TokenExpiredError', message, statusCode: 401 };
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File too large';
    error = { name: 'MulterError', message, statusCode: 400 };
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    const message = 'Too many files';
    error = { name: 'MulterError', message, statusCode: 400 };
  }

  // Rate limiting errors
  if (err.message && err.message.includes('Too many requests')) {
    error = { name: 'RateLimitError', message: err.message, statusCode: 429 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.name || 'ServerError',
    message: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export { errorHandler };