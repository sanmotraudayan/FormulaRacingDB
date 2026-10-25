import React, { useState, useEffect } from 'react';
import TopBar from './components/TopBar';
import Toast from './components/Toast';
import Modal from './components/Modal';
import { api } from './services/api';

// Pages
import Dashboard from './pages/Dashboard';
import Standings from './pages/Standings';
import Races from './pages/Races';
import RaceResults from './pages/RaceResults';
import Teams from './pages/Teams';
import Drivers from './pages/Drivers';
import LapTelemetry from './pages/LapTelemetry';
import PitStops from './pages/PitStops';
import PenaltiesIncidents from './pages/PenaltiesIncidents';
import Sponsors from './pages/Sponsors';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedSeason, setSelectedSeason] = useState('2025');
  const [championships, setChampionships] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [globalSearch, setGlobalSearch] = useState('');

  // Quick Add modal
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Filter pass-through for cross-page navigation
  const [navFilter, setNavFilter] = useState({});

  const addToast = ({ type = 'info', title, message }) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const loadInitialData = async () => {
    try {
      const champs = await api.getChampionships();
      setChampionships(champs);
      if (champs.length > 0) {
        setSelectedSeason(String(champs[0].season_year));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleNavigateWithFilter = (tab, filter = {}) => {
    setNavFilter(filter);
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSetTab = (tab) => {
    setNavFilter({});
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* Top Bar with Navigation */}
      <TopBar
        activeTab={activeTab}
        setActiveTab={handleSetTab}
        onNavigateWithFilter={handleNavigateWithFilter}
        selectedSeason={selectedSeason}
        setSelectedSeason={setSelectedSeason}
        championships={championships}
        globalSearch={globalSearch}
        setGlobalSearch={setGlobalSearch}
        onOpenQuickAdd={() => setIsQuickAddOpen(true)}
      />

      {/* Page Content */}
      <main style={{
        flex: 1,
        maxWidth: '1280px',
        width: '100%',
        margin: '0 auto',
        padding: '32px 24px',
        boxSizing: 'border-box'
      }}>
        {activeTab === 'dashboard' && (
          <Dashboard
            selectedSeason={selectedSeason}
            onNavigate={handleSetTab}
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
          />
        )}
        {activeTab === 'standings' && (
          <Standings selectedSeason={selectedSeason} />
        )}
        {activeTab === 'races' && (
          <Races
            selectedSeason={selectedSeason}
            initialSearch={navFilter.search}
            onNavigateWithFilter={handleNavigateWithFilter}
            onToast={addToast}
          />
        )}
        {activeTab === 'results' && (
          <RaceResults
            selectedSeason={selectedSeason}
            initialRaceId={navFilter.raceId}
            onToast={addToast}
          />
        )}
        {activeTab === 'teams' && (
          <Teams initialSearch={navFilter.search} onToast={addToast} />
        )}
        {activeTab === 'drivers' && (
          <Drivers selectedSeason={selectedSeason} initialSearch={navFilter.search} onToast={addToast} />
        )}
        {activeTab === 'laps' && (
          <LapTelemetry selectedSeason={selectedSeason} onToast={addToast} />
        )}
        {activeTab === 'pitstops' && (
          <PitStops selectedSeason={selectedSeason} onToast={addToast} />
        )}
        {activeTab === 'stewards' && (
          <PenaltiesIncidents selectedSeason={selectedSeason} onToast={addToast} />
        )}
        {activeTab === 'sponsors' && (
          <Sponsors selectedSeason={selectedSeason} onToast={addToast} />
        )}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--line)',
        padding: '14px 24px',
        background: 'var(--surface)',
        fontSize: '12px',
        color: 'var(--ink-3)',
        fontFamily: 'var(--font-mono)'
      }}>
        Demonstration data. Not official results or telemetry. All rights reserved.
      </footer>

      {/* Quick Add Chooser Modal */}
      <Modal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        title="Add New Record"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ color: 'var(--ink-3)', fontSize: '13px', marginBottom: '12px' }}>
            Navigate to the relevant section to add a new record:
          </p>
          {[
            { label: 'New Driver', tab: 'drivers' },
            { label: 'New Team / Car', tab: 'teams' },
            { label: 'Schedule Race', tab: 'races' },
            { label: 'Record Race Result', tab: 'results' },
            { label: 'Log Lap Timing', tab: 'laps' },
            { label: 'Log Pit Stop', tab: 'pitstops' },
            { label: 'Issue Penalty', tab: 'stewards' },
            { label: 'Add Sponsor', tab: 'sponsors' },
          ].map(item => (
            <button
              key={item.tab}
              className="btn btn-secondary"
              onClick={() => { setIsQuickAddOpen(false); handleSetTab(item.tab); }}
              style={{ justifyContent: 'flex-start', textAlign: 'left' }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </Modal>

      {/* Floating Notifications */}
      <Toast toasts={toasts} onDismiss={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
    </div>
  );
}
