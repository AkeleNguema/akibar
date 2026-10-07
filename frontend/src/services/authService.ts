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
  try {
    const response = await api.post('/api/auth/login', {
      barId: payload.codeBar.trim(),
      pin: payload.pin.trim(),
    });
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
      // Pour permettre le login hors ligne ultérieurement
      localStorage.setItem('offline_pin_hash', btoa(payload.codeBar.trim() + ':' + payload.pin.trim()));
    }
    if (response.data?.bar?.role) {
      localStorage.setItem('offline_role', response.data.bar.role);
    }
    return response.data;
  } catch (error: any) {
    if (!navigator.onLine || error.code === 'ERR_NETWORK') {
      const savedHash = localStorage.getItem('offline_pin_hash');
      const inputHash = btoa(payload.codeBar.trim() + ':' + payload.pin.trim());
      
      if (savedHash && savedHash === inputHash) {
        // Authentification offline réussie
        const role = localStorage.getItem('offline_role') || 'GERANT';
        return {
          message: 'Connecté (Mode Hors Ligne)',
          bar: { id: payload.codeBar.trim(), nomBar: 'Bar (Hors Ligne)', role } as any,
          user: { role }
        };
      }
      throw { response: { data: { error: 'Identifiants invalides ou connexion internet requise pour la première connexion.' } } };
    }
    throw error;
  }
};

export const ownerLogin = async (payload: { barId: string; pin: string }): Promise<any> => {
  const response = await api.post('/api/auth/owner-login', payload);
  if (response.data?.token) {
    localStorage.setItem('token', response.data.token);
  }
  if (response.data?.bar?.role) {
    localStorage.setItem('offline_role', response.data.bar.role);
  }
  return response.data;
};

export const loginSuperAdmin = async (payload: { username: string; password: string }): Promise<any> => {
  const response = await api.post('/api/auth/super-admin', payload);
  if (response.data?.token) {
    localStorage.setItem('token', response.data.token);
  }
  if (response.data?.user?.role) {
    localStorage.setItem('offline_role', response.data.user.role);
  }
  return response.data;
};

export const logoutBar = async (): Promise<void> => {
  localStorage.removeItem('token');
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