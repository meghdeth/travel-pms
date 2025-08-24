import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { errorHandler } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { connectDatabase } from '@/config/database';
import { connectRedis } from '@/config/redis';
import routes from '@/routes';
import { setupSocketIO } from '@/services/socketService';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);

// Get frontend URLs from environment variables
const allowedOrigins = [
  process.env.SUPER_ADMIN_URL || 'http://localhost:3001',
  process.env.VENDOR_DASHBOARD_URL || 'http://localhost:3002', 
  process.env.HOTEL_MANAGEMENT_URL || 'http://localhost:3003',
  process.env.BOOKING_WEBSITE_URL || 'http://localhost:3004',
  process.env.FRONTEND_URL // Additional frontend URL if specified
].filter(Boolean); // Remove any undefined values

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  credentials: true
}));
app.use(express.json({ limit: process.env.MAX_JSON_SIZE || '10mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.MAX_JSON_SIZE || '10mb' }));

// Static files
app.use('/uploads', express.static(process.env.UPLOAD_PATH || 'uploads'));

// Routes
app.use(`/api/${process.env.API_VERSION || 'v1'}`, routes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.API_VERSION || 'v1'
  });
});

// Error handling
app.use(errorHandler);

// Setup Socket.IO
setupSocketIO(io);

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    logger.info('Database connected successfully');

    // Connect to Redis
    await connectRedis();
    logger.info('Redis connected successfully');

    // Start server
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`API Version: ${process.env.API_VERSION || 'v1'}`);
      logger.info(`Allowed Origins: ${allowedOrigins.join(', ')}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export { app, io };
