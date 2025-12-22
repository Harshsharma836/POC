import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error.response?.data || error.message);
  }
);

export const notificationService = {
  getNotifications: async (userId) => {
    try {
      return await api.get(`/notifications/${userId}`);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },
  
  markAsRead: async (notificationId, userId) => {
    try {
      return await api.patch(`/notifications/${notificationId}/read`, { userId });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },
  
  getRecentNotifications: async (limit = 10) => {
    try {
      return await api.get('/notifications/recent', { params: { limit } });
    } catch (error) {
      console.error('Error fetching recent notifications:', error);
      throw error;
    }
  }
};
