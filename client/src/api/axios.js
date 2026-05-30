import axios from 'axios';

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

export default api;