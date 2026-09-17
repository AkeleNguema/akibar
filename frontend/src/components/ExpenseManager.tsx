import React, { useEffect, useState } from 'react';
import { getExpenses, createExpense, type Expense } from '../services/expenseService';
import '../styles/expense.css';

export const ExpenseManager: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await getExpenses();
      setExpenses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erreur chargement dépenses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;

    try {
      await createExpense({ description, amount: parseFloat(amount) });
      setDescription('');
      setAmount('');
      loadExpenses();
    } catch (err) {
      console.error('Erreur création dépense:', err);
      alert('Erreur lors de la création de la dépense.');
    }
  };

  return (
    <div className="expense-container">
      <div className="expense-form-card">
        <h3>Enregistrer une Dépense</h3>
        <form className="expense-form" onSubmit={handleCreateExpense}>
          <input
            type="text"
            placeholder="Motif (ex: Achat de glace, Transport...)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Montant (FCFA)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <button type="submit">Valider</button>
        </form>
      </div>

      <div className="expense-list-card">
        <h3>Dépenses du jour</h3>
        {loading ? (
          <p>Chargement...</p>
        ) : expenses.length === 0 ? (
          <p>Aucune dépense enregistrée aujourd'hui.</p>
        ) : (
          <div>
            {expenses.map((expense) => (
              <div key={expense.id} className="expense-item">
                <div className="expense-info">
                  <strong>{expense.description}</strong>
                  <small>{new Date(expense.createdAt || expense.date).toLocaleTimeString('fr-FR')}</small>
                </div>
                <div className="expense-amount">
                  -{expense.amount.toLocaleString('fr-FR')} FCFA
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
