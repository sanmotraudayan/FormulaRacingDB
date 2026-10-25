import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ExternalLink } from 'lucide-react';
import { api } from '../services/api';
import Modal from '../components/Modal';

export default function Races({ selectedSeason, initialSearch = '', onNavigateWithFilter, onToast }) {
  const [races, setRaces] = useState([]);
  const [circuits, setCircuits] = useState([]);
  const [championships, setChampionships] = useState([]);
  const [search, setSearch] = useState(initialSearch);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialSearch !== undefined) {
      setSearch(initialSearch);
    }
  }, [initialSearch]);

  // Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isCircuitAddOpen, setIsCircuitAddOpen] = useState(false);
  const [editingRace, setEditingRace] = useState(null);

  const [formData, setFormData] = useState({
    championship_id: '',
    circuit_id: '',
    race_name: '',
    round_number: '',
    race_date: '',
    scheduled_laps: 50,
    race_status: 'SCHEDULED'
  });

  const [circuitFormData, setCircuitFormData] = useState({
    circuit_name: '',
    country: '',
    city: '',
    circuit_length_km: 5.0,
    number_of_turns: 16
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [racesData, circuitsData, champsData] = await Promise.all([
        api.getRaces(selectedSeason),
        api.getCircuits(),
        api.getChampionships()
      ]);
      setRaces(racesData);
      setCircuits(circuitsData);
      setChampionships(champsData);

      if (champsData.length > 0 && !formData.championship_id) {
        setFormData(prev => ({
          ...prev,
          championship_id: champsData[0].championship_id,
          circuit_id: circuitsData[0]?.circuit_id || ''
        }));
      }
    } catch (err) {
      onToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedSeason]);

  const handleSaveRace = async (e) => {
    e.preventDefault();
    try {
      if (editingRace) {
        await api.updateRace(editingRace.race_id, formData);
        onToast({ type: 'success', message: `Race "${formData.race_name}" updated.` });
      } else {
        await api.createRace(formData);
        onToast({ type: 'success', message: `Grand Prix "${formData.race_name}" scheduled.` });
      }
      setIsAddOpen(false);
      setEditingRace(null);
      loadData();
    } catch (err) {
      onToast({ type: 'error', message: err.message });
    }
  };

  const handleDeleteRace = async (raceId, raceName) => {
    if (!window.confirm(`Delete "${raceName}" and related results?`)) return;
    try {
      await api.deleteRace(raceId);
      onToast({ type: 'success', message: `Race "${raceName}" deleted.` });
      loadData();
    } catch (err) {
      onToast({ type: 'error', message: `Cannot delete: ${err.message}` });
    }
  };

  const handleSaveCircuit = async (e) => {
    e.preventDefault();
    try {
      await api.createCircuit(circuitFormData);
      onToast({ type: 'success', message: `Circuit "${circuitFormData.circuit_name}" registered.` });
      setIsCircuitAddOpen(false);
      loadData();
    } catch (err) {
      onToast({ type: 'error', message: err.message });
    }
  };

  const openEdit = (race) => {
    setEditingRace(race);
    setFormData({
      championship_id: race.championship_id,
      circuit_id: race.circuit_id,
      race_name: race.race_name,
      round_number: race.round_number,
      race_date: race.race_date ? race.race_date.split('T')[0] : '',
      scheduled_laps: race.scheduled_laps,
      race_status: race.race_status
    });
    setIsAddOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div className="mono-tag">05 / RACES &amp; CIRCUITS</div>
            <h1 style={{ fontSize: '36px', lineHeight: 1.1, marginTop: '2px' }}>
              RACE CALENDAR &amp; CIRCUITS
            </h1>
            <p style={{ color: 'var(--ink-3)', fontSize: '14px', marginTop: '4px' }}>
              Official championship rounds, track lengths, turn counts, and session statuses.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={() => setIsCircuitAddOpen(true)}>
              + Add Circuit
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => {
                setEditingRace(null);
                setFormData({
                  championship_id: championships[0]?.championship_id || 1,
                  circuit_id: circuits[0]?.circuit_id || 1,
                  race_name: '',
                  round_number: (races.length + 1),
                  race_date: new Date().toISOString().split('T')[0],
                  scheduled_laps: 50,
                  race_status: 'SCHEDULED'
                });
                setIsAddOpen(true);
              }}
            >
              <Plus size={15} /> Schedule Grand Prix
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Split: Race Table & Circuits Side Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', alignItems: 'start' }}>
        
        {/* Race Calendar Table */}
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '45px' }}>RND</th>
                <th>GRAND PRIX</th>
                <th>CIRCUIT &amp; LOCATION</th>
                <th>DATE</th>
                <th className="num" style={{ width: '60px' }}>LAPS</th>
                <th style={{ width: '100px' }}>STATUS</th>
                <th style={{ textAlign: 'right', width: '130px' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {races
                .filter(r => !search || 
                  r.race_name?.toLowerCase().includes(search.toLowerCase()) || 
                  r.circuit_name?.toLowerCase().includes(search.toLowerCase()) ||
                  r.country?.toLowerCase().includes(search.toLowerCase())
                )
                .map(race => {
                const isCompleted = race.race_status === 'COMPLETED';
                const isInProgress = race.race_status === 'IN_PROGRESS';
                const statusClass = isCompleted ? 'chip-ok' : isInProgress ? 'chip-warn' : 'chip-scheduled';

                return (
                  <tr key={race.race_id}>
                    <td>
                      <span className="driver-chip" style={{ fontWeight: 800 }}>
                        {race.round_number}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--ink)' }}>
                        {race.race_name}
                      </div>
                      {race.winner_first_name && (
                        <div style={{ fontSize: '11px', color: 'var(--ink-3)' }}>
                          Winner: {race.winner_first_name} {race.winner_last_name}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ color: 'var(--ink)' }}>{race.circuit_name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--ink-3)' }}>
                        {race.city ? `${race.city}, ` : ''}{race.country}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', color: 'var(--ink-2)' }}>
                        {race.race_date ? new Date(race.race_date).toLocaleDateString() : 'TBD'}
                      </span>
                    </td>
                    <td className="num">{race.scheduled_laps}</td>
                    <td>
                      <span className={`chip ${statusClass}`}>
                        {race.race_status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => onNavigateWithFilter('results', { raceId: race.race_id })}
                          style={{ padding: '3px 8px', fontSize: '12px' }}
                          title="View Results"
                        >
                          Results
                        </button>
                        <button 
                          className="btn btn-secondary btn-icon"
                          style={{ width: '26px', height: '26px' }}
                          onClick={() => openEdit(race)}
                          title="Edit Race"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button 
                          className="btn btn-danger btn-icon"
                          style={{ width: '26px', height: '26px' }}
                          onClick={() => handleDeleteRace(race.race_id, race.race_name)}
                          title="Delete Race"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Circuits Side Panel */}
        <div className="panel-box">
          <div className="mono-tag" style={{ marginBottom: '8px' }}>FIA HOMOLOGATED CIRCUITS</div>
          <h3 style={{ fontSize: '18px', marginBottom: '12px' }}>TRACK PROFILES</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {circuits
              .filter(c => !search || 
                c.circuit_name?.toLowerCase().includes(search.toLowerCase()) || 
                c.country?.toLowerCase().includes(search.toLowerCase()) || 
                c.city?.toLowerCase().includes(search.toLowerCase())
              )
              .map(c => (
              <div 
                key={c.circuit_id}
                style={{
                  padding: '8px 10px',
                  background: 'var(--surface-2)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--radius)',
                  fontSize: '13px'
                }}
              >
                <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{c.circuit_name}</div>
                <div style={{ fontSize: '12px', color: 'var(--ink-3)', marginTop: '2px' }}>
                  {c.country} &bull; <span className="num">{c.circuit_length_km}</span> km &bull; <span className="num">{c.number_of_turns}</span> turns
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Add / Edit Race Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title={editingRace ? `Edit Race: ${editingRace.race_name}` : 'Schedule Grand Prix'}
      >
        <form onSubmit={handleSaveRace} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
              Championship Season *
            </label>
            <select
              value={formData.championship_id}
              onChange={(e) => setFormData({ ...formData, championship_id: e.target.value })}
              className="select-field"
              required
            >
              {championships.map(c => (
                <option key={c.championship_id} value={c.championship_id}>
                  {c.championship_name} ({c.season_year})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
              Circuit *
            </label>
            <select
              value={formData.circuit_id}
              onChange={(e) => setFormData({ ...formData, circuit_id: e.target.value })}
              className="select-field"
              required
            >
              {circuits.map(c => (
                <option key={c.circuit_id} value={c.circuit_id}>
                  {c.circuit_name} ({c.country} - {c.circuit_length_km} km)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
              Grand Prix Name *
            </label>
            <input
              type="text"
              placeholder="e.g. British Grand Prix"
              value={formData.race_name}
              onChange={(e) => setFormData({ ...formData, race_name: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
                Round Number *
              </label>
              <input
                type="number"
                min="1"
                value={formData.round_number}
                onChange={(e) => setFormData({ ...formData, round_number: parseInt(e.target.value) })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
                Race Date *
              </label>
              <input
                type="date"
                value={formData.race_date}
                onChange={(e) => setFormData({ ...formData, race_date: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
                Scheduled Laps *
              </label>
              <input
                type="number"
                min="1"
                value={formData.scheduled_laps}
                onChange={(e) => setFormData({ ...formData, scheduled_laps: parseInt(e.target.value) })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
                Status *
              </label>
              <select
                value={formData.race_status}
                onChange={(e) => setFormData({ ...formData, race_status: e.target.value })}
                className="select-field"
              >
                <option value="SCHEDULED">SCHEDULED</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingRace ? 'Save Changes' : 'Schedule Race'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Circuit Modal */}
      <Modal
        isOpen={isCircuitAddOpen}
        onClose={() => setIsCircuitAddOpen(false)}
        title="Register Circuit"
      >
        <form onSubmit={handleSaveCircuit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
              Circuit Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Silverstone Circuit"
              value={circuitFormData.circuit_name}
              onChange={(e) => setCircuitFormData({ ...circuitFormData, circuit_name: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
                Country *
              </label>
              <input
                type="text"
                placeholder="e.g. United Kingdom"
                value={circuitFormData.country}
                onChange={(e) => setCircuitFormData({ ...circuitFormData, country: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
                City
              </label>
              <input
                type="text"
                placeholder="e.g. Silverstone"
                value={circuitFormData.city}
                onChange={(e) => setCircuitFormData({ ...circuitFormData, city: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
                Length (km) *
              </label>
              <input
                type="number"
                step="0.001"
                min="0.1"
                value={circuitFormData.circuit_length_km}
                onChange={(e) => setCircuitFormData({ ...circuitFormData, circuit_length_km: parseFloat(e.target.value) })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
                Number of Turns *
              </label>
              <input
                type="number"
                min="1"
                value={circuitFormData.number_of_turns}
                onChange={(e) => setCircuitFormData({ ...circuitFormData, number_of_turns: parseInt(e.target.value) })}
                className="input-field"
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsCircuitAddOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Circuit
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
