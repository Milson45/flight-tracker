import React, { useState } from 'react';
import useFlightStore from '../store/flightStore';
import './FR24Layout.css';

export default function FR24Layout() {
  // State to track which accordion panel is open
  const [expandedPanel, setExpandedPanel] = useState('tracked');
  const [activeTab, setActiveTab] = useState('Aircraft');
  
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
          <div className="fr24-time">08:22 UTC</div>
          <div className="fr24-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Find flights, airports and more" />
          </div>
          <div className="fr24-login">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            LOG IN
          </div>
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
    </div>
  );
}
