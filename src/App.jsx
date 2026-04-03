/* ============================================================
   App — Root Application Component
   
   Assembles all components:
   - MapViewport (full-screen, contains AircraftLayer)
   - SearchBar (floating, top-center)
   - ControlPanel (floating, top-left)
   - FlightSidebar (conditional slide-in, right side)
   - StatusBar (floating pill, bottom-center)
   
   Also initializes the useAircraftData hook at the top level
   to start polling the OpenSky API.
   ============================================================ */

import React from 'react';
import MapViewport from './components/MapViewport';
import FlightSidebar from './components/FlightSidebar';
import FR24Layout from './components/FR24Layout';
import useAircraftData from './hooks/useAircraftData';

export default function App() {
  // Initialize the data polling orchestration at the root level
  // WHY here: Needs to run once, and the hook reads/writes to the
  // Zustand store which all child components subscribe to.
  useAircraftData();

  return (
    <>
      {/* Full-screen map — always rendered as the base layer */}
      <MapViewport />

      {/* New integrated Flightradar24-style UI layout */}
      <FR24Layout />

      {/* Flight sidebar rendered on top when aircraft is selected */}
      <FlightSidebar />
    </>
  );
}
