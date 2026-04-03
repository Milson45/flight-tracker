/* ============================================================
   OpenSky Network API Client
   
   WHY separate file: The architecture spec mandates strict
   separation of concerns — API calls must NOT live inside
   UI components. This module handles all OpenSky communication,
   response parsing, and error handling.
   
   API Docs: https://openskynetwork.github.io/opensky-api/rest.html
   
   The OpenSky state vector array indices:
   [0]  icao24        — ICAO 24-bit transponder address (hex string)
   [1]  callsign      — Callsign (string, may be null)
   [2]  origin_country
   [3]  time_position  — Unix timestamp of last position update
   [4]  last_contact   — Unix timestamp of last contact
   [5]  longitude
   [6]  latitude
   [7]  baro_altitude  — Barometric altitude in meters
   [8]  on_ground      — Boolean
   [9]  velocity       — Ground speed in m/s
   [10] true_track     — Heading in decimal degrees clockwise from north
   [11] vertical_rate  — Vertical rate in m/s
   [12] sensors        — IDs of receivers (array)
   [13] geo_altitude   — Geometric altitude in meters
   [14] squawk         — Transponder squawk code
   [15] spi            — Special purpose indicator
   [16] position_source — 0=ADS-B, 1=ASTERIX, 2=MLAT, 3=FLARM
   ============================================================ */

// WHY /api/opensky: We route through the Vite dev server proxy
// to bypass CORS restrictions. The proxy forwards requests to
// https://opensky-network.org/api/... server-side.
const OPENSKY_BASE_URL = '/api/opensky/states/all';

/**
 * Parse a raw OpenSky state vector array into a named object.
 * WHY: The API returns arrays (not objects) for bandwidth efficiency.
 * We convert to objects for readable, maintainable code downstream.
 */
function parseStateVector(sv) {
  return {
    icao24: sv[0],
    callsign: sv[1] ? sv[1].trim() : 'N/A',
    originCountry: sv[2],
    timePosition: sv[3],
    lastContact: sv[4],
    longitude: sv[5],
    latitude: sv[6],
    baroAltitude: sv[7],      // meters
    onGround: sv[8],
    velocity: sv[9],          // m/s
    trueTrack: sv[10],        // degrees
    verticalRate: sv[11],     // m/s
    geoAltitude: sv[13],      // meters
    squawk: sv[14],
  };
}

/**
 * Fetch aircraft within the given map bounding box.
 * 
 * @param {Object} bbox - { south, west, north, east } in decimal degrees
 * @returns {Promise<Object>} { aircraft: Array, timestamp: number }
 * 
 * WHY bounding box: Fetching the entire globe returns 10,000+ aircraft
 * which wastes bandwidth and slows rendering. The spec requires we
 * calculate the visible map bounds and only request those aircraft.
 */
export async function fetchAircraftInBounds(bbox) {
  if (!bbox) {
    throw new Error('Bounding box is required for API fetch');
  }

  const { south, west, north, east } = bbox;

  // Build URL with bounding box params as specified by OpenSky docs
  const url = `${OPENSKY_BASE_URL}?lamin=${south}&lomin=${west}&lamax=${north}&lomax=${east}`;

  const response = await fetch(url);

  if (!response.ok) {
    // WHY specific error codes: OpenSky returns 429 for rate limiting
    // and 503 when under heavy load. We surface these clearly.
    if (response.status === 429) {
      throw new Error('RATE_LIMITED');
    }
    throw new Error(`OpenSky API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  // The API returns { time: unix_timestamp, states: [[...], [...], ...] }
  // states can be null if no aircraft are in the bounding box
  const states = data.states || [];

  const aircraft = states
    .map(parseStateVector)
    // Filter out aircraft with no valid position data
    .filter((a) => a.longitude !== null && a.latitude !== null);

  return {
    aircraft,
    timestamp: data.time,
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
