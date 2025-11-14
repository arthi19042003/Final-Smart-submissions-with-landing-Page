// client/src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: '/api' // Proxy in package.json handles the domain
});

// Attach token if stored
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;