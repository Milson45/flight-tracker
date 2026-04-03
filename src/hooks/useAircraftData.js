/* ============================================================
   useAircraftData Hook — Orchestrates API polling + state updates
   
   WHY separate hook: Keeps the data-fetching orchestration logic
   out of UI components (separation of concerns). This hook:
   1. Reads the current bounding box from the store
   2. Calls the OpenSky API (or falls back to mock data)
   3. Updates the store with fresh aircraft data
   4. Manages connection status and error display
   ============================================================ */

import { useEffect, useCallback, useRef } from 'react';
import useFlightStore from '../store/flightStore';
import { fetchAircraftInBounds } from '../api/opensky';
import { fetchMockAircraft } from '../api/mockData';
import useInterval from './useInterval';

// WHY 10 seconds: OpenSky updates positions roughly every 10s.
// Polling faster wastes bandwidth and hits rate limits sooner.
const POLL_INTERVAL_MS = 10000;

export default function useAircraftData() {
  const boundingBox = useFlightStore((s) => s.boundingBox);
  const setAircraft = useFlightStore((s) => s.setAircraft);
  const setIsDemo = useFlightStore((s) => s.setIsDemo);
  const setConnectionStatus = useFlightStore((s) => s.setConnectionStatus);
  const refreshSelectedAircraft = useFlightStore((s) => s.refreshSelectedAircraft);
  const filters = useFlightStore((s) => s.filters);

  // Track consecutive API failures to decide when to fall back to demo
  const failCount = useRef(0);

  const fetchData = useCallback(async () => {
    if (!boundingBox) return;

    try {
      const { aircraft } = await fetchAircraftInBounds(boundingBox);

      // Apply altitude filter before storing
      const filtered = aircraft.filter((a) => {
        if (!filters.showOnGround && a.onGround) return false;
        if (a.baroAltitude !== null && a.baroAltitude < filters.minAltitude) return false;
        return true;
      });

      setAircraft(filtered);
      setConnectionStatus('connected');
      setIsDemo(false);
      failCount.current = 0;

      // Keep the sidebar in sync if an aircraft is selected
      refreshSelectedAircraft();

    } catch (error) {
      console.warn('[SkyMap] API fetch failed:', error.message);
      failCount.current++;

      // WHY 10: The caching proxy serves stale data on 429s and errors,
      // so the client should rarely see failures. Only fall back to demo
      // mode after 10 consecutive hard failures (e.g. server completely down).
      if (failCount.current >= 10) {
        console.info('[SkyMap] Switching to demo mode with mock data');
        const mockData = fetchMockAircraft(boundingBox);
        setAircraft(mockData);
        setIsDemo(true);
        setConnectionStatus('demo');
      } else {
        setConnectionStatus('error', error.message);
      }
    }
  }, [boundingBox, filters, setAircraft, setIsDemo, setConnectionStatus, refreshSelectedAircraft]);

  // Initial fetch when bounding box becomes available
  useEffect(() => {
    if (boundingBox) {
      fetchData();
    }
  }, [boundingBox]); // eslint-disable-line react-hooks/exhaustive-deps

  // Poll every 10 seconds
  useInterval(fetchData, POLL_INTERVAL_MS);
}
