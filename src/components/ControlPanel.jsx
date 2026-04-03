/* ============================================================
   ControlPanel — Floating controls for map layers and filters
   
   WHY floating: The spec says "Avoid rigid headers and sidebars
   attached to the edges of the screen" — all UI elements should be
   floating cards layered over the full-screen map.
   ============================================================ */

import React, { useState } from 'react';
import useFlightStore from '../store/flightStore';
import { metersToFeet } from '../api/opensky';
import './ControlPanel.css';

export default function ControlPanel() {
  const [isExpanded, setIsExpanded] = useState(false);
  const filters = useFlightStore((s) => s.filters);
  const setFilters = useFlightStore((s) => s.setFilters);
  const aircraftCount = useFlightStore((s) => s.aircraftCount);

  const handleAltitudeChange = (e) => {
    // Slider value is in feet, convert to meters for the filter
    const feet = parseInt(e.target.value, 10);
    setFilters({ minAltitude: feet / 3.28084 });
  };

  const handleGroundToggle = () => {
    setFilters({ showOnGround: !filters.showOnGround });
  };

  return (
    <div className="control-panel glass-panel" id="control-panel">
      {/* Toggle button */}
      <button
        className="control-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        id="control-toggle-btn"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
        <span>Controls</span>
        <span className="aircraft-badge mono">{aircraftCount}</span>
      </button>

      {/* Expandable content */}
      {isExpanded && (
        <div className="control-content">
          {/* Altitude Filter */}
          <div className="control-group">
            <div className="control-label">
              Min Altitude
              <span className="control-value mono">
                {metersToFeet(filters.minAltitude)?.toLocaleString() || 0} ft
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="45000"
              step="1000"
              value={metersToFeet(filters.minAltitude) || 0}
              onChange={handleAltitudeChange}
              className="altitude-slider"
              id="altitude-slider"
            />
            <div className="slider-labels">
              <span>GND</span>
              <span>FL450</span>
            </div>
          </div>

          {/* Ground Traffic Toggle */}
          <div className="control-group">
            <label className="toggle-row" htmlFor="ground-toggle">
              <span className="control-label-inline">Show Ground Traffic</span>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  id="ground-toggle"
                  checked={filters.showOnGround}
                  onChange={handleGroundToggle}
                />
                <span className="toggle-slider" />
              </div>
            </label>
          </div>

          {/* Layer Toggles — Placeholder for V1 */}
          <div className="control-group">
            <div className="control-label">Layers</div>
            <label className="toggle-row disabled" htmlFor="weather-toggle">
              <span className="control-label-inline">Weather Overlay</span>
              <div className="toggle-switch">
                <input type="checkbox" id="weather-toggle" disabled />
                <span className="toggle-slider" />
              </div>
            </label>
            <label className="toggle-row disabled" htmlFor="terminator-toggle">
              <span className="control-label-inline">Day/Night Terminator</span>
              <div className="toggle-switch">
                <input type="checkbox" id="terminator-toggle" disabled />
                <span className="toggle-slider" />
              </div>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
