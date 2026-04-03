/* ============================================================
   StatusBar — Connection status pill
   
   WHY: Shows the user whether data is live or in demo mode,
   the last update time, and how many aircraft are being tracked.
   Positioned at bottom-center as a floating element.
   ============================================================ */

import React, { useState, useEffect } from 'react';
import useFlightStore from '../store/flightStore';
import './StatusBar.css';

export default function StatusBar() {
  const connectionStatus = useFlightStore((s) => s.connectionStatus);
  const aircraftCount = useFlightStore((s) => s.aircraftCount);
  const lastFetchTime = useFlightStore((s) => s.lastFetchTime);
  const isDemo = useFlightStore((s) => s.isDemo);
  const errorMessage = useFlightStore((s) => s.errorMessage);

  const [lastUpdateStr, setLastUpdateStr] = useState('—');

  // Update the "last updated" display every second
  useEffect(() => {
    const updateTime = () => {
      if (!lastFetchTime) {
        setLastUpdateStr('—');
        return;
      }
      const secondsAgo = Math.floor((Date.now() - lastFetchTime) / 1000);
      if (secondsAgo < 5) {
        setLastUpdateStr('just now');
      } else if (secondsAgo < 60) {
        setLastUpdateStr(`${secondsAgo}s ago`);
      } else {
        setLastUpdateStr(`${Math.floor(secondsAgo / 60)}m ago`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [lastFetchTime]);

  const statusConfig = {
    connected: { color: 'var(--accent-green)', label: 'LIVE' },
    connecting: { color: 'var(--accent-amber)', label: 'CONNECTING' },
    error: { color: 'var(--accent-red)', label: 'ERROR' },
    demo: { color: 'var(--accent-amber)', label: 'DEMO' },
  };

  const status = statusConfig[connectionStatus] || statusConfig.connecting;

  return (
    <div className="status-bar glass-panel" id="status-bar">
      <div className="status-indicator">
        <span className="status-beacon" style={{ backgroundColor: status.color }} />
        <span className="status-label mono" style={{ color: status.color }}>
          {status.label}
        </span>
      </div>
      <span className="status-divider">|</span>
      <span className="status-info mono">
        {aircraftCount} aircraft
      </span>
      <span className="status-divider">|</span>
      <span className="status-info">
        Updated {lastUpdateStr}
      </span>
      {isDemo && (
        <>
          <span className="status-divider">|</span>
          <span className="status-demo-note">Mock Data</span>
        </>
      )}
      {errorMessage && connectionStatus === 'error' && (
        <span className="status-error-msg" title={errorMessage}>
          ⚠
        </span>
      )}
    </div>
  );
}
