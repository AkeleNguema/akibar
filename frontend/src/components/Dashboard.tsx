import React, { useEffect, useState } from 'react';
import { getDailyClosure, getDailyDetails, type DailyDetails } from '../services/closureService';
import { ownerLogin } from '../services/authService';
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

type ModalType = 'cash' | 'debt' | 'expense' | null;

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [detailsData, setDetailsData] = useState<DailyDetails | null>(null);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);

  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [ownerPin, setOwnerPin] = useState('');
  const [ownerError, setOwnerError] = useState('');
  const [ownerLoading, setOwnerLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const summary = await getDailyClosure();
        setData(summary);
        setError(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error('Erreur chargement dashboard:', err);
        setError('Impossible de charger les données du jour.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const openModal = async (type: ModalType) => {
    setActiveModal(type);
    if (!detailsData) {
      setLoadingDetails(true);
      try {
        const details = await getDailyDetails();
        setDetailsData(details);
      } catch (err) {
        console.error('Erreur chargement détails:', err);
        alert('Impossible de charger les détails.');
      } finally {
        setLoadingDetails(false);
      }
    }
  };

  const closeModal = () => setActiveModal(null);

  const handleOwnerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setOwnerLoading(true);
    setOwnerError('');
    try {
      let barId = '';
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        barId = payload.barId;
      }
      
      await ownerLogin({ barId, pin: ownerPin });
      window.location.reload(); // Reload will grab the new token & role
    } catch (err: any) {
      setOwnerError(err.response?.data?.error || 'PIN incorrect.');
      setOwnerLoading(false);
    }
  };

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

  const renderModalContent = () => {
    if (loadingDetails) {
      return <div style={{ color: '#94a3b8', textAlign: 'center', padding: '30px' }}>Chargement des données...</div>;
    }
    if (!detailsData) {
      return <div style={{ color: '#ef4444', textAlign: 'center', padding: '30px' }}>Aucune donnée disponible.</div>;
    }

    if (activeModal === 'cash') {
      const { cashSales } = detailsData;
      return (
        <>
          <div style={{ marginBottom: '15px', color: '#94a3b8' }}>
            <strong>{cashSales.length} ticket(s)</strong> pour un total de <strong>{data.cashSales.toLocaleString('fr-FR')} FCFA</strong>
          </div>
          {cashSales.length === 0 ? (
            <p>Aucune vente en espèces pour le moment.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Heure</th>
                  <th>Réf</th>
                  <th>Articles</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {cashSales.map(sale => (
                  <tr key={sale.id}>
                    <td>{new Date(sale.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</td>
                    <td style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{sale.id.substring(0, 8)}</td>
                    <td>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {sale.items.map((item: any) => (
                        <div key={item.id}>{item.quantite}x {item.product?.nom || 'Produit inconnu'}</div>
                      ))}
                    </td>
                    <td style={{ fontWeight: 'bold' }}>{sale.totalAmount.toLocaleString('fr-FR')} FCFA</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      );
    }

    if (activeModal === 'debt') {
      const { debtSales } = detailsData;
      return (
        <>
          <div style={{ marginBottom: '15px', color: '#94a3b8' }}>
            <strong>{debtSales.length} ardoise(s)</strong> pour un total de <strong>{data.debtSales.toLocaleString('fr-FR')} FCFA</strong>
          </div>
          {debtSales.length === 0 ? (
            <p>Aucune ardoise pour le moment.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Heure</th>
                  <th>Client</th>
                  <th>Articles</th>
                  <th>Statut</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {debtSales.map(sale => (
                  <tr key={sale.id}>
                    <td>{new Date(sale.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</td>
                    <td style={{ color: '#f59e0b', fontWeight: '500' }}>{sale.nomClient || 'Inconnu'}</td>
                    <td>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {sale.items.map((item: any) => (
                        <div key={item.id}>{item.quantite}x {item.product?.nom || 'Produit inconnu'}</div>
                      ))}
                    </td>
                    <td>
                      <span className={`debt-badge ${sale.status === 'PAYE' ? 'paid' : 'unpaid'}`} style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '0.8rem', background: sale.status === 'PAYE' ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)', color: sale.status === 'PAYE' ? '#10b981' : '#f59e0b' }}>
                        {sale.status === 'PAYE' ? 'Payé' : 'En attente'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 'bold' }}>{sale.totalAmount.toLocaleString('fr-FR')} FCFA</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      );
    }

    if (activeModal === 'expense') {
      const { expenses } = detailsData;
      return (
        <>
          <div style={{ marginBottom: '15px', color: '#94a3b8' }}>
            <strong>{expenses.length} dépense(s)</strong> pour un total de <strong>{data.totalExpenses.toLocaleString('fr-FR')} FCFA</strong>
          </div>
          {expenses.length === 0 ? (
            <p>Aucune dépense pour le moment.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Heure</th>
                  <th>Catégorie</th>
                  <th>Motif</th>
                  <th>Montant</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map(exp => (
                  <tr key={exp.id}>
                    <td>{new Date(exp.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</td>
                    <td style={{ color: '#ef4444' }}>{exp.categorie}</td>
                    <td>{exp.motif}</td>
                    <td style={{ fontWeight: 'bold' }}>{exp.montant.toLocaleString('fr-FR')} FCFA</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      );
    }

    return null;
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Tableau de Bord</h2>
          <p>Aperçu de la journée - {new Date(data.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <button 
          onClick={() => setShowOwnerModal(true)}
          style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          Accès Propriétaire
        </button>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-icon sales">💰</div>
          <div className="stat-content">
            <div className="stat-title">Chiffre d'Affaires</div>
            <div className="stat-value">{data.totalSales.toLocaleString('fr-FR')} FCFA</div>
          </div>
        </div>

        <div className="stat-card clickable-card" onClick={() => openModal('cash')}>
          <div className="stat-icon balance">💵</div>
          <div className="stat-content">
            <div className="stat-title">Cash en Caisse (Espèces) <span style={{fontSize:'0.7rem', color:'#3b82f6'}}>🔍</span></div>
            <div className="stat-value">{data.cashSales.toLocaleString('fr-FR')} FCFA</div>
          </div>
        </div>

        <div className="stat-card clickable-card" onClick={() => openModal('debt')}>
          <div className="stat-icon debts">📝</div>
          <div className="stat-content">
            <div className="stat-title">Ardoises (Dettes) du jour <span style={{fontSize:'0.7rem', color:'#f59e0b'}}>🔍</span></div>
            <div className="stat-value">{data.debtSales.toLocaleString('fr-FR')} FCFA</div>
          </div>
        </div>

        <div className="stat-card clickable-card" onClick={() => openModal('expense')}>
          <div className="stat-icon expenses">📉</div>
          <div className="stat-content">
            <div className="stat-title">Dépenses du jour <span style={{fontSize:'0.7rem', color:'#ef4444'}}>🔍</span></div>
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

      {activeModal && (
        <div className="dashboard-modal-overlay" onClick={closeModal}>
          <div className="dashboard-modal" onClick={e => e.stopPropagation()}>
            <div className="dashboard-modal-header">
              <h3>
                {activeModal === 'cash' && '💵 Détail du Cash en Caisse'}
                {activeModal === 'debt' && '📝 Détail des Ardoises'}
                {activeModal === 'expense' && '📉 Détail des Dépenses'}
              </h3>
              <button className="dashboard-modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="dashboard-modal-body">
              {renderModalContent()}
            </div>
          </div>
        </div>
      )}

      {showOwnerModal && (
        <div className="dashboard-modal-overlay" onClick={() => setShowOwnerModal(false)}>
          <div className="dashboard-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '350px' }}>
            <div className="dashboard-modal-header">
              <h3>Accès Propriétaire</h3>
              <button className="dashboard-modal-close" onClick={() => setShowOwnerModal(false)}>×</button>
            </div>
            <div className="dashboard-modal-body">
              {ownerError && <div style={{ color: '#ef4444', marginBottom: '10px', fontSize: '0.9rem' }}>{ownerError}</div>}
              <form onSubmit={handleOwnerLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', color: '#94a3b8', fontSize: '0.9rem' }}>Code PIN (4 chiffres)</label>
                  <input 
                    type="password" 
                    maxLength={4} 
                    minLength={4} 
                    pattern="\d{4}" 
                    required 
                    value={ownerPin} 
                    onChange={(e) => setOwnerPin(e.target.value)} 
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #334155', background: '#0f172a', color: '#fff' }} 
                  />
                </div>
                <button type="submit" disabled={ownerLoading} style={{ width: '100%', padding: '10px', background: '#f59e0b', color: '#000', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: ownerLoading ? 'not-allowed' : 'pointer' }}>
                  {ownerLoading ? 'Connexion...' : 'Se connecter'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
