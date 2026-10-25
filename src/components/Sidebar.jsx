import React from 'react';
import { 
  Activity, Trophy, Users, Car, Flag, CheckCircle2, 
  Gauge, Clock, ShieldAlert, DollarSign 
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'standings', label: 'Standings', icon: Trophy },
    { id: 'teams', label: 'Teams', icon: Car },
    { id: 'drivers', label: 'Drivers', icon: Users },
    { id: 'races', label: 'Races & Circuits', icon: Flag },
    { id: 'results', label: 'Race Results', icon: CheckCircle2 },
    { id: 'laps', label: 'Lap Performance', icon: Gauge },
    { id: 'pitstops', label: 'Pit Stops & Tyres', icon: Clock },
    { id: 'stewards', label: 'Penalties & Incidents', icon: ShieldAlert },
    { id: 'sponsors', label: 'Sponsors', icon: DollarSign }
  ];

  return (
    <aside style={{
      width: '232px',
      background: 'var(--surface)',
      borderRight: '1px solid var(--line)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      height: '100vh',
      zIndex: 100
    }}>
      {/* Brand Header */}
      <div style={{
        padding: '20px 18px',
        borderBottom: '1px solid var(--line)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <div style={{
          width: '6px',
          height: '24px',
          background: 'var(--red)',
          borderRadius: '1px',
          flexShrink: 0
        }} />
        <div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '18px',
            lineHeight: 1,
            color: 'var(--ink)',
            letterSpacing: '0.02em'
          }}>
            FORMULA RACING
          </div>
          <div style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            color: 'var(--ink-3)',
            marginTop: '2px',
            textTransform: 'uppercase'
          }}>
            Championship Analytics
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',

                padding: '9px 16px 9px 15px',
                background: isActive ? 'var(--surface-2)' : 'transparent',
                border: 'none',
                borderLeft: isActive ? '3px solid var(--red)' : '3px solid transparent',
                cursor: 'pointer',
                textAlign: 'left',
                color: isActive ? 'var(--ink)' : 'var(--ink-2)',
                fontWeight: isActive ? 700 : 500,
                fontSize: '13.5px',
                fontFamily: 'var(--font-body)',
                transition: 'background 100ms ease-out, color 100ms ease-out',
                outline: 'none'
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = 'var(--surface-2)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icon size={15} color={isActive ? 'var(--red)' : 'var(--ink-3)'} />
                <span>{item.label}</span>
              </div>

            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div style={{
        padding: '14px 18px',
        borderTop: '1px solid var(--line)',
        fontSize: '11px',
        color: 'var(--ink-3)',
        background: 'var(--surface)'
      }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--ink-2)' }}>
          TIMING PROGRAMME
        </div>
        <div>v1.0 &bull; FIA Spec Data</div>
      </div>
    </aside>
  );
}
