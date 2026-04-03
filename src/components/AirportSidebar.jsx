import React, { useEffect, useState } from 'react';
import useFlightStore from '../store/flightStore';
import './AirportSidebar.css';

export default function AirportSidebar() {
  const selectedAirport = useFlightStore((s) => s.selectedAirport);
  const clearSelection = useFlightStore((s) => s.clearSelection);

  const [mode, setMode] = useState('arrivals'); // 'arrivals' | 'departures'
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!selectedAirport?.iata) return;

    const fetchSchedule = async () => {
      setLoading(true);
      setError(false);
      setSchedule([]);
      try {
        const iata = selectedAirport.iata.toUpperCase();
        // Request page 1, limit 25 to fetch a manageable list
        const url = `https://api.flightradar24.com/common/v1/airport.json?code=${iata}&plugin[]=schedule&plugin-setting[schedule][mode]=${mode}&page=1&limit=25`;
        // Stealthily proxy via corsproxy to evade browser CORS restrictions
        const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(url)}`;
        
        const res = await fetch(proxyUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        
        if (!res.ok) throw new Error("CORS Proxy or API Blocked.");
        
        const data = await res.json();
        
        // FlightRadar24 Schedule JSON Path Navigation
        const flightsData = data.result?.response?.airport?.pluginData?.schedule?.[mode]?.data;
        if (flightsData && Array.isArray(flightsData)) {
          // FR24 API nests each flight inside { flight: { identification, status, airport, etc... } }
          const compiledFlights = flightsData.map(f => {
            const flight = f.flight;
            const timeData = flight.time?.scheduled;
            const statusData = flight.status?.text;
            const airline = flight.airline?.name || 'Unknown';
            const callsign = flight.identification?.number?.default || flight.identification?.callsign || 'N/A';
            
            // Format timestamps into local HH:MM depending on mode
            const timestamp = mode === 'arrivals' ? timeData?.arrival : timeData?.departure;
            const timeStr = timestamp ? new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--';
            
            const peerAirport = mode === 'arrivals' ? flight.airport?.origin : flight.airport?.destination;
            const peerCode = peerAirport?.code?.iata || 'UNK';
            
            return {
              id: flight.identification?.id || Math.random().toString(),
              airline,
              callsign,
              timeStr,
              peerCode,
              status: statusData || 'Scheduled'
            };
          });
          setSchedule(compiledFlights);
        } else {
          setSchedule([]);
        }
      } catch (err) {
        console.error("Airport API Error:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [selectedAirport?.iata, mode]);

  if (!selectedAirport) return null;

  return (
    <div className="airport-sidebar" id="airport-sidebar">
      {/* HEADER */}
      <div className="sidebar-header">
        <div className="sidebar-header-top">
          <div className="callsign-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
            <span className="sidebar-callsign" style={{ fontSize: '28px' }}>{selectedAirport.iata}</span>
            <span className="sidebar-airline" style={{ fontSize: '13px', margin: 0 }}>{selectedAirport.name}</span>
          </div>
          <button className="sidebar-close" onClick={clearSelection}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M6 18L18 6M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="airport-tabs">
        <button 
          className={`airport-tab ${mode === 'arrivals' ? 'active' : ''}`}
          onClick={() => setMode('arrivals')}
        >
          Arrivals
        </button>
        <button 
          className={`airport-tab ${mode === 'departures' ? 'active' : ''}`}
          onClick={() => setMode('departures')}
        >
          Departures
        </button>
      </div>

      {/* SCHEDULE LIST */}
      <div className="schedule-container">
        {loading && (
          <div className="schedule-state-msg">
            <span className="pulsing-dot"></span> Scraping Timetable...
          </div>
        )}
        
        {!loading && error && (
          <div className="schedule-state-msg">
            Schedule unavailable right now. (API blocked)
          </div>
        )}

        {!loading && !error && schedule.length === 0 && (
          <div className="schedule-state-msg">
            No scheduled {mode} available.
          </div>
        )}

        {!loading && !error && schedule.map(flight => (
          <div className="schedule-row" key={flight.id}>
            <div className="schedule-time">{flight.timeStr}</div>
            
            <div className="schedule-main">
              <div className="flight-id-peer">
                <span className="flight-number">{flight.callsign}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" style={{ margin: '0 6px' }}>
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
                <span className="flight-peer">{flight.peerCode}</span>
              </div>
              <div className="flight-airline">{flight.airline}</div>
            </div>

            <div className={`schedule-status ${flight.status.toLowerCase().includes('delayed') ? 'status-delayed' : flight.status.toLowerCase().includes('landed') ? 'status-good' : ''}`}>
              {flight.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
