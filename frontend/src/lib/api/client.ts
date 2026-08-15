// src/lib/api/client.ts
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { tokenManager } from '@/utils/tokenManager';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = tokenManager.getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = tokenManager.getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token');

        const response = await axios.post(
          `${API_URL}/auth/refresh`,
          { refreshToken },
          { withCredentials: true }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        tokenManager.setAccessToken(accessToken);
        tokenManager.setRefreshToken(newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        tokenManager.clearAll();
        window.location.href = '/login';
        toast.error('Session expired. Please login again.');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ✅ Auto-refresh token every 10 minutes
setInterval(async () => {
  const refreshToken = tokenManager.getRefreshToken();
  if (!refreshToken) return;

  try {
    const response = await axios.post(
      `${API_URL}/auth/refresh`,
      { refreshToken },
      { withCredentials: true }
    );
    const { accessToken, refreshToken: newRefreshToken } = response.data.data;
    tokenManager.setAccessToken(accessToken);
    tokenManager.setRefreshToken(newRefreshToken);
  } catch (error) {
    // Silent fail – will redirect on 401
  }
}, 10 * 60 * 1000); // 10 minutes