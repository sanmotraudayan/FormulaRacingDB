import React from 'react';
import { 
  Trophy, Flag, Car, Users, Gauge, Clock, ShieldAlert, DollarSign, Database, 
  Plus, CheckCircle2, AlertTriangle, ChevronDown, Activity, Sparkles 
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  selectedSeason, 
  setSelectedSeason, 
  championships,
  dbStatus, 
  onOpenQuickAdd,
  onOpenDbStatus
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'standings', label: 'Standings', icon: Trophy },
    { id: 'races', label: 'Races & Tracks', icon: Flag },
    { id: 'results', label: 'Results', icon: CheckCircle2 },
    { id: 'teams', label: 'Teams & Cars', icon: Car },
    { id: 'drivers', label: 'Drivers', icon: Users },
    { id: 'laps', label: 'Lap Times', icon: Gauge },
    { id: 'pitstops', label: 'Pit Stops', icon: Clock },
    { id: 'stewards', label: 'Stewards & Incidents', icon: ShieldAlert },
    { id: 'sponsors', label: 'Sponsors', icon: DollarSign }
  ];

  return (
    <header style={{ 
      background: '#191924', 
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
    }}>
      {/* Top F1 Red Racing Stripe */}
      <div className="f1-stripe" />

      {/* Main Bar */}
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        flexWrap: 'wrap'
      }}>
        {/* Brand & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: 'var(--accent-red)',
            color: '#FFFFFF',
            padding: '6px 14px',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 900,
            fontFamily: 'var(--font-racing)',
            fontSize: '22px',
            letterSpacing: '1px',
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 0 15px rgba(225, 6, 0, 0.4)'
          }}>
            <span>F1</span>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ 
                fontSize: '20px', 
                fontWeight: 900, 
                color: '#FFFFFF', 
                letterSpacing: '0.8px',
                lineHeight: 1
              }}>
                FORMULA RACING CHAMPIONSHIP
              </h1>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '3px' }}>
              Official Motorsport Championship Analytics &amp; Telemetry
            </p>
          </div>
        </div>

        {/* Status & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Season Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600, fontFamily: 'var(--font-racing)', textTransform: 'uppercase' }}>
              Season:
            </span>
            <select 
              value={selectedSeason} 
              onChange={(e) => setSelectedSeason(e.target.value)}
              className="select-field"
              style={{
                width: 'auto',
                fontWeight: 700,
                fontFamily: 'var(--font-racing)',
                fontSize: '14px',
                padding: '5px 12px',
                borderColor: 'var(--border-highlight)'
              }}
            >
              {championships.map(c => (
                <option key={c.championship_id} value={c.season_year}>
                  {c.season_year} ({c.status})
                </option>
              ))}
              <option value="ALL">All Seasons</option>
            </select>
          </div>

          {/* Quick Record Add Button */}
          <button 
            className="btn btn-primary"
            onClick={onOpenQuickAdd}
            style={{ padding: '6px 14px' }}
          >
            <Plus size={16} />
            <span>New Record</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <nav style={{
        background: '#15151E',
        borderTop: '1px solid rgba(46, 46, 61, 0.6)',
        overflowX: 'auto',
        display: 'flex',
        padding: '0 24px'
      }}>
        <div style={{
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'flex',
          gap: '2px',
          width: '100%'
        }}>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  background: isActive ? 'var(--bg-surface)' : 'transparent',
                  color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                  border: 'none',
                  borderBottom: isActive ? '3px solid var(--accent-red)' : '3px solid transparent',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: 'var(--font-racing)',
                  fontWeight: isActive ? 700 : 600,
                  fontSize: '14px',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                <Icon size={16} color={isActive ? 'var(--accent-red)' : 'currentColor'} />
                <span>{item.label}</span>
                {item.highlight && (
                  <span style={{
                    fontSize: '10px',
                    background: 'var(--color-purple-bg)',
                    color: 'var(--color-purple)',
                    border: '1px solid rgba(168, 85, 247, 0.4)',
                    padding: '1px 5px',
                    borderRadius: '3px',
                    marginLeft: '2px'
                  }}>
                    SQL
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
