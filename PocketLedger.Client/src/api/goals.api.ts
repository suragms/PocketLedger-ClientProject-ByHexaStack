import apiClient from './client';
import type { Goal, ApiResponse } from '../types';
import type { GoalInput } from '../lib/validators';

export const goalsApi = {
  getAll: async (): Promise<ApiResponse<Goal[]>> => {
    const response = await apiClient.get('/goals');
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<Goal>> => {
    const response = await apiClient.get(`/goals/${id}`);
    return response.data;
  },

  create: async (data: GoalInput): Promise<ApiResponse<Goal>> => {
    const response = await apiClient.post('/goals', data);
    return response.data;
  },

  update: async (id: number, data: GoalInput & { isArchived?: boolean }): Promise<ApiResponse<Goal>> => {
    const response = await apiClient.put(`/goals/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete(`/goals/${id}`);
    return response.data;
  },

  contribute: async (id: number, amount: number): Promise<ApiResponse<Goal>> => {
    const response = await apiClient.post(`/goals/${id}/contribute`, { amount });
    return response.data;
  },
};
