import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import vendorRoutes from './routes/vendorRoutes';
import uploadRoutes from './routes/uploadRoutes';

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.SUPER_ADMIN_URL || 'http://localhost:3001',
    process.env.VENDOR_DASHBOARD_URL || 'http://localhost:3002'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/v1/vendor', vendorRoutes);
app.use('/api/v1/upload', uploadRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'vendor-service',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`🏢 Vendor Service running on port ${PORT}`);
});

export { app };