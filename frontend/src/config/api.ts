import axios from 'axios';

// Base API instance pointing to our GigGuard server
const api = axios.create({
  baseURL: 'https://gig-guard.onrender.com/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ── Request interceptor: attach JWT on every request ──────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gg_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 (expired token) ─────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stale auth and redirect to login
      localStorage.removeItem('gg_token');
      localStorage.removeItem('gg_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
