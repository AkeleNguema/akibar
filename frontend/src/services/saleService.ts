import api from './api';

export interface SaleItemPayload {
  productId: string;
  quantite: number;
}

export interface CreateSalePayload {
  items: SaleItemPayload[];
  totalAmount: number;
  paymentMode: 'ESPECES' | 'AIRTEL_MONEY' | 'MOOV_MONEY' | 'ARDOISE';
  nomClient?: string;
  syncId?: string; // Optionnel pour l'idempotence
}

export const createSale = async (payload: CreateSalePayload) => {
  const response = await api.post('/api/sales', payload);
  return response.data;
};