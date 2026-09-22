import api from './api';

export interface Table {
  id: string;
  barId: string;
  nom: string;
  status: 'LIBRE' | 'EN_ATTENTE';
  currentCart: any;
}

export const getTables = async (): Promise<Table[]> => {
  const response = await api.get('/api/tables');
  return response.data;
};

export const updateTableCart = async (id: string, cart: any): Promise<Table> => {
  const response = await api.put(`/api/tables/${id}/cart`, { cart });
  return response.data;
};

export const freeTable = async (id: string): Promise<Table> => {
  const response = await api.put(`/api/tables/${id}/free`);
  return response.data;
};
