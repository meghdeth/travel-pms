import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import bookingRoutes from './routes/bookingRoutes';
import paymentRoutes from './routes/paymentRoutes';

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.BOOKING_WEBSITE_URL || 'http://localhost:3004',
    process.env.HOTEL_MANAGEMENT_URL || 'http://localhost:3003'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/v1/booking', bookingRoutes);
app.use('/api/v1/payment', paymentRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'booking-service',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3004;

app.listen(PORT, () => {
  console.log(`📅 Booking Service running on port ${PORT}`);
});

export { app };