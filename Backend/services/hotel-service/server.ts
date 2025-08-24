import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import hotelRoutes from './routes/hotelRoutes';
import userRoutes from './routes/userRoutes';

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.VENDOR_DASHBOARD_URL || 'http://localhost:3002',
    process.env.HOTEL_MANAGEMENT_URL || 'http://localhost:3003'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/v1/hotel', hotelRoutes);
app.use('/api/v1/user', userRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'hotel-service',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
  console.log(`🏨 Hotel Service running on port ${PORT}`);
});

export { app };