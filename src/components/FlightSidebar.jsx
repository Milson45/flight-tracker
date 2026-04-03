/* ============================================================
   FlightSidebar — Aircraft Details Panel
   
   WHY: When an aircraft is clicked, this sleek panel slides in
   from the right with identification and telemetry data.
   Typography uses JetBrains Mono for numbers (aviation instrument feel)
   and Inter for labels as specified in the design doc.
   ============================================================ */

import React from 'react';
import useFlightStore from '../store/flightStore';
import {
  formatAltitude,
  formatSpeed,
  formatHeading,
  formatVerticalRate,
  metersToFeet,
} from '../api/opensky';
import { getAltitudeColor } from '../utils/interpolation';
import './FlightSidebar.css';

export default function FlightSidebar() {
  const selectedAircraft = useFlightStore((s) => s.selectedAircraft);
  const clearSelection = useFlightStore((s) => s.clearSelection);

  if (!selectedAircraft) return null;

  const a = selectedAircraft;
  const altColor = getAltitudeColor(a.baroAltitude);

  return (
    <div className="flight-sidebar glass-panel-heavy" id="flight-sidebar">
      {/* Header with close button */}
      <div className="sidebar-header">
        <div className="sidebar-title-group">
          <div className="sidebar-callsign mono">
            {a.callsign || 'N/A'}
          </div>
          <div className="sidebar-icao mono">{a.icao24?.toUpperCase()}</div>
        </div>
        <button
          className="sidebar-close"
          onClick={clearSelection}
          aria-label="Close flight details"
          id="close-sidebar-btn"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M4 4L14 14M4 14L14 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Status indicator */}
      <div className="sidebar-status">
        <span
          className="status-dot"
          style={{ backgroundColor: a.onGround ? 'var(--accent-amber)' : 'var(--accent-green)' }}
        />
        <span className="status-text">
          {a.onGround ? 'On Ground' : 'In Flight'}
        </span>
      </div>

      {/* Identification Section */}
      <div className="sidebar-section">
        <div className="section-label">IDENTIFICATION</div>
        <div className="data-grid">
          <div className="data-item">
            <span className="data-label">Callsign</span>
            <span className="data-value mono">{a.callsign || '—'}</span>
          </div>
          <div className="data-item">
            <span className="data-label">ICAO 24</span>
            <span className="data-value mono">{a.icao24?.toUpperCase() || '—'}</span>
          </div>
          <div className="data-item full-width">
            <span className="data-label">Origin Country</span>
            <span className="data-value">{a.originCountry || '—'}</span>
          </div>
          {a.squawk && (
            <div className="data-item">
              <span className="data-label">Squawk</span>
              <span className="data-value mono">{a.squawk}</span>
            </div>
          )}
        </div>
      </div>

      {/* Telemetry Section */}
      <div className="sidebar-section">
        <div className="section-label">TELEMETRY</div>
        <div className="data-grid">
          <div className="data-item">
            <span className="data-label">Altitude</span>
            <span className="data-value mono" style={{ color: altColor }}>
              {formatAltitude(a.baroAltitude)}
            </span>
          </div>
          <div className="data-item">
            <span className="data-label">Geo Alt</span>
            <span className="data-value mono">
              {formatAltitude(a.geoAltitude)}
            </span>
          </div>
          <div className="data-item">
            <span className="data-label">Speed</span>
            <span className="data-value mono">{formatSpeed(a.velocity)}</span>
          </div>
          <div className="data-item">
            <span className="data-label">Heading</span>
            <span className="data-value mono">{formatHeading(a.trueTrack)}</span>
          </div>
          <div className="data-item full-width">
            <span className="data-label">Vertical Rate</span>
            <span className="data-value mono">{formatVerticalRate(a.verticalRate)}</span>
          </div>
        </div>
      </div>

      {/* Position Section */}
      <div className="sidebar-section">
        <div className="section-label">POSITION</div>
        <div className="data-grid">
          <div className="data-item">
            <span className="data-label">Latitude</span>
            <span className="data-value mono">
              {a.latitude?.toFixed(4) || '—'}°
            </span>
          </div>
          <div className="data-item">
            <span className="data-label">Longitude</span>
            <span className="data-value mono">
              {a.longitude?.toFixed(4) || '—'}°
            </span>
          </div>
        </div>
      </div>

      {/* Altitude bar visualization */}
      <div className="sidebar-section">
        <div className="section-label">ALTITUDE PROFILE</div>
        <div className="altitude-bar-container">
          <div className="altitude-bar-bg">
            <div
              className="altitude-bar-fill"
              style={{
                width: `${Math.min((metersToFeet(a.baroAltitude) || 0) / 450, 100)}%`,
                backgroundColor: altColor,
              }}
            />
          </div>
          <div className="altitude-bar-labels">
            <span>GND</span>
            <span>FL450</span>
          </div>
        </div>
      </div>
    </div>
  );
}
