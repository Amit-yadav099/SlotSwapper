import axios from 'axios';
import type { Event, EventFormData, CreateSwapRequestData, SwapResponseData } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }),
   getCurrentUser: (token: string) =>
    axios.get(`/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
};

export const eventAPI = {
  getAll: () => api.get<Event[]>('/events'),
  getById: (id: string) => api.get<Event>(`/events/${id}`),
  create: (data: EventFormData) => api.post<Event>('/events', data),
  update: (id: string, data: Partial<EventFormData>) => api.put<Event>(`/events/${id}`, data),
  delete: (id: string) => api.delete(`/events/${id}`),
  updateStatus: (id: string, status: 'BUSY' | 'SWAPPABLE') => 
    api.patch<Event>(`/events/${id}/status`, { status }),
};

export const swapAPI = {
  getSwappableSlots: () => api.get<Event[]>('/swaps/swappable-slots'),
  createSwapRequest: (data: CreateSwapRequestData) => 
    api.post('/swaps/swap-request', data),
  respondToSwapRequest: (requestId: string, data: SwapResponseData) =>
    api.post(`/swaps/swap-response/${requestId}`, data),
  getMyRequests: () => api.get<{ incoming: any[]; outgoing: any[] }>('/swaps/my-requests'),
};

export default api;