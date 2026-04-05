/* ============================================================
   useVesselData Hook — Orchestrates Marine Data Simulation
   
   WHY: Identical architecture to useAircraftData. Orchestrates
   the fetching (in this case, procedural simulation) of AIS
   traffic every 10 seconds and feeds it to the Zustand store.
   ============================================================ */

import { useEffect, useCallback } from 'react';
import useFlightStore from '../store/flightStore';
import { generateSimulatedVessels } from '../api/mockMarineData';
import useInterval from './useInterval';

const POLL_INTERVAL_MS = 10000; // 10 seconds standard telemetry poll

export default function useVesselData() {
  const boundingBox = useFlightStore((s) => s.boundingBox);
  const setVessels = useFlightStore((s) => s.setVessels);
  const domainMode = useFlightStore((s) => s.domainMode);

  const fetchVessels = useCallback(() => {
    // Only run the marine engine if we are actually tracking ships
    if (!boundingBox || domainMode !== 'maritime') return;

    try {
      // Procedurally generate or advance vessel traffic within viewport bounds
      const vessels = generateSimulatedVessels(boundingBox);
      setVessels(vessels);
    } catch (error) {
      console.warn('[MarineSim] Engine failed:', error.message);
    }
  }, [boundingBox, domainMode, setVessels]);

  useEffect(() => {
    if (boundingBox && domainMode === 'maritime') {
      fetchVessels();
    }
  }, [boundingBox, domainMode]); // eslint-disable-line react-hooks/exhaustive-deps

  useInterval(fetchVessels, POLL_INTERVAL_MS);
}
