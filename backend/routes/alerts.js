import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// GET /api/alerts?filter=all|delay|crowd|predictive|community
router.get('/', (req, res) => {
  try {
    const { filter = 'all' } = req.query;
    const alerts = db.getAlerts(filter);
    res.json({ success: true, filter, alerts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch alerts' });
  }
});

// POST /api/alerts (Admin / Transit Authority broadcast)
router.post('/', (req, res) => {
  try {
    const { type, tone, title, message, routeLabel, tripKey } = req.body;

    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required' });
    }

    const alert = db.addAlert({
      type: type || 'delay',
      tone: tone || 'amber',
      title,
      message,
      routeLabel: routeLabel || 'General',
      tripKey: tripKey || null,
    });

    // Broadcast through socket if available on req.app
    const io = req.app.get('io');
    if (io) {
      io.emit('alert:new', alert);
    }

    res.status(201).json({ success: true, alert });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to broadcast alert' });
  }
});

export default router;
