import axios from 'axios';

export const TOKEN_STORAGE_KEY = 'rh_token';

// Lee la variable de entorno en build-time (Vite). Fallback para desarrollo.
const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Token inválido o expirado: limpiar para que la app vuelva al estado público.
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
    return Promise.reject(error);
  },
);

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}