import apiClient from './client';
import type { ApiResponse, NotificationPreference, NotificationListResponse } from '../types';

export const notificationsApi = {
  getAll: async (page = 1, pageSize = 20): Promise<ApiResponse<NotificationListResponse>> => {
    const response = await apiClient.get('/notifications', { params: { page, pageSize } });
    return response.data;
  },

  getUnreadCount: async (): Promise<ApiResponse<number>> => {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data;
  },

  markAsRead: async (id: number): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.put('/notifications/read-all');
    return response.data;
  },

  archive: async (id: number): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.put(`/notifications/${id}/archive`);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete(`/notifications/${id}`);
    return response.data;
  },

  getPreferences: async (): Promise<ApiResponse<NotificationPreference>> => {
    const response = await apiClient.get('/notifications/preferences');
    return response.data;
  },

  updatePreferences: async (data: Partial<NotificationPreference>): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.put('/notifications/preferences', data);
    return response.data;
  },
};
