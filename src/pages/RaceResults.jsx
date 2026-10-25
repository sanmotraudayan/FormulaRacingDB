import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import Modal from '../components/Modal';

const TEAM_ACCENTS = {
  'Apex Racing': '#00A896',
  'Velocity GP': '#D90500',
  'Titan Motorsport': '#E67300',
  'Nova Racing': '#0070D2'
};

function PosBadge({ pos }) {
  const cls = pos === 1 ? 'pos-badge pos-p1' : pos === 2 ? 'pos-badge pos-p2' : pos === 3 ? 'pos-badge pos-p3' : 'pos-badge pos-other';
  return <span className={cls} aria-label={`Position ${pos}`}>{pos || 'NC'}</span>;
}

function StatusChip({ status }) {
  if (status === 'FINISHED') return <span className="chip chip-ok">Finished</span>;
  if (status === 'DISQUALIFIED') return <span className="chip" style={{ background: 'var(--ink)', color: '#fff' }}>DSQ</span>;
  return <span className="chip chip-red">{status}</span>;
}

const FORM_DEFAULT = {
  race_id: '',
  driver_id: '',
  team_id: '',
  car_id: '',
  finishing_position: 1,
  points_awarded: 10,
  result_status: 'FINISHED',
  total_race_time_seconds: ''
};

export default function RaceResults({ selectedSeason, initialRaceId, onToast }) {
  const [results, setResults] = useState([]);
  const [races, setRaces] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [cars, setCars] = useState([]);
  const [selectedRaceId, setSelectedRaceId] = useState(initialRaceId || '');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingResult, setEditingResult] = useState(null);
  const [formData, setFormData] = useState(FORM_DEFAULT);

  const loadData = async () => {
    try {
      setLoading(true);
      const [racesData, driversData, teamsData, carsData] = await Promise.all([
        api.getRaces(selectedSeason),
        api.getDrivers(selectedSeason),
        api.getTeams(),
        api.getCars()
      ]);
      setRaces(racesData);
      setDrivers(driversData);
      setTeams(teamsData);
      setCars(carsData);

      const activeRaceId = selectedRaceId || racesData[0]?.race_id || '';
      if (!selectedRaceId && activeRaceId) setSelectedRaceId(activeRaceId);
      if (activeRaceId) {
        const rd = await api.getResults(activeRaceId);
        setResults(rd);
      }
    } catch (err) {
      onToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [selectedSeason]);

  useEffect(() => {
    if (selectedRaceId) {
      api.getResults(selectedRaceId)
        .then(setResults)
        .catch(err => onToast({ type: 'error', message: err.message }));
    }
  }, [selectedRaceId]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        finishing_position: formData.finishing_position ? parseInt(formData.finishing_position) : null,
        points_awarded: parseFloat(formData.points_awarded),
        total_race_time_seconds: formData.total_race_time_seconds ? parseFloat(formData.total_race_time_seconds) : null,
        car_id: formData.car_id || null
      };
      if (editingResult) {
        await api.updateResult(editingResult.result_id, payload);
        onToast({ type: 'success', message: 'Result updated.' });
      } else {
        await api.createResult(payload);
        onToast({ type: 'success', message: 'Result recorded.' });
      }
      setIsModalOpen(false);
      setEditingResult(null);
      const rd = await api.getResults(selectedRaceId);
      setResults(rd);
    } catch (err) {
      onToast({ type: 'error', message: err.message });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this result?')) return;
    try {
      await api.deleteResult(id);
      onToast({ type: 'success', message: 'Result deleted.' });
      setResults(results.filter(r => r.result_id !== id));
    } catch (err) {
      onToast({ type: 'error', message: err.message });
    }
  };

  const openAdd = () => {
    setEditingResult(null);
    setFormData({
      ...FORM_DEFAULT,
      race_id: selectedRaceId || races[0]?.race_id || '',
      driver_id: drivers[0]?.driver_id || '',
      team_id: teams[0]?.team_id || '',
      finishing_position: results.length + 1
    });
    setIsModalOpen(true);
  };

  const openEdit = (res) => {
    setEditingResult(res);
    setFormData({
      race_id: res.race_id,
      driver_id: res.driver_id,
      team_id: res.team_id,
      car_id: res.car_id || '',
      finishing_position: res.finishing_position,
      points_awarded: res.points_awarded,
      result_status: res.result_status,
      total_race_time_seconds: res.total_race_time_seconds || ''
    });
    setIsModalOpen(true);
  };

  const activeRace = races.find(r => r.race_id == selectedRaceId);
  const labelStyle = { display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink-3)', marginBottom: '4px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.04em' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Page Header */}
      <div>
        <div className="mono-tag">06 / RACE RESULTS</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px', marginTop: '4px' }}>
          <div>
            <h1 style={{ fontSize: '36px', lineHeight: 1.1 }}>RACE CLASSIFICATION</h1>
            <p style={{ color: 'var(--ink-3)', fontSize: '14px', marginTop: '4px' }}>
              Official finishing order, points and status for each Grand Prix.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <select
              value={selectedRaceId}
              onChange={e => setSelectedRaceId(e.target.value)}
              className="select-field"
              style={{ width: 'auto', minWidth: '220px', height: '36px', fontWeight: 600 }}
            >
              {races.map(r => (
                <option key={r.race_id} value={r.race_id}>
                  Rd {r.round_number} — {r.race_name}
                </option>
              ))}
            </select>
            <button className="btn btn-primary btn-sm" onClick={openAdd}>
              <Plus size={15} /> Add Result
            </button>
          </div>
        </div>
      </div>

      <hr className="section-rule" />

      {/* Race Context Strip */}
      {activeRace && (
        <div style={{
          background: 'var(--surface)',
          border: 'var(--hairline)',
          borderLeft: '4px solid var(--ink)',
          padding: '14px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <div className="mono-tag">Round {activeRace.round_number} · {activeRace.country}</div>
            <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-display)', textTransform: 'uppercase', marginTop: '2px', color: 'var(--ink)' }}>
              {activeRace.race_name}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--ink-3)', marginTop: '2px' }}>
              {activeRace.circuit_name} · {activeRace.scheduled_laps} laps scheduled
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ textAlign: 'right' }}>
              <div className="mono-tag">Classified</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 700, color: 'var(--ink)' }}>{results.length}</div>
            </div>
            {activeRace.race_status === 'COMPLETED'
              ? <span className="chip chip-ok">Completed</span>
              : activeRace.race_status === 'SCHEDULED'
              ? <span className="chip chip-scheduled">Scheduled</span>
              : <span className="chip chip-red">{activeRace.race_status}</span>
            }
          </div>
        </div>
      )}

      {/* Results Table */}
      <div className="data-table-container">
        <table className="data-table">
          <caption style={{ display: 'none' }}>Race classification for {activeRace?.race_name}</caption>
          <thead>
            <tr>
              <th style={{ width: '52px' }}>Pos</th>
              <th style={{ width: '52px' }}>No</th>
              <th>Driver</th>
              <th>Team & Car</th>
              <th className="num">Race Time</th>
              <th>Status</th>
              <th className="num">Pts</th>
              <th style={{ width: '80px' }}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [1,2,3,4,5].map(i => (
                <tr key={i}>
                  {[1,2,3,4,5,6,7,8].map(j => (
                    <td key={j}>
                      <div style={{ height: '14px', background: 'var(--surface-2)', borderRadius: '2px', width: j === 3 ? '140px' : '60px' }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : results.length > 0 ? (
              results.map(res => {
                const accent = TEAM_ACCENTS[res.team_name] || 'var(--ink-3)';
                return (
                  <tr key={res.result_id}>
                    <td><PosBadge pos={res.finishing_position} /></td>
                    <td><span className="driver-chip">{res.driver_number}</span></td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{res.first_name} {res.last_name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--ink-3)', marginTop: '1px' }}>{res.nationality}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="team-bar" style={{ background: accent }} />
                        <div>
                          <div style={{ fontWeight: 500, color: 'var(--ink-2)' }}>{res.team_name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--ink-3)' }}>
                            {res.car_model ? `${res.car_model}` : '—'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="num" style={{ color: 'var(--ink-2)', fontSize: '13px' }}>
                      {res.total_race_time_seconds ? `${Number(res.total_race_time_seconds).toFixed(3)}s` : '—'}
                    </td>
                    <td><StatusChip status={res.result_status} /></td>
                    <td className="num" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '16px', color: 'var(--ink)' }}>
                      {Number(res.points_awarded).toFixed(0)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary btn-icon" onClick={() => openEdit(res)} aria-label="Edit result">
                          <Edit2 size={13} />
                        </button>
                        <button className="btn btn-danger btn-icon" onClick={() => handleDelete(res.result_id)} aria-label="Delete result">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--ink-3)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, marginBottom: '6px' }}>NO RESULTS LOGGED</div>
                  <div style={{ fontSize: '13px' }}>No results recorded for this race. Add result entries above.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {results.length > 0 && (
          <div style={{ padding: '10px 14px', background: 'var(--surface-2)', borderTop: 'var(--hairline)', fontSize: '12px', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
            Showing {results.length} classified {results.length === 1 ? 'entry' : 'entries'}
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingResult(null); }}
        title={editingResult ? 'Edit Race Result' : 'Record Race Result'}
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={labelStyle}>Race *</label>
            <select value={formData.race_id} onChange={e => setFormData({ ...formData, race_id: e.target.value })} className="select-field" required>
              {races.map(r => <option key={r.race_id} value={r.race_id}>Rd {r.round_number} — {r.race_name}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Driver *</label>
              <select value={formData.driver_id} onChange={e => setFormData({ ...formData, driver_id: e.target.value })} className="select-field" required>
                {drivers.map(d => <option key={d.driver_id} value={d.driver_id}>#{d.driver_number} {d.first_name} {d.last_name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Team *</label>
              <select value={formData.team_id} onChange={e => setFormData({ ...formData, team_id: e.target.value })} className="select-field" required>
                {teams.map(t => <option key={t.team_id} value={t.team_id}>{t.team_name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Car (Optional)</label>
            <select value={formData.car_id} onChange={e => setFormData({ ...formData, car_id: e.target.value })} className="select-field">
              <option value="">— No car assigned —</option>
              {cars.map(c => <option key={c.car_id} value={c.car_id}>#{c.car_number} {c.car_model}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Finishing Position</label>
              <input type="number" min="1" value={formData.finishing_position || ''} onChange={e => setFormData({ ...formData, finishing_position: e.target.value })} className="input-field" />
            </div>
            <div>
              <label style={labelStyle}>Points Awarded *</label>
              <input type="number" step="0.5" min="0" value={formData.points_awarded} onChange={e => setFormData({ ...formData, points_awarded: e.target.value })} className="input-field" required />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={labelStyle}>Status *</label>
              <select value={formData.result_status} onChange={e => setFormData({ ...formData, result_status: e.target.value })} className="select-field">
                <option>FINISHED</option>
                <option>RETIRED</option>
                <option>DNF</option>
                <option>DNS</option>
                <option>DISQUALIFIED</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Race Time (seconds)</label>
              <input type="number" step="0.001" min="0" value={formData.total_race_time_seconds} onChange={e => setFormData({ ...formData, total_race_time_seconds: e.target.value })} className="input-field" placeholder="e.g. 5400.120" />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px', borderTop: 'var(--hairline)', marginTop: '4px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">{editingResult ? 'Update' : 'Save Result'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
