import apiClient from './client';
import type { Budget, BudgetAnalytics, ApiResponse } from '../types';
import type { BudgetInput } from '../lib/validators';

export const budgetsApi = {
  getAll: async (): Promise<ApiResponse<Budget[]>> => {
    const response = await apiClient.get('/budgets');
    return response.data;
  },

  getAnalytics: async (): Promise<ApiResponse<BudgetAnalytics>> => {
    const response = await apiClient.get('/budgets/analytics');
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<Budget>> => {
    const response = await apiClient.get(`/budgets/${id}`);
    return response.data;
  },

  create: async (data: BudgetInput): Promise<ApiResponse<Budget>> => {
    const response = await apiClient.post('/budgets', data);
    return response.data;
  },

  update: async (id: number, data: BudgetInput): Promise<ApiResponse<Budget>> => {
    const response = await apiClient.put(`/budgets/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete(`/budgets/${id}`);
    return response.data;
  },
};
