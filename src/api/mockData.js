/* ============================================================
   Mock Aircraft Data
   
   WHY: The OpenSky free API aggressively rate-limits (429 errors).
   This mock dataset lets the app remain fully functional and
   visually impressive during development or when rate-limited.
   
   Aircraft are spread across Central Europe with realistic
   telemetry values for altitude, speed, and heading.
   ============================================================ */

export const MOCK_AIRCRAFT = [
  {
    icao24: 'a0b1c2', callsign: 'SWR283', originCountry: 'Switzerland',
    longitude: 8.5417, latitude: 47.3769, baroAltitude: 10668,
    velocity: 231.5, trueTrack: 45, verticalRate: 0, onGround: false,
    geoAltitude: 10700, squawk: '1000', timePosition: null, lastContact: null,
  },
  {
    icao24: 'd3e4f5', callsign: 'DLH42A', originCountry: 'Germany',
    longitude: 11.7861, latitude: 48.3537, baroAltitude: 11278,
    velocity: 245.2, trueTrack: 125, verticalRate: -1.2, onGround: false,
    geoAltitude: 11300, squawk: '2341', timePosition: null, lastContact: null,
  },
  {
    icao24: 'g6h7i8', callsign: 'AFR158', originCountry: 'France',
    longitude: 2.3522, latitude: 48.8566, baroAltitude: 9144,
    velocity: 210.8, trueTrack: 220, verticalRate: 3.5, onGround: false,
    geoAltitude: 9180, squawk: '5623', timePosition: null, lastContact: null,
  },
  {
    icao24: 'j9k0l1', callsign: 'BAW78C', originCountry: 'United Kingdom',
    longitude: -0.4614, latitude: 51.4700, baroAltitude: 457,
    velocity: 72.0, trueTrack: 270, verticalRate: -5.8, onGround: false,
    geoAltitude: 490, squawk: '7421', timePosition: null, lastContact: null,
  },
  {
    icao24: 'm2n3o4', callsign: 'KLM609', originCountry: 'Netherlands',
    longitude: 4.7683, latitude: 52.3086, baroAltitude: 10363,
    velocity: 238.0, trueTrack: 330, verticalRate: 0, onGround: false,
    geoAltitude: 10400, squawk: '3012', timePosition: null, lastContact: null,
  },
  {
    icao24: 'p5q6r7', callsign: 'RYR21C', originCountry: 'Ireland',
    longitude: 12.4964, latitude: 41.9028, baroAltitude: 11582,
    velocity: 252.3, trueTrack: 170, verticalRate: 0.3, onGround: false,
    geoAltitude: 11620, squawk: '4100', timePosition: null, lastContact: null,
  },
  {
    icao24: 's8t9u0', callsign: 'EZY53B', originCountry: 'United Kingdom',
    longitude: -3.7038, latitude: 40.4168, baroAltitude: 8534,
    velocity: 198.5, trueTrack: 90, verticalRate: 4.2, onGround: false,
    geoAltitude: 8570, squawk: '6200', timePosition: null, lastContact: null,
  },
  {
    icao24: 'v1w2x3', callsign: 'THY6PA', originCountry: 'Turkey',
    longitude: 28.9784, latitude: 41.0082, baroAltitude: 12192,
    velocity: 260.1, trueTrack: 55, verticalRate: 0, onGround: false,
    geoAltitude: 12230, squawk: '2050', timePosition: null, lastContact: null,
  },
  {
    icao24: 'y4z5a6', callsign: 'SAS900', originCountry: 'Sweden',
    longitude: 17.9553, latitude: 59.3293, baroAltitude: 9754,
    velocity: 220.0, trueTrack: 15, verticalRate: -2.1, onGround: false,
    geoAltitude: 9790, squawk: '1234', timePosition: null, lastContact: null,
  },
  {
    icao24: 'b7c8d9', callsign: 'AUA412', originCountry: 'Austria',
    longitude: 16.3738, latitude: 48.2082, baroAltitude: 7620,
    velocity: 195.0, trueTrack: 200, verticalRate: 6.1, onGround: false,
    geoAltitude: 7660, squawk: '3456', timePosition: null, lastContact: null,
  },
  {
    icao24: 'e0f1g2', callsign: 'IBE324', originCountry: 'Spain',
    longitude: -3.7038, latitude: 40.4168, baroAltitude: 10972,
    velocity: 240.5, trueTrack: 310, verticalRate: 0, onGround: false,
    geoAltitude: 11010, squawk: '5004', timePosition: null, lastContact: null,
  },
  {
    icao24: 'h3i4j5', callsign: 'TAP815', originCountry: 'Portugal',
    longitude: -9.1393, latitude: 38.7223, baroAltitude: 6096,
    velocity: 185.0, trueTrack: 140, verticalRate: 8.5, onGround: false,
    geoAltitude: 6130, squawk: '6721', timePosition: null, lastContact: null,
  },
  {
    icao24: 'k6l7m8', callsign: 'LOT358', originCountry: 'Poland',
    longitude: 20.9842, latitude: 52.2297, baroAltitude: 11887,
    velocity: 255.0, trueTrack: 75, verticalRate: 0, onGround: false,
    geoAltitude: 11920, squawk: '4321', timePosition: null, lastContact: null,
  },
  {
    icao24: 'n9o0p1', callsign: 'AZA702', originCountry: 'Italy',
    longitude: 12.4964, latitude: 41.9028, baroAltitude: 305,
    velocity: 65.0, trueTrack: 160, verticalRate: -8.0, onGround: false,
    geoAltitude: 340, squawk: '7000', timePosition: null, lastContact: null,
  },
  {
    icao24: 'q2r3s4', callsign: 'FIN29A', originCountry: 'Finland',
    longitude: 24.9384, latitude: 60.1699, baroAltitude: 10058,
    velocity: 225.0, trueTrack: 260, verticalRate: -1.5, onGround: false,
    geoAltitude: 10090, squawk: '2200', timePosition: null, lastContact: null,
  },
  {
    icao24: 't5u6v7', callsign: 'CSA550', originCountry: 'Czech Republic',
    longitude: 14.4378, latitude: 50.0755, baroAltitude: 9449,
    velocity: 218.0, trueTrack: 115, verticalRate: 2.0, onGround: false,
    geoAltitude: 9480, squawk: '3300', timePosition: null, lastContact: null,
  },
  {
    icao24: 'w8x9y0', callsign: 'UAE43F', originCountry: 'United Arab Emirates',
    longitude: 6.9603, latitude: 50.9375, baroAltitude: 12497,
    velocity: 268.0, trueTrack: 280, verticalRate: 0, onGround: false,
    geoAltitude: 12530, squawk: '1100', timePosition: null, lastContact: null,
  },
  {
    icao24: 'z1a2b3', callsign: 'NOR82D', originCountry: 'Norway',
    longitude: 10.7522, latitude: 59.9139, baroAltitude: 8839,
    velocity: 205.0, trueTrack: 195, verticalRate: 0, onGround: false,
    geoAltitude: 8870, squawk: '4400', timePosition: null, lastContact: null,
  },
  {
    icao24: 'c4d5e6', callsign: '', originCountry: 'Germany',
    longitude: 13.4050, latitude: 52.5200, baroAltitude: 0,
    velocity: 12.0, trueTrack: 90, verticalRate: 0, onGround: true,
    geoAltitude: 35, squawk: '7700', timePosition: null, lastContact: null,
  },
  {
    icao24: 'f7g8h9', callsign: 'WZZ101', originCountry: 'Hungary',
    longitude: 19.0402, latitude: 47.4979, baroAltitude: 7315,
    velocity: 190.0, trueTrack: 345, verticalRate: 5.5, onGround: false,
    geoAltitude: 7350, squawk: '5500', timePosition: null, lastContact: null,
  },
];

/**
 * Simulate fetching aircraft within bounds using mock data.
 * WHY: Returns only aircraft within the bounding box to mimic
 * the real API's bounding-box filtering behavior.
 */
export function fetchMockAircraft(bbox) {
  if (!bbox) return MOCK_AIRCRAFT;

  const { south, west, north, east } = bbox;
  return MOCK_AIRCRAFT.filter(
    (a) =>
      a.latitude >= south &&
      a.latitude <= north &&
      a.longitude >= west &&
      a.longitude <= east
  );
}
