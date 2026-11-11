import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL || 'https://salmanansari-velora-store.vercel.app/api';

export const api = axios.create({
  baseURL: apiBaseUrl.replace(/\/+$/, ''),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('velora_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function errorMessage(error, fallback = 'Something went wrong. Please try again.') {
  return error?.response?.data?.message || fallback;
}
