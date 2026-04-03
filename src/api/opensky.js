/* ============================================================
   adsb.lol API Client
   
   WHY adsb.lol: OpenSky Network aggressively rate-limits free
   users (~100 requests/day). adsb.lol is a community-driven,
   open-data project that provides real-time ADS-B data with
   far more generous limits and richer data per aircraft.
   
   API endpoint: /v2/lat/{lat}/lon/{lon}/dist/{dist_nm}
   Returns all aircraft within {dist_nm} nautical miles of the point.
   
   WHY distance-based instead of bounding box: adsb.lol doesn't
   support bounding box queries. Instead, we compute the center
   of the viewport and a radius that covers the visible area.
   ============================================================ */

import { getAircraftFullName } from '../utils/aircraftDictionary';

/**
 * Parse an adsb.lol aircraft object into our standard format.
 * The adsb.lol response uses different field names than OpenSky,
 * so we normalize here for consistent downstream usage.
 */
function parseAircraft(ac) {
  const parsed = {
    icao24: ac.hex || 'unknown',
    callsign: ac.flight ? ac.flight.trim() : (ac.r || 'N/A'),
    originCountry: '', // adsb.lol doesn't provide origin country directly
    registration: ac.r || null,
    aircraftType: getAircraftFullName(ac.t),
    timePosition: null,
    lastContact: null,
    longitude: ac.lon,
    latitude: ac.lat,
    // adsb.lol gives altitude in feet already (not meters like OpenSky)
    // We store in meters internally for consistency with our display helpers
    baroAltitude: ac.alt_baro === 'ground' ? 0 : (ac.alt_baro != null ? ac.alt_baro / 3.28084 : null),
    onGround: ac.alt_baro === 'ground' || (ac.gs != null && ac.gs < 30 && (ac.alt_baro === 'ground' || ac.alt_baro < 100)),
    // adsb.lol gives ground speed in knots — convert to m/s for our helpers
    velocity: ac.gs != null ? ac.gs * 0.514444 : null,
    trueTrack: ac.track ?? ac.true_heading ?? null,
    verticalRate: ac.baro_rate != null ? ac.baro_rate / 196.85 : null, // fpm → m/s
    geoAltitude: ac.alt_geom != null ? ac.alt_geom / 3.28084 : null,
    squawk: ac.squawk || null,
    // Extra fields from adsb.lol not available in OpenSky
    mach: ac.mach || null,
    ias: ac.ias || null, // indicated airspeed
    tas: ac.tas || null, // true airspeed
    category: ac.category || null,
    emergency: ac.emergency || null,
  };
  const cat = String(ac.category || '').toUpperCase();
  if (cat.startsWith('A1') || cat.startsWith('A2')) {
    parsed.iconType = 'aircraft-light'; // Light/Small
  } else if (cat.startsWith('A5')) {
    parsed.iconType = 'aircraft-heavy'; // Heavy
  } else if (cat === 'A7' || cat === 'C1') {
    parsed.iconType = 'aircraft-heli';  // Rotorcraft/Helicopter
  } else if (cat.startsWith('B')) {
    // If it's B1-B7 (Gliders, balloons, drones), default to light for now
    parsed.iconType = 'aircraft-light';
  } else {
    // Default to commercial jet size for A3, A4, or unknown
    parsed.iconType = 'aircraft-large';
  }

  return parsed;
}

/**
 * Calculate the center point and radius from a bounding box.
 * WHY: adsb.lol uses center+radius queries, not bounding boxes.
 * We compute the center of the visible map and a radius (in NM)
 * that covers the entire visible area.
 */
function bboxToCenterRadius(bbox) {
  const { south, west, north, east } = bbox;

  const centerLat = (south + north) / 2;
  const centerLon = (west + east) / 2;

  // Calculate the diagonal distance of the bounding box in nautical miles
  // Using the Haversine formula for accuracy
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(north - south);
  const dLon = toRad(east - west);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(south)) * Math.cos(toRad(north)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distKm = 6371 * c; // Earth radius in km
  const distNm = distKm / 1.852; // Convert to nautical miles

  // Use half the diagonal as radius, capped between 10 NM and 250 NM
  // WHY min 10 NM: Even if zoomed in deeply at an airport, we still want to
  // fetch traffic surrounding it, avoiding radius=0 errors.
  const radius = Math.max(10, Math.min(Math.round(distNm / 2), 250));

  return { lat: centerLat.toFixed(2), lon: centerLon.toFixed(2), radius };
}

/**
 * Fetch aircraft within the given map bounding box using adsb.lol.
 * 
 * @param {Object} bbox - { south, west, north, east } in decimal degrees
 * @returns {Promise<Object>} { aircraft: Array }
 */
export async function fetchAircraftInBounds(bbox) {
  if (!bbox) {
    throw new Error('Bounding box is required for API fetch');
  }

  const { lat, lon, radius } = bboxToCenterRadius(bbox);

  // Route through Vite proxy to avoid CORS
  const url = `/api/adsb/v2/lat/${lat}/lon/${lon}/dist/${radius}`;

  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('RATE_LIMITED');
    }
    throw new Error(`adsb.lol API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  // adsb.lol returns { ac: [...], msg: "...", now: timestamp, ... }
  const rawAircraft = data.ac || [];

  const aircraft = rawAircraft
    .map(parseAircraft)
    // Filter out aircraft with no valid position
    .filter((a) => a.longitude != null && a.latitude != null);

  return {
    aircraft,
    timestamp: data.now,
    total: data.total || aircraft.length,
  };
}

/**
 * Convert meters to feet for display
 */
export function metersToFeet(meters) {
  if (meters === null || meters === undefined) return null;
  return Math.round(meters * 3.28084);
}

/**
 * Convert m/s to knots for display
 */
export function msToKnots(ms) {
  if (ms === null || ms === undefined) return null;
  return Math.round(ms * 1.94384);
}

/**
 * Format altitude for display with commas
 */
export function formatAltitude(meters) {
  const feet = metersToFeet(meters);
  if (feet === null) return '—';
  return feet.toLocaleString() + ' ft';
}

/**
 * Format speed for display
 */
export function formatSpeed(ms) {
  const knots = msToKnots(ms);
  if (knots === null) return '—';
  return knots.toLocaleString() + ' kts';
}

/**
 * Format heading for display
 */
export function formatHeading(degrees) {
  if (degrees === null || degrees === undefined) return '—';
  return Math.round(degrees) + '°';
}

/**
 * Format vertical rate for display
 */
export function formatVerticalRate(ms) {
  if (ms === null || ms === undefined) return '—';
  const fpm = Math.round(ms * 196.85); // m/s to ft/min
  const sign = fpm > 0 ? '+' : '';
  return sign + fpm.toLocaleString() + ' fpm';
}
