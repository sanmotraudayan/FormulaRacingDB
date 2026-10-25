import React, { useState, useEffect } from 'react';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';
import Modal from '../components/Modal';

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

export default function PenaltiesIncidents({ selectedSeason, onToast }) {
  const [penalties, setPenalties] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [results, setResults] = useState([]);
  const [races, setRaces] = useState([]);
  const [activeTab, setActiveTab] = useState('penalties');
  const [loading, setLoading] = useState(true);
  const [isPenaltyModalOpen, setIsPenaltyModalOpen] = useState(false);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);

  const [penaltyForm, setPenaltyForm] = useState({
    result_id: '',
    penalty_type: 'TIME PENALTY',
    penalty_description: 'Track limits violation',
    time_penalty_seconds: 5.0,
    position_penalty: 0
  });

  const [incidentForm, setIncidentForm] = useState({
    race_id: '',
    result_id: '',
    lap_number: 10,
    incident_type: 'TRACK LIMITS',
    description: '',
    safety_car_deployed: false
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [pensData, incsData, racesData, resultsData] = await Promise.all([
        api.getPenalties(),
        api.getIncidents(),
        api.getRaces(selectedSeason),
        api.getResults()
      ]);
      setPenalties(pensData);
      setIncidents(incsData);
      setRaces(racesData);
      setResults(resultsData);

      if (resultsData.length > 0 && !penaltyForm.result_id) {
        setPenaltyForm(prev => ({ ...prev, result_id: resultsData[0].result_id }));
      }
      if (racesData.length > 0 && !incidentForm.race_id) {
        setIncidentForm(prev => ({ ...prev, race_id: racesData[0].race_id }));
      }
    } catch (err) {
      onToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [selectedSeason]);

  const handleSavePenalty = async (e) => {
    e.preventDefault();
    try {
      await api.createPenalty(penaltyForm);
      onToast({ type: 'success', message: 'Penalty decision logged.' });
      setIsPenaltyModalOpen(false);
      loadData();
    } catch (err) {
      onToast({ type: 'error', message: err.message });
    }
  };

  const handleDeletePenalty = async (id) => {
    if (!window.confirm('Delete this penalty?')) return;
    try {
      await api.deletePenalty(id);
      onToast({ type: 'success', message: 'Penalty deleted.' });
      setPenalties(penalties.filter(p => p.penalty_id !== id));
    } catch (err) {
      onToast({ type: 'error', message: err.message });
    }
  };

  const handleSaveIncident = async (e) => {
    e.preventDefault();
    try {
      await api.createIncident(incidentForm);
      onToast({ type: 'success', message: 'Incident reported.' });
      setIsIncidentModalOpen(false);
      loadData();
    } catch (err) {
      onToast({ type: 'error', message: err.message });
    }
  };

  const handleDeleteIncident = async (id) => {
    if (!window.confirm('Delete this incident report?')) return;
    try {
      await api.deleteIncident(id);
      onToast({ type: 'success', message: 'Incident deleted.' });
      setIncidents(incidents.filter(i => i.incident_id !== id));
    } catch (err) {
      onToast({ type: 'error', message: err.message });
    }
  };

  const tabBtnStyle = (isActive) => ({
    padding: '6px 14px',
    fontFamily: 'var(--font-display)',
    fontSize: '13px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
    border: 'none',
    borderRadius: '2px',
    cursor: 'pointer',
    background: isActive ? 'var(--ink)' : 'transparent',
    color: isActive ? '#FFFFFF' : 'var(--ink-2)',
    transition: 'all 120ms ease-out'
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Page Header */}
      <div>
        <div className="mono-tag">09 / PENALTIES & INCIDENTS</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px', marginTop: '4px' }}>
          <div>
            <h1 style={{ fontSize: '36px', lineHeight: 1.1 }}>PENALTIES & INCIDENTS</h1>
            <p style={{ color: 'var(--ink-3)', fontSize: '14px', marginTop: '4px' }}>
              Stewards decisions, time penalties, grid drops and race incidents.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Tab Switcher */}
            <div style={{
              display: 'inline-flex',
              border: '1px solid var(--line-strong)',
              borderRadius: 'var(--radius)',
              background: 'var(--surface)',
              padding: '2px',
              gap: '2px'
            }}>
              <button onClick={() => setActiveTab('penalties')} style={tabBtnStyle(activeTab === 'penalties')}>
                Penalties ({penalties.length})
              </button>
              <button onClick={() => setActiveTab('incidents')} style={tabBtnStyle(activeTab === 'incidents')}>
                Incidents ({incidents.length})
              </button>
            </div>
            {activeTab === 'penalties' ? (
              <button className="btn btn-primary btn-sm" onClick={() => setIsPenaltyModalOpen(true)}>
                <Plus size={15} /> Log Penalty
              </button>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={() => setIsIncidentModalOpen(true)}>
                <Plus size={15} /> Report Incident
              </button>
            )}
          </div>
        </div>
      </div>

      <hr className="section-rule" />

      {/* Penalties Tab */}
      {activeTab === 'penalties' && (
        <div className="data-table-container">
          <table className="data-table">
            <caption style={{ display: 'none' }}>Stewards penalty decisions</caption>
            <thead>
              <tr>
                <th>Driver</th>
                <th>Grand Prix</th>
                <th>Penalty Type</th>
                <th>Description</th>
                <th className="num">Time Penalty</th>
                <th className="num">Grid Drop</th>
                <th style={{ width: '56px' }}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3].map(i => (
                  <tr key={i}>
                    {[1,2,3,4,5,6,7].map(j => (
                      <td key={j}><div style={{ height: '14px', background: 'var(--surface-2)', borderRadius: '2px' }} /></td>
                    ))}
                  </tr>
                ))
              ) : penalties.length > 0 ? (
                penalties.map(p => (
                  <tr key={p.penalty_id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="driver-chip">{p.driver_number}</span>
                        <div>
                          <div style={{ fontWeight: 500, color: 'var(--ink)' }}>{p.first_name} {p.last_name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--ink-3)' }}>{p.team_name}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--ink-2)', fontSize: '13px' }}>{p.race_name}</td>
                    <td>
                      <span className="chip chip-warn">{p.penalty_type}</span>
                    </td>
                    <td style={{ color: 'var(--ink-3)', fontSize: '13px', maxWidth: '260px', whiteSpace: 'normal', lineHeight: 1.4 }}>
                      {p.penalty_description || 'Regulation breach'}
                    </td>
                    <td className="num" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: p.time_penalty_seconds > 0 ? 'var(--warn)' : 'var(--ink-3)' }}>
                      {p.time_penalty_seconds > 0 ? `+${Number(p.time_penalty_seconds).toFixed(0)}s` : '—'}
                    </td>
                    <td className="num" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: p.position_penalty > 0 ? 'var(--warn)' : 'var(--ink-3)' }}>
                      {p.position_penalty > 0 ? `+${p.position_penalty}` : '—'}
                    </td>
                    <td>
                      <button className="btn btn-danger btn-icon" onClick={() => handleDeletePenalty(p.penalty_id)} aria-label="Delete penalty">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--ink-3)' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, marginBottom: '6px' }}>NO PENALTIES RECORDED</div>
                    <div style={{ fontSize: '13px' }}>No penalties recorded for this selection. Try another race or clear filters.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {penalties.length > 0 && (
            <div style={{ padding: '10px 14px', background: 'var(--surface-2)', borderTop: 'var(--hairline)', fontSize: '12px', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
              {penalties.length} stewards {penalties.length === 1 ? 'decision' : 'decisions'}
            </div>
          )}
        </div>
      )}

      {/* Incidents Tab */}
      {activeTab === 'incidents' && (
        <div className="data-table-container">
          <table className="data-table">
            <caption style={{ display: 'none' }}>Race incidents log</caption>
            <thead>
              <tr>
                <th>Grand Prix</th>
                <th style={{ width: '70px' }}>Lap</th>
                <th>Type</th>
                <th>Driver Involved</th>
                <th>Description</th>
                <th style={{ textAlign: 'center' }}>Safety Car</th>
                <th style={{ width: '56px' }}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3].map(i => (
                  <tr key={i}>
                    {[1,2,3,4,5,6,7].map(j => (
                      <td key={j}><div style={{ height: '14px', background: 'var(--surface-2)', borderRadius: '2px' }} /></td>
                    ))}
                  </tr>
                ))
              ) : incidents.length > 0 ? (
                incidents.map(inc => (
                  <tr key={inc.incident_id}>
                    <td style={{ fontWeight: 500, color: 'var(--ink)' }}>{inc.race_name}</td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--ink-3)', fontSize: '13px' }}>
                        {inc.lap_number ? `L${inc.lap_number}` : 'Pre'}
                      </span>
                    </td>
                    <td>
                      <span className="chip chip-warn" style={{ fontSize: '11px' }}>{inc.incident_type}</span>
                    </td>
                    <td>
                      {inc.first_name ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="driver-chip">{inc.driver_number}</span>
                          <span style={{ color: 'var(--ink-2)', fontSize: '13px' }}>{inc.first_name} {inc.last_name}</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--ink-3)', fontSize: '13px' }}>Multiple / Track</span>
                      )}
                    </td>
                    <td style={{ color: 'var(--ink-3)', fontSize: '13px', maxWidth: '240px', whiteSpace: 'normal', lineHeight: 1.4 }}>
                      {inc.description || 'Under investigation'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {inc.safety_car_deployed ? (
                        <span className="chip chip-warn" style={{ fontSize: '11px', gap: '4px' }}>
                          <AlertTriangle size={11} /> SC
                        </span>
                      ) : (
                        <span style={{ color: 'var(--line-strong)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>—</span>
                      )}
                    </td>
                    <td>
                      <button className="btn btn-danger btn-icon" onClick={() => handleDeleteIncident(inc.incident_id)} aria-label="Delete incident">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--ink-3)' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, marginBottom: '6px' }}>NO INCIDENTS REPORTED</div>
                    <div style={{ fontSize: '13px' }}>No race incidents reported for this selection.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {incidents.length > 0 && (
            <div style={{ padding: '10px 14px', background: 'var(--surface-2)', borderTop: 'var(--hairline)', fontSize: '12px', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
              {incidents.length} reported {incidents.length === 1 ? 'incident' : 'incidents'}
            </div>
          )}
        </div>
      )}

      {/* Penalty Modal */}
      <Modal
        isOpen={isPenaltyModalOpen}
        onClose={() => setIsPenaltyModalOpen(false)}
        title="Issue Penalty Decision"
      >
        <form onSubmit={handleSavePenalty} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={LABEL}>Driver & Race Entry *</label>
            <select value={penaltyForm.result_id} onChange={e => setPenaltyForm({ ...penaltyForm, result_id: e.target.value })} className="select-field" required>
              <option value="">Select driver...</option>
              {results.map(r => (
                <option key={r.result_id} value={r.result_id}>
                  #{r.driver_number} {r.first_name} {r.last_name} — {r.team_name} ({r.race_name})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={LABEL}>Penalty Type *</label>
            <select value={penaltyForm.penalty_type} onChange={e => setPenaltyForm({ ...penaltyForm, penalty_type: e.target.value })} className="select-field">
              <option>TIME PENALTY</option>
              <option>GRID PENALTY</option>
              <option>STOP AND GO</option>
              <option>DRIVE THROUGH</option>
              <option>WARNING</option>
              <option>DISQUALIFIED</option>
            </select>
          </div>
          <div>
            <label style={LABEL}>Description *</label>
            <input type="text" placeholder="e.g. Causing a collision at Turn 1" value={penaltyForm.penalty_description} onChange={e => setPenaltyForm({ ...penaltyForm, penalty_description: e.target.value })} className="input-field" required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={LABEL}>Time Penalty (s)</label>
              <input type="number" step="1" min="0" value={penaltyForm.time_penalty_seconds} onChange={e => setPenaltyForm({ ...penaltyForm, time_penalty_seconds: parseFloat(e.target.value) })} className="input-field" />
            </div>
            <div>
              <label style={LABEL}>Grid Drop (positions)</label>
              <input type="number" min="0" value={penaltyForm.position_penalty} onChange={e => setPenaltyForm({ ...penaltyForm, position_penalty: parseInt(e.target.value) })} className="input-field" />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px', borderTop: 'var(--hairline)' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsPenaltyModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Issue Penalty</button>
          </div>
        </form>
      </Modal>

      {/* Incident Modal */}
      <Modal
        isOpen={isIncidentModalOpen}
        onClose={() => setIsIncidentModalOpen(false)}
        title="Report Race Incident"
      >
        <form onSubmit={handleSaveIncident} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={LABEL}>Grand Prix *</label>
            <select value={incidentForm.race_id} onChange={e => setIncidentForm({ ...incidentForm, race_id: e.target.value })} className="select-field" required>
              {races.map(r => <option key={r.race_id} value={r.race_id}>{r.race_name}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={LABEL}>Incident Type *</label>
              <select value={incidentForm.incident_type} onChange={e => setIncidentForm({ ...incidentForm, incident_type: e.target.value })} className="select-field">
                <option>TRACK LIMITS</option>
                <option>COLLISION</option>
                <option>DEBRIS</option>
                <option>UNSAFE RELEASE</option>
                <option>MECHANICAL FAILURE</option>
                <option>YELLOW FLAG</option>
              </select>
            </div>
            <div>
              <label style={LABEL}>Lap Number</label>
              <input type="number" min="1" value={incidentForm.lap_number} onChange={e => setIncidentForm({ ...incidentForm, lap_number: parseInt(e.target.value) })} className="input-field" />
            </div>
          </div>
          <div>
            <label style={LABEL}>Description *</label>
            <input type="text" placeholder="e.g. Contact between cars at Turn 4" value={incidentForm.description} onChange={e => setIncidentForm({ ...incidentForm, description: e.target.value })} className="input-field" required />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', background: 'var(--surface-2)', border: 'var(--hairline)', borderRadius: 'var(--radius)' }}>
            <input
              type="checkbox"
              id="scCheck"
              checked={incidentForm.safety_car_deployed}
              onChange={e => setIncidentForm({ ...incidentForm, safety_car_deployed: e.target.checked })}
              style={{ width: '16px', height: '16px', accentColor: 'var(--warn)', cursor: 'pointer' }}
            />
            <label htmlFor="scCheck" style={{ fontSize: '13px', color: 'var(--ink)', fontWeight: 500, cursor: 'pointer' }}>
              Safety car or virtual safety car deployed
            </label>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px', borderTop: 'var(--hairline)' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsIncidentModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Report Incident</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
