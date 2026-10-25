import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, User, Shield, Flag, Calendar, Loader2, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'standings', label: 'Standings' },
  { id: 'teams', label: 'Teams' },
  { id: 'drivers', label: 'Drivers' },
  { id: 'races', label: 'Races & Circuits' },
  { id: 'results', label: 'Race Results' },
  { id: 'laps', label: 'Lap Performance' },
  { id: 'pitstops', label: 'Pit Stops & Tyres' },
  { id: 'stewards', label: 'Penalties & Incidents' },
  { id: 'sponsors', label: 'Sponsors' }
];

export default function TopBar({ 
  activeTab,
  setActiveTab,
  onNavigateWithFilter,
  selectedSeason, 
  setSelectedSeason, 
  championships,
  globalSearch,
  setGlobalSearch,
  onOpenQuickAdd 
}) {
  const [suggestions, setSuggestions] = useState({ drivers: [], teams: [], circuits: [], races: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchContainerRef = useRef(null);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search for suggestions
  useEffect(() => {
    const trimmed = (globalSearch || '').trim();
    if (!trimmed || trimmed.length < 1) {
      setSuggestions({ drivers: [], teams: [], circuits: [], races: [] });
      setIsOpen(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await api.searchAll(trimmed);
        setSuggestions(data);
        const hasResults = (
          (data.drivers?.length || 0) +
          (data.teams?.length || 0) +
          (data.circuits?.length || 0) +
          (data.races?.length || 0)
        ) > 0;
        setIsOpen(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [globalSearch]);

  const handleSelectDriver = (driver) => {
    setIsOpen(false);
    if (onNavigateWithFilter) {
      onNavigateWithFilter('drivers', { search: `${driver.first_name} ${driver.last_name}` });
    } else {
      setActiveTab('drivers');
    }
  };

  const handleSelectTeam = (team) => {
    setIsOpen(false);
    if (onNavigateWithFilter) {
      onNavigateWithFilter('teams', { search: team.team_name });
    } else {
      setActiveTab('teams');
    }
  };

  const handleSelectCircuit = (circuit) => {
    setIsOpen(false);
    if (onNavigateWithFilter) {
      onNavigateWithFilter('races', { search: circuit.circuit_name });
    } else {
      setActiveTab('races');
    }
  };

  const handleSelectRace = (race) => {
    setIsOpen(false);
    if (onNavigateWithFilter) {
      onNavigateWithFilter('results', { raceId: race.race_id });
    } else {
      setActiveTab('results');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setIsOpen(false);
      const query = (globalSearch || '').trim();
      if (!query) return;

      // Smart routing based on first suggestion match if available
      if (suggestions.drivers && suggestions.drivers.length > 0) {
        handleSelectDriver(suggestions.drivers[0]);
      } else if (suggestions.teams && suggestions.teams.length > 0) {
        handleSelectTeam(suggestions.teams[0]);
      } else if (suggestions.circuits && suggestions.circuits.length > 0) {
        handleSelectCircuit(suggestions.circuits[0]);
      } else if (suggestions.races && suggestions.races.length > 0) {
        handleSelectRace(suggestions.races[0]);
      } else {
        // Default search on drivers
        if (onNavigateWithFilter) {
          onNavigateWithFilter('drivers', { search: query });
        } else {
          setActiveTab('drivers');
        }
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const totalResultsCount = (suggestions.drivers?.length || 0) +
    (suggestions.teams?.length || 0) +
    (suggestions.circuits?.length || 0) +
    (suggestions.races?.length || 0);
  return (
    <header style={{
      background: 'var(--surface)',
      borderBottom: '2px solid var(--ink)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Top Row: Brand + Search + Season + New Entry */}
      <div style={{ borderBottom: '1px solid var(--line)' }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 24px',
          gap: '20px'
        }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <div style={{
              width: '5px',
              height: '22px',
              background: 'var(--red)',
              borderRadius: '1px'
            }} />
            <div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                fontSize: '16px',
                lineHeight: 1,
                color: 'var(--ink)',
                letterSpacing: '0.02em'
              }}>
                FORMULA RACING
              </div>
              <div style={{
                fontSize: '10px',
                fontFamily: 'var(--font-mono)',
                color: 'var(--ink-3)',
                marginTop: '1px',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Championship Analytics
              </div>
            </div>
          </div>

          {/* Search with Live Suggestions */}
          <div ref={searchContainerRef} style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
            <Search 
              size={14} 
              color="var(--ink-3)" 
              style={{ position: 'absolute', left: '10px', top: '10px', pointerEvents: 'none', zIndex: 2 }} 
            />
            {loading && (
              <Loader2
                size={14}
                className="spin"
                color="var(--ink-3)"
                style={{ position: 'absolute', right: '10px', top: '10px', zIndex: 2 }}
              />
            )}
            <input
              type="text"
              placeholder="Search drivers, teams, circuits, races..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              onFocus={() => {
                if ((globalSearch || '').trim().length > 0 && totalResultsCount > 0) {
                  setIsOpen(true);
                }
              }}
              onKeyDown={handleKeyDown}
              className="input-field"
              style={{
                paddingLeft: '32px',
                paddingRight: loading ? '32px' : '10px',
                height: '34px',
                fontSize: '13px',
                background: 'var(--bg)',
                width: '100%'
              }}
            />

            {/* Suggestions Dropdown */}
            {isOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                right: 0,
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius)',
                boxShadow: 'var(--shadow-md)',
                zIndex: 1000,
                maxHeight: '380px',
                overflowY: 'auto'
              }}>
                {totalResultsCount === 0 && !loading && (
                  <div style={{ padding: '12px 14px', fontSize: '12px', color: 'var(--ink-3)' }}>
                    No results found for "{globalSearch}"
                  </div>
                )}

                {/* Drivers Category */}
                {suggestions.drivers && suggestions.drivers.length > 0 && (
                  <div>
                    <div style={{
                      padding: '8px 12px 4px',
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--ink-3)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      background: 'var(--surface-2)',
                      borderBottom: '1px solid var(--line)'
                    }}>
                      Drivers ({suggestions.drivers.length})
                    </div>
                    {suggestions.drivers.map(d => (
                      <div
                        key={d.driver_id}
                        onClick={() => handleSelectDriver(d)}
                        style={{
                          padding: '8px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          borderBottom: '1px solid var(--line-light)',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-2)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <User size={13} color="var(--red)" />
                          <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ink)' }}>
                            {d.first_name} {d.last_name}
                          </span>
                          <span className="driver-chip" style={{ fontSize: '11px', padding: '1px 5px' }}>
                            #{d.driver_number}
                          </span>
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--ink-3)' }}>
                          {d.team_name || d.nationality}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Teams Category */}
                {suggestions.teams && suggestions.teams.length > 0 && (
                  <div>
                    <div style={{
                      padding: '8px 12px 4px',
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--ink-3)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      background: 'var(--surface-2)',
                      borderBottom: '1px solid var(--line)',
                      borderTop: '1px solid var(--line)'
                    }}>
                      Teams ({suggestions.teams.length})
                    </div>
                    {suggestions.teams.map(t => (
                      <div
                        key={t.team_id}
                        onClick={() => handleSelectTeam(t)}
                        style={{
                          padding: '8px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          borderBottom: '1px solid var(--line-light)',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-2)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Shield size={13} color="var(--ink)" />
                          <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ink)' }}>
                            {t.team_name}
                          </span>
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--ink-3)' }}>
                          {t.base_country}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Circuits Category */}
                {suggestions.circuits && suggestions.circuits.length > 0 && (
                  <div>
                    <div style={{
                      padding: '8px 12px 4px',
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--ink-3)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      background: 'var(--surface-2)',
                      borderBottom: '1px solid var(--line)',
                      borderTop: '1px solid var(--line)'
                    }}>
                      Circuits ({suggestions.circuits.length})
                    </div>
                    {suggestions.circuits.map(c => (
                      <div
                        key={c.circuit_id}
                        onClick={() => handleSelectCircuit(c)}
                        style={{
                          padding: '8px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          borderBottom: '1px solid var(--line-light)',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-2)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Flag size={13} color="var(--red)" />
                          <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ink)' }}>
                            {c.circuit_name}
                          </span>
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--ink-3)' }}>
                          {c.city ? `${c.city}, ` : ''}{c.country}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Races Category */}
                {suggestions.races && suggestions.races.length > 0 && (
                  <div>
                    <div style={{
                      padding: '8px 12px 4px',
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--ink-3)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      background: 'var(--surface-2)',
                      borderBottom: '1px solid var(--line)',
                      borderTop: '1px solid var(--line)'
                    }}>
                      Races ({suggestions.races.length})
                    </div>
                    {suggestions.races.map(r => (
                      <div
                        key={r.race_id}
                        onClick={() => handleSelectRace(r)}
                        style={{
                          padding: '8px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          borderBottom: '1px solid var(--line-light)',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-2)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Calendar size={13} color="var(--ink-2)" />
                          <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ink)' }}>
                            {r.race_name}
                          </span>
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--ink-3)' }}>
                          Rnd {r.round_number} &bull; {r.race_status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Press Enter hint */}
                <div style={{
                  padding: '6px 12px',
                  background: 'var(--surface-2)',
                  borderTop: '1px solid var(--line)',
                  fontSize: '11px',
                  color: 'var(--ink-3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span>Press <kbd style={{ background: 'var(--surface)', padding: '1px 5px', border: '1px solid var(--line)', borderRadius: '3px', fontSize: '10px' }}>Enter</kbd> to search</span>
                  <span><kbd style={{ background: 'var(--surface)', padding: '1px 5px', border: '1px solid var(--line)', borderRadius: '3px', fontSize: '10px' }}>Esc</kbd> to close</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            {/* Season Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label 
                htmlFor="season-select"
                style={{ 
                  fontSize: '11px', 
                  color: 'var(--ink-3)', 
                  fontFamily: 'var(--font-mono)', 
                  fontWeight: 600,
                  textTransform: 'uppercase'
                }}
              >
                Season:
              </label>
              <select
                id="season-select"
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                className="select-field"
                style={{
                  width: 'auto',
                  height: '34px',
                  padding: '4px 10px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  background: 'var(--surface)'
                }}
              >
                {championships.map(c => (
                  <option key={c.championship_id} value={c.season_year}>
                    {c.season_year}, {c.status ? c.status.charAt(0) + c.status.slice(1).toLowerCase() : 'Scheduled'}
                  </option>
                ))}
                <option value="ALL">All Seasons</option>
              </select>
            </div>

            {/* Primary Action Button */}
            <button 
              className="btn btn-primary btn-sm"
              onClick={onOpenQuickAdd}
              style={{ height: '34px', padding: '0 14px' }}
            >
              <Plus size={15} />
              <span>New Entry</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Navigation Tabs — centered */}
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
          padding: '0 24px',
          overflowX: 'auto'
        }}>
          {NAV_ITEMS.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  padding: '10px 16px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: isActive ? '3px solid var(--red)' : '3px solid transparent',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--ink)' : 'var(--ink-3)',
                  whiteSpace: 'nowrap',
                  transition: 'color 120ms ease-out, border-color 120ms ease-out',
                  outline: 'none'
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = 'var(--ink-2)'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = 'var(--ink-3)'; }}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
