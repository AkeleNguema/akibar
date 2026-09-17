import api from './api';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  createdAt: string;
}

export const getExpenses = async (): Promise<Expense[]> => {
  const response = await api.get('/api/expenses');
  return response.data;
};

export const createExpense = async (expenseData: { description: string; amount: number }): Promise<Expense> => {
  const response = await api.post('/api/expenses', expenseData);
  return response.data;
};
