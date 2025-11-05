import axios from 'axios';
import { Event, EventFormData, CreateSwapRequestData, SwapResponseData, LoginFormData, RegisterFormData, SwapRequestsResponse } from '../types';

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
  login: (data: LoginFormData) =>
    api.post('/auth/login', data),
  register: (data: Omit<RegisterFormData, 'confirmPassword'>) =>
    api.post('/auth/register', data),
};

export const eventAPI = {
  getAll: () => api.get<{ events: Event[] }>('/events'),
  getById: (id: string) => api.get<{ event: Event }>(`/events/${id}`),
  create: (data: EventFormData) => api.post<{ event: Event }>('/events', data),
  update: (id: string, data: Partial<EventFormData>) => api.put<{ event: Event }>(`/events/${id}`, data),
  delete: (id: string) => api.delete(`/events/${id}`),
  updateStatus: (id: string, status: 'BUSY' | 'SWAPPABLE') => 
    api.patch<{ event: Event }>(`/events/${id}/status`, { status }),
};

export const swapAPI = {
  getSwappableSlots: () => api.get<{ slots: Event[] }>('/swaps/swappable-slots'),
  createSwapRequest: (data: CreateSwapRequestData) => 
    api.post<{ swapRequest: any }>('/swaps/swap-request', data),
  respondToSwapRequest: (requestId: string, data: SwapResponseData) =>
    api.post<{ swapRequest: any }>(`/swaps/swap-response/${requestId}`, data),
  getMyRequests: () => api.get<SwapRequestsResponse>('/swaps/my-requests'),
};

export default api;