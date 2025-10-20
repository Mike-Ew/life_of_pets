import axios from "axios";

// Temporary in-memory storage for development
// TODO: Replace with AsyncStorage after fixing native build issues
const inMemoryStorage = {
  storage: {},
  async getItem(key) {
    return this.storage[key] || null;
  },
  async setItem(key, value) {
    this.storage[key] = value;
  },
  async removeItem(key) {
    delete this.storage[key];
  },
};

const AsyncStorage = inMemoryStorage;

// Update this to your machine's IP address when testing on a physical device
// For iOS Simulator: localhost works
// For Android Emulator: use 10.0.2.2
// For physical device: use your computer's local IP (e.g., 192.168.1.x)
const BASE_URL = "http://localhost:3000/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests automatically
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't log expected errors to console (reduces red banner noise)
    const status = error.response?.status;
    const expectedErrors = [400, 401, 403, 404, 409]; // Bad request, Unauthorized, Forbidden, Not found, Conflict

    if (!expectedErrors.includes(status)) {
      // Only log unexpected errors (500, network errors, etc.)
      console.error("API Error:", error.message);
    }

    return Promise.reject(error);
  }
);

// Authentication APIs
export const authAPI = {
  register: async (email, password, name, location) => {
    const response = await api.post("/auth/register", {
      email,
      password,
      name,
      location,
    });
    if (response.data.token) {
      await AsyncStorage.setItem("authToken", response.data.token);
      await AsyncStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    if (response.data.token) {
      await AsyncStorage.setItem("authToken", response.data.token);
      await AsyncStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: async () => {
    await AsyncStorage.removeItem("authToken");
    await AsyncStorage.removeItem("user");
  },

  getCurrentUser: async () => {
    const userString = await AsyncStorage.getItem("user");
    return userString ? JSON.parse(userString) : null;
  },

  isAuthenticated: async () => {
    const token = await AsyncStorage.getItem("authToken");
    return !!token;
  },
};

// Pet APIs
export const petAPI = {
  getAll: async () => {
    const response = await api.get("/me/pets");
    return response.data.pets || [];
  },

  getById: async (petId) => {
    const response = await api.get(`/pets/${petId}`);
    return response.data.pet;
  },

  create: async (petData) => {
    const response = await api.post("/pets", petData);
    return response.data.pet;
  },

  update: async (petId, petData) => {
    const response = await api.put(`/pets/${petId}`, petData);
    return response.data.pet;
  },

  delete: async (petId) => {
    const response = await api.delete(`/pets/${petId}`);
    return response.data;
  },

  uploadPhoto: async (petId, photoUri, isMain = false) => {
    // For development, we send the URI directly
    // In production, you would upload to cloud storage first
    const response = await api.post(`/pets/${petId}/photos`, {
      url: photoUri,
      is_main: isMain,
    });
    return response.data.photo;
  },

  setMainPhoto: async (photoId) => {
    const response = await api.patch(`/pet_photos/${photoId}`, {
      is_main: true
    });
    return response.data.photo;
  },
};

// Care APIs
export const careAPI = {
  // Care Templates
  getTemplates: async (petId) => {
    const response = await api.get(`/pets/${petId}/care/templates`);
    return response.data.templates || [];
  },

  createTemplate: async (petId, templateData) => {
    const response = await api.post(
      `/pets/${petId}/care/templates`,
      templateData
    );
    return response.data.template;
  },

  updateTemplate: async (petId, templateId, templateData) => {
    const response = await api.put(
      `/pets/${petId}/care/templates/${templateId}`,
      templateData
    );
    return response.data.template;
  },

  deleteTemplate: async (petId, templateId) => {
    const response = await api.delete(
      `/pets/${petId}/care/templates/${templateId}`
    );
    return response.data;
  },

  // Care Events
  getTodayTasks: async (petId) => {
    const response = await api.get(`/pets/${petId}/care/today`);
    return response.data.tasks || [];
  },

  getUpcomingEvents: async (petId) => {
    const response = await api.get(`/pets/${petId}/care/upcoming`);
    return response.data.events || [];
  },

  updateEvent: async (eventId, completed, notes) => {
    const response = await api.patch(`/care/events/${eventId}`, {
      completed,
      notes,
    });
    return response.data.event;
  },

  // Care Logs
  getLogs: async (petId, limit = 50) => {
    const response = await api.get(`/pets/${petId}/care/logs?limit=${limit}`);
    return response.data.logs || [];
  },

  createLog: async (petId, logData) => {
    const response = await api.post(`/pets/${petId}/care/logs`, logData);
    return response.data.log;
  },
};

export default api;
