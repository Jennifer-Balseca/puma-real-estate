import axios from 'axios';
import { emitPropertiesRefresh } from '../utils/propertyEvents';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const storedAuth = window.localStorage.getItem('puma-auth');

  if (storedAuth) {
    const parsedAuth = JSON.parse(storedAuth);

    if (parsedAuth?.token) {
      config.headers.Authorization = `Bearer ${parsedAuth.token}`;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    const method = String(response.config?.method ?? '').toLowerCase();
    const url = String(response.config?.url ?? '');

    if (url.includes('/api/properties') && ['post', 'put', 'delete'].includes(method)) {
      emitPropertiesRefresh();
    }

    return response;
  },
  (error) => {
    const url = String(error.config?.url ?? '');
    
    if (error.response && error.response.status === 401 && !url.includes('/api/auth/login')) {
      window.localStorage.removeItem('puma-auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;