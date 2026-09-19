import express from 'express';
import { db } from '../db.js';
import {
  getCachedWbtcRoutes,
  findNearbyWbtcRoutes,
  scrapeWbtcCityBusRoutes
} from '../services/wbtcScraper.js';

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

// ==========================================
// 🚌 WBTC City Bus Routes API
// ==========================================

// GET /api/routes/wbtc - List all WBTC city bus routes with filters
router.get('/wbtc', (req, res) => {
  try {
    const { q = '', ac, origin, destination, limit = 50, page = 1 } = req.query;
    let routes = getCachedWbtcRoutes();

    if (routes.length === 0) {
      // If cache empty on boot, attempt quick load
      routes = [];
    }

    // Filter by search keyword (routeNo, origin, destination, or stop name)
    if (q) {
      const keyword = q.trim().toLowerCase();
      routes = routes.filter((r) =>
        r.routeNo.toLowerCase().includes(keyword) ||
        r.origin.toLowerCase().includes(keyword) ||
        r.destination.toLowerCase().includes(keyword) ||
        r.rawStoppages.toLowerCase().includes(keyword)
      );
    }

    // Filter by AC type
    if (ac !== undefined) {
      const isAcBool = ac === 'true' || ac === '1';
      routes = routes.filter((r) => r.isAC === isAcBool);
    }

    if (origin) {
      routes = routes.filter((r) => r.origin.toLowerCase().includes(origin.toLowerCase()));
    }

    if (destination) {
      routes = routes.filter((r) => r.destination.toLowerCase().includes(destination.toLowerCase()));
    }

    const total = routes.length;
    const startIndex = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const paginated = routes.slice(startIndex, startIndex + parseInt(limit, 10));

    res.json({
      success: true,
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      routes: paginated,
      source: 'West Bengal Transport Corporation (https://wbtconline.in/wbtc-city-bus-routes)'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch WBTC routes', error: err.message });
  }
});

// GET /api/routes/nearby - Find closest WBTC stops and routes based on GPS coordinates
router.get('/nearby', (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radiusKm = parseFloat(req.query.radius || 3.0);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid coordinates. Please provide valid lat and lng query parameters.'
      });
    }

    const nearby = findNearbyWbtcRoutes(lat, lng, radiusKm);

    res.json({
      success: true,
      userLocation: { lat, lng },
      radiusKm,
      count: nearby.length,
      nearby
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to find nearby routes', error: err.message });
  }
});

// GET /api/routes/wbtc/:routeNo - Detailed route coordinates & stops
router.get('/wbtc/:routeNo', (req, res) => {
  try {
    const routeNo = req.params.routeNo.trim().toUpperCase();
    const routes = getCachedWbtcRoutes();
    const found = routes.find((r) => r.routeNo.toUpperCase() === routeNo || r.id === req.params.routeNo.toLowerCase());

    if (!found) {
      return res.status(404).json({ success: false, message: `Route ${req.params.routeNo} not found` });
    }

    res.json({ success: true, route: found });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to get route details', error: err.message });
  }
});

// POST /api/routes/wbtc/sync - Trigger on-demand sync from official WBTC portal
router.post('/wbtc/sync', async (req, res) => {
  try {
    const refreshed = await scrapeWbtcCityBusRoutes();
    res.json({
      success: true,
      message: `Successfully synchronized ${refreshed.length} routes from WBTC portal`,
      count: refreshed.length,
      syncedAt: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Sync failed', error: err.message });
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
