import axios from "axios";

// Use environment variable for API base URL
const baseURL = import.meta.env.VITE_API_BASE_URL || "/api";

const api = axios.create({ 
  baseURL: baseURL,
  withCredentials: true 
});

export default api;

// Axios instance for making API requests with credentials
// Updated to use correct API base URL from environment variables
