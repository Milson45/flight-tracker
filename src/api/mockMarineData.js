/* ============================================================
   Mock Marine AIS Simulator
   
   WHY: Global real-time maritime AIS data is monopolized by 
   enterprise aggregators that enforce severe paywalls and IP blocks.
   To fulfill the architectural requirement of a dual-domain tracker
   without introducing subscription costs, this engine algorithmically
   simulates marine traffic mathematically bound to the active viewport.
   ============================================================ */

const VESSEL_TYPES = [
  'Oil Tanker',
  'Container Ship',
  'Bulk Carrier',
  'Fishing Vessel',
  'Sailing Yacht',
  'Passenger Cruiser',
  'Tug',
  'Ro-Ro Cargo'
];

const DESTINATIONS = [
  'Rotterdam', 'Singapore', 'Shanghai', 'Los Angeles', 'Hamburg',
  'Antwerp', 'Dubai', 'New York', 'Marseille', 'Tokyo'
];

// Seed math to guarantee persistent vessels within a bounded area
function sfc32(a, b, c, d) {
  return function() {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
    let t = (a + b) | 0;
    a = b ^ b >>> 9;
    b = c + (c << 3) | 0;
    c = (c << 21 | c >>> 11);
    d = d + 1 | 0;
    t = t + d | 0;
    c = c + t | 0;
    return (t >>> 0) / 4294967296;
  }
}

export function generateSimulatedVessels(bbox) {
  if (!bbox) return [];
  
  // Calculate area roughly to determine density
  const latDiff = Math.abs(bbox.north - bbox.south);
  const lonDiff = Math.abs(bbox.east - bbox.west);
  const area = latDiff * lonDiff;
  
  // Generate 8 to 25 vessels depending on zoom/area size
  const vesselCount = Math.max(8, Math.min(25, Math.floor(area * 50)));

  // Use the center coordinates rounded to nearest whole number to seed persistent generation
  // so ships don't totally vanish and randomize every time we pan slightly.
  const centerLatCng = Math.round((bbox.north + bbox.south) / 2);
  const centerLonCng = Math.round((bbox.east + bbox.west) / 2);
  const rand = sfc32(centerLatCng, centerLonCng, 1337, 42);

  const vessels = [];
  const now = Date.now();

  for (let i = 0; i < vesselCount; i++) {
    // Persistent initial state for this ship based on seed
    const initLat = bbox.south + (rand() * latDiff);
    const initLon = bbox.west + (rand() * lonDiff);
    
    // Trajectory parameters
    const speedKnots = 8 + (rand() * 16); // 8 to 24 knots
    const headingDeg = rand() * 360;
    
    // Calculate how far the ship has moved relative to a daily epoch
    // so they physically glide across the screen when polling every 10 seconds.
    const dayEpochMs = now % (1000 * 60 * 60 * 24); // Ms elapsed today
    const hoursElapsed = dayEpochMs / 3600000;
    
    // Knots = Nautical Miles Per Hour. 1 NM = ~1/60th of a degree latitude
    const distanceNm = speedKnots * hoursElapsed;
    const distanceDeg = distanceNm / 60;
    
    // Offset current position by trajectory
    const headingRad = headingDeg * (Math.PI / 180);
    // Wrap around coordinates cleanly
    let curLat = initLat + (Math.cos(headingRad) * distanceDeg);
    let curLon = initLon + (Math.sin(headingRad) * distanceDeg);
    
    // Bounce them within a massive simulated ocean box so they don't jump crazily
    curLat = ((curLat + 90) % 180) - 90;
    curLon = ((curLon + 180) % 360) - 180;

    const mmsi = Math.floor(100000000 + rand() * 899999999).toString();
    const typeIdx = Math.floor(rand() * VESSEL_TYPES.length);
    const destIdx = Math.floor(rand() * DESTINATIONS.length);
    const length = Math.floor(40 + rand() * 300); // 40m to 340m
    const draft = (Math.random() * 12 + 2).toFixed(1);

    vessels.push({
      id: mmsi,        // MMSI replaces ICAO24
      mmsi: mmsi,
      name: `MV MARINER ${i+1}`,
      type: VESSEL_TYPES[typeIdx],
      destination: DESTINATIONS[destIdx],
      longitude: curLon,
      latitude: curLat,
      speed: speedKnots,
      heading: headingDeg,
      length: length,
      width: Math.floor(length / 6),
      draft: draft,
      grossTonnage: Math.floor(length * 150),
      flag: 'PA', // Panama default testing flag
    });
  }

  return vessels;
}
