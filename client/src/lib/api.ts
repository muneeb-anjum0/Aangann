import axios from "axios";

// Use environment variable for API base URL
const baseURL = import.meta.env.VITE_API_BASE_URL || "/api";

const api = axios.create({ 
  baseURL: baseURL,
});

// Add request interceptor to include auth token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid, remove it
      localStorage.removeItem('authToken');
      // Optionally redirect to login or refresh page
      if (window.location.pathname.includes('/admin')) {
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Axios instance for making API requests with automatic token management
// Updated to use Bearer token authentication with localStorage
