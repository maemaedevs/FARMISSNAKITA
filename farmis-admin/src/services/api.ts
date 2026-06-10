import axios, { AxiosError, type AxiosInstance } from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api';

export const api: AxiosInstance = axios.create({
  baseURL,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const TOKEN_STORAGE_KEY = 'farmis.admin.token';

export function setAuthToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    delete api.defaults.headers.common.Authorization;
  }
}

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

// Hydrate token (if present) so subsequent requests are authenticated.
const existing = getStoredToken();
if (existing) {
  api.defaults.headers.common.Authorization = `Bearer ${existing}`;
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    if (error.response?.status === 401) {
      setAuthToken(null);
      // Avoid hard redirect inside interceptor — let auth context observe storage.
    }
    return Promise.reject(error);
  },
);
