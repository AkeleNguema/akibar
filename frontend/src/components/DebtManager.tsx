import React, { useEffect, useState } from 'react';
import { getDebts, createDebt, payDebt, type Debt } from '../services/debtService';
import '../styles/debt.css';

export const DebtManager: React.FC = () => {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Champs de création d'ardoise
  const [customerName, setCustomerName] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

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

  const handleCreateDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !amount) return;

    try {
      await createDebt({
        customerName,
        amount: parseFloat(amount),
        notes,
      });
      setCustomerName('');
      setAmount('');
      setNotes('');
      fetchDebts();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      alert("Erreur lors de la création de l'ardoise : " + (error.response?.data?.message || error.message));
    }
  };

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

  return (
    <div className="debt-container">
      <h1>📋 Gestion des Ardoises Clients</h1>

      {/* Formulaire de création d'ardoise */}
      <div className="debt-form-card">
        <h3>Ajouter une Ardoise</h3>
        <form className="debt-form" onSubmit={handleCreateDebt}>
          <input
            type="text"
            placeholder="Nom du client"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Montant (FCFA)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Note (optionnel)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <button type="submit">Enregistrer</button>
        </form>
      </div>

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