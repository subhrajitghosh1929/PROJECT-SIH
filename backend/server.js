import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

// Import route modules
import authRoutes from './routes/auth.js';
import transitRoutes from './routes/routes.js';
import trackingRoutes from './routes/tracking.js';
import alertsRoutes from './routes/alerts.js';
import habitsRoutes from './routes/habits.js';
import communityRoutes from './routes/community.js';
import adminRoutes from './routes/admin.js';

// Import real-time simulation engine
import { simulation } from './simulation.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize Socket.IO with permissive CORS for local dev / demoing
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Attach Socket.IO instance to app for use in routes
app.set('io', io);

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Request logger for development / live demo
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    project: 'TransitMate - Smart India Hackathon (SIH)',
    version: '1.0.0',
    adminUrl: `http://localhost:${PORT}/admin`,
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

// Admin Portal Web Interface Routes
app.get(['/', '/admin', '/dashboard'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Socket.IO Real-time Connection Handler
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  // Send initial fleet state immediately on connect
  socket.emit('vehicles:update', simulation.getAllVehicles());

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Start Real-Time Simulation Engine
simulation.init(io);

// Start HTTP & WebSocket Server
server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`  🚀 TransitMate Backend is Running on Port ${PORT}`);
  console.log(`  🛡️ Admin Console: http://localhost:${PORT}/admin`);
  console.log(`  📍 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`  📊 Admin Metrics: http://localhost:${PORT}/api/admin/metrics`);
  console.log(`  ⚡ WebSockets: ws://localhost:${PORT}`);
  console.log(`======================================================\n`);
});
