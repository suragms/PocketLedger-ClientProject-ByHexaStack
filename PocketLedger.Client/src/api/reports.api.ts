import apiClient from './client';
import type { ApiResponse, IncomeVsExpenseDto, CategorySpendingDto, Report } from '../types';

export const reportsApi = {
  getIncomeVsExpense: async (startDate: string, endDate: string): Promise<ApiResponse<IncomeVsExpenseDto>> => {
    const response = await apiClient.get('/reports/income-vs-expense', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  getSpendingByCategory: async (startDate: string, endDate: string): Promise<ApiResponse<CategorySpendingDto[]>> => {
    const response = await apiClient.get('/reports/spending-by-category', {
      params: { startDate, endDate },
    });
    return response.data;
  },

  getReport: async (period: string, startDate?: string, endDate?: string): Promise<ApiResponse<Report>> => {
    const response = await apiClient.get('/reports', {
      params: { period, startDate, endDate },
    });
    return response.data;
  },

  exportCsv: async (period: string, startDate?: string, endDate?: string): Promise<Blob> => {
    const response = await apiClient.get('/reports/export/csv', {
      params: { period, startDate, endDate },
      responseType: 'blob',
    });
    return response.data as Blob;
  },

  exportPdf: async (period: string, startDate?: string, endDate?: string): Promise<Blob> => {
    const response = await apiClient.get('/reports/export/pdf', {
      params: { period, startDate, endDate },
      responseType: 'blob',
    });
    return response.data as Blob;
  },
};
