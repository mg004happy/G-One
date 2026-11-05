/**
 * Axios instance with JWT interceptor and error handling.
 *
 * In development, Vite proxies /api → http://localhost:8080.
 * In production, set VITE_API_URL to the backend base URL.
 */
import axios from 'axios';
import { getToken, clearAuthStorage } from '../utils/storage';
import { API_BASE_URL } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// ---- Request Interceptor: Attach JWT ----
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---- Response Interceptor: Handle errors ----
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    if (response) {
      // 401 Unauthorized → token expired or invalid
      if (response.status === 401) {
        clearAuthStorage();
        // Only redirect if we're not already on auth pages
        if (!window.location.pathname.startsWith('/login') &&
            !window.location.pathname.startsWith('/register')) {
          window.location.href = '/login';
        }
      }

      // Normalize error message
      const message =
        response.data?.message ||
        response.data?.error ||
        `Request failed with status ${response.status}`;

      return Promise.reject(new Error(message));
    }

    // Network error
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timed out. Please try again.'));
    }

    return Promise.reject(new Error('Network error. Please check your connection.'));
  }
);

export default api;
