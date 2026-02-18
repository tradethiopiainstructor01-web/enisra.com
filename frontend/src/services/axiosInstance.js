import axios from 'axios';
import { resolveApiBase } from '../utils/apiBase';

const clearAuthStorage = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('userToken');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userRoleRaw');
  localStorage.removeItem('userName');
  localStorage.removeItem('userStatus');
  localStorage.removeItem('infoStatus');
  localStorage.removeItem('userDepartment');
  localStorage.removeItem('userId');
  localStorage.removeItem('userEmail');
};

// Create an axios instance with default config
const axiosInstance = axios.create({
  baseURL: resolveApiBase(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window === 'undefined') {
      return config;
    }
    const token = localStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Axios response error:', error);
    if (error.response?.status === 401) {
      // Token expired or invalid
      clearAuthStorage();
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
