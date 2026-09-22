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
      // Pass paymentMode along if payDebt allows it, but currently payDebt in debtService doesn't accept it, I'll update it later if needed, wait, payDebt in controller accepts paymentMode.
      // Actually let's just keep the existing behavior or add it. I'll pass it just in case.
      // Wait, in debtService.ts payDebt only accepts amountPaid. Let's stick to amountPaid for now.
      await payDebt(debtId, parseFloat(paymentAmount));
      setSelectedDebtId(null);
      setPaymentAmount('');
      fetchDebts();
    } catch (error) {
      console.error(error);
      alert("Erreur lors du règlement de l'ardoise.");
    }
  };

  return (
    <div className="debt-container">
      <h1>📋 Gestion des Ardoises Clients</h1>
      <p style={{ color: '#94a3b8', marginBottom: '20px' }}>
        Note : Les ardoises sont désormais créées directement depuis la caisse en sélectionnant le mode de paiement "Ardoise".
      </p>

      {/* Liste des ardoises */}
      <div>
        <h3>Liste des Ardoises</h3>
        {loading ? (
          <p>Chargement...</p>
        ) : debts.length === 0 ? (
          <p>Aucune ardoise en cours.</p>
        ) : (
          <ul className="debt-list">
            {debts.map((debt) => (
              <li key={debt.id} className="debt-item">
                <div className="debt-header">
                  <div>
                    <div className="debt-customer">{debt.customerName}</div>
                    <div className="debt-amounts">
                      Reste : <span className="debt-remaining">{debt.remainingAmount} FCFA</span> / Total : {debt.amount} FCFA
                    </div>
                    {debt.notes && <small style={{ color: '#aaa' }}>Note : {debt.notes}</small>}
                  </div>

                  <div className="debt-actions" style={{ display: 'flex', alignItems: 'center' }}>
                    <span className={`debt-badge ${debt.status.toLowerCase()}`}>
                      {debt.status === 'PAID' ? 'Payé' : debt.status === 'PARTIAL' ? 'Partiel' : 'Non payé'}
                    </span>

                    {debt.status !== 'PAID' && (
                      <button onClick={() => setSelectedDebtId(selectedDebtId === debt.id ? null : debt.id)}>
                        Régler
                      </button>
                    )}
                  </div>
                </div>

                {/* Détails du ticket / boissons */}
                {debt.items && debt.items.length > 0 && (
                  <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#cbd5e1' }}>Détails du ticket :</h4>
                    <table style={{ width: '100%', fontSize: '0.85rem', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ color: '#94a3b8' }}>
                          <th style={{ paddingBottom: '5px' }}>Produit</th>
                          <th style={{ paddingBottom: '5px' }}>Qté</th>
                          <th style={{ paddingBottom: '5px' }}>P.U.</th>
                          <th style={{ paddingBottom: '5px' }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {debt.items.map((item, idx) => (
                          <tr key={idx} style={{ borderTop: '1px solid #334155' }}>
                            <td style={{ paddingTop: '5px' }}>{item.productName}</td>
                            <td style={{ paddingTop: '5px' }}>{item.quantity}</td>
                            <td style={{ paddingTop: '5px' }}>{item.unitPrice} FCFA</td>
                            <td style={{ paddingTop: '5px' }}>{item.subtotal} FCFA</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {selectedDebtId === debt.id && (
                  <div className="debt-pay-box">
                    <input
                      type="number"
                      placeholder="Montant payé"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                    />
                    <button onClick={() => handlePayDebt(debt.id)}>Valider</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};