import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, ChevronDown } from 'lucide-react';
import { api } from '../services/api';

const TEAM_ACCENTS = {
  'Apex Racing': '#00A896',
  'Velocity GP': '#D90500',
  'Titan Motorsport': '#E67300',
  'Nova Racing': '#0070D2'
};

export default function Standings({ selectedSeason }) {
  const [activeTab, setActiveTab] = useState('drivers'); // 'drivers' or 'constructors'
  const [driverStandings, setDriverStandings] = useState([]);
  const [constructorStandings, setConstructorStandings] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadStandings = async () => {
    try {
      setLoading(true);
      const [drivers, constructors] = await Promise.all([
        api.getDriverStandings(selectedSeason),
        api.getConstructorStandings(selectedSeason)
      ]);
      setDriverStandings(drivers);
      setConstructorStandings(constructors);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStandings();
  }, [selectedSeason]);

  const filteredDrivers = driverStandings.filter(d => 
    d.driver_name?.toLowerCase().includes(search.toLowerCase()) ||
    d.team_name?.toLowerCase().includes(search.toLowerCase()) ||
    d.nationality?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredConstructors = constructorStandings.filter(c =>
    c.team_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.base_country?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Page Header */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div className="mono-tag">02 / STANDINGS</div>
            <h1 style={{ fontSize: '36px', lineHeight: 1.1, marginTop: '2px' }}>
              CHAMPIONSHIP STANDINGS
            </h1>
            <p style={{ color: 'var(--ink-3)', fontSize: '14px', marginTop: '4px' }}>
              Official points classification and race win tallies for Season {selectedSeason}.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Drivers / Constructors Switcher */}
            <div style={{
              display: 'inline-flex',
              border: '1px solid var(--line-strong)',
              borderRadius: 'var(--radius)',
              background: 'var(--surface)',
              padding: '2px'
            }}>
              <button
                onClick={() => setActiveTab('drivers')}
                style={{
                  padding: '6px 14px',
                  fontFamily: 'var(--font-display)',
                  fontSize: '14px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  border: 'none',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  background: activeTab === 'drivers' ? 'var(--ink)' : 'transparent',
                  color: activeTab === 'drivers' ? '#FFFFFF' : 'var(--ink-2)'
                }}
              >
                Drivers
              </button>
              <button
                onClick={() => setActiveTab('constructors')}
                style={{
                  padding: '6px 14px',
                  fontFamily: 'var(--font-display)',
                  fontSize: '14px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  border: 'none',
                  borderRadius: '2px',
                  cursor: 'pointer',
                  background: activeTab === 'constructors' ? 'var(--ink)' : 'transparent',
                  color: activeTab === 'constructors' ? '#FFFFFF' : 'var(--ink-2)'
                }}
              >
                Constructors
              </button>
            </div>

            {/* Filter Search */}
            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={14} color="var(--ink-3)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
              <input
                type="text"
                placeholder="Filter table..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '30px', height: '34px', fontSize: '13px' }}
              />
            </div>

            <button className="btn btn-secondary btn-icon" onClick={loadStandings} title="Refresh">
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Table Container */}
      {activeTab === 'drivers' ? (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>POS</th>
                <th style={{ width: '50px' }}>NO</th>
                <th>DRIVER</th>
                <th>NATIONALITY</th>
                <th>CONSTRUCTOR</th>
                <th className="num" style={{ width: '80px' }}>WINS</th>
                <th className="num" style={{ width: '80px' }}>PODIUMS</th>
                <th className="num" style={{ width: '90px' }}>POINTS</th>
              </tr>
            </thead>
            <tbody>
              {filteredDrivers.length > 0 ? (
                filteredDrivers.map((driver, index) => {
                  const pos = index + 1;
                  const posClass = pos === 1 ? 'pos-p1' : pos === 2 ? 'pos-p2' : pos === 3 ? 'pos-p3' : 'pos-other';
                  const accentColor = TEAM_ACCENTS[driver.team_name] || 'var(--ink-3)';

                  // Tie Detection
                  const isTied = index > 0 && driver.total_points === filteredDrivers[index - 1].total_points;

                  return (
                    <tr key={driver.driver_id}>
                      <td>
                        <span className={`pos-badge ${posClass}`}>
                          {isTied ? `=${pos}` : pos}
                        </span>
                      </td>
                      <td>
                        <span className="driver-chip">{driver.driver_number}</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--ink)' }}>
                          {driver.driver_name}
                        </span>
                      </td>
                      <td>
                        <span style={{ color: 'var(--ink-3)', fontSize: '13px' }}>
                          {driver.nationality}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <span className="team-bar" style={{ background: accentColor }} />
                          <span style={{ color: 'var(--ink)' }}>{driver.team_name || 'Free Agent'}</span>
                        </div>
                      </td>
                      <td className="num">{driver.race_wins || 0}</td>
                      <td className="num">{driver.podiums || 0}</td>
                      <td className="num" style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '15px' }}>
                        {Number(driver.total_points || 0).toFixed(0)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: 'var(--ink-3)' }}>
                    {loading ? 'Reading classification...' : 'No drivers matching search filter.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>POS</th>
                <th>CONSTRUCTOR</th>
                <th>BASE COUNTRY</th>
                <th>TEAM PRINCIPAL</th>
                <th className="num" style={{ width: '100px' }}>SCORERS</th>
                <th className="num" style={{ width: '80px' }}>WINS</th>
                <th className="num" style={{ width: '90px' }}>POINTS</th>
              </tr>
            </thead>
            <tbody>
              {filteredConstructors.length > 0 ? (
                filteredConstructors.map((team, index) => {
                  const pos = index + 1;
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
                          <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{team.team_name}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{ color: 'var(--ink-3)', fontSize: '13px' }}>{team.base_country}</span>
                      </td>
                      <td>
                        <span style={{ color: 'var(--ink-2)', fontSize: '13px' }}>{team.team_principal || 'N/A'}</span>
                      </td>
                      <td className="num">{team.drivers_scoring || 0}</td>
                      <td className="num">{team.race_wins || 0}</td>
                      <td className="num" style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '15px' }}>
                        {Number(team.total_points || 0).toFixed(0)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: 'var(--ink-3)' }}>
                    {loading ? 'Reading classification...' : 'No constructor records found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tiebreak Note */}
      <div style={{ fontSize: '12px', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
        Note: Equal points share position with tiebreak resolved by race wins, then best finish count.
      </div>
    </div>
  );
}
