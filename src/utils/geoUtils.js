// Geolocation & Map Utilities for Kolkata Transit Network

export const KOLKATA_STOPS_MAP = {
  'howrah': { lat: 22.5850, lng: 88.3426, name: 'Howrah Station' },
  'howrah station': { lat: 22.5850, lng: 88.3426, name: 'Howrah Station' },
  'howrah bridge': { lat: 22.5855, lng: 88.3468, name: 'Howrah Bridge' },
  'sealdah': { lat: 22.5670, lng: 88.3713, name: 'Sealdah Station' },
  'esplanade': { lat: 22.5645, lng: 88.3518, name: 'Esplanade' },
  'park street': { lat: 22.5510, lng: 88.3524, name: 'Park Street' },
  'rabindra sadan': { lat: 22.5390, lng: 88.3490, name: 'Rabindra Sadan / Exide' },
  'exide': { lat: 22.5390, lng: 88.3490, name: 'Exide' },
  'elgin': { lat: 22.5395, lng: 88.3520, name: 'Elgin Road' },
  'hazra': { lat: 22.5230, lng: 88.3450, name: 'Hazra Crossing' },
  'kalighat': { lat: 22.5180, lng: 88.3455, name: 'Kalighat' },
  'chetla': { lat: 22.5167, lng: 88.3361, name: 'Chetla' },
  'mominpur': { lat: 22.5270, lng: 88.3280, name: 'Mominpur' },
  'khidderpur': { lat: 22.5350, lng: 88.3260, name: 'Khidderpore' },
  'taratala': { lat: 22.5080, lng: 88.3120, name: 'Taratala' },
  'behala': { lat: 22.4975, lng: 88.3145, name: 'Behala Chowrasta' },
  'sarsuna': { lat: 22.4780, lng: 88.2890, name: 'Sarsuna' },
  'thakurpukur': { lat: 22.4600, lng: 88.3030, name: 'Thakurpukur' },
  'joka': { lat: 22.4435, lng: 88.3032, name: 'Joka' },
  'parnasree': { lat: 22.5020, lng: 88.3070, name: 'Parnasree' },
  'tollygunge': { lat: 22.4965, lng: 88.3458, name: 'Tollygunge Metro' },
  'jadavpur': { lat: 22.4988, lng: 88.3716, name: 'Jadavpur' },
  'golpark': { lat: 22.5120, lng: 88.3670, name: 'Golpark' },
  'gariahat': { lat: 22.5186, lng: 88.3653, name: 'Gariahat' },
  'dhakuria': { lat: 22.5100, lng: 88.3640, name: 'Dhakuria' },
  'baghajatin': { lat: 22.4840, lng: 88.3750, name: 'Baghajatin' },
  'garia': { lat: 22.4645, lng: 88.3813, name: 'Garia' },
  'ruby': { lat: 22.5135, lng: 88.3995, name: 'Ruby Crossing (EM Bypass)' },
  'science city': { lat: 22.5390, lng: 88.3950, name: 'Science City' },
  'chingrighata': { lat: 22.5640, lng: 88.4010, name: 'Chingrighata' },
  'nicco park': { lat: 22.5710, lng: 88.4200, name: 'Nicco Park' },
  'sector v': { lat: 22.5735, lng: 88.4331, name: 'Salt Lake Sector V' },
  'sector v bus stand': { lat: 22.5735, lng: 88.4331, name: 'Sector V Bus Stand' },
  'salt lake': { lat: 22.5800, lng: 88.4150, name: 'Salt Lake' },
  'karunamoyee': { lat: 22.5867, lng: 88.4183, name: 'Karunamoyee Central Terminus' },
  'tank no. 4': { lat: 22.5780, lng: 88.4210, name: 'Tank No. 4' },
  'nicco park gate': { lat: 22.5710, lng: 88.4200, name: 'Nicco Park Gate' },
  'city centre': { lat: 22.5885, lng: 88.4080, name: 'City Centre Salt Lake' },
  'bidhannagar': { lat: 22.5820, lng: 88.3990, name: 'Bidhannagar' },
  'phoolbagan': { lat: 22.5720, lng: 88.3850, name: 'Phoolbagan' },
  'bikash bhavan': { lat: 22.5890, lng: 88.4110, name: 'Bikash Bhavan' },
  'central park': { lat: 22.5840, lng: 88.4140, name: 'Central Park' },
  'college more': { lat: 22.5760, lng: 88.4340, name: 'College More' },
  'technopolis': { lat: 22.5775, lng: 88.4370, name: 'Technopolis' },
  'new town': { lat: 22.5850, lng: 88.4800, name: 'New Town' },
  'ultadanga': { lat: 22.5973, lng: 88.3888, name: 'Ultadanga HUDCO' },
  'shyambazar': { lat: 22.6026, lng: 88.3712, name: 'Shyambazar Five Point Crossing' },
  'dum dum': { lat: 22.6225, lng: 88.4180, name: 'Dum Dum' },
  'lake town': { lat: 22.6090, lng: 88.4020, name: 'Lake Town Crossing' },
  'baguiati': { lat: 22.6210, lng: 88.4280, name: 'Baguiati' },
  'airport': { lat: 22.6547, lng: 88.4467, name: 'Airport (CCU)' },
  'nabanna': { lat: 22.5562, lng: 88.3245, name: 'Nabanna' },
};

export function lookupStopCoordinate(stopName) {
  if (!stopName) return null;
  const clean = stopName.toLowerCase().replace(/[.\-_,()]/g, ' ').replace(/\s+/g, ' ').trim();
  for (const [key, val] of Object.entries(KOLKATA_STOPS_MAP)) {
    if (clean.includes(key) || key.includes(clean)) {
      return { lat: val.lat, lng: val.lng, name: stopName };
    }
  }
  return null;
}

export function buildRouteCoordinates(stops = []) {
  if (!stops || stops.length === 0) {
    return [
      { lat: 22.5735, lng: 88.4331, name: 'Start' },
      { lat: 22.5645, lng: 88.3518, name: 'End' }
    ];
  }

  const defaultOrigin = { lat: 22.5735, lng: 88.4331 }; // Sector V
  const defaultDest = { lat: 22.5645, lng: 88.3518 }; // Esplanade

  const mapped = stops.map((stopName, i) => {
    const coord = lookupStopCoordinate(stopName);
    if (coord) {
      return { name: stopName, lat: coord.lat, lng: coord.lng };
    }
    const ratio = stops.length > 1 ? i / (stops.length - 1) : 0.5;
    const lat = defaultOrigin.lat + (defaultDest.lat - defaultOrigin.lat) * ratio;
    const lng = defaultOrigin.lng + (defaultDest.lng - defaultOrigin.lng) * ratio;
    return { name: stopName, lat: Number(lat.toFixed(4)), lng: Number(lng.toFixed(4)) };
  });

  return mapped;
}

export function interpolatePositionAlongPath(path = [], t = 0) {
  if (!path || path.length === 0) return { lat: 22.5735, lng: 88.4331 };
  if (path.length === 1) return { lat: path[0].lat, lng: path[0].lng };

  const clampedT = Math.max(0, Math.min(1, t));
  const totalSegments = path.length - 1;
  const segmentFraction = clampedT * totalSegments;
  const segmentIndex = Math.min(totalSegments - 1, Math.floor(segmentFraction));
  const segmentT = segmentFraction - segmentIndex;

  const p1 = path[segmentIndex];
  const p2 = path[segmentIndex + 1];

  const lat = p1.lat + (p2.lat - p1.lat) * segmentT;
  const lng = p1.lng + (p2.lng - p1.lng) * segmentT;

  return { lat, lng };
}
