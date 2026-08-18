import api from './api';

export interface Debt {
  id: string;
  customerName: string;
  amount: number;
  remainingAmount: number;
  status: 'UNPAID' | 'PARTIAL' | 'PAID';
  notes?: string;
  createdAt: string;
}

export const getDebts = async (): Promise<Debt[]> => {
  const response = await api.get('/api/debts');
  return response.data;
};

export const createDebt = async (debtData: { customerName: string; amount: number; notes?: string }) => {
  const response = await api.post('/api/debts', debtData);
  return response.data;
};

export const payDebt = async (debtId: string, amountPaid: number) => {
  const response = await api.patch(`/api/debts/${debtId}/pay`, { amountPaid });
  return response.data;
};