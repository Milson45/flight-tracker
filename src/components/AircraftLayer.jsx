/* ============================================================
   AircraftLayer Component — WebGL-Rendered Aircraft Markers
   
   WHY WebGL layers: The spec explicitly prohibits standard DOM
   elements for aircraft markers. Mapbox GL's symbol layers render
   entirely on the GPU via WebGL, so we can display thousands of
   aircraft without creating any DOM nodes. This is essential for
   performance.
   
   HOW IT WORKS:
   1. Convert aircraft array to GeoJSON with interpolated positions
   2. Load custom airplane SVG as a Mapbox image
   3. Render as a symbol layer with:
      - icon-rotate bound to true_track (heading)
      - icon-color interpolated by altitude
   4. Use requestAnimationFrame for smooth interpolation between polls
   ============================================================ */

import { useEffect, useRef, useCallback, useState } from 'react';
import { Source, Layer } from 'react-map-gl';
import useFlightStore from '../store/flightStore';
import { interpolateAllToGeoJSON } from '../utils/interpolation';
import aircraftSvgUrl from '../assets/aircraft.svg';

export default function AircraftLayer({ mapRef }) {
  const aircraft = useFlightStore((s) => s.aircraft);
  const lastFetchTime = useFlightStore((s) => s.lastFetchTime);
  const selectAircraftByIcao = useFlightStore((s) => s.selectAircraftByIcao);
  const selectedAircraft = useFlightStore((s) => s.selectedAircraft);

  const [geoJsonData, setGeoJsonData] = useState(null);
  const animationRef = useRef(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Load the custom airplane SVG as a Mapbox image
  // WHY: Mapbox symbol layers reference images by name. We need to
  // register our SVG as 'aircraft-icon' before the layer can use it.
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const loadImage = () => {
      if (map.hasImage('aircraft-icon')) {
        setImageLoaded(true);
        return;
      }

      const img = new Image(64, 64);
      img.onload = () => {
        if (!map.hasImage('aircraft-icon')) {
          map.addImage('aircraft-icon', img, { sdf: true });
          // WHY sdf: true: Signed Distance Field rendering lets us
          // recolor the icon dynamically via icon-color property.
          // Without SDF, the icon color is baked into the image.
        }
        setImageLoaded(true);
      };
      img.src = aircraftSvgUrl;
    };

    if (map.loaded()) {
      loadImage();
    } else {
      map.on('load', loadImage);
    }
  }, [mapRef]);

  // Interpolation animation loop
  // WHY requestAnimationFrame: Runs at display refresh rate (~60fps)
  // to smoothly interpolate aircraft positions between 10s polls.
  useEffect(() => {
    if (!aircraft.length || !lastFetchTime) {
      setGeoJsonData({
        type: 'FeatureCollection',
        features: [],
      });
      return;
    }

    const animate = () => {
      const elapsed = Date.now() - lastFetchTime;
      // Cap interpolation at 15 seconds to avoid overshooting
      // if the next poll is delayed
      const clampedElapsed = Math.min(elapsed, 15000);
      const geojson = interpolateAllToGeoJSON(aircraft, clampedElapsed);
      setGeoJsonData(geojson);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [aircraft, lastFetchTime]);

  // Handle aircraft click — find which feature was clicked
  // and select it in the store
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const handleClick = (e) => {
      // Query rendered features at the click point on our layer
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['aircraft-symbols'],
      });

      if (features.length > 0) {
        const icao24 = features[0].properties.icao24;
        selectAircraftByIcao(icao24);
      }
    };

    // Change cursor to pointer when hovering over aircraft
    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = 'pointer';
    };
    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = '';
    };

    map.on('click', 'aircraft-symbols', handleClick);
    map.on('mouseenter', 'aircraft-symbols', handleMouseEnter);
    map.on('mouseleave', 'aircraft-symbols', handleMouseLeave);

    return () => {
      map.off('click', 'aircraft-symbols', handleClick);
      map.off('mouseenter', 'aircraft-symbols', handleMouseEnter);
      map.off('mouseleave', 'aircraft-symbols', handleMouseLeave);
    };
  }, [mapRef, selectAircraftByIcao]);

  if (!imageLoaded || !geoJsonData) return null;

  return (
    <>
      {/* Main aircraft data source — GeoJSON FeatureCollection */}
      <Source id="aircraft-source" type="geojson" data={geoJsonData}>
        {/* 
          Symbol layer for aircraft icons.
          WHY symbol layer: GPU-rendered, supports rotation, color interpolation,
          and collision detection. Far more performant than HTML markers.
        */}
        <Layer
          id="aircraft-symbols"
          type="symbol"
          layout={{
            'icon-image': 'aircraft-icon',
            'icon-size': [
              'interpolate', ['linear'], ['zoom'],
              3, 0.3,    // Very small at world view
              6, 0.45,   // Medium at regional view
              10, 0.65,  // Larger when zoomed in
              14, 0.85,
            ],
            // WHY icon-rotate: Rotates each airplane to point in its
            // direction of travel. The SVG points north (0°), and
            // true_track is degrees clockwise from north.
            'icon-rotate': ['get', 'trueTrack'],
            'icon-rotation-alignment': 'map',
            'icon-allow-overlap': true,
            'icon-ignore-placement': true,
            // Show callsign label at higher zoom levels
            'text-field': ['step', ['zoom'], '', 8, ['get', 'callsign']],
            'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
            'text-size': 10,
            'text-offset': [0, 1.8],
            'text-anchor': 'top',
            'text-optional': true,
          }}
          paint={{
            // WHY altitude-based color: The spec requires visual hierarchy
            // using color gradients — yellow for low, transitioning to blue for high.
            'icon-color': [
              'interpolate',
              ['linear'],
              ['coalesce', ['get', 'altitude'], 0],
              0, '#ef4444',       // Red — ground
              500, '#fbbf24',     // Amber — very low
              3000, '#f59e0b',    // Orange — low
              6000, '#06b6d4',    // Cyan — medium
              9000, '#0ea5e9',    // Sky blue — high
              12000, '#6366f1',   // Indigo — cruise
            ],
            'icon-opacity': 0.9,
            'text-color': '#94a3b8',
            'text-halo-color': 'rgba(15, 23, 42, 0.8)',
            'text-halo-width': 1,
          }}
        />
      </Source>

      {/* Selected aircraft highlight ring */}
      {selectedAircraft && (
        <Source
          id="selected-aircraft-source"
          type="geojson"
          data={{
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [
                    selectedAircraft.longitude,
                    selectedAircraft.latitude,
                  ],
                },
                properties: {},
              },
            ],
          }}
        >
          {/* Pulsing ring around the selected aircraft */}
          <Layer
            id="selected-aircraft-pulse"
            type="circle"
            paint={{
              'circle-radius': [
                'interpolate', ['linear'], ['zoom'],
                4, 12,
                8, 18,
                12, 25,
              ],
              'circle-color': 'transparent',
              'circle-stroke-color': '#06b6d4',
              'circle-stroke-width': 2,
              'circle-stroke-opacity': 0.6,
            }}
          />
        </Source>
      )}
    </>
  );
}
