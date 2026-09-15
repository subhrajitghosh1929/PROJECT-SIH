import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// Helper to map search text to a known destination key
function matchDestinationKey(text = '') {
  const t = text.trim().toLowerCase();
  if (!t) return 'default';

  const quick = db.getQuickDestinations();
  const found = quick.find(
    (q) => t.includes(q.sub.toLowerCase()) || t.includes(q.label.toLowerCase()) || t.includes(q.key)
  );

  if (found) return found.key;
  if (t.includes('park') || t.includes('office')) return 'office';
  if (t.includes('salt lake') || t.includes('sector v') || t.includes('home')) return 'home';
  if (t.includes('esplanade')) return 'esplanade';

  return 'default';
}

// GET /api/routes/quick-destinations
router.get('/quick-destinations', (req, res) => {
  try {
    const destinations = db.getQuickDestinations();
    res.json({ success: true, destinations });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch destinations' });
  }
});

// GET /api/routes/search?destination=...&priority=...
router.get('/search', (req, res) => {
  try {
    const { destination = '', priority = 'fastest' } = req.query;
    const tripKey = matchDestinationKey(destination);
    const tripSet = db.getRouteSets(tripKey);

    // Sort options according to user preference priority
    const sortedOptions = [...tripSet.options].sort((a, b) => {
      if (a.key === priority) return -1;
      if (b.key === priority) return 1;
      return 0;
    });

    res.json({
      success: true,
      tripKey,
      title: destination.trim() || tripSet.title,
      options: sortedOptions,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to search routes' });
  }
});

// GET /api/routes/:tripKey
router.get('/:tripKey', (req, res) => {
  try {
    const { tripKey } = req.params;
    const tripSet = db.getRouteSets(tripKey);
    res.json({ success: true, tripKey, ...tripSet });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to retrieve route set' });
  }
});

export default router;
