import axios from "axios";
import { resolveApiBase } from './apiBase';

const baseURL = resolveApiBase();
let redirectingToLogin = false;

const clearAuthStorage = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("userToken");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userRoleRaw");
  localStorage.removeItem("userName");
  localStorage.removeItem("userStatus");
  localStorage.removeItem("infoStatus");
  localStorage.removeItem("userDepartment");
  localStorage.removeItem("userId");
  localStorage.removeItem("userEmail");
};

const redirectToLogin = () => {
  if (typeof window === "undefined") return;
  if (redirectingToLogin || window.location.pathname === "/login") return;
  redirectingToLogin = true;
  window.location.href = "/login";
};

const apiClient = axios.create({
  baseURL,
});

apiClient.interceptors.request.use(
  (config) => {
    if (typeof window === "undefined") {
      return config;
    }
    const token = localStorage.getItem("userToken");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    // Return successful responses
    return response;
  },
  (error) => {
    // Ignore request cancellations (AbortController/navigation) to avoid noisy logs/toasts.
    if (error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError') {
      return Promise.reject(error);
    }

    // Handle different types of errors
    if (error.response) {
      // Server responded with error status
      console.error('API Error Response:', error.response.status, error.response.data);
      if (error.response.status === 401) {
        clearAuthStorage();
        redirectToLogin();
      }
      return Promise.reject({
        ...error,
        message: error.response.data?.message || 'Server error occurred',
        status: error.response.status
      });
    } else if (error.request) {
      // Request was made but no response received
      console.error('API No Response:', error.request);
      return Promise.reject({
        ...error,
        message: 'No response from server. Please check your connection.'
      });
    } else {
      // Something else happened
      console.error('API Error:', error.message);
      return Promise.reject({
        ...error,
        message: error.message || 'An error occurred'
      });
    }
  }
);

export default apiClient;
