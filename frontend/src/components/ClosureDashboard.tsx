import React, { useEffect, useState } from 'react';
import { getDailyClosure, validateClosure, type ClosureReport } from '../services/closureService';
import '../styles/closure.css';

export const ClosureDashboard: React.FC = () => {
  const [report, setReport] = useState<ClosureReport | null>(null);
  const [actualCash, setActualCash] = useState<string>('');
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  const loadReport = async () => {
    try {
      setLoading(true);
      const data = await getDailyClosure();
      setReport(data);
      setActualCash(data.expectedCash.toString());
    } catch (err) {
      console.error('Erreur chargement clôture:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const handleValidate = async () => {
    if (!actualCash) return;
    try {
      await validateClosure({
        actualCash: parseFloat(actualCash),
        comments,
      });
      setIsClosed(true);
      alert('Clôture validée avec succès !');
    } catch (err) {
      console.error('Erreur validation clôture:', err);
      alert('Erreur lors de la validation de la clôture.');
    }
  };

  if (loading) return <div className="closure-container">Chargement...</div>;
  if (!report) return <div className="closure-container">Impossible de charger les données du jour.</div>;

  return (
    <div className="closure-container">
      <h2>Bilan de la journée</h2>

      <div className="closure-dashboard">
        <div className="closure-card">
          <h3>Total Ventes</h3>
          <div className="amount">{report.totalSales.toLocaleString('fr-FR')} FCFA</div>
        </div>
        <div className="closure-card">
          <h3>Ventes Espèces</h3>
          <div className="amount">{report.cashSales.toLocaleString('fr-FR')} FCFA</div>
        </div>
        <div className="closure-card">
          <h3>Ventes Mobile Money</h3>
          <div className="amount">{report.mobileMoneySales.toLocaleString('fr-FR')} FCFA</div>
        </div>
        <div className="closure-card">
          <h3>Dépenses</h3>
          <div className="amount" style={{ color: '#f87171' }}>-{report.totalExpenses.toLocaleString('fr-FR')} FCFA</div>
        </div>
        <div className="closure-card highlight">
          <h3>Caisse Attendue</h3>
          <div className="amount">{report.expectedCash.toLocaleString('fr-FR')} FCFA</div>
        </div>
      </div>

      {!isClosed ? (
        <div className="closure-action">
          <h3>Validation de la Caisse Physique</h3>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' }}>
            <span>Espèces recomptées :</span>
            <input
              type="number"
              value={actualCash}
              onChange={(e) => setActualCash(e.target.value)}
            />
            <span>FCFA</span>
          </div>
          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="Commentaire (ex: écart de caisse expliqué par...)"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              style={{ width: '80%' }}
            />
          </div>
          <button className="btn-validate-closure" onClick={handleValidate}>
            Clôturer la journée
          </button>
        </div>
      ) : (
        <div className="closure-action" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
          <h3 style={{ color: '#4ade80' }}>Journée clôturée !</h3>
          <p>Le rapport a été enregistré avec succès.</p>
        </div>
      )}
    </div>
  );
};
