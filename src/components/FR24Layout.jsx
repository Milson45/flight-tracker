import React, { useState, useEffect } from 'react';
import useFlightStore from '../store/flightStore';
import LoginModal from './LoginModal';
import { auth, signOut } from '../services/firebase';
import './FR24Layout.css';

export default function FR24Layout() {
  // Authentication UI State
  const [showLogin, setShowLogin] = useState(false);
  const user = useFlightStore(s => s.user);

  // State to track which accordion panel is open
  const [expandedPanel, setExpandedPanel] = useState('tracked');
  const [activeTab, setActiveTab] = useState('Aircraft');
  
  // Real-time UTC clock
  const [utcTime, setUtcTime] = useState('');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hh = String(now.getUTCHours()).padStart(2, '0');
      const mm = String(now.getUTCMinutes()).padStart(2, '0');
      setUtcTime(`${hh}:${mm} UTC`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000); // update every minute
    return () => clearInterval(interval);
  }, []);

  // Search logic
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const aircraftList = useFlightStore(s => s.aircraft);
  const selectAircraftByIcao = useFlightStore(s => s.selectAircraftByIcao);
  const setFlyToTarget = useFlightStore(s => s.setFlyToTarget);
  const selectAirport = useFlightStore(s => s.selectAirport);
  const setUser = useFlightStore(s => s.setUser);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      let results = [];
      const queryUpper = searchQuery.toUpperCase();

      // 1. Local Flights (Instant)
      const localMatches = aircraftList.filter(a => 
        (a.callsign && a.callsign.toUpperCase().includes(queryUpper)) ||
        (a.registration && a.registration.toUpperCase().includes(queryUpper)) ||
        (a.icao24 && a.icao24.toUpperCase().includes(queryUpper))
      ).slice(0, 3).map(a => ({
        id: a.icao24,
        title: a.callsign || a.registration || a.icao24,
        subtitle: `Local Flight • ${a.aircraftType || 'Unknown Aircraft'}`,
        action: () => {
          selectAircraftByIcao(a.icao24);
          setSearchQuery('');
        }
      }));
      results = [...results, ...localMatches];

      // 2. Global Airports via Nominatim OpenStreetMap API
      try {
        const airportRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery + ' airport')}&format=json&limit=3`, {
          headers: { 'User-Agent': 'SkyMap-FlightTracker/1.0' }
        });
        if (airportRes.ok) {
          const airportData = await airportRes.json();
          const airportMatches = airportData.map(apt => {
            // Attempt to extract a 3-letter IATA code if it's in the name (e.g. "JFK, John F Kennedy...", "London Heathrow (LHR)")
            const iataMatch = apt.display_name.match(/\b([A-Z]{3})\b/);
            const iata = iataMatch ? iataMatch[1] : (apt.name.substring(0,3).toUpperCase());
            const cityName = apt.display_name.split(',').slice(-1)[0].trim();
            const fullName = apt.name || apt.display_name.split(',')[0];

            return {
              id: apt.place_id,
              title: fullName,
              subtitle: `Airport • ${cityName}`,
              action: () => {
                setFlyToTarget({ longitude: parseFloat(apt.lon), latitude: parseFloat(apt.lat), zoom: 13 });
                // We dispatch the new selected airport object!
                selectAirport({ iata, city: cityName, name: fullName });
                setSearchQuery('');
              }
            };
          });
          results = [...results, ...airportMatches];
        }
      } catch(e) {
        console.warn("Airport search failed", e);
      }

      setSearchResults(results);
    }, 500); // 500ms debounce to prevent spamming the geocoding API

    return () => clearTimeout(timer);
  }, [searchQuery, aircraftList, selectAircraftByIcao, setFlyToTarget, selectAirport]);

  const handleSelectResult = (result) => {
    result.action();
  };

  const filters = useFlightStore(s => s.filters);
  const setFilters = useFlightStore(s => s.setFilters);

  const togglePanel = (panelName) => {
    setExpandedPanel(expandedPanel === panelName ? null : panelName);
  };

  return (
    <div className="fr24-layout">
      {/* LEFT PANELS */}
      <div className="fr24-left-panels">
        {/* Most tracked flights */}
        <div className="fr24-panel">
          <div className="fr24-panel-header" onClick={() => togglePanel('tracked')}>
            <div className="panel-title-wrap">
              Most tracked flights
              <span className="live-badge">LIVE</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" style={{ transform: expandedPanel === 'tracked' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </div>
          {expandedPanel === 'tracked' && (
            <div className="bookmarks-content" style={{ padding: '16px', fontSize: '12px', color: '#ccc' }}>
              Top 10 flights are currently loading from the GM radar network...
            </div>
          )}
        </div>
        
        {/* Airport disruptions */}
        <div className="fr24-panel">
          <div className="fr24-panel-header" onClick={() => togglePanel('disruptions')}>
            <div className="panel-title-wrap">
              Airport disruptions
              <span className="live-badge">LIVE</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" style={{ transform: expandedPanel === 'disruptions' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </div>
          {expandedPanel === 'disruptions' && (
            <div className="bookmarks-content" style={{ padding: '16px', fontSize: '12px', color: '#ccc' }}>
              No major regional disruptions recorded at this time.
            </div>
          )}
        </div>

        {/* Bookmarks */}
        <div className="fr24-panel">
          <div className="fr24-panel-header" onClick={() => togglePanel('bookmarks')}>
            <div className="panel-title-wrap">
              Bookmarks
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" style={{ transform: expandedPanel === 'bookmarks' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </div>
          {expandedPanel === 'bookmarks' && (
            <div className="bookmarks-content">
              <div className="bookmarks-tabs">
                {['Aircraft', 'Flights', 'Airports', 'Locations'].map(tab => (
                  <div 
                    key={tab} 
                    className={`bookmarks-tab ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </div>
                ))}
              </div>
              <div className="bookmarks-body" style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>You have no {activeTab.toLowerCase()} bookmarked yet.</div>
                
                {activeTab === 'Airports' && (
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', background: '#333', padding: '12px', borderRadius: '4px', border: '1px solid #444' }}>
                    <input 
                      type="checkbox" 
                      checked={filters.showOnGround}
                      onChange={(e) => setFilters({ showOnGround: e.target.checked })} 
                      style={{ cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '13px', color: '#f8fafc', fontWeight: '500' }}>Show ground vehicles</span>
                  </label>
                )}

                <button className="add-bookmark-btn" style={{ background: '#2563eb', color: 'white', marginTop: '8px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                  Add {activeTab.slice(0, activeTab === 'Aircraft' ? activeTab.length : -1)}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TOP HEADER */}
      <div className="fr24-header">
        <div style={{ flex: 1 }}></div> {/* Spacer */}
        <div className="fr24-logo-container">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#facc15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          <div className="fr24-logo-text">
            <span>GM radar</span>
            <span className="fr24-logo-sub">Live Air Traffic</span>
          </div>
        </div>
        
        <div className="fr24-header-right">
          <div className="fr24-time">{utcTime}</div>
          <div className="fr24-search" style={{ position: 'relative' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input 
              type="text" 
              placeholder="Find flights, airports and more" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchResults.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', background: 'white', color: '#333', borderRadius: '4px', marginTop: '4px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', overflow: 'hidden' }}>
                {searchResults.map(res => (
                  <div 
                    key={res.id}
                    onClick={() => handleSelectResult(res)}
                    style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #eee', display: 'flex', flexDirection: 'column' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                  >
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>{res.title}</span>
                    <span style={{ color: '#64748b', fontSize: '11px' }}>{res.subtitle}</span>
                  </div>
                ))}
              </div>
            )}
            {searchQuery.length > 1 && searchResults.length === 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, width: '100%', background: 'white', color: '#666', borderRadius: '4px', marginTop: '4px', padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                No active flights found.
              </div>
            )}
          </div>
          {user ? (
            <div className="fr24-login" onClick={() => {
              if (window.confirm("Do you want to log out?")) {
                signOut(auth).then(() => useFlightStore.getState().setUser(null));
              }
            }} style={{ padding: '4px 8px', gap: '8px' }}>
              {user.photoURL ? (
                <img src={user.photoURL} alt="Avatar" style={{ width: 24, height: 24, borderRadius: '50%' }} />
              ) : (
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#3b82f6', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                  {user.displayName ? user.displayName.charAt(0) : 'U'}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'white' }}>{user.displayName?.split(' ')[0] || 'User'}</span>
                <span style={{ fontSize: '9px', color: '#94a3b8' }}>Sign out</span>
              </div>
            </div>
          ) : (
            <div className="fr24-login" onClick={() => setShowLogin(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              LOG IN
            </div>
          )}
        </div>
      </div>
      
      <div className="fr24-view-toggle">
        VIEW <span style={{ color: '#eab308' }}>Map</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
      </div>

      {/* BOTTOM PILL MENU */}
      <div className="fr24-bottom-container">
        <button className="add-coverage-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
          Add coverage
        </button>

        <div className="fr24-bottom-pill">
          <button className="pill-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            <span>Settings</span>
          </button>
          
          <button className="pill-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/></svg>
            <span>Weather</span>
          </button>
          
          <button className="pill-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            <span>Filters</span>
          </button>
          
          <button className="pill-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            <span>Widgets</span>
          </button>
          
          <button className="pill-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>Playback</span>
          </button>
        </div>
      </div>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  );
}
