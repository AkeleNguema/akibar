import api from './api';

export interface LoginPayload {
  codeBar: string;
  pin: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  bar: {
    id: string;
    nomBar: string;
  };
}

export const loginBar = async (payload: LoginPayload): Promise<AuthResponse> => {
  const response = await api.post('/api/auth/login', {
    barId: payload.codeBar.trim(),
    pin: payload.pin.trim(),
  });

  if (response.data?.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

export const logoutBar = (): void => {
  localStorage.removeItem('token');
};

export const getStoredToken = (): string | null => {
  return localStorage.getItem('token');
};