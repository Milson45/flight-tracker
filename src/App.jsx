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
import ControlPanel from './components/ControlPanel';
import SearchBar from './components/SearchBar';
import StatusBar from './components/StatusBar';
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

      {/* Floating UI overlays — layered over the map */}
      <SearchBar />
      <ControlPanel />
      <FlightSidebar />
      <StatusBar />
    </>
  );
}
