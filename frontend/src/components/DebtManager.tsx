import React, { useState, useEffect } from 'react';
import { getDebts, payDebt, type Debt } from '../services/debtService';
import '../styles/debt.css';

export const DebtManager: React.FC = () => {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Champs de règlement rapide
  const [selectedDebtId, setSelectedDebtId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  const fetchDebts = async () => {
    try {
      setLoading(true);
      const data = await getDebts();
      setDebts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur lors du chargement des ardoises :', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDebts();
  }, []);

  const handlePayDebt = async (debtId: string) => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) return;

    try {
      await payDebt(debtId, parseFloat(paymentAmount));
      setSelectedDebtId(null);
      setPaymentAmount('');
      fetchDebts();
    } catch (error) {
      console.error(error);
      alert("Erreur lors du règlement de l'ardoise.");
    }
  };

  const getStatusClass = (status: string) => {
    if (status === 'PAID') return 'paid';
    if (status === 'PARTIAL') return 'partial';
    return 'unpaid';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'PAID') return 'Payé';
    if (status === 'PARTIAL') return 'Partiel';
    return 'Non payé';
  };

  return (
    <div className="debt-container">
      <h1>📋 Ardoises Clients</h1>
      <p className="debt-notice">
        Retrouvez ici toutes les consommations mises en attente de paiement (crédits).
      </p>

      {loading ? (
        <p>Chargement...</p>
      ) : debts.length === 0 ? (
        <p className="debt-notice" style={{ fontStyle: 'italic' }}>Aucune ardoise en cours.</p>
      ) : (
        <ul className="debt-list">
          {debts.map((debt) => (
            <li key={debt.id} className={`debt-item ${getStatusClass(debt.status)}`}>
              <div className="debt-header">
                <div>
                  <div className="debt-customer">{debt.customerName}</div>
                  <div className="debt-date">{new Date(debt.date).toLocaleDateString()}</div>
                </div>
                <span className={`debt-badge ${getStatusClass(debt.status)}`}>
                  {getStatusLabel(debt.status)}
                </span>
              </div>

              <div className="debt-amounts">
                <div>Montant Initial : {debt.amount} FCFA</div>
                <div className="debt-remaining">Reste à payer : {debt.remainingAmount} FCFA</div>
                {debt.notes && <small style={{ color: '#aaa', display: 'block', marginTop: '5px' }}>Note : {debt.notes}</small>}
              </div>

              {/* Détails du ticket / boissons */}
              {debt.items && debt.items.length > 0 && (
                <div className="debt-details">
                  <h4>Détails du ticket</h4>
                  <table className="debt-details-table">
                    <thead>
                      <tr>
                        <th>Produit</th>
                        <th>Qté</th>
                        <th>P.U.</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {debt.items.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.productName}</td>
                          <td>{item.quantity}</td>
                          <td>{item.unitPrice}</td>
                          <td>{item.subtotal}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {debt.status !== 'PAID' && selectedDebtId !== debt.id && (
                <button 
                  className="debt-pay-btn"
                  onClick={() => { setSelectedDebtId(debt.id); setPaymentAmount(debt.remainingAmount.toString()); }}
                >
                  Régler l'ardoise
                </button>
              )}

              {selectedDebtId === debt.id && (
                <div className="debt-pay-box">
                  <input
                    type="number"
                    placeholder="Montant payé (FCFA)"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                  />
                  <div className="debt-pay-actions">
                    <button className="btn-confirm-pay" onClick={() => handlePayDebt(debt.id)}>Valider le paiement</button>
                    <button className="btn-cancel-pay" onClick={() => setSelectedDebtId(null)}>Annuler</button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};