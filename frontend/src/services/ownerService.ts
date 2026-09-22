import api from './api';

export interface OwnerStats {
  dailySales: number;
  weeklySales: number;
  monthlySales: number;
  netProfit30Days: number;
  pendingDebts: number;
  stockValue: number;
  availableCash: number;
  topProducts: { nom: string; qty: number; revenue: number }[];
  recentClosures: any[];
  salesEvolution: { date: string; total: number }[];
}

export const getOwnerDashboardStats = async (): Promise<OwnerStats> => {
  const response = await api.get('/api/owner/dashboard');
  return response.data;
};
