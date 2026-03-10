import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import propertyRoutes from './routes/propertyRoutes';
import mediaRoutes from './routes/mediaRoutes';
import inquiryRoutes from './routes/inquiryRoutes';
import contractRoutes from './routes/contractRoutes';
import paymentRoutes from './routes/paymentRoutes';
import notificationRoutes from './routes/notificationRoutes';
import ownerRoutes from './routes/ownerRoutes';
import adminRoutes from './routes/adminRoutes';
import verificationRoutes from './routes/verificationRoutes';
import bookingRoutes from './routes/bookingRoutes';
import favoriteRoutes from './routes/favoriteRoutes';
import savedSearchRoutes from './routes/savedSearchRoutes';
import { checkExpiringLeases, updateExpiredContracts } from './lib/leaseService';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));

// Use raw body for Stripe webhook
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/owners', ownerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/saved-searches', savedSearchRoutes);

// Basic Route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Real Estate Management System API' });
});

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP' });
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
  
  // Initialize Lease Lifecycle Tracking
  // Run checks every 24 hours
  setInterval(() => {
    console.log('[system]: Running lease expiry checks...');
    checkExpiringLeases();
    updateExpiredContracts();
  }, 24 * 60 * 60 * 1000);

  // Initial run on startup
  checkExpiringLeases();
  updateExpiredContracts();
});

export default app;
