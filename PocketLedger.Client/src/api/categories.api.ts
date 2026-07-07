import apiClient from './client';
import type { Category, ApiResponse } from '../types';
import type { CategoryInput } from '../lib/validators';

export interface CategoryQueryParams {
  type?: number;
  isArchived?: boolean;
  search?: string;
}

export const categoriesApi = {
  getAll: async (params?: CategoryQueryParams): Promise<ApiResponse<Category[]>> => {
    const response = await apiClient.get('/categories', { params });
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<Category>> => {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  },

  create: async (data: CategoryInput): Promise<ApiResponse<Category>> => {
    const response = await apiClient.post('/categories', data);
    return response.data;
  },

  update: async (id: number, data: CategoryInput): Promise<ApiResponse<Category>> => {
    const response = await apiClient.put(`/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete(`/categories/${id}`);
    return response.data;
  },

  archive: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.put(`/categories/${id}/archive`);
    return response.data;
  },

  restore: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.put(`/categories/${id}/restore`);
    return response.data;
  },

  reorder: async (items: { id: number; displayOrder: number }[]): Promise<ApiResponse<null>> => {
    const response = await apiClient.put('/categories/reorder', { items });
    return response.data;
  },
};
