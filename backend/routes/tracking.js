import express from 'express';
import { simulation } from '../simulation.js';

const router = express.Router();

/**
 * Calculates coach-by-coach (Metro) or section-by-section (Bus) crowd intelligence.
 * Includes proximity distance calculation based on user entry gate.
 */
function calculateCrowdIntelligence(vehicleType, coachCrowds, userGateIndex = 2, unitPref = 'metric') {
  const GATE_SPACING_M = 24; // Average 24 meters between metro coach gates

  if (vehicleType === 'metro') {
    const crowds = coachCrowds || ['Medium', 'High', 'Low', 'Medium', 'Low', 'Medium'];
    const sections = crowds.map((level, i) => {
      const distanceM = Math.abs(i - userGateIndex) * GATE_SPACING_M;
      const direction = i === userGateIndex ? 'here' : i > userGateIndex ? 'ahead' : 'behind';
      return {
        id: `Gate ${i + 1}`,
        subLabel: `Coach ${i + 1}`,
        level,
        distanceM,
        distanceDisplay: unitPref === 'imperial' ? `${Math.round(distanceM * 3.281)}ft` : `${distanceM}m`,
        direction,
      };
    });

    const priority = { Low: 0, Medium: 1, High: 2 };
    const recommended = sections.reduce((best, s) => {
      if (priority[s.level] < priority[best.level]) return s;
      if (priority[s.level] === priority[best.level] && s.distanceM < best.distanceM) return s;
      return best;
    });

    return {
      type: 'metro',
      userGate: userGateIndex + 1,
      sections,
      recommended,
    };
  }

  // Bus section breakdown
  const busCrowds = coachCrowds || ['Medium', 'Medium', 'Low'];
  const sections = [
    { id: 'Front', subLabel: 'Near the driver', level: busCrowds[0] || 'Medium' },
    { id: 'Middle', subLabel: 'Center of the bus', level: busCrowds[1] || 'Medium' },
    { id: 'Back', subLabel: 'Rear door', level: busCrowds[2] || 'Low' },
  ];

  const priority = { Low: 0, Medium: 1, High: 2 };
  const recommended = sections.reduce((best, s) => (priority[s.level] < priority[best.level] ? s : best));

  return {
    type: 'bus',
    sections,
    recommended,
  };
}

// GET /api/track/:tripKey
router.get('/:tripKey', (req, res) => {
  try {
    const { tripKey } = req.params;
    const vehicle = simulation.getVehicle(tripKey);
    res.json({ success: true, vehicle });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve tracking telemetry' });
  }
});

// GET /api/track/:tripKey/crowd-map
router.get('/:tripKey/crowd-map', (req, res) => {
  try {
    const { tripKey } = req.params;
    const { gate = 2, unit = 'metric' } = req.query;
    const vehicle = simulation.getVehicle(tripKey);

    const crowdIntelligence = calculateCrowdIntelligence(
      vehicle.vehicleType,
      vehicle.coachCrowds,
      parseInt(gate, 10),
      unit
    );

    res.json({
      success: true,
      tripKey,
      vehicleType: vehicle.vehicleType,
      routeLabel: vehicle.routeLabel,
      overallCrowd: vehicle.crowdLevel,
      crowdIntelligence,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to calculate crowd map' });
  }
});

// POST /api/track/:tripKey/board
router.post('/:tripKey/board', (req, res) => {
  try {
    const { tripKey } = req.params;
    const vehicle = simulation.getVehicle(tripKey);
    vehicle.phase = 'boarded';
    vehicle.waitProgress = 100;
    res.json({ success: true, message: 'Boarded vehicle successfully', vehicle });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to transition trip phase' });
  }
});

export default router;
