import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Base URL - change this to your backend URL
// For iOS simulator: http://localhost:8000
// For Android emulator: http://10.0.2.2:8000
// For physical device: http://YOUR_COMPUTER_IP:8000
const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
const TOKEN_KEY = '@auth_token';
const REFRESH_TOKEN_KEY = '@refresh_token';

export const tokenManager = {
  async getAccessToken() {
    return await AsyncStorage.getItem(TOKEN_KEY);
  },

  async getRefreshToken() {
    return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  },

  async setTokens(accessToken, refreshToken) {
    await AsyncStorage.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) {
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },

  async clearTokens() {
    await AsyncStorage.removeItem(TOKEN_KEY);
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await tokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await tokenManager.getRefreshToken();
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          await tokenManager.setTokens(access, refreshToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        await tokenManager.clearTokens();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  async register(userData) {
    const response = await api.post('/auth/register/', userData);
    if (response.data.tokens) {
      await tokenManager.setTokens(
        response.data.tokens.access,
        response.data.tokens.refresh
      );
    }
    return response.data;
  },

  async login(username, password) {
    const response = await api.post('/auth/login/', { username, password });
    await tokenManager.setTokens(response.data.access, response.data.refresh);
    return response.data;
  },

  async logout() {
    await tokenManager.clearTokens();
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me/');
    return response.data;
  },

  async updateProfile(userData) {
    const response = await api.put('/auth/me/', userData);
    return response.data;
  },
};

// Pets API
export const petsAPI = {
  async getAll() {
    const response = await api.get('/pets/');
    // Handle paginated response from Django REST Framework
    return response.data.results || response.data;
  },

  async getOne(id) {
    const response = await api.get(`/pets/${id}/`);
    return response.data;
  },

  async create(petData) {
    const response = await api.post('/pets/', petData);
    return response.data;
  },

  async update(id, petData) {
    const response = await api.patch(`/pets/${id}/`, petData);
    return response.data;
  },

  async delete(id) {
    await api.delete(`/pets/${id}/`);
  },

  async uploadPhoto(petId, photoUri) {
    const formData = new FormData();

    // Extract filename from URI
    const filename = photoUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('image', {
      uri: photoUri,
      name: filename,
      type,
    });

    const response = await api.post(`/pets/${petId}/upload-photo/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getPhotos(petId) {
    const response = await api.get(`/pets/${petId}/photos/`);
    return response.data;
  },
};

// Events API
export const eventsAPI = {
  async getAll() {
    const response = await api.get('/events/');
    // Handle paginated response from Django REST Framework
    return response.data.results || response.data;
  },

  async getOne(id) {
    const response = await api.get(`/events/${id}/`);
    return response.data;
  },

  async create(eventData) {
    const response = await api.post('/events/', eventData);
    return response.data;
  },

  async update(id, eventData) {
    const response = await api.patch(`/events/${id}/`, eventData);
    return response.data;
  },

  async delete(id) {
    await api.delete(`/events/${id}/`);
  },
};

export default api;
