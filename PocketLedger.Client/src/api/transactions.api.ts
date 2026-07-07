import apiClient from './client';
import type { Transaction, ApiResponse, PagedResult, TransactionFilters } from '../types';
import type { TransactionInput } from '../lib/validators';

interface GetTransactionsParams extends TransactionFilters {
  page?: number;
  pageSize?: number;
}

export const transactionsApi = {
  getAll: async (params: GetTransactionsParams): Promise<ApiResponse<PagedResult<Transaction>>> => {
    const response = await apiClient.get('/transactions', { params });
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<Transaction>> => {
    const response = await apiClient.get(`/transactions/${id}`);
    return response.data;
  },

  create: async (data: TransactionInput): Promise<ApiResponse<Transaction>> => {
    const response = await apiClient.post('/transactions', data);
    return response.data;
  },

  update: async (id: number, data: TransactionInput): Promise<ApiResponse<Transaction>> => {
    const response = await apiClient.put(`/transactions/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete(`/transactions/${id}`);
    return response.data;
  },

  undoDelete: async (id: number): Promise<ApiResponse<Transaction>> => {
    const response = await apiClient.put(`/transactions/${id}/undo`);
    return response.data;
  },

  uploadReceipt: async (id: number, file: File): Promise<ApiResponse<Transaction>> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post(`/transactions/${id}/receipt`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  removeReceipt: async (id: number): Promise<ApiResponse<Transaction>> => {
    const response = await apiClient.delete(`/transactions/${id}/receipt`);
    return response.data;
  },

  getDeleted: async (): Promise<ApiResponse<Transaction[]>> => {
    const response = await apiClient.get('/transactions/deleted');
    return response.data;
  },

  exportCsv: async (filters?: TransactionFilters): Promise<Blob> => {
    const params: Record<string, string> = {};
    if (filters?.startDate) params.startDate = filters.startDate;
    if (filters?.endDate) params.endDate = filters.endDate;
    if (filters?.type !== undefined) params.type = String(filters.type);
    if (filters?.accountId) params.accountId = String(filters.accountId);
    if (filters?.categoryId) params.categoryId = String(filters.categoryId);
    if (filters?.minAmount) params.minAmount = String(filters.minAmount);
    if (filters?.maxAmount) params.maxAmount = String(filters.maxAmount);
    if (filters?.search) params.search = filters.search;
    if (filters?.payee) params.payee = filters.payee;
    const response = await apiClient.get('/transactions/export', { params, responseType: 'blob' });
    return response.data as Blob;
  },
};
