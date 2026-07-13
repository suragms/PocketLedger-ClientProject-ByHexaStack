import apiClient from './client';
import type { RecurringTransaction, ApiResponse } from '../types';
import type { RecurringTransactionInput } from '../lib/validators';

export const recurringTransactionsApi = {
  getAll: async (params?: { isActive?: boolean }): Promise<ApiResponse<RecurringTransaction[]>> => {
    const response = await apiClient.get('/recurringtransactions', { params });
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<RecurringTransaction>> => {
    const response = await apiClient.get(`/recurringtransactions/${id}`);
    return response.data;
  },

  create: async (data: RecurringTransactionInput): Promise<ApiResponse<RecurringTransaction>> => {
    const response = await apiClient.post('/recurringtransactions', data);
    return response.data;
  },

  update: async (id: number, data: RecurringTransactionInput): Promise<ApiResponse<RecurringTransaction>> => {
    const response = await apiClient.put(`/recurringtransactions/${id}`, data);
    return response.data;
  },

  toggle: async (id: number): Promise<ApiResponse<RecurringTransaction>> => {
    const response = await apiClient.put(`/recurringtransactions/${id}/toggle`);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete(`/recurringtransactions/${id}`);
    return response.data;
  },
};
