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
import lightSvg from '../assets/aircraft-light.svg';
import largeSvg from '../assets/aircraft-large.svg';
import heavySvg from '../assets/aircraft-heavy.svg';
import heliSvg from '../assets/aircraft-heli.svg';

export default function AircraftLayer({ mapRef }) {
  const aircraft = useFlightStore((s) => s.aircraft);
  const lastFetchTime = useFlightStore((s) => s.lastFetchTime);
  const selectAircraftByIcao = useFlightStore((s) => s.selectAircraftByIcao);
  const selectedAircraft = useFlightStore((s) => s.selectedAircraft);

  const [geoJsonData, setGeoJsonData] = useState(null);
  const animationRef = useRef(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Load custom airplane SVGs as Mapbox images
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const loadImages = async () => {
      const icons = [
        { name: 'aircraft-light', url: lightSvg },
        { name: 'aircraft-large', url: largeSvg },
        { name: 'aircraft-heavy', url: heavySvg },
        { name: 'aircraft-heli', url: heliSvg },
      ];

      const promises = icons.map((icon) => {
        return new Promise((resolve) => {
          if (map.hasImage(icon.name)) {
            resolve();
            return;
          }
          const img = new Image(64, 64);
          img.onload = () => {
            if (!map.hasImage(icon.name)) {
              map.addImage(icon.name, img);
            }
            resolve();
          };
          img.src = icon.url;
        });
      });

      await Promise.all(promises);
      setImagesLoaded(true);
    };

    if (map.loaded()) {
      loadImages();
    } else {
      map.on('load', loadImages);
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

  // Handle cluster click — zoom into the cluster
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const handleClusterClick = (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: ['aircraft-clusters'],
      });
      if (!features.length) return;

      const clusterId = features[0].properties.cluster_id;
      const source = map.getSource('aircraft-source');
      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;
        map.easeTo({
          center: features[0].geometry.coordinates,
          zoom: Math.min(zoom, 14),
          duration: 500,
        });
      });
    };

    const handleClusterEnter = () => {
      map.getCanvas().style.cursor = 'pointer';
    };
    const handleClusterLeave = () => {
      map.getCanvas().style.cursor = '';
    };

    map.on('click', 'aircraft-clusters', handleClusterClick);
    map.on('mouseenter', 'aircraft-clusters', handleClusterEnter);
    map.on('mouseleave', 'aircraft-clusters', handleClusterLeave);

    return () => {
      map.off('click', 'aircraft-clusters', handleClusterClick);
      map.off('mouseenter', 'aircraft-clusters', handleClusterEnter);
      map.off('mouseleave', 'aircraft-clusters', handleClusterLeave);
    };
  }, [mapRef]);

  if (!imagesLoaded || !geoJsonData) return null;

  return (
    <>
      {/* Main aircraft data source.
          We rely on Mapbox GL's native collision detection
          (icon-allow-overlap: false) to naturally show a 
          sparsely sampled set of aircraft when zoomed out, 
          revealing more as the user zooms in. */}
      <Source
        id="aircraft-source"
        type="geojson"
        data={geoJsonData}
      >
        <Layer
          id="aircraft-symbols"
          type="symbol"
          layout={{
            'icon-image': ['get', 'iconType'],
            'icon-size': [
              'interpolate', ['linear'], ['zoom'],
              3, 0.25,
              6, 0.35,
              10, 0.5,
              14, 0.8,
            ],
            'icon-rotate': ['get', 'trueTrack'],
            'icon-rotation-alignment': 'map',
            // WHY true: FlightRadar24 creates massive "swarms" of overlapping
            // yellow planes in dense areas. Allowing overlap stops Mapbox from
            // dynamically hiding markers to keep things clean.
            'icon-allow-overlap': true,
            'icon-ignore-placement': true,
            'text-field': ['step', ['zoom'], '', 8, ['get', 'callsign']],
            'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'],
            'text-size': 10,
            'text-offset': [0, 1.8],
            'text-anchor': 'top',
            'text-optional': true,
          }}
          paint={{
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
