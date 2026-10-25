import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import Modal from '../components/Modal';

const TEAM_ACCENTS = {
  'Apex Racing': '#00A896',
  'Velocity GP': '#D90500',
  'Titan Motorsport': '#E67300',
  'Nova Racing': '#0070D2'
};

export default function Drivers({ selectedSeason, initialSearch = '', onToast }) {
  const [drivers, setDrivers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [championships, setChampionships] = useState([]);
  const [search, setSearch] = useState(initialSearch);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialSearch !== undefined) {
      setSearch(initialSearch);
    }
  }, [initialSearch]);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    nationality: '',
    date_of_birth: '2000-01-01',
    driver_number: 99,
    team_id: '',
    championship_id: ''
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [driversData, teamsData, champsData] = await Promise.all([
        api.getDrivers(selectedSeason),
        api.getTeams(),
        api.getChampionships()
      ]);
      setDrivers(driversData);
      setTeams(teamsData);
      setChampionships(champsData);

      if (!formData.championship_id && champsData.length > 0) {
        setFormData(prev => ({
          ...prev,
          championship_id: champsData[0].championship_id,
          team_id: teamsData[0]?.team_id || ''
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

  const handleSaveDriver = async (e) => {
    e.preventDefault();
    try {
      if (editingDriver) {
        await api.updateDriver(editingDriver.driver_id, formData);
        onToast({ type: 'success', message: `Driver "${formData.first_name} ${formData.last_name}" updated.` });
      } else {
        await api.createDriver(formData);
        onToast({ type: 'success', message: `Driver #${formData.driver_number} "${formData.first_name} ${formData.last_name}" registered.` });
      }
      setIsModalOpen(false);
      setEditingDriver(null);
      loadData();
    } catch (err) {
      onToast({ type: 'error', message: err.message });
    }
  };

  const handleDeleteDriver = async (driverId, driverName) => {
    if (!window.confirm(`Delete driver "${driverName}"? Note: Cannot delete if race results reference this driver.`)) return;
    try {
      await api.deleteDriver(driverId);
      onToast({ type: 'success', message: `Driver "${driverName}" deleted.` });
      loadData();
    } catch (err) {
      onToast({ type: 'error', message: `Deletion failed: ${err.message}` });
    }
  };

  const openAdd = () => {
    setEditingDriver(null);
    setFormData({
      first_name: '',
      last_name: '',
      nationality: 'British',
      date_of_birth: '2001-05-15',
      driver_number: (Math.floor(Math.random() * 80) + 10),
      team_id: teams[0]?.team_id || '',
      championship_id: championships[0]?.championship_id || ''
    });
    setIsModalOpen(true);
  };

  const openEdit = (d) => {
    setEditingDriver(d);
    setFormData({
      first_name: d.first_name,
      last_name: d.last_name,
      nationality: d.nationality,
      date_of_birth: d.date_of_birth ? d.date_of_birth.split('T')[0] : '',
      driver_number: d.driver_number,
      team_id: d.team_id || '',
      championship_id: championships[0]?.championship_id || ''
    });
    setIsModalOpen(true);
  };

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const diff = Date.now() - birthDate.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const filtered = drivers.filter(d => 
    `${d.first_name} ${d.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    d.nationality?.toLowerCase().includes(search.toLowerCase()) ||
    d.team_name?.toLowerCase().includes(search.toLowerCase()) ||
    d.driver_number?.toString().includes(search)
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header Pattern */}
      <div>
        <div className="mono-tag">04 / DRIVERS</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px', marginTop: '4px' }}>
          <div>
            <h1 style={{ fontSize: '36px', lineHeight: 1.1 }}>
              GRID DRIVERS
            </h1>
            <p style={{ color: 'var(--ink-3)', fontSize: '14px', marginTop: '4px' }}>
              FIA Superlicense driver roster, age, nationality, and season championship points.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ position: 'relative', width: '220px' }}>
              <Search size={14} color="var(--ink-3)" style={{ position: 'absolute', left: '10px', top: '10px' }} />
              <input
                type="text"
                placeholder="Filter drivers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '30px', height: '34px', fontSize: '13px' }}
              />
            </div>

            <button className="btn btn-primary btn-sm" onClick={openAdd}>
              <Plus size={15} /> Register Driver
            </button>
          </div>
        </div>
      </div>

      <hr className="section-rule" />

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '50px' }}>NO</th>
              <th>DRIVER</th>
              <th>NATIONALITY</th>
              <th className="num" style={{ width: '60px' }}>AGE</th>
              <th>CONSTRUCTOR</th>
              <th className="num" style={{ width: '70px' }}>WINS</th>
              <th className="num" style={{ width: '70px' }}>PODIUMS</th>
              <th className="num" style={{ width: '80px' }}>POINTS</th>
              <th style={{ textAlign: 'right', width: '90px' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map(d => {
                const accentColor = TEAM_ACCENTS[d.team_name] || 'var(--ink-3)';
                const age = calculateAge(d.date_of_birth);

                return (
                  <tr key={d.driver_id}>
                    <td>
                      <span className="driver-chip">{d.driver_number}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--ink)' }}>
                        {d.first_name} {d.last_name}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--ink-3)', fontSize: '13px' }}>
                        {d.nationality}
                      </span>
                    </td>
                    <td className="num">{age}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span className="team-bar" style={{ background: accentColor }} />
                        <span style={{ color: 'var(--ink)' }}>{d.team_name || 'Free Agent'}</span>
                      </div>
                    </td>
                    <td className="num">{d.season_wins || 0}</td>
                    <td className="num">{d.season_podiums || 0}</td>
                    <td className="num" style={{ fontWeight: 700, color: 'var(--ink)', fontSize: '15px' }}>
                      {Number(d.season_points || 0).toFixed(0)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                        <button className="btn btn-secondary btn-icon" onClick={() => openEdit(d)} title="Edit Driver">
                          <Edit2 size={13} />
                        </button>
                        <button className="btn btn-danger btn-icon" onClick={() => handleDeleteDriver(d.driver_id, `${d.first_name} ${d.last_name}`)} title="Delete Driver">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: 'var(--ink-3)' }}>
                  {loading ? 'Reading drivers list...' : 'No drivers matching filter.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Result Count Status */}
      <div style={{ fontSize: '12px', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
        Showing {filtered.length} of {drivers.length} registered drivers
      </div>

      {/* Add / Edit Driver Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDriver ? `Edit Driver: ${editingDriver.first_name} ${editingDriver.last_name}` : 'Register Driver'}
      >
        <form onSubmit={handleSaveDriver} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
                First Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Liam"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
                Last Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Lawson"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
                Driver Number (1-99) *
              </label>
              <input
                type="number"
                min="1"
                max="99"
                value={formData.driver_number}
                onChange={(e) => setFormData({ ...formData, driver_number: parseInt(e.target.value) })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
                Nationality *
              </label>
              <input
                type="text"
                placeholder="e.g. New Zealander, British"
                value={formData.nationality}
                onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
              Date of Birth
            </label>
            <input
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              className="input-field"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
                Assign to Team
              </label>
              <select
                value={formData.team_id}
                onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
                className="select-field"
              >
                <option value="">-- Free Agent (None) --</option>
                {teams.map(t => (
                  <option key={t.team_id} value={t.team_id}>
                    {t.team_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
                Championship Season
              </label>
              <select
                value={formData.championship_id}
                onChange={(e) => setFormData({ ...formData, championship_id: e.target.value })}
                className="select-field"
              >
                {championships.map(c => (
                  <option key={c.championship_id} value={c.championship_id}>
                    {c.season_year} ({c.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingDriver ? 'Save Driver' : 'Register Driver'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
