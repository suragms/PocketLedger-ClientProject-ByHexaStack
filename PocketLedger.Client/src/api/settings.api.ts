import apiClient from './client';
import type {
  ApiResponse,
  UserProfile,
  UserSettings,
  PasskeyList,
  TwoFactorStatus,
  TwoFactorSetup,
  AboutInfo,
  ExportResult,
  ImportResult,
} from '../types';

export const settingsApi = {
  // Profile
  getProfile: async (): Promise<ApiResponse<UserProfile>> => {
    const response = await apiClient.get('/settings/profile');
    return response.data;
  },

  updateProfile: async (data: {
    firstName: string;
    lastName: string;
    defaultCurrency: string;
  }): Promise<ApiResponse<UserProfile>> => {
    const response = await apiClient.put('/settings/profile', data);
    return response.data;
  },

  uploadAvatar: async (file: File): Promise<ApiResponse<{ avatarUrl: string }>> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/settings/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Settings
  getSettings: async (): Promise<ApiResponse<UserSettings>> => {
    const response = await apiClient.get('/settings');
    return response.data;
  },

  updateAppearance: async (data: {
    theme: string;
    language: string;
    currency: string;
  }): Promise<ApiResponse<UserSettings>> => {
    const response = await apiClient.put('/settings/appearance', data);
    return response.data;
  },

  updateNotifications: async (data: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    budgetAlerts: boolean;
    weeklyReport: boolean;
    monthlyReport: boolean;
  }): Promise<ApiResponse<UserSettings>> => {
    const response = await apiClient.put('/settings/notifications', data);
    return response.data;
  },

  updatePrivacy: async (data: {
    showBalance: boolean;
    showTransactions: boolean;
    publicProfile: boolean;
  }): Promise<ApiResponse<UserSettings>> => {
    const response = await apiClient.put('/settings/privacy', data);
    return response.data;
  },

  updateSecurity: async (data: {
    loginNotifications: boolean;
    sessionTimeout: boolean;
    sessionTimeoutMinutes: number;
  }): Promise<ApiResponse<UserSettings>> => {
    const response = await apiClient.put('/settings/security', data);
    return response.data;
  },

  // Security - Password
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> => {
    await apiClient.post('/settings/change-password', data);
  },

  // Security - Passkeys
  getPasskeys: async (): Promise<ApiResponse<PasskeyList>> => {
    const response = await apiClient.get('/settings/passkeys');
    return response.data;
  },

  deletePasskey: async (id: number): Promise<void> => {
    await apiClient.delete(`/settings/passkeys/${id}`);
  },

  // Security - 2FA
  get2FAStatus: async (): Promise<ApiResponse<TwoFactorStatus>> => {
    const response = await apiClient.get('/settings/2fa');
    return response.data;
  },

  enable2FA: async (): Promise<ApiResponse<TwoFactorSetup>> => {
    const response = await apiClient.post('/settings/2fa/enable');
    return response.data;
  },

  verify2FA: async (code: string): Promise<void> => {
    await apiClient.post('/settings/2fa/verify', { code });
  },

  disable2FA: async (password: string): Promise<void> => {
    await apiClient.post('/settings/2fa/disable', { password });
  },

  // Data - Export/Import
  exportData: async (): Promise<ApiResponse<ExportResult>> => {
    const response = await apiClient.post('/settings/export');
    return response.data;
  },

  importData: async (file: File): Promise<ApiResponse<ImportResult>> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/settings/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // About
  getAbout: async (): Promise<ApiResponse<AboutInfo>> => {
    const response = await apiClient.get('/settings/about');
    return response.data;
  },

  // Delete Account
  deleteAccount: async (password: string): Promise<void> => {
    await apiClient.post('/settings/delete-account', { password });
  },
};
