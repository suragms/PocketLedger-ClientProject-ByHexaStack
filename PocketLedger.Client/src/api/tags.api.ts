import apiClient from './client';
import type { Tag, ApiResponse } from '../types';

export const tagsApi = {
  getAll: async (params?: { search?: string }): Promise<ApiResponse<Tag[]>> => {
    const response = await apiClient.get('/tags', { params });
    return response.data;
  },

  create: async (data: { name: string; color?: string }): Promise<ApiResponse<Tag>> => {
    const response = await apiClient.post('/tags', data);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete(`/tags/${id}`);
    return response.data;
  },
};
