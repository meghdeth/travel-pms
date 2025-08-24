import 'module-alias/register';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';
import multer from 'multer';

// Load environment variables
dotenv.config();

// Import routes and middleware
import hotelRoutes from './routes/hotel';
import roomRoutes from './routes/room';
import authRoutes from './routes/auth';
import dashboardRoutes from './routes/dashboard';
import voucherRoutes from './routes/vouchers';
import bookingRoutes from './routes/bookings';
import hotelStaffRoutes from './routes/hotelStaff';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';
import { testConnection } from './config/database';

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5001', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5001', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Hotel Service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/hotels', hotelRoutes);
app.use('/api/v1/rooms', roomRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/vouchers', voucherRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/hotel', hotelStaffRoutes);

// Stats endpoint for Super Admin
app.get('/api/v1/stats', (req, res) => {
  // Mock data - replace with actual database queries
  res.json({
    success: true,
    data: {
      total: 45,
      active: 38,
      pending: 5,
      suspended: 2
    }
  });
});

// Analytics endpoint
app.get('/api/v1/analytics', (req, res) => {
  // Mock data - replace with actual analytics
  res.json({
    success: true,
    data: {
      totalHotels: 45,
      newHotelsThisMonth: 8,
      activeHotels: 38,
      totalRooms: 1250,
      occupancyRate: 78.5,
      topPerformingHotels: [
        { id: 1, name: 'Grand Plaza Hotel', occupancy: 95 },
        { id: 2, name: 'City Center Inn', occupancy: 88 }
      ]
    }
  });
});

// File upload endpoint
app.post('/api/v1/upload', upload.array('images', 10), (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    const uploadedFiles = files.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      path: `/uploads/${file.filename}`,
      size: file.size
    }));
    
    res.json({
      success: true,
      message: 'Files uploaded successfully',
      data: { files: uploadedFiles }
    });
  } catch (error) {
    logger.error('File upload error:', error);
    const message = (error as any)?.message || String(error);
    res.status(500).json({
      error: 'File upload failed',
      message
    });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`Hotel client connected: ${socket.id}`);
  
  socket.on('join-hotel-room', (hotelId) => {
    socket.join(`hotel-${hotelId}`);
    logger.info(`Hotel ${hotelId} joined room: hotel-${hotelId}`);
  });
  
  socket.on('room-status-update', (data) => {
    socket.to(`hotel-${data.hotelId}`).emit('room-status-changed', data);
    logger.info(`Room status update broadcasted for hotel ${data.hotelId}`);
  });
  
  socket.on('disconnect', () => {
    logger.info(`Hotel client disconnected: ${socket.id}`);
  });
});

// Make io available to routes
app.set('io', io);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
server.listen(PORT, async () => {
  logger.info(`Hotel Service running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  
  // Test database connection
  await testConnection();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

export { app, io };