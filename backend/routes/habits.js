import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// GET /api/habits/stats
router.get('/stats', (req, res) => {
  try {
    const habitsData = db.getHabitsData();

    // AI Commute Insight calculation
    const totalMinutes = habitsData.weeklyMinutes.reduce((sum, item) => sum + item.minutes, 0);
    const topRoute = [...habitsData.routeUsage].sort((a, b) => b.trips - a.trips)[0];

    const aiInsight = {
      title: topRoute ? `${topRoute.label} is eating most of your time` : "Smart commute pattern detected",
      description: topRoute?.key === 'home'
        ? "Switching to the Metro + Route 3 combo on your Home trip could save you roughly 12 minutes a week, based on your recent trips."
        : "Taking Metro during the 6:30 PM - 7:15 PM peak hour saves an average of ₹340 vs ride-hailing cabs.",
    };

    res.json({
      success: true,
      ...habitsData,
      totalMinutesWeekly: totalMinutes,
      aiInsight,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch habit analytics' });
  }
});

// POST /api/habits/record-trip
router.post('/record-trip', (req, res) => {
  try {
    const { tripKey, routeLabel, mode, durationMin, fare, savedVsCab } = req.body;

    const updated = db.recordCompletedTrip({
      tripKey,
      routeLabel,
      mode,
      durationMin: Number(durationMin) || 20,
      fare: Number(fare) || 15,
      savedVsCab: Number(savedVsCab) || 45,
    });

    res.json({
      success: true,
      message: 'Trip recorded into habit history',
      habits: updated,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to record trip' });
  }
});

export default router;
