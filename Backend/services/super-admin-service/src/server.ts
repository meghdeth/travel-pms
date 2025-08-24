import 'module-alias/register';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

// Import routes and middleware
import superAdminRoutes from './routes/superAdmin';
import authRoutes from './routes/auth';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3001'],
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
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3001'],
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
    service: 'Super Admin Service',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Super Admin specific routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/super-admin', superAdminRoutes);

// API Gateway - Proxy to other services
const createServiceProxy = (serviceName: string, serviceUrl: string, pathPrefix: string) => {
  return createProxyMiddleware({
    target: serviceUrl,
    changeOrigin: true,
    pathRewrite: {
      [`^/api/v1/${pathPrefix}`]: '/api/v1'
    },
    onError: (err, req, res) => {
      logger.error(`Proxy error for ${serviceName}:`, err);
      res.status(503).json({
        error: `${serviceName} service unavailable`,
        message: 'Please try again later'
      });
    },
    onProxyReq: (proxyReq, req, res) => {
      logger.info(`Proxying ${req.method} ${req.url} to ${serviceName}`);
    }
  });
};

// Proxy routes to other services
app.use('/api/v1/vendor', createServiceProxy('Vendor', process.env.VENDOR_SERVICE_URL!, 'vendor'));
app.use('/api/v1/hotel', createServiceProxy('Hotel', process.env.HOTEL_SERVICE_URL!, 'hotel'));
app.use('/api/v1/booking', createServiceProxy('Booking', process.env.BOOKING_SERVICE_URL!, 'booking'));
app.use('/api/v1/user', createServiceProxy('Booking', process.env.BOOKING_SERVICE_URL!, 'user'));
app.use('/api/v1/payment', createServiceProxy('Booking', process.env.BOOKING_SERVICE_URL!, 'payment'));

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  socket.on('join-admin-room', () => {
    socket.join('admin-notifications');
    logger.info(`Admin ${socket.id} joined admin room`);
  });
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
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
  logger.info(`Super Admin Service running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  logger.info('API Gateway routes configured for:');
  logger.info(`- Vendor Service: ${process.env.VENDOR_SERVICE_URL}`);
  logger.info(`- Hotel Service: ${process.env.HOTEL_SERVICE_URL}`);
  logger.info(`- Booking Service: ${process.env.BOOKING_SERVICE_URL}`);
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