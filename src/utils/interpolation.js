/* ============================================================
   Position Interpolation Engine
   
   WHY: The OpenSky API only updates every ~10 seconds, which
   makes aircraft "jump" between positions. To create smooth
   movement, we linearly interpolate each aircraft's position
   based on its velocity and heading between poll intervals.
   
   MATH: We use a flat-earth approximation for the short distances
   covered in 10 seconds (aircraft travel ~2-3km in 10s at cruise).
   At these scales, the curvature error is negligible (<0.01%).
   
   The formula converts velocity + heading into lat/lng deltas:
   - dLat = velocity * cos(heading) * dt / 111,320
   - dLng = velocity * sin(heading) * dt / (111,320 * cos(lat))
   
   Where 111,320 meters ≈ 1 degree of latitude at any point,
   and the longitude divisor accounts for meridian convergence.
   ============================================================ */

/**
 * Interpolate a single aircraft's position forward in time.
 * 
 * @param {Object} aircraft — aircraft data object from store
 * @param {number} elapsedMs — milliseconds since last API poll
 * @returns {{ latitude: number, longitude: number }} — interpolated position
 */
export function interpolatePosition(aircraft, elapsedMs) {
  const { latitude, longitude, velocity, trueTrack } = aircraft;

  // If we don't have velocity or heading, can't interpolate — return as-is
  if (
    velocity === null || velocity === undefined ||
    trueTrack === null || trueTrack === undefined ||
    latitude === null || longitude === null
  ) {
    return { latitude, longitude };
  }

  // Don't interpolate ground traffic — they follow taxiways, not straight lines
  if (aircraft.onGround) {
    return { latitude, longitude };
  }

  const elapsedSeconds = elapsedMs / 1000;

  // Convert heading from degrees to radians for trig functions
  const headingRad = (trueTrack * Math.PI) / 180;

  // Distance traveled in meters during the elapsed time
  const distanceMeters = velocity * elapsedSeconds;

  // WHY 111,320: One degree of latitude is approximately 111,320 meters
  // at any point on Earth (it varies by ~0.5% from equator to pole,
  // which is irrelevant for our 10-second interpolation distances).
  const METERS_PER_DEG_LAT = 111320;

  // Latitude change: northward component of the velocity vector
  const dLat = (distanceMeters * Math.cos(headingRad)) / METERS_PER_DEG_LAT;

  // Longitude change: eastward component, corrected for latitude
  // WHY cos(lat): Longitude degrees get smaller as you move toward the poles.
  // At 60°N latitude, one degree of longitude is only ~55,660m (half of equatorial).
  const latRad = (latitude * Math.PI) / 180;
  const dLng = (distanceMeters * Math.sin(headingRad)) / (METERS_PER_DEG_LAT * Math.cos(latRad));

  return {
    latitude: latitude + dLat,
    longitude: longitude + dLng,
  };
}

/**
 * Interpolate all aircraft in an array.
 * Returns a new GeoJSON FeatureCollection with updated positions.
 * 
 * WHY GeoJSON: Mapbox GL's Source/Layer API uses GeoJSON natively.
 * Converting here means the AircraftLayer component can directly
 * pass this to the map source without further transformation.
 */
export function interpolateAllToGeoJSON(aircraft, elapsedMs) {
  return {
    type: 'FeatureCollection',
    features: aircraft.map((a) => {
      const { latitude, longitude } = interpolatePosition(a, elapsedMs);
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        properties: {
          icao24: a.icao24,
          callsign: a.callsign,
          originCountry: a.originCountry,
          altitude: a.baroAltitude,
          velocity: a.velocity,
          trueTrack: a.trueTrack || 0,
          verticalRate: a.verticalRate,
          onGround: a.onGround,
          geoAltitude: a.geoAltitude,
          squawk: a.squawk,
          iconType: a.iconType || 'aircraft-large',
        },
      };
    }),
  };
}

/**
 * Get a color for an aircraft based on its altitude.
 * WHY: Visual hierarchy — the spec requires altitude-based color coding
 * so high-flying aircraft are visually distinct from low-altitude ones.
 * 
 * Scale: Ground (red) → Low/amber → Mid/cyan → High/blue
 */
export function getAltitudeColor(altitudeMeters) {
  if (altitudeMeters === null || altitudeMeters === undefined || altitudeMeters <= 0) {
    return '#ef4444'; // Red — on ground or invalid
  }
  if (altitudeMeters < 1000) return '#fbbf24';   // Amber — very low
  if (altitudeMeters < 3000) return '#f59e0b';   // Orange — low
  if (altitudeMeters < 6000) return '#06b6d4';   // Cyan — medium
  if (altitudeMeters < 9000) return '#0ea5e9';   // Sky blue — high
  return '#6366f1';                                // Indigo — cruise altitude
}
