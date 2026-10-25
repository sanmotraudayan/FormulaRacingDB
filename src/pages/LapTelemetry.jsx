import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import Modal from '../components/Modal';

function formatLapTime(seconds) {
  if (!seconds) return '—';
  const s = Number(seconds);
  const mins = Math.floor(s / 60);
  const secs = (s % 60).toFixed(3).padStart(6, '0');
  return mins > 0 ? `${mins}:${secs}` : `${secs}s`;
}

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

export default function LapTelemetry({ selectedSeason, onToast }) {
  const [laps, setLaps] = useState([]);
  const [races, setRaces] = useState([]);
  const [results, setResults] = useState([]);
  const [selectedRaceId, setSelectedRaceId] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLap, setEditingLap] = useState(null);
  const [formData, setFormData] = useState({
    result_id: '',
    lap_number: 1,
    lap_time_seconds: 90.000,
    is_fastest_lap: false
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [racesData, lapsData] = await Promise.all([
        api.getRaces(selectedSeason),
        api.getLaps(selectedRaceId)
      ]);
      setRaces(racesData);
      setLaps(lapsData);

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
      const payload = {
        ...formData,
        lap_number: parseInt(formData.lap_number),
        lap_time_seconds: parseFloat(formData.lap_time_seconds)
      };
      if (editingLap) {
        await api.updateLap(editingLap.lap_id, payload);
        onToast({ type: 'success', message: 'Lap updated.' });
      } else {
        await api.createLap(payload);
        onToast({ type: 'success', message: `Lap ${formData.lap_number} recorded.` });
      }
      setIsModalOpen(false);
      setEditingLap(null);
      loadData();
    } catch (err) {
      onToast({ type: 'error', message: err.message });
    }
  };

  const handleDelete = async (lapId, lapNum) => {
    if (!window.confirm(`Delete lap #${lapNum}?`)) return;
    try {
      await api.deleteLap(lapId);
      onToast({ type: 'success', message: 'Lap deleted.' });
      setLaps(laps.filter(l => l.lap_id !== lapId));
    } catch (err) {
      onToast({ type: 'error', message: err.message });
    }
  };

  const openAdd = () => {
    setEditingLap(null);
    setFormData({
      result_id: results[0]?.result_id || '',
      lap_number: laps.length > 0 ? Math.max(...laps.map(l => l.lap_number)) + 1 : 1,
      lap_time_seconds: 90.150,
      is_fastest_lap: false
    });
    setIsModalOpen(true);
  };

  const openEdit = (lap) => {
    setEditingLap(lap);
    setFormData({
      result_id: lap.result_id,
      lap_number: lap.lap_number,
      lap_time_seconds: lap.lap_time_seconds,
      is_fastest_lap: Boolean(lap.is_fastest_lap)
    });
    setIsModalOpen(true);
  };

  const minTime = laps.length > 0 ? Math.min(...laps.map(l => Number(l.lap_time_seconds))) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Page Header */}
      <div>
        <div className="mono-tag">07 / LAP PERFORMANCE</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px', marginTop: '4px' }}>
          <div>
            <h1 style={{ fontSize: '36px', lineHeight: 1.1 }}>LAP PERFORMANCE</h1>
            <p style={{ color: 'var(--ink-3)', fontSize: '14px', marginTop: '4px' }}>
              Lap-by-lap timing splits. Fastest lap marked <span className="fl-tag" style={{ fontSize: '11px', verticalAlign: 'middle' }}>FL</span>.
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
              <Plus size={15} /> Log Lap
            </button>
          </div>
        </div>
      </div>

      <hr className="section-rule" />

      {/* Summary row */}
      {laps.length > 0 && (
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div className="stat-tile" style={{ flex: '1', minWidth: '140px' }}>
            <div className="stat-tile-label">Total Laps</div>
            <div className="stat-tile-val">{laps.length}</div>
          </div>
          <div className="stat-tile" style={{ flex: '1', minWidth: '140px' }}>
            <div className="stat-tile-label">Fastest Lap</div>
            <div className="stat-tile-val" style={{ color: 'var(--fl)', fontSize: '24px' }}>{formatLapTime(minTime)}</div>
            <div className="stat-tile-context">Overall minimum in dataset</div>
          </div>
          <div className="stat-tile" style={{ flex: '1', minWidth: '140px' }}>
            <div className="stat-tile-label">FL Flagged</div>
            <div className="stat-tile-val">{laps.filter(l => l.is_fastest_lap).length}</div>
            <div className="stat-tile-context">Marked in database</div>
          </div>
        </div>
      )}

      {/* Laps Table */}
      <div className="data-table-container">
        <table className="data-table">
          <caption style={{ display: 'none' }}>Lap timing data</caption>
          <thead>
            <tr>
              <th style={{ width: '60px' }}>Lap</th>
              <th>Driver</th>
              <th>Team</th>
              <th>Grand Prix</th>
              <th className="num">Lap Time</th>
              <th style={{ textAlign: 'center', width: '80px' }}>FL</th>
              <th style={{ width: '80px' }}></th>
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
            ) : laps.length > 0 ? (
              laps.map(lap => {
                const isFastest = Boolean(lap.is_fastest_lap);
                const isMin = minTime && Number(lap.lap_time_seconds) === minTime;
                return (
                  <tr key={lap.lap_id} style={{ background: isFastest ? '#F3ECFB' : 'transparent' }}>
                    <td>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        fontSize: '14px',
                        color: isFastest ? 'var(--fl)' : 'var(--ink-3)'
                      }}>
                        L{lap.lap_number}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="driver-chip">{lap.driver_number}</span>
                        <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{lap.first_name} {lap.last_name}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--ink-3)', fontSize: '13px' }}>{lap.team_name}</td>
                    <td style={{ color: 'var(--ink-3)', fontSize: '13px' }}>{lap.race_name}</td>
                    <td className="num">
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        fontSize: '14px',
                        color: isFastest ? 'var(--fl)' : 'var(--ink)'
                      }}>
                        {formatLapTime(lap.lap_time_seconds)}
                      </span>
                      {isMin && !isFastest && (
                        <span style={{ fontSize: '10px', color: 'var(--ink-3)', marginLeft: '4px' }}>min</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {isFastest ? (
                        <span className="fl-tag">FL</span>
                      ) : (
                        <span style={{ color: 'var(--line-strong)', fontSize: '12px' }}>—</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary btn-icon" onClick={() => openEdit(lap)} aria-label="Edit lap">
                          <Edit2 size={13} />
                        </button>
                        <button className="btn btn-danger btn-icon" onClick={() => handleDelete(lap.lap_id, lap.lap_number)} aria-label="Delete lap">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--ink-3)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, marginBottom: '6px' }}>NO LAP DATA</div>
                  <div style={{ fontSize: '13px' }}>No lap timing records found for this selection. Try another race or clear filters.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {laps.length > 0 && (
          <div style={{ padding: '10px 14px', background: 'var(--surface-2)', borderTop: 'var(--hairline)', fontSize: '12px', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
            Showing {laps.length} {laps.length === 1 ? 'lap' : 'laps'} · <span style={{ color: 'var(--fl)' }}>FL</span> = database-flagged fastest lap
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingLap(null); }}
        title={editingLap ? `Edit Lap #${editingLap.lap_number}` : 'Record Lap Time'}
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={LABEL}>Driver & Race Entry *</label>
            <select value={formData.result_id} onChange={e => setFormData({ ...formData, result_id: e.target.value })} className="select-field" required>
              <option value="">Select driver entry...</option>
              {results.map(r => (
                <option key={r.result_id} value={r.result_id}>
                  #{r.driver_number} {r.first_name} {r.last_name} — {r.team_name} ({r.race_name})
                </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={LABEL}>Lap Number *</label>
              <input type="number" min="1" value={formData.lap_number} onChange={e => setFormData({ ...formData, lap_number: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label style={LABEL}>Lap Time (seconds) *</label>
              <input type="number" step="0.001" min="10" value={formData.lap_time_seconds} onChange={e => setFormData({ ...formData, lap_time_seconds: e.target.value })} className="input-field" required />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'var(--surface-2)', border: 'var(--hairline)', borderRadius: 'var(--radius)' }}>
            <input
              type="checkbox"
              id="flCheck"
              checked={formData.is_fastest_lap}
              onChange={e => setFormData({ ...formData, is_fastest_lap: e.target.checked })}
              style={{ width: '16px', height: '16px', accentColor: 'var(--fl)', cursor: 'pointer' }}
            />
            <label htmlFor="flCheck" style={{ fontSize: '13px', color: 'var(--ink)', fontWeight: 500, cursor: 'pointer' }}>
              Mark as fastest lap of the Grand Prix <span className="fl-tag" style={{ marginLeft: '6px' }}>FL</span>
            </label>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px', borderTop: 'var(--hairline)' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">{editingLap ? 'Update Lap' : 'Save Lap'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
