import apiClient from './client';
import type { ApiResponse, PagedResult } from '../types';

// Dashboard
export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  totalTransactions: number;
  totalVolume: number;
  totalCategories: number;
  totalWallets: number;
  totalBudgets: number;
  totalNotifications: number;
  auditLogCount: number;
  dailyStats: { date: string; users: number; transactions: number; volume: number }[];
  topUsers: { id: string; email: string; name: string; transactionCount: number; totalVolume: number }[];
}

// Users
export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  isActive: boolean;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  lastLoginAt?: string;
  roles: string[];
}

export interface UserDetail extends AdminUser {
  defaultCurrency: string;
  pinEnabled: boolean;
  transactionCount: number;
  accountCount: number;
  categoryCount: number;
  budgetCount: number;
}

// Transactions
export interface AdminTransaction {
  id: number;
  amount: number;
  currency: string;
  type: number;
  date: string;
  note?: string;
  payee?: string;
  userId: string;
  userEmail: string;
  accountName?: string;
  categoryName?: string;
  createdAt: string;
}

// Categories
export interface AdminCategory {
  id: number;
  name: string;
  description?: string;
  icon: string;
  color: string;
  type: number;
  userId: string;
  userEmail: string;
  createdAt: string;
}

// Wallets
export interface AdminWallet {
  id: number;
  name: string;
  description?: string;
  type: number;
  balance: number;
  currency: string;
  color?: string;
  userId: string;
  userEmail: string;
  createdAt: string;
}

// Budgets
export interface AdminBudget {
  id: number;
  name: string;
  amount: number;
  currency: string;
  period: number;
  startDate: string;
  endDate?: string;
  alertThreshold?: number;
  userId: string;
  userEmail: string;
  categoryName?: string;
  createdAt: string;
}

// Analytics
export interface AnalyticsData {
  userGrowth: {
    totalUsers: number;
    activeUsers: number;
    growthRate: number;
    monthlyGrowth: { label: string; value: number; count: number }[];
  };
  transactionAnalytics: {
    totalTransactions: number;
    totalVolume: number;
    averageTransaction: number;
    monthlyVolume: { label: string; value: number; count: number }[];
  };
  revenue: { totalRevenue: number; monthlyRevenue: number; growthRate: number };
  systemHealth: { totalAccounts: number; totalCategories: number; totalBudgets: number; activeNotifications: number; uptime: number };
}

// Audit Logs
export interface AuditLog {
  id: number;
  userId: string;
  userEmail: string;
  action: string;
  entity: string;
  entityId?: string;
  oldValues?: string;
  newValues?: string;
  ipAddress?: string;
  isSuccess: boolean;
  createdAt: string;
}

// System Logs
export interface SystemLog {
  timestamp: string;
  level: string;
  message: string;
  exception?: string;
  source?: string;
}

// Roles
export interface AdminRole {
  id: string;
  name: string;
  description?: string;
  userCount: number;
}

// Notifications
export interface AdminNotification {
  id: number;
  title: string;
  message: string;
  type: number;
  status: number;
  userId: string;
  userEmail: string;
  createdAt: string;
}

export const adminApi = {
  // Dashboard
  getDashboard: async (): Promise<ApiResponse<DashboardStats>> => {
    const response = await apiClient.get('/admin/dashboard');
    return response.data;
  },

  // Users
  createUser: async (data: { email: string; firstName: string; lastName: string; password: string; role: string }): Promise<ApiResponse<{ id: string; message: string }>> => {
    const response = await apiClient.post('/admin/users', data);
    return response.data;
  },

  updateUser: async (id: string, data: { email: string; firstName: string; lastName: string; password?: string; role: string }): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.put(`/admin/users/${id}`, data);
    return response.data;
  },

  getUsers: async (params: { page?: number; pageSize?: number; search?: string; role?: string; isActive?: boolean } = {}): Promise<ApiResponse<PagedResult<AdminUser>>> => {
    const response = await apiClient.get('/admin/users', { params });
    return response.data;
  },

  getUserDetail: async (id: string): Promise<ApiResponse<UserDetail>> => {
    const response = await apiClient.get(`/admin/users/${id}`);
    return response.data;
  },

  updateUserRole: async (id: string, role: string): Promise<ApiResponse<{ userId: string; roles: string[] }>> => {
    const response = await apiClient.put(`/admin/users/${id}/role`, { userId: id, role });
    return response.data;
  },

  updateUserStatus: async (id: string, isActive: boolean): Promise<ApiResponse<void>> => {
    const response = await apiClient.put(`/admin/users/${id}/status`, { userId: id, isActive });
    return response.data;
  },

  deleteUser: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/admin/users/${id}`);
    return response.data;
  },

  // Transactions
  getTransactions: async (params: { page?: number; pageSize?: number; search?: string; userId?: string; type?: number } = {}): Promise<ApiResponse<PagedResult<AdminTransaction>>> => {
    const response = await apiClient.get('/admin/transactions', { params });
    return response.data;
  },

  // Categories
  getCategories: async (params: { page?: number; pageSize?: number; search?: string; userId?: string } = {}): Promise<ApiResponse<PagedResult<AdminCategory>>> => {
    const response = await apiClient.get('/admin/categories', { params });
    return response.data;
  },

  // Wallets
  getWallets: async (params: { page?: number; pageSize?: number; search?: string; userId?: string } = {}): Promise<ApiResponse<PagedResult<AdminWallet>>> => {
    const response = await apiClient.get('/admin/wallets', { params });
    return response.data;
  },

  // Budgets
  getBudgets: async (params: { page?: number; pageSize?: number; search?: string; userId?: string } = {}): Promise<ApiResponse<PagedResult<AdminBudget>>> => {
    const response = await apiClient.get('/admin/budgets', { params });
    return response.data;
  },

  // Analytics
  getAnalytics: async (period?: string): Promise<ApiResponse<AnalyticsData>> => {
    const response = await apiClient.get('/admin/analytics', { params: { period } });
    return response.data;
  },

  // Audit Logs
  getAuditLogs: async (params: { page?: number; pageSize?: number; search?: string; userId?: string; action?: string; startDate?: string; endDate?: string } = {}): Promise<ApiResponse<PagedResult<AuditLog>>> => {
    const response = await apiClient.get('/admin/audit-logs', { params });
    return response.data;
  },

  // System Logs
  getSystemLogs: async (params: { page?: number; pageSize?: number; level?: string; startDate?: string; endDate?: string } = {}): Promise<ApiResponse<{ items: SystemLog[]; totalCount: number; page: number; pageSize: number }>> => {
    const response = await apiClient.get('/admin/system-logs', { params });
    return response.data;
  },

  // Roles
  getRoles: async (): Promise<ApiResponse<{ roles: AdminRole[] }>> => {
    const response = await apiClient.get('/admin/roles');
    return response.data;
  },

  createRole: async (name: string, description?: string): Promise<ApiResponse<{ id: string; name: string }>> => {
    const response = await apiClient.post('/admin/roles', { name, description });
    return response.data;
  },

  deleteRole: async (id: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete(`/admin/roles/${id}`);
    return response.data;
  },

  assignRole: async (userId: string, roleName: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post('/admin/roles/assign', { userId, roleName });
    return response.data;
  },

  removeRole: async (userId: string, roleName: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post('/admin/roles/remove', { userId, roleName });
    return response.data;
  },

  // Notifications
  getNotifications: async (params: { page?: number; pageSize?: number; userId?: string; type?: number } = {}): Promise<ApiResponse<PagedResult<AdminNotification>>> => {
    const response = await apiClient.get('/admin/notifications', { params });
    return response.data;
  },

  // Export
  exportData: async (type?: string): Promise<ApiResponse<{ downloadUrl: string; fileName: string; fileSize: number; exportedAt: string }>> => {
    const response = await apiClient.post('/admin/export', { type });
    return response.data;
  },
};
