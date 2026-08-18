import React, { useEffect, useState } from 'react';
import { getDebts, createDebt, payDebt, type Debt } from '../services/debtService';

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
      setDebts(data);
    } catch (error) {
      console.error('Erreur lors du chargement des ardoises :', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
    } catch (error) {
      alert("Erreur lors de la création de l'ardoise.");
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
      alert("Erreur lors du règlement de l'ardoise.");
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>📋 Gestion des Ardoises Clients</h1>

      {/* Formulaire de création d'ardoise */}
      <div style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>Ajouter une Ardoise</h3>
        <form onSubmit={handleCreateDebt} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Nom du client"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
            style={{ padding: '8px', flex: '1' }}
          />
          <input
            type="number"
            placeholder="Montant (FCFA)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            style={{ padding: '8px', width: '150px' }}
          />
          <input
            type="text"
            placeholder="Note (optionnel)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{ padding: '8px', flex: '1' }}
          />
          <button type="submit" style={{ padding: '8px 16px', cursor: 'pointer' }}>
            Enregistrer
          </button>
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
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {debts.map((debt) => (
              <li
                key={debt.id}
                style={{
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  padding: '12px',
                  marginBottom: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <div>
                    <strong>{debt.customerName}</strong>
                    <div>
                      Reste : <span style={{ color: 'red', fontWeight: 'bold' }}>{debt.remainingAmount} FCFA</span> / Total : {debt.amount} FCFA
                    </div>
                    {debt.notes && <small style={{ color: '#666' }}>Note : {debt.notes}</small>}
                  </div>

                  <div>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        marginRight: '10px',
                        background: debt.status === 'PAID' ? '#d4edda' : debt.status === 'PARTIAL' ? '#fff3cd' : '#f8d7da',
                      }}
                    >
                      {debt.status}
                    </span>

                    {debt.status !== 'PAID' && (
                      <button
                        onClick={() => setSelectedDebtId(selectedDebtId === debt.id ? null : debt.id)}
                        style={{ padding: '4px 8px', cursor: 'pointer' }}
                      >
                        Régler
                      </button>
                    )}
                  </div>
                </div>

                {selectedDebtId === debt.id && (
                  <div style={{ width: '100%', display: 'flex', gap: '5px' }}>
                    <input
                      type="number"
                      placeholder="Montant payé"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      style={{ padding: '4px' }}
                    />
                    <button onClick={() => handlePayDebt(debt.id)} style={{ padding: '4px 8px' }}>
                      Valider
                    </button>
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