import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Car, Users } from 'lucide-react';
import { api } from '../services/api';
import Modal from '../components/Modal';

const TEAM_ACCENTS = {
  'Apex Racing': '#00A896',
  'Velocity GP': '#D90500',
  'Titan Motorsport': '#E67300',
  'Nova Racing': '#0070D2'
};

export default function Teams({ initialSearch = '', onToast }) {
  const [teams, setTeams] = useState([]);
  const [search, setSearch] = useState(initialSearch);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialSearch !== undefined) {
      setSearch(initialSearch);
    }
  }, [initialSearch]);

  // Modals
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [isCarModalOpen, setIsCarModalOpen] = useState(false);
  const [selectedTeamForCar, setSelectedTeamForCar] = useState(null);

  const [teamForm, setTeamForm] = useState({
    team_name: '',
    base_country: '',
    team_principal: '',
    founded_year: 2010
  });

  const [carForm, setCarForm] = useState({
    team_id: '',
    car_number: 10,
    car_model: 'Challenger 26',
    engine_manufacturer: 'Ferrari'
  });

  const loadTeams = async () => {
    try {
      setLoading(true);
      const data = await api.getTeams();
      setTeams(data);
    } catch (err) {
      onToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  const handleSaveTeam = async (e) => {
    e.preventDefault();
    try {
      if (editingTeam) {
        await api.updateTeam(editingTeam.team_id, teamForm);
        onToast({ type: 'success', message: `Team "${teamForm.team_name}" updated.` });
      } else {
        await api.createTeam(teamForm);
        onToast({ type: 'success', message: `Team "${teamForm.team_name}" registered.` });
      }
      setIsTeamModalOpen(false);
      setEditingTeam(null);
      loadTeams();
    } catch (err) {
      onToast({ type: 'error', message: err.message });
    }
  };

  const handleDeleteTeam = async (teamId, teamName) => {
    if (!window.confirm(`Delete team "${teamName}" and associated cars/roster?`)) return;
    try {
      await api.deleteTeam(teamId);
      onToast({ type: 'success', message: `Team "${teamName}" deleted.` });
      loadTeams();
    } catch (err) {
      onToast({ type: 'error', message: err.message });
    }
  };

  const handleSaveCar = async (e) => {
    e.preventDefault();
    try {
      await api.createCar(carForm);
      onToast({ type: 'success', message: `Car #${carForm.car_number} registered.` });
      setIsCarModalOpen(false);
      loadTeams();
    } catch (err) {
      onToast({ type: 'error', message: err.message });
    }
  };

  const handleDeleteCar = async (carId, carNumber) => {
    if (!window.confirm(`Delete Car #${carNumber}?`)) return;
    try {
      await api.deleteCar(carId);
      onToast({ type: 'success', message: `Car #${carNumber} deleted.` });
      loadTeams();
    } catch (err) {
      onToast({ type: 'error', message: err.message });
    }
  };

  const openEditTeam = (team) => {
    setEditingTeam(team);
    setTeamForm({
      team_name: team.team_name,
      base_country: team.base_country,
      team_principal: team.team_principal || '',
      founded_year: team.founded_year || 2010
    });
    setIsTeamModalOpen(true);
  };

  const openAddCar = (team) => {
    setSelectedTeamForCar(team);
    setCarForm({
      team_id: team.team_id,
      car_number: (team.cars.length > 0 ? team.cars[team.cars.length - 1].car_number + 1 : 11),
      car_model: `${team.team_name.split(' ')[0]} AR26`,
      engine_manufacturer: 'Apex Power'
    });
    setIsCarModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header Pattern */}
      <div>
        <div className="mono-tag">03 / TEAMS</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px', marginTop: '4px' }}>
          <div>
            <h1 style={{ fontSize: '36px', lineHeight: 1.1 }}>
              CONSTRUCTOR TEAMS
            </h1>
            <p style={{ color: 'var(--ink-3)', fontSize: '14px', marginTop: '4px' }}>
              Championship constructors, driver pairings, chassis models, and power units.
            </p>
          </div>

          <button 
            className="btn btn-primary btn-sm"
            onClick={() => {
              setEditingTeam(null);
              setTeamForm({ team_name: '', base_country: '', team_principal: '', founded_year: 2020 });
              setIsTeamModalOpen(true);
            }}
          >
            <Plus size={15} /> Register Team
          </button>
        </div>
      </div>

      <hr className="section-rule" />

      {/* Grid of Compact Constructor Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '16px' }}>
        {teams
          .filter(t => !search || 
            t.team_name?.toLowerCase().includes(search.toLowerCase()) || 
            t.base_country?.toLowerCase().includes(search.toLowerCase()) ||
            t.team_principal?.toLowerCase().includes(search.toLowerCase()) ||
            t.drivers?.some(d => `${d.first_name} ${d.last_name}`.toLowerCase().includes(search.toLowerCase()))
          )
          .map(team => {
            const accentColor = TEAM_ACCENTS[team.team_name] || 'var(--ink-3)';

          return (
            <div 
              key={team.team_id}
              className="panel-box"
              style={{
                borderLeft: `4px solid ${accentColor}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '16px 18px'
              }}
            >
              <div>
                {/* Title & Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '20px', color: 'var(--ink)', fontWeight: 800 }}>
                      {team.team_name}
                    </h3>
                    <div style={{ fontSize: '13px', color: 'var(--ink-3)', marginTop: '2px' }}>
                      {team.base_country} &bull; Founded {team.founded_year || 'N/A'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button className="btn btn-secondary btn-icon" onClick={() => openEditTeam(team)} title="Edit Team">
                      <Edit2 size={13} />
                    </button>
                    <button className="btn btn-danger btn-icon" onClick={() => handleDeleteTeam(team.team_id, team.team_name)} title="Delete Team">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Team Principal & Points */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  background: 'var(--surface-2)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius)',
                  marginTop: '12px',
                  border: '1px solid var(--line)'
                }}>
                  <div>
                    <div className="mono-tag" style={{ fontSize: '10px' }}>PRINCIPAL</div>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--ink)' }}>
                      {team.team_principal || 'Vacant'}
                    </div>
                  </div>
                  <div>
                    <div className="mono-tag" style={{ fontSize: '10px' }}>ALL-TIME POINTS</div>
                    <div style={{ fontWeight: 700, fontSize: '15px', fontFamily: 'var(--font-mono)', color: 'var(--ink)' }}>
                      {Number(team.all_time_points || 0).toFixed(0)} PTS
                    </div>
                  </div>
                </div>

                {/* Driver Roster */}
                <div style={{ marginTop: '12px' }}>
                  <div className="mono-tag" style={{ marginBottom: '6px' }}>DRIVER LINEUP</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {team.drivers && team.drivers.length > 0 ? (
                      team.drivers.map(d => (
                        <div 
                          key={d.team_driver_id}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'var(--surface)',
                            border: '1px solid var(--line-strong)',
                            padding: '3px 8px',
                            borderRadius: '2px',
                            fontSize: '13px'
                          }}
                        >
                          <span className="driver-chip" style={{ fontSize: '11px', padding: '0 4px' }}>
                            {d.driver_number}
                          </span>
                          <span style={{ fontWeight: 500, color: 'var(--ink)' }}>
                            {d.first_name} {d.last_name}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span style={{ fontSize: '12px', color: 'var(--ink-3)' }}>No drivers assigned</span>
                    )}
                  </div>
                </div>

                {/* Cars */}
                <div style={{ marginTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div className="mono-tag">CARS ({team.cars?.length || 0})</div>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => openAddCar(team)}
                      style={{ padding: '2px 6px', fontSize: '11px' }}
                    >
                      + Add Car
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {team.cars && team.cars.length > 0 ? (
                      team.cars.map(c => (
                        <div 
                          key={c.car_id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '4px 8px',
                            background: 'var(--surface)',
                            border: '1px solid var(--line)',
                            borderRadius: '2px',
                            fontSize: '12px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span className="driver-chip" style={{ fontSize: '11px', padding: '0 4px' }}>#{c.car_number}</span>
                            <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{c.car_model}</span>
                            <span style={{ color: 'var(--ink-3)' }}>({c.engine_manufacturer})</span>
                          </div>
                          <button 
                            className="btn btn-danger btn-icon"
                            style={{ width: '20px', height: '20px' }}
                            onClick={() => handleDeleteCar(c.car_id, c.car_number)}
                            title="Delete Car"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <span style={{ fontSize: '12px', color: 'var(--ink-3)' }}>No cars registered.</span>
                    )}
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Team Modal */}
      <Modal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        title={editingTeam ? `Edit Team: ${editingTeam.team_name}` : 'Register Constructor Team'}
      >
        <form onSubmit={handleSaveTeam} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
              Team Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Phoenix Grand Prix"
              value={teamForm.team_name}
              onChange={(e) => setTeamForm({ ...teamForm, team_name: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
              Base Country *
            </label>
            <input
              type="text"
              placeholder="e.g. United Kingdom"
              value={teamForm.base_country}
              onChange={(e) => setTeamForm({ ...teamForm, base_country: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
                Team Principal
              </label>
              <input
                type="text"
                placeholder="Principal name"
                value={teamForm.team_principal}
                onChange={(e) => setTeamForm({ ...teamForm, team_principal: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
                Founded Year
              </label>
              <input
                type="number"
                min="1900"
                max="2030"
                value={teamForm.founded_year}
                onChange={(e) => setTeamForm({ ...teamForm, founded_year: parseInt(e.target.value) })}
                className="input-field"
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsTeamModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingTeam ? 'Save Team' : 'Register Team'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Car Modal */}
      <Modal
        isOpen={isCarModalOpen}
        onClose={() => setIsCarModalOpen(false)}
        title={`Register Car for ${selectedTeamForCar?.team_name}`}
      >
        <form onSubmit={handleSaveCar} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
              Car Number (1-99) *
            </label>
            <input
              type="number"
              min="1"
              max="99"
              value={carForm.car_number}
              onChange={(e) => setCarForm({ ...carForm, car_number: parseInt(e.target.value) })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
              Car Model *
            </label>
            <input
              type="text"
              placeholder="e.g. AR26 Evo"
              value={carForm.car_model}
              onChange={(e) => setCarForm({ ...carForm, car_model: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '4px' }}>
              Engine Manufacturer
            </label>
            <input
              type="text"
              placeholder="e.g. Apex Power, Mercedes"
              value={carForm.engine_manufacturer}
              onChange={(e) => setCarForm({ ...carForm, engine_manufacturer: e.target.value })}
              className="input-field"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsCarModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Register Car
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
