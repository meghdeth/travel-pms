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

// Load environment variables
dotenv.config();

// Import routes and middleware
import vendorRoutes from './routes/vendor';
import authRoutes from './routes/auth';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3002'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

const PORT = process.env.PORT || 3002;

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
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3002'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'Vendor Service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1', vendorRoutes);

// Stats endpoint for Super Admin
app.get('/api/v1/stats', (req, res) => {
  // Mock data - replace with actual database queries
  res.json({
    success: true,
    data: {
      total: 25,
      active: 20,
      pending: 3,
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
      totalVendors: 25,
      newVendorsThisMonth: 5,
      activeVendors: 20,
      topPerformingVendors: [
        { id: 1, name: 'Vendor A', revenue: 50000 },
        { id: 2, name: 'Vendor B', revenue: 45000 }
      ]
    }
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`Vendor client connected: ${socket.id}`);
  
  socket.on('join-vendor-room', (vendorId) => {
    socket.join(`vendor-${vendorId}`);
    logger.info(`Vendor ${vendorId} joined room: vendor-${vendorId}`);
  });
  
  socket.on('disconnect', () => {
    logger.info(`Vendor client disconnected: ${socket.id}`);
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
server.listen(PORT, () => {
  logger.info(`Vendor Service running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
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