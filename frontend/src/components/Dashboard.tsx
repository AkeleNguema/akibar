import React, { useEffect, useState } from 'react';
import { getDailyClosure } from '../services/closureService';
import '../styles/dashboard.css';

interface DashboardData {
  totalSales: number;
  totalExpenses: number;
  cashSales: number;
  mobileMoneySales: number;
  debtSales: number;
  expectedCash: number;
  date: string;
}

interface DashboardProps {
  onNavigate?: (tab: 'caisse' | 'stock' | 'ardoises' | 'depenses' | 'cloture') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const summary = await getDailyClosure();
        setData(summary);
        setError(null);
      } catch (err: any) {
        console.error('Erreur chargement dashboard:', err);
        setError('Impossible de charger les données du jour.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div style={{ color: '#fff', textAlign: 'center', padding: '50px' }}>Chargement du tableau de bord...</div>;
  }

  if (error || !data) {
    return (
      <div style={{ color: '#ef4444', textAlign: 'center', padding: '50px' }}>
        <h3>Erreur</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Tableau de Bord</h2>
        <p>Aperçu de la journée - {new Date(data.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-icon sales">💰</div>
          <div className="stat-content">
            <div className="stat-title">Chiffre d'Affaires</div>
            <div className="stat-value">{data.totalSales.toLocaleString('fr-FR')} FCFA</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon balance">💵</div>
          <div className="stat-content">
            <div className="stat-title">Cash en Caisse (Espèces)</div>
            <div className="stat-value">{data.cashSales.toLocaleString('fr-FR')} FCFA</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon debts">📝</div>
          <div className="stat-content">
            <div className="stat-title">Ardoises (Dettes) du jour</div>
            <div className="stat-value">{data.debtSales.toLocaleString('fr-FR')} FCFA</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon expenses">📉</div>
          <div className="stat-content">
            <div className="stat-title">Dépenses du jour</div>
            <div className="stat-value">{data.totalExpenses.toLocaleString('fr-FR')} FCFA</div>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h3>Actions Rapides</h3>
        <div className="actions-grid">
          <button className="action-btn" onClick={() => onNavigate && onNavigate('caisse')}>
            <span className="action-icon">🍺</span>
            <span>Aller en Caisse</span>
          </button>
          <button className="action-btn" onClick={() => onNavigate && onNavigate('depenses')}>
            <span className="action-icon">💸</span>
            <span>Sortir une Dépense</span>
          </button>
          <button className="action-btn" onClick={() => onNavigate && onNavigate('ardoises')}>
            <span className="action-icon">📖</span>
            <span>Gérer les Ardoises</span>
          </button>
          <button className="action-btn" onClick={() => onNavigate && onNavigate('cloture')}>
            <span className="action-icon">🔒</span>
            <span>Clôturer la journée</span>
          </button>
        </div>
      </div>
    </div>
  );
};
