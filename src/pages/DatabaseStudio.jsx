import React, { useState, useEffect } from 'react';
import { Database, Table, Search, RefreshCw, Key, Shield, Layers, FileText } from 'lucide-react';
import { api } from '../services/api';

export default function DatabaseStudio({ onToast }) {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('driver');
  const [tableData, setTableData] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadTables = async () => {
    try {
      setLoading(true);
      const data = await api.getTables();
      setTables(data);
      if (data.length > 0 && !selectedTable) {
        setSelectedTable(data[0].TABLE_NAME);
      }
    } catch (err) {
      onToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const loadTableData = async (tableName) => {
    try {
      setLoading(true);
      const data = await api.getTableData(tableName);
      setTableData(data);
    } catch (err) {
      onToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTables();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      loadTableData(selectedTable);
    }
  }, [selectedTable]);

  const filteredRows = (tableData?.rows || []).filter(row => {
    if (!search) return true;
    return Object.values(row).some(val => 
      String(val).toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="f1-badge" style={{ background: 'var(--color-purple)', color: '#FFF' }}>
              RDBMS RAW STUDIO
            </span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
              Database: <code style={{ color: '#FFF', background: '#191924', padding: '1px 5px', borderRadius: '3px' }}>formularacingdb</code> (MySQL 8.0)
            </span>
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 900, marginTop: '4px' }}>
            SCHEMA EXPLORER &amp; TABLE INSPECTOR
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative', width: '240px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder={`Search in ${selectedTable}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '32px' }}
            />
          </div>

          <button className="btn btn-secondary btn-icon" onClick={() => loadTableData(selectedTable)} title="Refresh Table Data">
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
          </button>
        </div>
      </div>

      {/* Main Studio Viewport */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '20px', alignItems: 'start' }}>
        
        {/* Table Selector Sidebar */}
        <div className="f1-card" style={{ padding: '14px', maxHeight: '75vh', overflowY: 'auto' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-racing)', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={14} /> Database Relations ({tables.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {tables.map(t => {
              const isSelected = selectedTable === t.TABLE_NAME;
              const isView = t.TABLE_TYPE === 'VIEW';

              return (
                <button
                  key={t.TABLE_NAME}
                  onClick={() => { setSelectedTable(t.TABLE_NAME); setSearch(''); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: isSelected ? 'var(--accent-red)' : 'transparent',
                    color: isSelected ? '#FFF' : 'var(--text-secondary)',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: isSelected ? 'var(--font-racing)' : 'inherit',
                    fontWeight: isSelected ? 800 : 500,
                    fontSize: '13px',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = '#262636';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Table size={13} color={isSelected ? '#FFF' : isView ? 'var(--color-purple)' : 'var(--text-muted)'} />
                    <span>{t.TABLE_NAME}</span>
                  </div>
                  {isView && (
                    <span style={{
                      fontSize: '9px',
                      background: isSelected ? 'rgba(0,0,0,0.3)' : 'var(--color-purple-bg)',
                      color: isSelected ? '#FFF' : 'var(--color-purple)',
                      padding: '1px 4px',
                      borderRadius: '2px',
                      fontWeight: 700
                    }}>
                      VIEW
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Table Inspector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Table Schema Banner */}
          <div style={{
            background: '#191924',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'var(--font-racing)' }}>
                Active Relation
              </span>
              <div style={{ fontSize: '20px', fontWeight: 900, color: '#FFF' }}>
                {selectedTable}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>COLUMNS</span>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFF' }}>
                  {tableData?.columns?.length || 0}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>RECORDS LOADED</span>
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-green)' }}>
                  {tableData?.rows?.length || 0}
                </div>
              </div>
            </div>
          </div>

          {/* Schema Metadata Pills */}
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            background: '#15151E',
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)'
          }}>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', alignSelf: 'center', fontWeight: 700, fontFamily: 'var(--font-racing)' }}>
              COLUMNS:
            </span>
            {tableData?.columns?.map(col => (
              <span
                key={col.COLUMN_NAME}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: '#1F1F2B',
                  border: `1px solid ${col.COLUMN_KEY === 'PRI' ? 'var(--color-yellow)' : 'var(--border-color)'}`,
                  padding: '3px 8px',
                  borderRadius: '3px',
                  fontSize: '11px',
                  color: col.COLUMN_KEY === 'PRI' ? 'var(--color-yellow)' : '#FFF'
                }}
              >
                {col.COLUMN_KEY === 'PRI' && <Key size={10} />}
                <strong>{col.COLUMN_NAME}</strong>
                <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>({col.DATA_TYPE})</span>
              </span>
            ))}
          </div>

          {/* Table Data Grid */}
          <div className="f1-table-container" style={{ maxHeight: '55vh', overflowY: 'auto' }}>
            <table className="f1-table">
              <thead>
                <tr>
                  {tableData?.columns?.map(col => (
                    <th key={col.COLUMN_NAME}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {col.COLUMN_KEY === 'PRI' && <Key size={12} color="var(--color-yellow)" />}
                        <span>{col.COLUMN_NAME}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.length > 0 ? (
                  filteredRows.map((row, idx) => (
                    <tr key={idx}>
                      {tableData?.columns?.map(col => {
                        const val = row[col.COLUMN_NAME];
                        return (
                          <td key={col.COLUMN_NAME} style={{ fontSize: '12px' }}>
                            {val === null || val === undefined ? (
                              <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>NULL</span>
                            ) : typeof val === 'boolean' || col.DATA_TYPE === 'tinyint' ? (
                              val ? '1 (TRUE)' : '0 (FALSE)'
                            ) : (
                              String(val)
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={tableData?.columns?.length || 1} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-secondary)' }}>
                      {loading ? 'Querying database...' : 'No records found in this table.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
