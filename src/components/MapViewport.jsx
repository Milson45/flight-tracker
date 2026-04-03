/* ============================================================
   MapViewport Component
   
   WHY: This is the central map component as defined in the spec.
   It handles zoom, pan, and bounding box calculations. On every
   viewport change, it computes the visible bounding box and
   updates the store so the API layer knows what area to query.
   
   We use react-map-gl's <Map> component with a controlled
   viewport pattern (viewState in Zustand store) for precise
   control over fly-to animations and programmatic movements.
   ============================================================ */

import React, { useCallback, useRef, useEffect } from 'react';
import Map from 'react-map-gl';
import useFlightStore from '../store/flightStore';
import AircraftLayer from './AircraftLayer';
import './MapViewport.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Dark map style matching the provided reference screenshot.
// WHY dark-v11: Provides a dark grey topographic feel with dark water,
// perfectly contrasting the bright yellow "swarm" markers.
const MAP_STYLE = 'mapbox://styles/mapbox/dark-v11';

export default function MapViewport() {
  const mapRef = useRef(null);
  const viewState = useFlightStore((s) => s.viewState);
  const setViewState = useFlightStore((s) => s.setViewState);
  const setBoundingBox = useFlightStore((s) => s.setBoundingBox);
  const selectedAircraft = useFlightStore((s) => s.selectedAircraft);

  /**
   * Calculate the visible bounding box from the map's current viewport.
   * WHY: This is the CRUCIAL optimization mentioned in the spec —
   * instead of fetching all global aircraft, we only request what's visible.
   */
  const updateBoundingBox = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const bounds = map.getBounds();
    setBoundingBox({
      south: bounds.getSouth(),
      west: bounds.getWest(),
      north: bounds.getNorth(),
      east: bounds.getEast(),
    });
  }, [setBoundingBox]);

  /**
   * Handle viewport changes — sync to store and recalculate bounds.
   * WHY debounce-free: We want immediate UI response for smooth panning.
   * The bounding box update triggers an API call, but the useInterval
   * hook in useAircraftData handles the actual timing (10s intervals).
   */
  const onMove = useCallback(
    (evt) => {
      setViewState(evt.viewState);
    },
    [setViewState]
  );

  // Update bounding box after each move ends (not during drag for perf)
  const onMoveEnd = useCallback(() => {
    updateBoundingBox();
  }, [updateBoundingBox]);

  // Fly-to animation when an aircraft is selected
  // WHY eased animation: The spec requires "slow, eased fly-to"
  // to center the plane when selected.
  useEffect(() => {
    if (selectedAircraft && mapRef.current) {
      const map = mapRef.current.getMap();
      map.flyTo({
        center: [selectedAircraft.longitude, selectedAircraft.latitude],
        zoom: Math.max(viewState.zoom, 7),
        duration: 1500,
        essential: true,
      });
    }
  }, [selectedAircraft]); // eslint-disable-line react-hooks/exhaustive-deps

  // Set initial bounding box once the map loads
  const onLoad = useCallback(() => {
    updateBoundingBox();
  }, [updateBoundingBox]);

  return (
    <div className="map-viewport" id="map-viewport">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={onMove}
        onMoveEnd={onMoveEnd}
        onLoad={onLoad}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={MAP_STYLE}
        minZoom={2}
        maxZoom={18}
        attributionControl={true}
        reuseMaps
        // WHY projection mercator: Standard for aviation tracking apps.
        // Globe projection looks fancy but distorts bounding box math.
        projection={{ name: 'mercator' }}
        style={{ width: '100%', height: '100%' }}
      >
        <AircraftLayer mapRef={mapRef} />
      </Map>
    </div>
  );
}
