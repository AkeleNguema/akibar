import api from './api';

export const getConsignes = async () => {
  const response = await api.get('/consignes');
  return response.data;
};

export const createConsigne = async (data: { nomClient: string; nombreCasiers: number }) => {
  const response = await api.post('/consignes', data);
  return response.data;
};

export const updateConsigneStatut = async (id: string, statut: string) => {
  const response = await api.put(`/consignes/${id}`, { statut });
  return response.data;
};
