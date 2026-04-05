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
  // —— Domain Mode ——
  // 'aviation' deals with ADS-B flight telemetry
  // 'maritime' deals with AIS oceanic telemetry
  domainMode: 'aviation',

  // —— Aviation State ——
  aircraft: [],
  selectedAircraft: null,
  
  // —— Maritime State ——
  vessels: [],
  selectedVessel: null,
  
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
  
  // A transient target to force the map to pan to specific coordinates
  flyToTarget: null,

  // —— Shared Tracking Elements ——
  boundingBox: null,
  lastFetchTime: null,
  isDemo: false,
  filters: {
    minAltitude: 0,
    showOnGround: false,
  },
  user: null,
  isAuthLoading: true,
  connectionStatus: 'connecting',
  aircraftCount: 0,
  vesselCount: 0,
  errorMessage: null,

  // —— Actions ——
  
  setDomainMode: (mode) => set({
    domainMode: mode,
    selectedAircraft: null,
    selectedVessel: null,
    selectedAirport: null,
    // When swapping modes, flush the opposing buffer so things don't ghost
  }),

  setUser: (user) => set({
    user,
    isAuthLoading: false,
  }),

  setAircraft: (aircraft) => set({
    aircraft,
    aircraftCount: aircraft.length,
    lastFetchTime: Date.now(),
  }),
  
  setVessels: (vessels) => set({
    vessels,
    vesselCount: vessels.length,
    lastFetchTime: Date.now(),
  }),

  setIsDemo: (isDemo) => set({
    isDemo,
    connectionStatus: isDemo ? 'demo' : 'connected',
  }),

  selectAircraft: (aircraft) => set({ selectedAircraft: aircraft, selectedAirport: null, selectedVessel: null }),
  selectVessel: (vessel) => set({ selectedVessel: vessel, selectedAircraft: null, selectedAirport: null }),
  selectAirport: (airport) => set({ selectedAirport: airport, selectedAircraft: null, selectedVessel: null }),

  clearSelection: () => set({ selectedAircraft: null, selectedAirport: null, selectedVessel: null }),

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

  selectAircraftByIcao: (icao24) => {
    const { aircraft } = get();
    const found = aircraft.find((a) => a.icao24 === icao24);
    if (found) {
      set({ selectedAircraft: found, selectedAirport: null, selectedVessel: null });
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
