/* ============================================================
   Zustand Flight Store
   
   WHY Zustand over Context: With aircraft positions updating
   every 10s and interpolating 60fps between polls, Context
   would cause cascading re-renders across the entire tree.
   Zustand's selector pattern lets each component subscribe
   to only the slice of state it needs.
   ============================================================ */

import { create } from 'zustand';

const useFlightStore = create((set, get) => ({
  // —— Aircraft State ——
  // Raw array of aircraft objects from the last API poll
  aircraft: [],
  // Timestamp of the last successful data fetch (for interpolation timing)
  lastFetchTime: null,
  // Whether we're using mock data due to API rate limits
  isDemo: false,

  // —— Selection State ——
  // The currently selected aircraft object, or null
  selectedAircraft: null,
  // The currently selected airport object { iata, city }, or null
  selectedAirport: null,

  // —— Map Viewport State ——
  // react-map-gl controlled viewport
  viewState: {
    longitude: 8.5417,   // Default: Central Europe (Switzerland)
    latitude: 47.3769,
    zoom: 6,
    bearing: 0,
    pitch: 30,           // Slight pitch for that 3D avionics feel
  },
  
  // A transient target to force the map to pan to specific coordinates (e.g., from an airport search)
  flyToTarget: null,

  // —— Bounding Box ——
  // Computed from the current map viewport corners.
  // WHY: We pass this to the OpenSky API so we only fetch aircraft
  // visible on screen, not the entire globe (~10K+ aircraft).
  boundingBox: null,

  // —— Filters & Toggles ——
  filters: {
    minAltitude: 0,       // Meters — filter out aircraft below this
    showOnGround: false,  // Toggle ground traffic visibility
  },

  // —— User Session ——
  user: null,
  isAuthLoading: true, // While checking Firebase on initial load
  
  // —— Connection Status ——
  connectionStatus: 'connecting', // 'connected' | 'connecting' | 'error' | 'demo'
  aircraftCount: 0,
  errorMessage: null,

  // —— Actions ——

  setUser: (user) => set({
    user,
    isAuthLoading: false,
  }),

  setAircraft: (aircraft) => set({
    aircraft,
    aircraftCount: aircraft.length,
    lastFetchTime: Date.now(),
  }),

  setIsDemo: (isDemo) => set({
    isDemo,
    connectionStatus: isDemo ? 'demo' : 'connected',
  }),

  selectAircraft: (aircraft) => set({ selectedAircraft: aircraft, selectedAirport: null }),

  selectAirport: (airport) => set({ selectedAirport: airport, selectedAircraft: null }),

  clearSelection: () => set({ selectedAircraft: null, selectedAirport: null }),

  setViewState: (viewState) => set({ viewState }),
  
  setFlyToTarget: (target) => set({ flyToTarget: target }),

  setBoundingBox: (boundingBox) => set({ boundingBox }),

  setFilters: (filterUpdate) => set((state) => ({
    filters: { ...state.filters, ...filterUpdate },
  })),

  setConnectionStatus: (status, errorMessage = null) => set({
    connectionStatus: status,
    errorMessage,
  }),

  // WHY: When the user clicks an aircraft, we want to update the
  // selected state AND trigger a fly-to animation. This helper
  // finds the aircraft by ICAO24 hex code from the current array.
  selectAircraftByIcao: (icao24) => {
    const { aircraft } = get();
    const found = aircraft.find((a) => a.icao24 === icao24);
    if (found) {
      set({ selectedAircraft: found, selectedAirport: null });
    }
  },

  // Update the selected aircraft's data when new poll data arrives
  // so the sidebar always shows fresh telemetry
  refreshSelectedAircraft: () => {
    const { selectedAircraft, aircraft } = get();
    if (!selectedAircraft) return;
    const updated = aircraft.find((a) => a.icao24 === selectedAircraft.icao24);
    if (updated) {
      set({ selectedAircraft: updated });
    }
  },
}));

export default useFlightStore;
