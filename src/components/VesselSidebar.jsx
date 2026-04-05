import React, { useEffect, useState } from 'react';
import useFlightStore from '../store/flightStore';
// Reusing exact same CSS logic from FlightSidebar so it perfectly slides on mobile
import '../components/FlightSidebar.css'; 

export default function VesselSidebar() {
  const selectedVessel = useFlightStore((s) => s.selectedVessel);
  const clearSelection = useFlightStore((s) => s.clearSelection);

  if (!selectedVessel) return null;

  const v = selectedVessel;

  return (
    <div className="flight-sidebar" id="vessel-sidebar">
      {/* HEADER */}
      <div className="sidebar-header">
        <div className="sidebar-header-top">
          <div className="callsign-row">
            <span className="sidebar-callsign" style={{ color: '#0ea5e9' }}>{v.name}</span>
            <span className="sidebar-badge badge-blue" style={{ background: '#0284c7' }}>{v.type}</span>
          </div>
          <button className="sidebar-close" onClick={clearSelection}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="sidebar-airline">Registered Flag: {v.flag || 'Unknown'}</div>
      </div>

      {/* PHOTO AREA (Simulated/Placeholder for Maritime) */}
      <div className="sidebar-photo-container" style={{ background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="1">
          <path d="M22 12A10 10 0 0 0 12 2a10 10 0 0 0-10 10"/>
          <path d="M12 22a10 10 0 0 0 10-10"/>
          <path d="M2 12h20"/>
          <path d="M12 2v20"/>
        </svg>
        <div className="photo-placeholder" style={{ position: 'absolute' }}>Marine Photo Unavailable</div>
      </div>

      {/* ROUTE INFO */}
      <div className="sidebar-progress-section">
        <div className="route-row">
          <div className="route-airport">
            <span className="route-code" style={{ fontSize: '18px' }}>Tracking</span>
            <span className="route-city">AIS Network</span>
          </div>
          <div className="route-icon" style={{ color: '#0ea5e9' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 12h20"/>
              <path d="M12 2v20"/>
              <circle cx="12" cy="12" r="10"/>
            </svg>
          </div>
          <div className="route-airport">
            <span className="route-code" style={{ fontSize: '18px' }}>{v.destination}</span>
            <span className="route-city">Destination</span>
          </div>
        </div>
      </div>

      {/* MORE INFO BAR */}
      <div className="more-info-bar" style={{ color: '#0ea5e9' }}>
        <span>More vessel information</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>

      {/* DETAILED DATA */}
      <div className="details-section">
        
        {/* Row 1: Vessel Details */}
        <div className="details-row">
          <div className="details-icon-col">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
          </div>
          <div className="details-content-col">
            <div className="details-label">VESSEL CLASS</div>
            <div className="details-value">{v.type || 'Unknown'}</div>
            
            <div className="details-grid" style={{ marginTop: '8px' }}>
              <div>
                <div className="details-label">MMSI</div>
                <div className="details-value">{v.mmsi}</div>
              </div>
              <div>
                <div className="details-label">GROSS TONNAGE</div>
                <div className="details-value">{v.grossTonnage?.toLocaleString() || 'N/A'} t</div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Telemetry */}
        <div className="details-row">
          <div className="details-icon-col">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          </div>
          <div className="details-content-col">
            <div className="details-grid">
              <div>
                <div className="details-label">SPEED OVER GROUND</div>
                <div className="details-value">{v.speed?.toFixed(1)} knots</div>
              </div>
              <div>
                <div className="details-label">HEADING</div>
                <div className="details-value">{v.heading?.toFixed(0)}°</div>
              </div>
              <div style={{ marginTop: '8px' }}>
                <div className="details-label">LENGTH OVERALL</div>
                <div className="details-value">{v.length} m</div>
              </div>
              <div style={{ marginTop: '8px' }}>
                <div className="details-label">DRAFT</div>
                <div className="details-value">{v.draft} m</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
