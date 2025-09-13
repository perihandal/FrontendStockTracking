import type { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import axios from 'axios';

// API Base Configuration
const API_BASE_URL = 'http://localhost:5000'; // Hardcode for now
console.log('🚀 API Client initialized with URL:', API_BASE_URL);

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - JWT token ekleme
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const fullUrl = `${API_BASE_URL}${config.url}`;
    console.log('📤 Request interceptor - Full URL:', fullUrl);
    console.log('📤 Request interceptor - Method:', config.method?.toUpperCase());
    console.log('📤 Request interceptor - Headers:', config.headers);
    
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token added to request');
    } else {
      console.log('⚠️ No token found in localStorage');
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Token refresh ve error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('✅ Response received:', response.status, response.config.url);
    console.log('✅ Response data:', response.data);
    return response;
  },
  async (error) => {
    console.error('❌ Response error occurred:');
    console.error('❌ Error message:', error.message);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error config:', error.config);
    console.error('❌ Error response:', error.response);
    if (error.response?.data) {
      console.error('❌ Error response data:', JSON.stringify(error.response.data, null, 2));
      console.error('❌ Error response status:', error.response.status);
      console.error('❌ Error response statusText:', error.response.statusText);
    }
    console.error('❌ Error request:', error.request);
    
    // Network Error specific handling
    if (error.message === 'Network Error') {
      console.error('🌐 NETWORK ERROR - Possible causes:');
      console.error('🌐 1. Backend is not running');
      console.error('🌐 2. Wrong port number');
      console.error('🌐 3. CORS issue');
      console.error('🌐 4. Firewall blocking');
      console.error('🌐 5. Backend crashed');
    }

    // 401 Unauthorized - Token expired or missing
    if (error.response?.status === 401) {
      console.log('🔐 401 Unauthorized - Redirecting to login page');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/sign-in';
      return Promise.reject(error);
    }
    
    const originalRequest = error.config;

    // Token refresh logic (if needed later)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data;
          localStorage.setItem('accessToken', accessToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token da expired, login sayfasına yönlendir
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/sign-in';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
