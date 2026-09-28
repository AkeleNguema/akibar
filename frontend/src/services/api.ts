import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace(/\/+$/, '') 
  : `http://${window.location.hostname}:5000`;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  
  const assistanceBarId = localStorage.getItem('assistanceBarId');
  if (assistanceBarId) {
    config.headers['X-Assistance-Bar-Id'] = assistanceBarId;
  }
  return config;
});

export default api;