import api from './api';

export interface LoginPayload {
  codeBar: string;
  pin: string;
}

export interface AuthResponse {
  message: string;
  bar?: {
    id: string;
    nomBar: string;
  };
  user?: any;
}

export const loginBar = async (payload: LoginPayload): Promise<AuthResponse> => {
  const response = await api.post('/api/auth/login', {
    barId: payload.codeBar.trim(),
    pin: payload.pin.trim(),
  });
  if (response.data?.bar?.role) {
    localStorage.setItem('offline_role', response.data.bar.role);
  }
  return response.data;
};

export const ownerLogin = async (payload: { barId: string; pin: string }): Promise<any> => {
  const response = await api.post('/api/auth/owner-login', payload);
  if (response.data?.bar?.role) {
    localStorage.setItem('offline_role', response.data.bar.role);
  }
  return response.data;
};

export const loginSuperAdmin = async (payload: { username: string; password: string }): Promise<any> => {
  const response = await api.post('/api/auth/super-admin', payload);
  if (response.data?.user?.role) {
    localStorage.setItem('offline_role', response.data.user.role);
  }
  return response.data;
};

export const logoutBar = async (): Promise<void> => {
  localStorage.removeItem('offline_role');
  try {
    await api.post('/api/auth/logout');
  } catch (error) {
    // Ignore error if offline during logout
  }
};

export const getMe = async (): Promise<any> => {
  try {
    const response = await api.get('/api/auth/me');
    if (response.data?.user) {
      localStorage.setItem('offline_role', response.data.user.role);
      return response.data.user;
    } else {
      localStorage.removeItem('offline_role');
      return null;
    }
  } catch (error: any) {
    // Si on est hors ligne ou erreur réseau, on tente d'utiliser le cache
    if (!navigator.onLine || error.code === 'ERR_NETWORK') {
      const offlineRole = localStorage.getItem('offline_role');
      if (offlineRole) {
        return { role: offlineRole, offlineMode: true };
      }
    }
    return null;
  }
};