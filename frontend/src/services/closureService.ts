import api from './api';

export interface ClosureReport {
  totalSales: number;
  totalExpenses: number;
  cashSales: number;
  mobileMoneySales: number;
  debtSales: number;
  expectedCash: number;
  date: string;
}

export const getDailyClosure = async (): Promise<ClosureReport> => {
  const response = await api.get('/api/closures/daily');
  return response.data;
};

export const validateClosure = async (closureData: { actualCash: number; comments?: string }): Promise<any> => {
  const response = await api.post('/api/closures/validate', closureData);
  return response.data;
};
