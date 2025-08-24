import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);

// API Gateway Configuration
const services = {
  vendor: process.env.VENDOR_SERVICE_URL || 'http://localhost:3002',
  hotel: process.env.HOTEL_SERVICE_URL || 'http://localhost:3003',
  booking: process.env.BOOKING_SERVICE_URL || 'http://localhost:3004'
};

// CORS Configuration
const allowedOrigins = [
  process.env.SUPER_ADMIN_URL || 'http://localhost:3001',
  process.env.VENDOR_DASHBOARD_URL || 'http://localhost:3002',
  process.env.HOTEL_MANAGEMENT_URL || 'http://localhost:3003',
  process.env.BOOKING_WEBSITE_URL || 'http://localhost:3004'
].filter(Boolean);

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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Gateway Routes
app.use('/api/v1/vendor', createProxyMiddleware({
  target: services.vendor,
  changeOrigin: true,
  pathRewrite: {
    '^/api/v1/vendor': '/api/v1'
  }
}));

app.use('/api/v1/hotel', createProxyMiddleware({
  target: services.hotel,
  changeOrigin: true,
  pathRewrite: {
    '^/api/v1/hotel': '/api/v1'
  }
}));

app.use('/api/v1/booking', createProxyMiddleware({
  target: services.booking,
  changeOrigin: true,
  pathRewrite: {
    '^/api/v1/booking': '/api/v1'
  }
}));

// Super Admin specific routes
import authRoutes from './routes/authRoutes';
import superAdminRoutes from './routes/superAdminRoutes';

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/super-admin', superAdminRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'super-admin-service',
    timestamp: new Date().toISOString(),
    services: {
      vendor: services.vendor,
      hotel: services.hotel,
      booking: services.booking
    }
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Super Admin Service running on port ${PORT}`);
  console.log(`📡 API Gateway routing to:`);
  console.log(`   - Vendor Service: ${services.vendor}`);
  console.log(`   - Hotel Service: ${services.hotel}`);
  console.log(`   - Booking Service: ${services.booking}`);
});

export { app, io };