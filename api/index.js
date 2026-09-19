import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Import route modules from backend
import authRoutes from '../backend/routes/auth.js';
import transitRoutes from '../backend/routes/routes.js';
import trackingRoutes from '../backend/routes/tracking.js';
import alertsRoutes from '../backend/routes/alerts.js';
import habitsRoutes from '../backend/routes/habits.js';
import communityRoutes from '../backend/routes/community.js';
import adminRoutes from '../backend/routes/admin.js';
import walletRoutes from '../backend/routes/wallet.js';

const app = express();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    project: 'TransitMate - Smart India Hackathon (SIH)',
    version: '1.0.0',
    platform: 'Vercel Serverless',
    timestamp: new Date().toISOString(),
  });
});

// Mount API Route Handlers
app.use('/api/auth', authRoutes);
app.use('/api/routes', transitRoutes);
app.use('/api/track', trackingRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/habits', habitsRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/wallet', walletRoutes);

// Catch-all for unmatched /api routes
app.all('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

export default app;
