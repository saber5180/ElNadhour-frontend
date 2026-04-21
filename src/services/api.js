import axios from 'axios';
import { getApiBaseURL } from '../utils/apiBase';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: getApiBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // FormData : ne pas forcer application/json — sinon le fichier n'arrive pas (multer: "Image file required")
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 unauthorized errors
    if (error.response?.status === 401) {
      const reqUrl = error.config?.url || '';
      // Wrong password on login returns 401 — do not hard-redirect (hides the error toast).
      if (!reqUrl.includes('/auth/login')) {
        localStorage.removeItem('token');
        window.location.href = '/admin/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;