// A lightweight map of common ICAO aircraft type codes to human-readable names.
// WHY: ADS-B data only transmits tiny codes to save bandwidth. This makes the UI feel premium.
// Extracted from common aviation databases for the absolute most frequent flyers.

const dictionary = {
  // Airbus
  A20N: 'Airbus A320neo',
  A21N: 'Airbus A321neo',
  A318: 'Airbus A318',
  A319: 'Airbus A319',
  A320: 'Airbus A320',
  A321: 'Airbus A321',
  A332: 'Airbus A330-200',
  A333: 'Airbus A330-300',
  A339: 'Airbus A330-900neo',
  A343: 'Airbus A340-300',
  A346: 'Airbus A340-600',
  A359: 'Airbus A350-900',
  A35K: 'Airbus A350-1041',
  A388: 'Airbus A380-800',

  // Boeing
  B737: 'Boeing 737',
  B738: 'Boeing 737-800',
  B739: 'Boeing 737-900',
  B38M: 'Boeing 737 MAX 8',
  B39M: 'Boeing 737 MAX 9',
  B744: 'Boeing 747-400',
  B748: 'Boeing 747-8',
  B752: 'Boeing 752-200',
  B753: 'Boeing 753-300',
  B763: 'Boeing 767-300',
  B764: 'Boeing 767-400',
  B772: 'Boeing 777-200',
  B773: 'Boeing 777-300',
  B77L: 'Boeing 777-200LR',
  B77W: 'Boeing 777-300ER',
  B788: 'Boeing 787-8 Dreamliner',
  B789: 'Boeing 787-9 Dreamliner',
  B78X: 'Boeing 787-10 Dreamliner',

  // Embraer
  E170: 'Embraer E170',
  E75L: 'Embraer E175',
  E75S: 'Embraer E175',
  E190: 'Embraer E190',
  E195: 'Embraer E195',

  // Bombardier / CRJ
  CRJ2: 'Bombardier CRJ-200',
  CRJ7: 'Bombardier CRJ-700',
  CRJ9: 'Bombardier CRJ-900',
  CRJX: 'Bombardier CRJ-1000',
  BCS1: 'Airbus A220-100', // Formerly CSeries
  BCS3: 'Airbus A220-300',

  // Cessna / Business Jets
  C25A: 'Cessna Citation CJ2',
  C25B: 'Cessna Citation CJ3',
  C25C: 'Cessna Citation CJ4',
  C560: 'Cessna Citation V',
  C56X: 'Cessna Citation Excel',
  C680: 'Cessna Citation Sovereign',
  C750: 'Cessna Citation X',
  GL5T: 'Bombardier Global 5000',
  GLEX: 'Bombardier Global Express',
  GLF4: 'Gulfstream IV',
  GLF5: 'Gulfstream V',
  GLF6: 'Gulfstream G650',

  // General Aviation
  C172: 'Cessna 172 Skyhawk',
  C182: 'Cessna 182 Skylane',
  C208: 'Cessna 208 Caravan',
  P28A: 'Piper PA-28 Cherokee',
  SR22: 'Cirrus SR22'
};

export function getAircraftFullName(icaoCode) {
  if (!icaoCode) return 'Unknown Aircraft';
  const cleanCode = icaoCode.toUpperCase().trim();
  return dictionary[cleanCode] || `Unknown (${cleanCode})`;
}
