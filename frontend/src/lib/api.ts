// frontend/src/lib/api.ts
import axios, { AxiosInstance } from 'axios';
import { getSession, signOut } from 'next-auth/react';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request interceptor: attach token
apiClient.interceptors.request.use(async (config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: refresh on 401
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const data = await apiClient.post('/api/auth/refresh', { refreshToken });
        localStorage.setItem('accessToken', (data as any).accessToken);
        original.headers.Authorization = `Bearer ${(data as any).accessToken}`;
        return apiClient(original);
      } catch {
        localStorage.clear();
        window.location.href = '/auth/login';
      }
    }
    return Promise.reject(error.response?.data || error);
  },
);

export const api = {
  get:    (url: string, params?: any) => apiClient.get(url, { params }),
  post:   (url: string, data?: any)   => apiClient.post(url, data),
  patch:  (url: string, data?: any)   => apiClient.patch(url, data),
  delete: (url: string)               => apiClient.delete(url),
  upload: (url: string, formData: FormData) =>
    apiClient.post(url, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

export default apiClient;
