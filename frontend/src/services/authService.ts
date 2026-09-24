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

export const ownerLogin = async (payload: { barId: string; pin: string }): Promise<any> => {
  const response = await api.post('/api/auth/owner-login', payload);
  if (response.data?.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

export const loginSuperAdmin = async (payload: { username: string; password: string }): Promise<any> => {
  const response = await api.post('/api/auth/super-admin', payload);
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

export const getUserRole = (): string | null => {
  const token = getStoredToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role || null;
  } catch (e) {
    return null;
  }
};