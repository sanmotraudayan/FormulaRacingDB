import React, { useState, useEffect } from 'react';
import { Plus, Trash2, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import Modal from '../components/Modal';

const TYRE_COMPOUND_MAP = {
  'Soft': 'soft',
  'Medium': 'medium',
  'Hard': 'hard',
  'Intermediate': 'inter',
  'Wet': 'wet'
};

const LABEL = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 600,
  color: 'var(--ink-3)',
  marginBottom: '4px',
  fontFamily: 'var(--font-mono)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em'
};

function TyreCompound({ name }) {
  const cls = TYRE_COMPOUND_MAP[name] || '';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--ink-2)' }}>
      <span className={`tyre-dot ${cls}`} />
      {name}
    </span>
  );
}

const TEAM_ACCENTS = {
  'Apex Racing': '#00A896',
  'Velocity GP': '#D90500',
  'Titan Motorsport': '#E67300',
  'Nova Racing': '#0070D2'
};

export default function PitStops({ selectedSeason, onToast }) {
  const [pitStops, setPitStops] = useState([]);
  const [analytics, setAnalytics] = useState([]);
  const [races, setRaces] = useState([]);
  const [results, setResults] = useState([]);
  const [tyres, setTyres] = useState([]);
  const [selectedRaceId, setSelectedRaceId] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    result_id: '',
    tyre_id: 1,
    lap_number: 18,
    duration_seconds: 2.350
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [pitData, analyticsData, racesData, tyresData] = await Promise.all([
        api.getPitStops(selectedRaceId),
        api.getPitStopAnalytics(),
        api.getRaces(selectedSeason),
        api.getTyreCompounds()
      ]);
      setPitStops(pitData);
      setAnalytics(analyticsData);
      setRaces(racesData);
      setTyres(tyresData);

      if (racesData.length > 0) {
        const activeId = selectedRaceId || racesData[0].race_id;
        const rd = await api.getResults(activeId);
        setResults(rd);
        if (rd.length > 0 && !formData.result_id) {
          setFormData(prev => ({ ...prev, result_id: rd[0].result_id }));
        }
      }
    } catch (err) {
      onToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [selectedSeason, selectedRaceId]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.createPitStop({
        ...formData,
        lap_number: parseInt(formData.lap_number),
        duration_seconds: parseFloat(formData.duration_seconds)
      });
      onToast({ type: 'success', message: `Pit stop (${formData.duration_seconds}s) recorded.` });
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      onToast({ type: 'error', message: err.message });
    }
  };

  const handleDelete = async (id, dur) => {
    if (!window.confirm(`Delete pit stop (${dur}s)?`)) return;
    try {
      await api.deletePitStop(id);
      onToast({ type: 'success', message: 'Pit stop deleted.' });
      setPitStops(pitStops.filter(p => p.pit_stop_id !== id));
    } catch (err) {
      onToast({ type: 'error', message: err.message });
    }
  };

  const openAdd = () => {
    setFormData({
      result_id: results[0]?.result_id || '',
      tyre_id: tyres[0]?.tyre_id || 1,
      lap_number: 20,
      duration_seconds: 2.450
    });
    setIsModalOpen(true);
  };

  // Only show averages when 3+ stops
  const analyticsToShow = analytics.filter(a => a.total_pit_stops >= 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Page Header */}
      <div>
        <div className="mono-tag">08 / PIT STOPS & TYRES</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px', marginTop: '4px' }}>
          <div>
            <h1 style={{ fontSize: '36px', lineHeight: 1.1 }}>PIT STOPS & TYRES</h1>
            <p style={{ color: 'var(--ink-3)', fontSize: '14px', marginTop: '4px' }}>
              Pit crew durations, tyre strategy and team averages.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <select
              value={selectedRaceId}
              onChange={e => setSelectedRaceId(e.target.value)}
              className="select-field"
              style={{ width: 'auto', minWidth: '200px', height: '36px', fontWeight: 600 }}
            >
              <option value="">All Races</option>
              {races.map(r => (
                <option key={r.race_id} value={r.race_id}>Rd {r.round_number} — {r.race_name}</option>
              ))}
            </select>
            <button className="btn btn-primary btn-sm" onClick={openAdd}>
              <Plus size={15} /> Log Pit Stop
            </button>
          </div>
        </div>
      </div>

      <hr className="section-rule" />

      {/* Team Analytics (only if 3+ stops) */}
      {analyticsToShow.length > 0 && (
        <div>
          <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--ink)' }}>
              Team Pit Crew Averages
            </div>
            <div style={{ fontSize: '11px', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
              Shown only when 3+ stops recorded
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
            {analyticsToShow.map((team, idx) => {
              const accent = TEAM_ACCENTS[team.team_name] || 'var(--ink-3)';
              return (
                <div
                  key={team.team_name}
                  className="stat-tile"
                  style={{ borderLeft: `4px solid ${accent}`, paddingLeft: '16px' }}
                >
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--ink)', marginBottom: '10px' }}>
                    {team.team_name}
                    {idx === 0 && (
                      <span style={{ marginLeft: '8px', fontSize: '10px', fontFamily: 'var(--font-mono)', color: 'var(--ok)', background: '#E8F5EE', border: '1px solid #B6E2C8', padding: '1px 5px', borderRadius: '2px' }}>
                        FASTEST
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <div className="stat-tile-label">Avg Stop</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '18px', color: 'var(--ink)' }}>
                        {Number(team.average_duration).toFixed(3)}s
                      </div>
                    </div>
                    <div>
                      <div className="stat-tile-label">Fastest</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '18px', color: 'var(--ok)' }}>
                        {Number(team.fastest_pit_stop).toFixed(3)}s
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
                    n={team.total_pit_stops} stops
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Pit Stops Table */}
      <div>
        <div style={{ marginBottom: '12px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--ink)' }}>
          Stop Log
        </div>
        <div className="data-table-container">
          <table className="data-table">
            <caption style={{ display: 'none' }}>Pit stop records</caption>
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Lap</th>
                <th>Driver</th>
                <th>Team</th>
                <th>Compound</th>
                <th>Grand Prix</th>
                <th className="num">Duration</th>
                <th style={{ width: '56px' }}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i}>
                    {[1,2,3,4,5,6,7].map(j => (
                      <td key={j}><div style={{ height: '14px', background: 'var(--surface-2)', borderRadius: '2px' }} /></td>
                    ))}
                  </tr>
                ))
              ) : pitStops.length > 0 ? (
                pitStops.map(stop => {
                  const sub25 = Number(stop.duration_seconds) <= 2.30;
                  const accent = TEAM_ACCENTS[stop.team_name] || 'var(--ink-3)';
                  return (
                    <tr key={stop.pit_stop_id}>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--ink-3)' }}>
                          L{stop.lap_number}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="driver-chip">{stop.driver_number}</span>
                          <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{stop.first_name} {stop.last_name}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="team-bar" style={{ background: accent }} />
                          <span style={{ color: 'var(--ink-2)', fontSize: '13px' }}>{stop.team_name}</span>
                        </div>
                      </td>
                      <td>
                        <TyreCompound name={stop.compound_name} />
                        {stop.tyre_type && (
                          <span style={{ fontSize: '11px', color: 'var(--ink-3)', marginLeft: '4px' }}>({stop.tyre_type})</span>
                        )}
                      </td>
                      <td style={{ color: 'var(--ink-3)', fontSize: '13px' }}>{stop.race_name}</td>
                      <td className="num">
                        <span style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          fontSize: '15px',
                          color: sub25 ? 'var(--ok)' : 'var(--ink)'
                        }}>
                          {Number(stop.duration_seconds).toFixed(3)}s
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-danger btn-icon" onClick={() => handleDelete(stop.pit_stop_id, stop.duration_seconds)} aria-label="Delete pit stop">
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--ink-3)' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, marginBottom: '6px' }}>NO PIT STOPS LOGGED</div>
                    <div style={{ fontSize: '13px' }}>No pit stops for this selection. Try another race or clear filters.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {pitStops.length > 0 && (
            <div style={{ padding: '10px 14px', background: 'var(--surface-2)', borderTop: 'var(--hairline)', fontSize: '12px', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
              Showing {pitStops.length} {pitStops.length === 1 ? 'stop' : 'stops'}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Pit Stop"
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={LABEL}>Driver & Race Entry *</label>
            <select value={formData.result_id} onChange={e => setFormData({ ...formData, result_id: e.target.value })} className="select-field" required>
              <option value="">Select driver...</option>
              {results.map(r => (
                <option key={r.result_id} value={r.result_id}>
                  #{r.driver_number} {r.first_name} {r.last_name} — {r.team_name} ({r.race_name})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={LABEL}>Tyre Compound *</label>
            <select value={formData.tyre_id} onChange={e => setFormData({ ...formData, tyre_id: e.target.value })} className="select-field" required>
              {tyres.map(t => (
                <option key={t.tyre_id} value={t.tyre_id}>{t.compound_name} ({t.tyre_type})</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={LABEL}>Lap Number *</label>
              <input type="number" min="1" value={formData.lap_number} onChange={e => setFormData({ ...formData, lap_number: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label style={LABEL}>Duration (seconds) *</label>
              <input type="number" step="0.001" min="1" value={formData.duration_seconds} onChange={e => setFormData({ ...formData, duration_seconds: e.target.value })} className="input-field" required />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px', borderTop: 'var(--hairline)' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Log Pit Stop</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
