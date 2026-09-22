import React, { useEffect, useState } from 'react';
import { getOwnerDashboardStats } from '../services/ownerService';
import type { OwnerStats } from '../services/ownerService';
import { TrendingUp, Activity, PackageOpen, CreditCard, DollarSign, Wallet } from 'lucide-react';
import '../styles/ownerDashboard.css';

export const OwnerDashboard: React.FC = () => {
  const [stats, setStats] = useState<OwnerStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await getOwnerDashboardStats();
        setStats(data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Erreur lors du chargement des statistiques.');
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return <div className="owner-dash-loading">Chargement du tableau de bord propriétaire...</div>;
  }

  if (error || !stats) {
    return <div className="owner-dash-error">{error || 'Erreur inconnue'}</div>;
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XAF', maximumFractionDigits: 0 }).format(val || 0);
  };

  return (
    <div className="owner-dashboard-container">
      <div className="owner-header">
        <h1>Vue d'ensemble - Propriétaire</h1>
        <p className="owner-subtitle">Aperçu financier et performances de votre établissement</p>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card highlight">
          <div className="kpi-icon"><TrendingUp /></div>
          <div className="kpi-content">
            <h3>CA du Jour</h3>
            <p className="kpi-value">{formatCurrency(stats.dailySales)}</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon"><Activity /></div>
          <div className="kpi-content">
            <h3>Bénéfice Net (30J)</h3>
            <p className="kpi-value profit">{formatCurrency(stats.netProfit30Days)}</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon"><CreditCard /></div>
          <div className="kpi-content">
            <h3>Ardoises en cours</h3>
            <p className="kpi-value danger">{formatCurrency(stats.pendingDebts)}</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon"><PackageOpen /></div>
          <div className="kpi-content">
            <h3>Valeur du Stock</h3>
            <p className="kpi-value">{formatCurrency(stats.stockValue)}</p>
          </div>
        </div>
      </div>

      <div className="owner-charts-section">
        <div className="owner-panel">
          <h2>Top 5 Boissons (30J)</h2>
          <div className="top-products-list">
            {stats.topProducts.map((p, idx) => (
              <div key={idx} className="top-product-item">
                <div className="tp-info">
                  <span className="tp-rank">#{idx + 1}</span>
                  <span className="tp-name">{p.nom}</span>
                </div>
                <div className="tp-stats">
                  <span className="tp-qty">{p.qty} vendus</span>
                  <span className="tp-rev">{formatCurrency(p.revenue)}</span>
                </div>
                <div className="tp-bar-container">
                  <div className="tp-bar" style={{ width: `${(p.qty / (stats.topProducts[0]?.qty || 1)) * 100}%` }}></div>
                </div>
              </div>
            ))}
            {stats.topProducts.length === 0 && <p className="empty-state">Pas assez de données</p>}
          </div>
        </div>

        <div className="owner-panel">
          <h2>Clôtures Récentes</h2>
          <div className="closures-list">
            {stats.recentClosures.map((closure) => (
              <div key={closure.id} className="closure-item">
                <div className="closure-date">
                  {new Date(closure.createdAt).toLocaleDateString()}
                </div>
                <div className="closure-stats">
                  <div>Attendu : {formatCurrency(closure.montantAttendu)}</div>
                  <div>Réel : {formatCurrency(closure.montantReel)}</div>
                </div>
                <div className={`closure-diff ${closure.ecart < 0 ? 'diff-negative' : closure.ecart > 0 ? 'diff-positive' : 'diff-neutral'}`}>
                  Écart : {formatCurrency(closure.ecart)}
                </div>
              </div>
            ))}
            {stats.recentClosures.length === 0 && <p className="empty-state">Aucune clôture enregistrée</p>}
          </div>
        </div>
      </div>

      <div className="owner-footer-stats">
        <div className="footer-stat">
          <Wallet size={20} />
          <span>Trésorerie estimée dispo : <strong>{formatCurrency(stats.availableCash)}</strong></span>
        </div>
        <div className="footer-stat">
          <DollarSign size={20} />
          <span>CA Hebdo : <strong>{formatCurrency(stats.weeklySales)}</strong></span>
        </div>
        <div className="footer-stat">
          <DollarSign size={20} />
          <span>CA Mensuel : <strong>{formatCurrency(stats.monthlySales)}</strong></span>
        </div>
      </div>

    </div>
  );
};
