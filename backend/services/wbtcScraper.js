import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '..', 'data', 'wbtc_routes.json');

// Reference coordinates for major Kolkata transit stops & landmarks
const KOLKATA_COORDINATES = {
  'howrah': { lat: 22.5850, lng: 88.3426, name: 'Howrah Station' },
  'howrah station': { lat: 22.5850, lng: 88.3426, name: 'Howrah Station' },
  'howrah stn': { lat: 22.5850, lng: 88.3426, name: 'Howrah Station' },
  'howrah bridge': { lat: 22.5855, lng: 88.3468, name: 'Howrah Bridge' },
  'sealdah': { lat: 22.5670, lng: 88.3713, name: 'Sealdah Station' },
  'sealdha': { lat: 22.5670, lng: 88.3713, name: 'Sealdah Station' },
  'esplanade': { lat: 22.5645, lng: 88.3518, name: 'Esplanade' },
  'espl': { lat: 22.5645, lng: 88.3518, name: 'Esplanade' },
  'b.b.d.bag': { lat: 22.5710, lng: 88.3480, name: 'BBD Bag' },
  'bbd bag': { lat: 22.5710, lng: 88.3480, name: 'BBD Bag' },
  'park street': { lat: 22.5510, lng: 88.3524, name: 'Park Street' },
  'rabindra sadan': { lat: 22.5390, lng: 88.3490, name: 'Rabindra Sadan / Exide' },
  'exide': { lat: 22.5390, lng: 88.3490, name: 'Exide' },
  'elgin': { lat: 22.5395, lng: 88.3520, name: 'Elgin Road' },
  'elgin road': { lat: 22.5395, lng: 88.3520, name: 'Elgin Road' },
  'hazra': { lat: 22.5230, lng: 88.3450, name: 'Hazra Crossing' },
  'kalighat': { lat: 22.5180, lng: 88.3455, name: 'Kalighat' },
  'chetla': { lat: 22.5167, lng: 88.3361, name: 'Chetla' },
  'mominpur': { lat: 22.5270, lng: 88.3280, name: 'Mominpur' },
  'mominpor': { lat: 22.5270, lng: 88.3280, name: 'Mominpur' },
  'khidderpur': { lat: 22.5350, lng: 88.3260, name: 'Khidderpore' },
  'khidirpur': { lat: 22.5350, lng: 88.3260, name: 'Khidderpore' },
  'khidirpor': { lat: 22.5350, lng: 88.3260, name: 'Khidderpore' },
  'dahighat': { lat: 22.5400, lng: 88.3200, name: 'Dahighat' },
  'hastings': { lat: 22.5480, lng: 88.3340, name: 'Hastings' },
  'taratala': { lat: 22.5080, lng: 88.3120, name: 'Taratala' },
  'behala': { lat: 22.4975, lng: 88.3145, name: 'Behala Chowrasta' },
  'chowrasta': { lat: 22.4975, lng: 88.3145, name: 'Behala Chowrasta' },
  'sarsuna': { lat: 22.4780, lng: 88.2890, name: 'Sarsuna' },
  'thakurpukur': { lat: 22.4600, lng: 88.3030, name: 'Thakurpukur' },
  'joka': { lat: 22.4435, lng: 88.3032, name: 'Joka' },
  'parnasree': { lat: 22.5020, lng: 88.3070, name: 'Parnasree' },
  'parnashri': { lat: 22.5020, lng: 88.3070, name: 'Parnasree' },
  'tollygunge': { lat: 22.4965, lng: 88.3458, name: 'Tollygunge Metro' },
  'tollygunge phari': { lat: 22.5030, lng: 88.3470, name: 'Tollygunge Phari' },
  'jadavpur': { lat: 22.4988, lng: 88.3716, name: 'Jadavpur' },
  'jadavpore': { lat: 22.4988, lng: 88.3716, name: 'Jadavpur' },
  'golpark': { lat: 22.5120, lng: 88.3670, name: 'Golpark' },
  'gariahat': { lat: 22.5186, lng: 88.3653, name: 'Gariahat' },
  'dhakuria': { lat: 22.5100, lng: 88.3640, name: 'Dhakuria' },
  'baghajatin': { lat: 22.4840, lng: 88.3750, name: 'Baghajatin' },
  'garia': { lat: 22.4645, lng: 88.3813, name: 'Garia' },
  'ruby': { lat: 22.5135, lng: 88.3995, name: 'Ruby Crossing (EM Bypass)' },
  'science city': { lat: 22.5390, lng: 88.3950, name: 'Science City' },
  's.city': { lat: 22.5390, lng: 88.3950, name: 'Science City' },
  'chingrighata': { lat: 22.5640, lng: 88.4010, name: 'Chingrighata' },
  'chingrihata': { lat: 22.5640, lng: 88.4010, name: 'Chingrighata' },
  'nicco park': { lat: 22.5710, lng: 88.4200, name: 'Nicco Park' },
  'sector v': { lat: 22.5735, lng: 88.4331, name: 'Salt Lake Sector V' },
  'sector v bus stand': { lat: 22.5735, lng: 88.4331, name: 'Sector V Bus Stand' },
  'salt lake': { lat: 22.5800, lng: 88.4150, name: 'Salt Lake' },
  'karunamoyee': { lat: 22.5867, lng: 88.4183, name: 'Karunamoyee Central Bus Terminus' },
  'city centre': { lat: 22.5885, lng: 88.4080, name: 'City Centre Salt Lake' },
  'bikash bhavan': { lat: 22.5890, lng: 88.4110, name: 'Bikash Bhavan' },
  'central park': { lat: 22.5840, lng: 88.4140, name: 'Central Park' },
  'college more': { lat: 22.5760, lng: 88.4340, name: 'College More' },
  'technopolis': { lat: 22.5775, lng: 88.4370, name: 'Technopolis' },
  'new town': { lat: 22.5850, lng: 88.4800, name: 'New Town' },
  'newtown': { lat: 22.5850, lng: 88.4800, name: 'New Town' },
  'unitech': { lat: 22.5820, lng: 88.4760, name: 'Unitech Infospace' },
  'sapoorji': { lat: 22.5615, lng: 88.5080, name: 'Sapoorji Pallonji Action Area III' },
  'sapurji': { lat: 22.5615, lng: 88.5080, name: 'Sapoorji Pallonji Action Area III' },
  'ultadanga': { lat: 22.5973, lng: 88.3888, name: 'Ultadanga HUDCO' },
  'hudco': { lat: 22.5973, lng: 88.3888, name: 'Ultadanga HUDCO' },
  'khanna': { lat: 22.5920, lng: 88.3750, name: 'Khanna Cinema' },
  'shyambazar': { lat: 22.6026, lng: 88.3712, name: 'Shyambazar Five Point Crossing' },
  'paikpara': { lat: 22.6080, lng: 88.3810, name: 'Paikpara' },
  'dum dum': { lat: 22.6225, lng: 88.4180, name: 'Dum Dum' },
  'dum dum stn': { lat: 22.6225, lng: 88.4180, name: 'Dum Dum Station' },
  'lake town': { lat: 22.6090, lng: 88.4020, name: 'Lake Town Crossing' },
  'bangur': { lat: 22.6060, lng: 88.4080, name: 'Bangur Avenue' },
  'kestopur': { lat: 22.6030, lng: 88.4200, name: 'Kestopur' },
  'baguiati': { lat: 22.6210, lng: 88.4280, name: 'Baguiati' },
  'baguihati': { lat: 22.6210, lng: 88.4280, name: 'Baguiati' },
  'teghoria': { lat: 22.6270, lng: 88.4320, name: 'Teghoria' },
  'haldiram': { lat: 22.6340, lng: 88.4370, name: 'Haldirams / VIP Road' },
  'kaikhali': { lat: 22.6370, lng: 88.4390, name: 'Kaikhali' },
  'airport': { lat: 22.6547, lng: 88.4467, name: 'Kolkata Netaji Subhash Chandra Bose Airport (CCU)' },
  'birati': { lat: 22.6700, lng: 88.4400, name: 'Birati More' },
  'madhyamgram': { lat: 22.6990, lng: 88.4550, name: 'Madhyamgram' },
  'barasat': { lat: 22.7230, lng: 88.4815, name: 'Barasat Bus Terminus' },
  'manicktala': { lat: 22.5880, lng: 88.3730, name: 'Manicktala' },
  'girish park': { lat: 22.5830, lng: 88.3580, name: 'Girish Park' },
  'm.g.road': { lat: 22.5800, lng: 88.3580, name: 'MG Road Crossing' },
  'moulali': { lat: 22.5580, lng: 88.3650, name: 'Moulali' },
  'nabanna': { lat: 22.5562, lng: 88.3245, name: 'Nabanna (State Secretariat)' },
  'bichalighat': { lat: 22.5380, lng: 88.3050, name: 'Bichalighat / Metiabruz' },
};

function lookupCoord(stopName) {
  if (!stopName) return null;
  const clean = stopName.toLowerCase().replace(/[.\-_,]/g, ' ').replace(/\s+/g, ' ').trim();
  for (const [key, val] of Object.entries(KOLKATA_COORDINATES)) {
    if (clean.includes(key) || key.includes(clean)) {
      return { lat: val.lat, lng: val.lng, matchedName: val.name };
    }
  }
  return null;
}

export function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

export async function scrapeWbtcCityBusRoutes() {
  console.log('[WBTC Scraper] Fetching live routes from https://wbtconline.in/wbtc-city-bus-routes ...');
  try {
    const res = await fetch('https://wbtconline.in/wbtc-city-bus-routes', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} from wbtconline.in`);
    }

    const html = await res.text();
    const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let trMatch;
    const rawRoutes = [];

    while ((trMatch = trRegex.exec(html)) !== null) {
      const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
      const cols = [];
      let tdMatch;
      while ((tdMatch = tdRegex.exec(trMatch[1])) !== null) {
        cols.push(tdMatch[1].replace(/&nbsp;/g, ' ').replace(/<[^>]+>/g, '').trim());
      }
      if (cols.length >= 5) {
        const sl = cols[0];
        const routeNo = cols[1];
        const origin = cols[2];
        const destination = cols[3];
        const rawStoppages = cols[4];

        if (routeNo && origin && destination && !routeNo.toLowerCase().includes('route')) {
          rawRoutes.push({ sl, routeNo, origin, destination, rawStoppages });
        }
      }
    }

    console.log(`[WBTC Scraper] Parsed ${rawRoutes.length} raw routes. Enriching with coordinates...`);

    const enrichedRoutes = rawRoutes.map((r) => {
      // Split stoppages by dash, comma, or semicolon
      const parsedStops = r.rawStoppages
        .split(/[-–,;]+/)
        .map(s => s.trim())
        .filter(s => s.length > 1 && !/^\d+$/.test(s));

      // Build full sequence: Origin -> Intermediate Stops -> Destination
      const fullStopSequence = [r.origin, ...parsedStops, r.destination];
      // Deduplicate consecutive identical stops
      const uniqueStops = fullStopSequence.filter((s, idx, arr) => idx === 0 || s.toLowerCase() !== arr[idx - 1].toLowerCase());

      const originCoord = lookupCoord(r.origin) || { lat: 22.5726, lng: 88.3639, matchedName: r.origin };
      const destCoord = lookupCoord(r.destination) || { lat: 22.5850, lng: 88.3426, matchedName: r.destination };

      // Map coordinates for stops
      const stopDetails = uniqueStops.map((name, i) => {
        const found = lookupCoord(name);
        if (found) {
          return { name, lat: found.lat, lng: found.lng, isEstimated: false };
        }
        // Linear interpolation between origin and destination for unmapped intermediate stops
        const ratio = uniqueStops.length > 1 ? i / (uniqueStops.length - 1) : 0.5;
        const lat = originCoord.lat + (destCoord.lat - originCoord.lat) * ratio;
        const lng = originCoord.lng + (destCoord.lng - originCoord.lng) * ratio;
        return { name, lat: Number(lat.toFixed(4)), lng: Number(lng.toFixed(4)), isEstimated: true };
      });

      const isAC = r.routeNo.toUpperCase().startsWith('AC') || r.routeNo.toUpperCase().includes('AC');

      return {
        id: `wbtc-${r.routeNo.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
        routeNo: r.routeNo,
        origin: r.origin,
        destination: r.destination,
        isAC,
        fareMin: isAC ? 25 : 10,
        fareMax: isAC ? 50 : 25,
        frequencyMin: isAC ? '12-18 min' : '8-12 min',
        rawStoppages: r.rawStoppages,
        stops: uniqueStops,
        stopDetails,
        pathCoordinates: stopDetails.map(s => ({ lat: s.lat, lng: s.lng })),
        totalStops: uniqueStops.length,
        source: 'https://wbtconline.in/wbtc-city-bus-routes',
        updatedAt: new Date().toISOString()
      };
    });

    // Save to disk cache
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(enrichedRoutes, null, 2), 'utf8');
    console.log(`[WBTC Scraper] Successfully saved ${enrichedRoutes.length} enriched routes to ${DATA_FILE}`);
    return enrichedRoutes;

  } catch (err) {
    console.error('[WBTC Scraper] Error scraping WBTC routes:', err.message);
    // Fallback: Return cached if file exists
    if (fs.existsSync(DATA_FILE)) {
      console.log('[WBTC Scraper] Serving from existing disk cache.');
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
    throw err;
  }
}

export function getCachedWbtcRoutes() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    } catch (e) {
      console.error('[WBTC Scraper] Failed to parse cache file:', e.message);
    }
  }
  return [];
}

export function findNearbyWbtcRoutes(userLat, userLng, maxDistKm = 3.0) {
  const routes = getCachedWbtcRoutes();
  const matched = [];

  for (const route of routes) {
    let minDistance = Infinity;
    let nearestStop = null;

    for (const stop of route.stopDetails) {
      const dist = haversineDistance(userLat, userLng, stop.lat, stop.lng);
      if (dist < minDistance) {
        minDistance = dist;
        nearestStop = stop;
      }
    }

    if (minDistance <= maxDistKm) {
      matched.push({
        route,
        nearestStop,
        distanceKm: Number(minDistance.toFixed(2)),
        walkingTimeMin: Math.max(1, Math.round((minDistance / 4.5) * 60)) // 4.5 km/h walking speed
      });
    }
  }

  // Sort by closest stop first
  matched.sort((a, b) => a.distanceKm - b.distanceKm);
  return matched;
}
