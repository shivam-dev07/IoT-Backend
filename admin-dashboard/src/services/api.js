import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
};

// Devices API
export const devicesAPI = {
  getAll: (params) => api.get('/devices', { params }),
  getById: (id) => api.get(`/devices/${id}`),
  create: (data) => api.post('/devices', data),
  update: (id, data) => api.put(`/devices/${id}`, data),
  delete: (id) => api.delete(`/devices/${id}`),
  getData: (id, params) => api.get(`/devices/${id}/data`, { params }),
  getLatestData: (id) => api.get(`/devices/${id}/data/latest`),
};

// Gateways API
export const gatewaysAPI = {
  getAll: (params) => api.get('/gateways', { params }),
  getById: (id) => api.get(`/gateways/${id}`),
  create: (data) => api.post('/gateways', data),
  update: (id, data) => api.put(`/gateways/${id}`, data),
  delete: (id) => api.delete(`/gateways/${id}`),
  getNodes: (id, params) => api.get(`/gateways/${id}/nodes`, { params }),
};

// Nodes API
export const nodesAPI = {
  getData: (mac, params) => api.get(`/nodes/${mac}/data`, { params }),
};

// Sensor Data API
export const sensorDataAPI = {
  getRecent: (params) => api.get('/sensor-data', { params }),
};

// OTA API
export const otaAPI = {
  getFirmware: (params) => api.get('/ota/firmware', { params }),
  uploadFirmware: (formData) =>
    api.post('/ota/firmware', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  triggerUpdate: (data) => api.post('/ota/update', data),
  getHistory: (params) => api.get('/ota/history', { params }),
};

// Logs API
export const logsAPI = {
  getAll: (params) => api.get('/logs', { params }),
};

// Status API
export const statusAPI = {
  getStatus: () => api.get('/status'),
  getHealth: () => api.get('/health'),
};

// Commands API
export const commandsAPI = {
  send: (data) => api.post('/commands/send', data),
};

export default api;
