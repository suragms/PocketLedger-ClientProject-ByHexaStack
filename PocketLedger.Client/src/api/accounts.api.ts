import apiClient from './client';
import type { Account, ApiResponse, PagedResult, PaginationParams, WalletStatistics } from '../types';

interface GetAccountsParams extends PaginationParams {
  accountType?: number;
  includeInBalance?: boolean;
}

export const accountsApi = {
  getAll: async (params: GetAccountsParams): Promise<ApiResponse<PagedResult<Account>>> => {
    const response = await apiClient.get('/accounts', { params });
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<Account>> => {
    const response = await apiClient.get(`/accounts/${id}`);
    return response.data;
  },

  getStatistics: async (id: number): Promise<ApiResponse<WalletStatistics>> => {
    const response = await apiClient.get(`/accounts/${id}/statistics`);
    return response.data;
  },

  create: async (data: Partial<Account>): Promise<ApiResponse<Account>> => {
    const response = await apiClient.post('/accounts', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Account>): Promise<ApiResponse<Account>> => {
    const response = await apiClient.put(`/accounts/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await apiClient.delete(`/accounts/${id}`);
    return response.data;
  },
};
