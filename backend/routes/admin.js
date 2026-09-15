import express from 'express';
import { db } from '../db.js';
import { simulation } from '../simulation.js';
import { authenticateToken, requireAdmin } from './auth.js';

const router = express.Router();

// Apply strict authentication and admin-only check to all admin routes
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/admin/metrics (SIH Hackathon Evaluator Dashboard data)
router.get('/metrics', (req, res) => {
  try {
    const vehicles = simulation.getAllVehicles();
    const habits = db.getHabitsData();
    const alerts = db.getAlerts('all');
    const posts = db.getCommunityPosts();

    res.json({
      success: true,
      authenticatedAdmin: req.user.email,
      systemStatus: 'Operational (Protected Live Engine)',
      activeFleetCount: Object.keys(vehicles).length,
      connectedCorridors: ['Salt Lake Sector V', 'Karunamoyee', 'Park Street', 'Esplanade', 'Ultadanga', 'City Centre'],
      totalCommutersServedWeekly: habits.summary.totalTrips * 1250,
      estimatedCarbonSavedKg: Math.round(habits.summary.totalTrips * 4.2),
      activeDisruptions: alerts.filter((a) => a.active).length,
      liveCommunityReports: posts.length,
      simulationFleet: vehicles,
      dbStats: {
        users: db.data.users?.length || 2,
        alerts: alerts.length,
        posts: posts.length,
        tripsRecorded: habits.summary.totalTrips,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve admin metrics' });
  }
});

// GET /api/admin/database (Inspect Raw Backend Storage)
router.get('/database', (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        users: db.data.users?.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role || 'commuter', createdAt: u.createdAt })),
        alerts: db.data.alerts,
        communityPosts: db.data.communityPosts,
        routeUsage: db.data.routeUsage,
        weeklyMinutes: db.data.weeklyMinutes,
        habitsSummary: db.data.habitsSummary,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch database snapshot' });
  }
});

// POST /api/admin/inject-delay (Live Hackathon Demo Tool)
router.post('/inject-delay', (req, res) => {
  try {
    const { tripKey = 'home', delayMinutes = 8, reason = 'Traffic congestion near Karunamoyee' } = req.body;

    const result = simulation.injectDelay(tripKey, Number(delayMinutes), reason);

    if (result.success) {
      const alert = db.addAlert({
        type: 'delay',
        tone: 'amber',
        title: `Simulated Delay: +${delayMinutes}m`,
        message: `${reason}. TransitMate route recommender has recalculated alternative routes.`,
        routeLabel: result.vehicle.routeLabel,
        tripKey,
      });

      const io = req.app.get('io');
      if (io) {
        io.emit('alert:new', alert);
        io.emit('vehicles:update', simulation.getAllVehicles());
      }
    }

    res.json({
      ...result,
      injectedByAdmin: req.user.email,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to inject delay' });
  }
});

// POST /api/admin/broadcast-alert (Create Transit Authority Notice)
router.post('/broadcast-alert', (req, res) => {
  try {
    const { title, message, type = 'disruption', tone = 'danger', routeLabel = 'Metro · Blue', tripKey = 'office' } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required' });
    }

    const alert = db.addAlert({
      type,
      tone,
      title,
      message,
      routeLabel,
      tripKey,
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('alert:new', alert);
    }

    res.status(201).json({ success: true, alert, broadcastedBy: req.user.email });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to broadcast alert' });
  }
});

// POST /api/admin/set-crowd (Set Live Crowd Surge)
router.post('/set-crowd', (req, res) => {
  try {
    const { tripKey = 'home', crowdLevel = 'High' } = req.body;
    const v = simulation.getVehicle(tripKey);
    if (v) {
      v.crowdLevel = crowdLevel;
      if (v.vehicleType === 'metro') {
        v.coachCrowds = crowdLevel === 'High' 
          ? ['High', 'High', 'High', 'Medium', 'High', 'High']
          : ['Low', 'Low', 'Low', 'Low', 'Low', 'Low'];
      } else {
        v.coachCrowds = crowdLevel === 'High' ? ['High', 'High', 'High'] : ['Low', 'Low', 'Low'];
      }

      const io = req.app.get('io');
      if (io) {
        io.emit('vehicles:update', simulation.getAllVehicles());
      }

      return res.json({ success: true, vehicle: v, updatedBy: req.user.email });
    }
    res.status(404).json({ success: false, message: 'Vehicle not found' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update crowd level' });
  }
});

// POST /api/admin/reset
router.post('/reset', (req, res) => {
  try {
    db.reset();
    Object.keys(simulation.vehicles).forEach((k) => simulation.resetVehicle(k));
    res.json({ success: true, message: 'TransitMate backend and simulation reset to initial seed state by Admin' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to reset system' });
  }
});

export default router;
