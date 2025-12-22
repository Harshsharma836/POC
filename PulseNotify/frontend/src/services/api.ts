import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const notificationService = {
  getNotifications: async (userId: string) => {
    const response = await axios.get(`${API_URL}/notifications/${userId}`);
    return response.data;
  },
  
  markAsRead: async (notificationId: string, userId: string) => {
    const response = await axios.patch(
      `${API_URL}/notifications/${notificationId}/read`,
      { userId }
    );
    return response.data;
  },
  
  getRecentNotifications: async (limit = 10) => {
    const response = await axios.get(`${API_URL}/notifications/recent`, {
      params: { limit }
    });
    return response.data;
  }
};

export type Notification = {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  createdAt: string;
};
