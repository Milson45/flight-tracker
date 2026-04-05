import React, { useMemo } from 'react';
import { Source, Layer, Marker } from 'react-map-gl';
import useFlightStore from '../store/flightStore';

// Custom SVG path for a nautical vessel (triangle with a flat back)
const VESSEL_PATH = "M12 2L20 20L12 17L4 20L12 2Z";

export default function VesselLayer() {
  const vessels = useFlightStore((s) => s.vessels);
  const selectedVessel = useFlightStore((s) => s.selectedVessel);
  const selectVessel = useFlightStore((s) => s.selectVessel);
  const zoom = useFlightStore((s) => s.viewState.zoom);

  // If zoomed too far out, hide them to prevent massive clutter natively
  if (zoom < 4) return null;

  return (
    <>
      {vessels.map((v) => {
        const isSelected = selectedVessel?.id === v.id;
        
        let color = '#38bdf8'; // Blue for passenger / generic
        if (v.type.includes('Tanker')) color = '#f97316'; // Orange for tankers
        if (v.type.includes('Cargo')) color = '#a855f7';  // Purple for cargo
        if (v.type.includes('Fishing')) color = '#84cc16'; // Green for fishing
        
        if (isSelected) color = '#ef4444'; // Red when active

        const scale = isSelected ? 1.5 : (zoom > 8 ? 1.2 : 0.8);

        return (
          <Marker
            key={v.id}
            longitude={v.longitude}
            latitude={v.latitude}
            anchor="center"
            style={{ 
              pointerEvents: 'auto',
              cursor: 'pointer',
              zIndex: isSelected ? 100 : 10,
              transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)' 
            }}
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              selectVessel(v);
            }}
          >
            <div style={{
              transform: `rotate(${v.heading}deg) scale(${scale})`,
              transformOrigin: 'center center',
              transition: 'transform 0.3s ease',
            }}>
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill={color} 
                stroke="#ffffff" 
                strokeWidth={isSelected ? "1.5" : "0.5"}
              >
                <path d={VESSEL_PATH} />
              </svg>
            </div>
          </Marker>
        );
      })}
    </>
  );
}
