/* ============================================================
   SearchBar — Floating callsign search
   
   WHY: Lets users find a specific flight by callsign and fly to it.
   Positioned top-center as a floating element over the map.
   ============================================================ */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import useFlightStore from '../store/flightStore';
import './SearchBar.css';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const aircraft = useFlightStore((s) => s.aircraft);
  const selectAircraftByIcao = useFlightStore((s) => s.selectAircraftByIcao);

  // Search aircraft by callsign as the user types
  const handleSearch = useCallback(
    (value) => {
      setQuery(value);
      if (value.length < 2) {
        setResults([]);
        return;
      }
      const normalized = value.toUpperCase().trim();
      const matches = aircraft
        .filter(
          (a) =>
            a.callsign?.toUpperCase().includes(normalized) ||
            a.icao24?.toUpperCase().includes(normalized)
        )
        .slice(0, 8); // Limit results for performance
      setResults(matches);
    },
    [aircraft]
  );

  // Select a result and fly to it
  const handleSelect = useCallback(
    (a) => {
      selectAircraftByIcao(a.icao24);
      setQuery(a.callsign || a.icao24);
      setResults([]);
      setIsFocused(false);
      inputRef.current?.blur();
    },
    [selectAircraftByIcao]
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (inputRef.current && !inputRef.current.closest('.search-bar')?.contains(e.target)) {
        setResults([]);
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`search-bar glass-panel ${isFocused ? 'focused' : ''}`} id="search-bar">
      <div className="search-input-row">
        <svg
          className="search-icon"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search callsign or ICAO..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsFocused(true)}
          className="search-input mono"
          id="search-input"
          autoComplete="off"
          spellCheck="false"
        />
        {query && (
          <button
            className="search-clear"
            onClick={() => {
              setQuery('');
              setResults([]);
            }}
            id="search-clear-btn"
          >
            ×
          </button>
        )}
      </div>

      {/* Search results dropdown */}
      {results.length > 0 && (
        <div className="search-results">
          {results.map((a) => (
            <button
              key={a.icao24}
              className="search-result-item"
              onClick={() => handleSelect(a)}
            >
              <span className="result-callsign mono">{a.callsign || a.icao24}</span>
              <span className="result-country">{a.originCountry}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
