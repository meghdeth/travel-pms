/// <reference types="node" />
import axios from 'axios';
import { cookieAuthService } from './cookieAuth';

// Use environment variable for API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Request interceptor for auth token
apiClient.interceptors.request.use(
  (config) => {
    // Use cookie-based authentication instead of localStorage
    const token = cookieAuthService.getAuthToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('API Response:', response.config.url, response.status, response.data);
    }
    return response;
  },
  (error) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('API Error:', error.config?.url, error.response?.status, error.response?.data, error.message);
    }
    
    // Handle authentication errors
    if (error.response?.status === 401 || 
        (error.response?.status === 403 && 
         error.response?.data?.message?.includes('Invalid hotel user token'))) {
      
      // Clear all auth cookies
      cookieAuthService.clearAuth();
      
      // Redirect to login if on client side
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
     return Promise.reject(error);
   }
);