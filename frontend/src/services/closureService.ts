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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validateClosure = async (closureData: { actualCash: number; comments?: string }): Promise<any> => {
  const response = await api.post('/api/closures/validate', closureData);
  return response.data;
};

export interface DailyDetails {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cashSales: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debtSales: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  expenses: any[];
}

export const getDailyDetails = async (): Promise<DailyDetails> => {
  const response = await api.get('/api/closures/daily-details');
  return response.data;
};

export const getFinancialReport = async (startDate?: string, endDate?: string): Promise<any> => {
  const params = new URLSearchParams();
  if (startDate) params.append('startDate', startDate);
  if (endDate) params.append('endDate', endDate);
  
  const response = await api.get(`/api/closures/report?${params.toString()}`);
  return response.data;
};
