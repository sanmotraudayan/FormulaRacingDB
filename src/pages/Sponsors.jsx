import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import Modal from '../components/Modal';

// Per design.md: do NOT show currency symbol. Use formatAmount() util.
function formatAmount(value) {
  if (!value) return '—';
  return Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const TEAM_ACCENTS = {
  'Apex Racing': '#00A896',
  'Velocity GP': '#D90500',
  'Titan Motorsport': '#E67300',
  'Nova Racing': '#0070D2'
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

export default function Sponsors({ selectedSeason, onToast }) {
  const [sponsorsData, setSponsorsData] = useState({ sponsors: [], deals: [] });
  const [teams, setTeams] = useState([]);
  const [championships, setChampionships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSponsorModalOpen, setIsSponsorModalOpen] = useState(false);
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);

  const [sponsorForm, setSponsorForm] = useState({
    sponsor_name: '',
    industry: 'Technology',
    country: 'United States'
  });

  const [dealForm, setDealForm] = useState({
    team_id: '',
    sponsor_id: '',
    championship_id: '',
    sponsorship_amount: 5000000.00
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [data, teamsData, champsData] = await Promise.all([
        api.getSponsors(),
        api.getTeams(),
        api.getChampionships()
      ]);
      setSponsorsData(data);
      setTeams(teamsData);
      setChampionships(champsData);

      if (teamsData.length > 0 && !dealForm.team_id) {
        setDealForm(prev => ({
          ...prev,
          team_id: teamsData[0].team_id,
          sponsor_id: data.sponsors[0]?.sponsor_id || '',
          championship_id: champsData[0]?.championship_id || ''
        }));
      }
    } catch (err) {
      onToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [selectedSeason]);

  const handleSaveSponsor = async (e) => {
    e.preventDefault();
    try {
      await api.createSponsor(sponsorForm);
      onToast({ type: 'success', message: `Sponsor "${sponsorForm.sponsor_name}" added.` });
      setIsSponsorModalOpen(false);
      loadData();
    } catch (err) {
      onToast({ type: 'error', message: err.message });
    }
  };

  const handleSaveDeal = async (e) => {
    e.preventDefault();
    try {
      await api.createTeamSponsorship(dealForm);
      onToast({ type: 'success', message: 'Sponsorship deal linked.' });
      setIsDealModalOpen(false);
      loadData();
    } catch (err) {
      onToast({ type: 'error', message: err.message });
    }
  };

  const handleDeleteSponsor = async (id, name) => {
    if (!window.confirm(`Delete sponsor "${name}"? Cannot delete if active contracts exist.`)) return;
    try {
      await api.deleteSponsor(id);
      onToast({ type: 'success', message: `Sponsor "${name}" deleted.` });
      loadData();
    } catch (err) {
      onToast({ type: 'error', message: `Cannot delete: ${err.message}` });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Page Header */}
      <div>
        <div className="mono-tag">10 / SPONSORS</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px', marginTop: '4px' }}>
          <div>
            <h1 style={{ fontSize: '36px', lineHeight: 1.1 }}>SPONSORS</h1>
            <p style={{ color: 'var(--ink-3)', fontSize: '14px', marginTop: '4px' }}>
              Commercial partners, sponsorship contracts and team deals.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setIsDealModalOpen(true)}>
              Link Team Deal
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setIsSponsorModalOpen(true)}>
              <Plus size={15} /> Add Sponsor
            </button>
          </div>
        </div>
      </div>

      <hr className="section-rule" />

      {/* Sponsors Table */}
      <div>
        <div style={{ marginBottom: '12px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--ink)' }}>
          Sponsor Register
        </div>
        <div className="data-table-container">
          <table className="data-table">
            <caption style={{ display: 'none' }}>Sponsor register</caption>
            <thead>
              <tr>
                <th>Sponsor</th>
                <th>Industry</th>
                <th>Country</th>
                <th className="num">Contracts</th>
                <th style={{ width: '56px' }}></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3,4].map(i => (
                  <tr key={i}>
                    {[1,2,3,4,5].map(j => (
                      <td key={j}><div style={{ height: '14px', background: 'var(--surface-2)', borderRadius: '2px' }} /></td>
                    ))}
                  </tr>
                ))
              ) : sponsorsData.sponsors.length > 0 ? (
                sponsorsData.sponsors.map(sponsor => (
                  <tr key={sponsor.sponsor_id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{sponsor.sponsor_name}</div>
                    </td>
                    <td>
                      <span className="chip chip-scheduled" style={{ fontSize: '11px', borderRadius: '2px' }}>
                        {sponsor.industry}
                      </span>
                    </td>
                    <td style={{ color: 'var(--ink-3)', fontSize: '13px' }}>{sponsor.country}</td>
                    <td className="num" style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--ink)' }}>
                      {sponsor.teams_sponsored || 0}
                    </td>
                    <td>
                      <button className="btn btn-danger btn-icon" onClick={() => handleDeleteSponsor(sponsor.sponsor_id, sponsor.sponsor_name)} aria-label="Delete sponsor">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--ink-3)' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, marginBottom: '6px' }}>NO SPONSORS</div>
                    <div style={{ fontSize: '13px' }}>No sponsors registered. Add a sponsor above.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deals Table */}
      <div>
        <div style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--ink)' }}>
            Active Constructor Contracts
          </div>
          <div style={{ fontSize: '11px', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
            Amount — Currency not specified in dataset
          </div>
        </div>
        <div className="data-table-container">
          <table className="data-table">
            <caption style={{ display: 'none' }}>Active sponsorship contracts</caption>
            <thead>
              <tr>
                <th>Constructor</th>
                <th>Sponsor</th>
                <th>Season</th>
                <th className="num">Amount</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3].map(i => (
                  <tr key={i}>
                    {[1,2,3,4].map(j => (
                      <td key={j}><div style={{ height: '14px', background: 'var(--surface-2)', borderRadius: '2px' }} /></td>
                    ))}
                  </tr>
                ))
              ) : sponsorsData.deals.length > 0 ? (
                sponsorsData.deals.map((deal, idx) => {
                  const accent = TEAM_ACCENTS[deal.team_name] || 'var(--ink-3)';
                  return (
                    <tr key={idx}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="team-bar" style={{ background: accent }} />
                          <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{deal.team_name}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--ink-2)', fontSize: '13px' }}>{deal.sponsor_name}</td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600, color: 'var(--ink-3)' }}>
                          {deal.season_year}
                        </span>
                      </td>
                      <td className="num" style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '14px', color: 'var(--ink)' }}>
                        {formatAmount(deal.sponsorship_amount)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--ink-3)' }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, marginBottom: '6px' }}>NO DEALS</div>
                    <div style={{ fontSize: '13px' }}>No sponsorship contracts linked yet.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Sponsor Modal */}
      <Modal
        isOpen={isSponsorModalOpen}
        onClose={() => setIsSponsorModalOpen(false)}
        title="Add Sponsor"
      >
        <form onSubmit={handleSaveSponsor} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={LABEL}>Sponsor Name *</label>
            <input type="text" placeholder="e.g. Rolex, Shell" value={sponsorForm.sponsor_name} onChange={e => setSponsorForm({ ...sponsorForm, sponsor_name: e.target.value })} className="input-field" required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={LABEL}>Industry</label>
              <input type="text" placeholder="Technology, Finance…" value={sponsorForm.industry} onChange={e => setSponsorForm({ ...sponsorForm, industry: e.target.value })} className="input-field" />
            </div>
            <div>
              <label style={LABEL}>Country</label>
              <input type="text" placeholder="United States…" value={sponsorForm.country} onChange={e => setSponsorForm({ ...sponsorForm, country: e.target.value })} className="input-field" />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px', borderTop: 'var(--hairline)' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsSponsorModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Save Sponsor</button>
          </div>
        </form>
      </Modal>

      {/* Link Deal Modal */}
      <Modal
        isOpen={isDealModalOpen}
        onClose={() => setIsDealModalOpen(false)}
        title="Link Sponsorship Contract"
      >
        <form onSubmit={handleSaveDeal} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={LABEL}>Constructor Team *</label>
            <select value={dealForm.team_id} onChange={e => setDealForm({ ...dealForm, team_id: e.target.value })} className="select-field" required>
              {teams.map(t => <option key={t.team_id} value={t.team_id}>{t.team_name}</option>)}
            </select>
          </div>
          <div>
            <label style={LABEL}>Sponsor *</label>
            <select value={dealForm.sponsor_id} onChange={e => setDealForm({ ...dealForm, sponsor_id: e.target.value })} className="select-field" required>
              <option value="">Select sponsor...</option>
              {sponsorsData.sponsors.map(s => (
                <option key={s.sponsor_id} value={s.sponsor_id}>{s.sponsor_name} ({s.industry})</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={LABEL}>Championship Season *</label>
              <select value={dealForm.championship_id} onChange={e => setDealForm({ ...dealForm, championship_id: e.target.value })} className="select-field" required>
                {championships.map(c => <option key={c.championship_id} value={c.championship_id}>{c.season_year}</option>)}
              </select>
            </div>
            <div>
              <label style={LABEL}>Amount *</label>
              <input type="number" step="100000" min="0" value={dealForm.sponsorship_amount} onChange={e => setDealForm({ ...dealForm, sponsorship_amount: parseFloat(e.target.value) })} className="input-field" required />
              <div style={{ fontSize: '11px', color: 'var(--ink-3)', marginTop: '3px', fontFamily: 'var(--font-mono)' }}>Currency not specified</div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px', borderTop: 'var(--hairline)' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsDealModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Link Deal</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
