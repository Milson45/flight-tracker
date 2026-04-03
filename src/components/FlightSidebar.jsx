/* ============================================================
   FlightSidebar — Aircraft Details Panel
   
   WHY: When an aircraft is clicked, this sleek panel slides in
   from the right with identification and telemetry data.
   Typography uses JetBrains Mono for numbers (aviation instrument feel)
   and Inter for labels as specified in the design doc.
   ============================================================ */

import React, { useEffect, useState } from 'react';
import useFlightStore from '../store/flightStore';
import {
  formatAltitude,
  formatSpeed,
  formatHeading,
  formatVerticalRate,
} from '../api/opensky';
import './FlightSidebar.css';

export default function FlightSidebar() {
  const selectedAircraft = useFlightStore((s) => s.selectedAircraft);
  const clearSelection = useFlightStore((s) => s.clearSelection);
  const [photoUrl, setPhotoUrl] = useState(null);
  const [photographer, setPhotographer] = useState(null);

  useEffect(() => {
    if (!selectedAircraft?.icao24) {
      setPhotoUrl(null);
      setPhotographer(null);
      return;
    }

    const fetchPhoto = async () => {
      try {
        const res = await fetch(`https://api.planespotters.net/pub/photos/hex/${selectedAircraft.icao24}`);
        const data = await res.json();
        if (data.photos && data.photos.length > 0) {
          setPhotoUrl(data.photos[0].thumbnail_large.src);
          setPhotographer(data.photos[0].photographer);
        } else {
          setPhotoUrl(null);
          setPhotographer(null);
        }
      } catch (err) {
        console.error("Failed to fetch aircraft photo", err);
        setPhotoUrl(null);
        setPhotographer(null);
      }
    };

    fetchPhoto();
  }, [selectedAircraft?.icao24]);

  if (!selectedAircraft) return null;

  const a = selectedAircraft;

  return (
    <div className="flight-sidebar" id="flight-sidebar">
      {/* HEADER */}
      <div className="sidebar-header">
        <div className="sidebar-header-top">
          <div className="callsign-row">
            <span className="sidebar-callsign">{a.callsign || a.icao24?.toUpperCase()}</span>
            {a.registration && <span className="sidebar-badge">{a.registration}</span>}
            {a.aircraftType && <span className="sidebar-badge badge-blue">{a.aircraftType}</span>}
          </div>
          <button className="sidebar-close" onClick={clearSelection}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="sidebar-airline">{a.originCountry || 'Unknown Airline'}</div>
      </div>

      {/* PHOTO AREA */}
      <div className="sidebar-photo-container">
        {photoUrl ? (
          <>
            <img src={photoUrl} alt="Aircraft" className="sidebar-photo" />
            <div style={{ position: 'absolute', bottom: '8px', left: '8px', color: 'white', fontSize: '11px', background: 'rgba(0,0,0,0.5)', padding: '2px 6px', borderRadius: '4px' }}>
              © {photographer}
            </div>
          </>
        ) : (
          <div className="photo-placeholder">No photo available</div>
        )}
      </div>

      {/* ROUTE INFO (Simulated) */}
      <div className="sidebar-progress-section">
        <div className="route-row">
          <div className="route-airport">
            <span className="route-code">ORG</span>
            <span className="route-city">ORIGIN</span>
          </div>
          <div className="route-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" style={{display: "none"}}></path>
              <path fill="currentColor" stroke="none" d="M12.35 15.65c-.32 1.44-1.39 2.5-2.83 2.82l-5.06-5.06L20 8l-5.41-5.41a6 6 0 00-8.48 0L2 6.7A6 6 0 002.32 15h.6a2 2 0 002-2v-1.3a6 6 0 001.3-.87l-4.7 4.72a6 6 0 000 8.48l1.41 1.41a6 6 0 008.48 0l4.31-4.31a6 6 0 00.32-8.15l-1.42 1.42a4 4 0 011.02 2.39L12.35 15.65z"/>
            </svg>
          </div>
          <div className="route-airport">
            <span className="route-code">DST</span>
            <span className="route-city">DESTINATION</span>
          </div>
        </div>
      </div>

      {/* MORE INFO BAR */}
      <div className="more-info-bar">
        <span>More {a.callsign || 'flight'} information</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>

      {/* DETAILED DATA */}
      <div className="details-section">
        {/* Row 1: Aircraft Details */}
        <div className="details-row">
          <div className="details-icon-col">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" style={{display: "none"}}></path>
              <path stroke="currentColor" d="M12.35 15.65c-.32 1.44-1.39 2.5-2.83 2.82l-5.06-5.06L20 8l-5.41-5.41a6 6 0 00-8.48 0L2 6.7A6 6 0 002.32 15h.6a2 2 0 002-2v-1.3a6 6 0 001.3-.87l-4.7 4.72a6 6 0 000 8.48l1.41 1.41a6 6 0 008.48 0l4.31-4.31" fill="none"/>
            </svg>
          </div>
          <div className="details-content-col">
            <div className="details-label">AIRCRAFT TYPE</div>
            <div className="details-value">{a.aircraftType || 'Unknown'}</div>
            
            <div className="details-grid" style={{ marginTop: '8px' }}>
              <div>
                <div className="details-label">REGISTRATION</div>
                <div className="details-value">{a.registration || a.icao24}</div>
              </div>
              <div>
                <div className="details-label">COUNTRY OF REG</div>
                <div className="details-value">{a.originCountry || 'N/A'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Telemetry */}
        <div className="details-row">
          <div className="details-icon-col">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="details-content-col">
            <div className="details-grid">
              <div>
                <div className="details-label">ALTITUDE</div>
                <div className="details-value">{formatAltitude(a.baroAltitude)}</div>
              </div>
              <div>
                <div className="details-label">VERTICAL SPEED</div>
                <div className="details-value">{formatVerticalRate(a.verticalRate)}</div>
              </div>
              <div style={{ marginTop: '8px' }}>
                <div className="details-label">SPEED</div>
                <div className="details-value">{formatSpeed(a.velocity)}</div>
              </div>
              <div style={{ marginTop: '8px' }}>
                <div className="details-label">HEADING</div>
                <div className="details-value">{formatHeading(a.trueTrack)}</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
