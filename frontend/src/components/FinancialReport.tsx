import React, { useState, useEffect } from 'react';
import { getFinancialReport } from '../services/closureService';
import { exportToExcel, exportToPDF, shareToWhatsApp } from '../services/exportService';
import type { FinancialData } from '../services/exportService';

export const FinancialReport: React.FC = () => {
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filtres par défaut (30 derniers jours)
  const defaultStart = new Date();
  defaultStart.setDate(defaultStart.getDate() - 30);
  
  const [startDate, setStartDate] = useState<string>(defaultStart.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const loadReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getFinancialReport(new Date(startDate).toISOString(), new Date(endDate).toISOString());
      setData(res);
    } catch (err: any) {
      setError("Impossible de charger le rapport financier.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const handleExportExcel = () => {
    if (data) exportToExcel(data);
  };

  const handleExportPDF = () => {
    if (data) exportToPDF(data);
  };

  const handleShareWhatsApp = () => {
    if (data) shareToWhatsApp(data);
  };

  const setFilter = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  return (
    <div style={{ padding: '2rem', color: '#f8fafc', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#f59e0b', margin: 0 }}>Rapport Financier</h2>
          <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Analyse des performances et historique des transactions</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button onClick={() => setFilter(0)} style={filterBtnStyle}>Aujourd'hui</button>
          <button onClick={() => setFilter(7)} style={filterBtnStyle}>7 jours</button>
          <button onClick={() => setFilter(30)} style={filterBtnStyle}>30 jours</button>
        </div>
      </div>

      <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>Du</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', color: '#cbd5e1', marginBottom: '0.5rem' }}>Au</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={inputStyle} />
        </div>
        <button onClick={loadReport} disabled={loading} style={{ ...btnStyle, background: '#3b82f6', color: '#fff' }}>
          {loading ? 'Chargement...' : 'Filtrer'}
        </button>
      </div>

      {error && <div style={{ color: '#ef4444', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', marginBottom: '2rem' }}>{error}</div>}

      {data && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <StatCard title="Chiffre d'Affaires Net" value={data.cashSales + data.mobileMoneySales} color="#10b981" />
            <StatCard title="Ventes Espèces" value={data.cashSales} color="#3b82f6" />
            <StatCard title="Mobile Money" value={data.mobileMoneySales} color="#8b5cf6" />
            <StatCard title="Ardoises (Crédits)" value={data.debtSales} color="#f59e0b" />
            <StatCard title="Dépenses Totales" value={data.expenses} color="#ef4444" />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
            <button onClick={handleExportExcel} style={{ ...btnStyle, background: '#10b981', color: '#fff' }}>📥 Exporter Excel</button>
            <button onClick={handleExportPDF} style={{ ...btnStyle, background: '#ef4444', color: '#fff' }}>📄 Exporter PDF</button>
            <button onClick={handleShareWhatsApp} style={{ ...btnStyle, background: '#22c55e', color: '#fff' }}>💬 Partager WhatsApp</button>
          </div>

          <div style={{ background: '#1e293b', borderRadius: '12px', overflow: 'hidden' }}>
            <h3 style={{ padding: '1.5rem', margin: 0, borderBottom: '1px solid #334155' }}>Journal des Transactions</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#0f172a' }}>
                    <th style={thStyle}>Date & Heure</th>
                    <th style={thStyle}>Type</th>
                    <th style={thStyle}>Client</th>
                    <th style={thStyle}>Montant</th>
                    <th style={thStyle}>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {data.journal.map(tx => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid #334155' }}>
                      <td style={tdStyle}>{new Date(tx.createdAt).toLocaleString('fr-FR')}</td>
                      <td style={tdStyle}>{tx.paymentMode}</td>
                      <td style={tdStyle}>{tx.nomClient || '-'}</td>
                      <td style={{ ...tdStyle, fontWeight: 'bold' }}>{tx.totalAmount.toLocaleString('fr-FR')} FCFA</td>
                      <td style={tdStyle}>{tx.status}</td>
                    </tr>
                  ))}
                  {data.journal.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Aucune transaction sur cette période.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const StatCard = ({ title, value, color }: { title: string, value: number, color: string }) => (
  <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '12px', borderLeft: `4px solid ${color}` }}>
    <h4 style={{ color: '#94a3b8', margin: '0 0 0.5rem 0', fontSize: '0.875rem' }}>{title}</h4>
    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: '#f8fafc' }}>{value.toLocaleString('fr-FR')} FCFA</p>
  </div>
);

const inputStyle = {
  padding: '0.75rem',
  borderRadius: '6px',
  border: '1px solid #334155',
  background: '#0f172a',
  color: '#fff',
  outline: 'none'
};

const btnStyle = {
  padding: '0.75rem 1.5rem',
  borderRadius: '6px',
  border: 'none',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'opacity 0.2s'
};

const filterBtnStyle = {
  background: 'transparent',
  border: '1px solid #334155',
  color: '#cbd5e1',
  padding: '0.5rem 1rem',
  borderRadius: '20px',
  cursor: 'pointer',
  fontSize: '0.875rem'
};

const thStyle = {
  padding: '1rem 1.5rem',
  color: '#94a3b8',
  fontWeight: 600,
  fontSize: '0.875rem',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em'
};

const tdStyle = {
  padding: '1rem 1.5rem',
  color: '#f8fafc',
  fontSize: '0.875rem'
};
