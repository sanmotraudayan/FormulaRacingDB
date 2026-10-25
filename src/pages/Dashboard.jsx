import React, { useState, useEffect } from 'react';
import { Trophy, Flag, Users, Car, Gauge, CheckCircle2, ChevronRight, RefreshCw, Zap, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

const TEAM_ACCENTS = {
  'Apex Racing': '#00A896',
  'Velocity GP': '#D90500',
  'Titan Motorsport': '#E67300',
  'Nova Racing': '#0070D2'
};

export default function Dashboard({ selectedSeason, onNavigate, onOpenQuickAdd }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await api.getDashboardStats(selectedSeason);
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedSeason]);

  if (loading && !stats) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--ink-3)' }}>
        <div className="stat-tile-label" style={{ marginBottom: '8px' }}>LOADING TIMING PROGRAMME...</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '13px' }}>Querying championship database</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel-box" style={{ borderColor: 'var(--red)', background: 'var(--red-tint)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--red)' }}>CONNECTION ERROR</div>
        <p style={{ color: 'var(--ink-2)', marginTop: '4px', fontSize: '14px' }}>{error}</p>
        <button className="btn btn-secondary btn-sm" onClick={loadData} style={{ marginTop: '12px' }}>
          <RefreshCw size={13} /> Retry Query
        </button>
      </div>
    );
  }

  const { counts, topDrivers, topConstructors, races, fastestLap } = stats || {};

  // Check for Next Scheduled race
  const nextScheduledRace = races?.find(r => r.race_status === 'SCHEDULED');
  const latestCompletedRace = races?.filter(r => r.race_status === 'COMPLETED').slice(-1)[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header Pattern */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div className="mono-tag">01 / DASHBOARD</div>
            <h1 style={{ fontSize: '36px', lineHeight: 1.1, marginTop: '2px' }}>
              CHAMPIONSHIP OVERVIEW
            </h1>
            <p style={{ color: 'var(--ink-3)', fontSize: '14px', marginTop: '4px' }}>
              Season {selectedSeason} classification, driver standings, and session telemetry.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button className="btn btn-primary" onClick={onOpenQuickAdd}>
              + New Record
            </button>
          </div>
        </div>
      </div>

      {/* Kerb Strip Divider (Dashboard signature kerb) */}
      <div className="kerb-strip" />

      {/* Four Stat Tiles (Flat white boxes, 1px border, large mono value, max 4 per row) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        <div className="stat-tile">
          <div className="stat-tile-label">CONSTRUCTORS</div>
          <div className="stat-tile-val">{counts?.teams || 0}</div>
          <div className="stat-tile-context">Teams active on grid</div>
        </div>

        <div className="stat-tile">
          <div className="stat-tile-label">DRIVERS</div>
          <div className="stat-tile-val">{counts?.drivers || 0}</div>
          <div className="stat-tile-context">Superlicense entries</div>
        </div>

        <div className="stat-tile">
          <div className="stat-tile-label">CIRCUITS</div>
          <div className="stat-tile-val">{counts?.circuits || 0}</div>
          <div className="stat-tile-context">FIA homologated venues</div>
        </div>

        <div className="stat-tile">
          <div className="stat-tile-label">ROUNDS HELD</div>
          <div className="stat-tile-val">{counts?.completedRaces || 0} / {counts?.races || 0}</div>
          <div className="stat-tile-context">
            {counts?.scheduledRaces > 0 ? `${counts.scheduledRaces} scheduled remaining` : 'Championship season final'}
          </div>
        </div>
      </div>

      {/* Next Race Tile (Show ONLY if scheduled race exists) */}
      {nextScheduledRace && (
        <div className="panel-box" style={{ borderLeft: '4px solid var(--ink)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="mono-tag">NEXT ROUND &bull; ROUND {nextScheduledRace.round_number}</div>
              <h3 style={{ fontSize: '20px', marginTop: '2px' }}>{nextScheduledRace.race_name}</h3>
              <div style={{ fontSize: '13px', color: 'var(--ink-3)', marginTop: '2px' }}>
                {nextScheduledRace.circuit_name} &bull; {nextScheduledRace.city}, {nextScheduledRace.country}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className="chip chip-scheduled">SCHEDULED</span>
              <div style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--ink-3)', marginTop: '4px' }}>
                {nextScheduledRace.scheduled_laps} Laps &bull; {new Date(nextScheduledRace.race_date).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Drivers Championship & Constructors Standings */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
        
        {/* Top 5 Drivers Standings Preview */}
        <div className="panel-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <div className="mono-tag">STANDINGS PREVIEW</div>
              <h3 style={{ fontSize: '18px' }}>DRIVERS' CHAMPIONSHIP</h3>
            </div>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('standings')}
            >
              Full Table <ChevronRight size={14} />
            </button>
          </div>

          <table className="data-table" style={{ border: 'none' }}>
            <thead>
              <tr>
                <th style={{ width: '40px' }}>POS</th>
                <th style={{ width: '45px' }}>NO</th>
                <th>DRIVER</th>
                <th>TEAM</th>
                <th className="num" style={{ width: '60px' }}>WINS</th>
                <th className="num" style={{ width: '60px' }}>PTS</th>
              </tr>
            </thead>
            <tbody>
              {topDrivers && topDrivers.length > 0 ? (
                topDrivers.slice(0, 5).map((driver, index) => {
                  const pos = index + 1;
                  const posClass = pos === 1 ? 'pos-p1' : pos === 2 ? 'pos-p2' : pos === 3 ? 'pos-p3' : 'pos-other';
                  const accentColor = TEAM_ACCENTS[driver.team_name] || 'var(--ink-3)';

                  return (
                    <tr key={driver.driver_id}>
                      <td>
                        <span className={`pos-badge ${posClass}`}>{pos}</span>
                      </td>
                      <td>
                        <span className="driver-chip">{driver.driver_number}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{driver.driver_name}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span className="team-bar" style={{ background: accentColor }} />
                          <span style={{ fontSize: '13px', color: 'var(--ink-2)' }}>{driver.team_name || 'Free Agent'}</span>
                        </div>
                      </td>
                      <td className="num">{driver.race_wins || 0}</td>
                      <td className="num" style={{ fontWeight: 700, color: 'var(--ink)' }}>
                        {Number(driver.total_points || 0).toFixed(0)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--ink-3)', padding: '24px' }}>
                    No standings recorded for Season {selectedSeason}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Constructors Championship Standings */}
        <div className="panel-box">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <div className="mono-tag">CONSTRUCTOR PREVIEW</div>
              <h3 style={{ fontSize: '18px' }}>CONSTRUCTORS' CHAMPIONSHIP</h3>
            </div>
            <button 
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('standings')}
            >
              Details <ChevronRight size={14} />
            </button>
          </div>

          <table className="data-table" style={{ border: 'none' }}>
            <thead>
              <tr>
                <th style={{ width: '40px' }}>POS</th>
                <th>CONSTRUCTOR</th>
                <th className="num" style={{ width: '60px' }}>SCORERS</th>
                <th className="num" style={{ width: '60px' }}>WINS</th>
                <th className="num" style={{ width: '70px' }}>TOTAL PTS</th>
              </tr>
            </thead>
            <tbody>
              {topConstructors && topConstructors.length > 0 ? (
                topConstructors.map((team, idx) => {
                  const pos = idx + 1;
                  const posClass = pos === 1 ? 'pos-p1' : pos === 2 ? 'pos-p2' : pos === 3 ? 'pos-p3' : 'pos-other';
                  const accentColor = TEAM_ACCENTS[team.team_name] || 'var(--ink-3)';

                  return (
                    <tr key={team.team_id}>
                      <td>
                        <span className={`pos-badge ${posClass}`}>{pos}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span className="team-bar" style={{ background: accentColor }} />
                          <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{team.team_name}</span>
                        </div>
                      </td>
                      <td className="num">{team.drivers_scoring || 0}</td>
                      <td className="num">{team.race_wins || 0}</td>
                      <td className="num" style={{ fontWeight: 700, color: 'var(--ink)' }}>
                        {Number(team.total_points || 0).toFixed(0)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--ink-3)', padding: '24px' }}>
                    No constructor records available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 3: Fastest Lap Telemetry (FL tag) & Latest Completed Race */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        
        {/* Fastest Lap Record Card */}
        {fastestLap && (
          <div className="panel-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="mono-tag">RECORD TELEMETRY</div>
              <span className="fl-tag">FL FASTEST LAP</span>
            </div>

            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'baseline', gap: '10px' }}>
              <div className="stat-tile-val" style={{ color: 'var(--fl)', fontSize: '38px', margin: 0 }}>
                {Number(fastestLap.lap_time_seconds).toFixed(3)}s
              </div>
              <span style={{ fontSize: '13px', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
                Lap {fastestLap.lap_number}
              </span>
            </div>

            <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--ink)' }}>
                  {fastestLap.first_name} {fastestLap.last_name}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--ink-3)' }}>
                  {fastestLap.team_name}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px', color: 'var(--ink)' }}>{fastestLap.race_name}</div>
                <div style={{ fontSize: '11px', color: 'var(--ok)', fontWeight: 600 }}>Verified Minimum</div>
              </div>
            </div>
          </div>
        )}

        {/* Latest Completed Race Summary */}
        {latestCompletedRace && (
          <div className="panel-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="mono-tag">LATEST COMPLETED GRAND PRIX</div>
              <span className="chip chip-ok">COMPLETED</span>
            </div>

            <h3 style={{ fontSize: '20px', marginTop: '6px' }}>{latestCompletedRace.race_name}</h3>
            <div style={{ fontSize: '13px', color: 'var(--ink-3)', marginTop: '2px' }}>
              Round {latestCompletedRace.round_number} &bull; {latestCompletedRace.circuit_name} ({latestCompletedRace.country})
            </div>

            <div style={{
              marginTop: '12px',
              padding: '10px 14px',
              background: 'var(--surface-2)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>ROUND WINNER</div>
                <div style={{ fontWeight: 700, color: 'var(--ink)' }}>
                  {latestCompletedRace.winner_first_name ? `${latestCompletedRace.winner_first_name} ${latestCompletedRace.winner_last_name}` : 'Recorded'}
                </div>
              </div>
              <button 
                className="btn btn-secondary btn-sm"
                onClick={() => onNavigate('results')}
              >
                View Classification
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
