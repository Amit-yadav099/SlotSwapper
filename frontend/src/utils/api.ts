import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const authAPI = {
  login: (email: string, password: string) => 
    axios.post(`${API_BASE_URL}/auth/login`, { email, password }),
  register: (name: string, email: string, password: string) =>
    axios.post(`${API_BASE_URL}/auth/register`, { name, email, password })
};

// You can add more API calls here for events, swap requests, etc.

// Also, set up an axios interceptor to include the token in requests
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);