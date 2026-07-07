import apiClient from './client';
import type {
  AuthResponse, User,
  ForgotPasswordRequest, ResetPasswordRequest, VerifyEmailRequest,
  ChangePasswordRequest, UpdateProfileRequest, DeleteAccountRequest,
  SetPinRequest, VerifyPinRequest, RemovePinRequest, RefreshTokenRequest,
} from '../types';
import type { LoginInput, RegisterInput } from '../lib/validators';

export const authApi = {
  register: async (data: RegisterInput): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
    });
    return response.data;
  },

  login: async (data: LoginInput): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      email: data.email,
      password: data.password,
      rememberMe: data.rememberMe,
    });
    return response.data;
  },

  loginWithPin: async (data: VerifyPinRequest & { email: string }): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login/pin', data);
    return response.data;
  },

  refreshToken: async (data: RefreshTokenRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/refresh', data);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
    const response = await apiClient.put<User>('/auth/profile', data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await apiClient.post('/auth/change-password', data);
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
    await apiClient.post('/auth/forgot-password', data);
  },

  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    await apiClient.post('/auth/reset-password', data);
  },

  verifyEmail: async (data: VerifyEmailRequest): Promise<void> => {
    await apiClient.post('/auth/verify-email', data);
  },

  resendVerification: async (email: string): Promise<void> => {
    await apiClient.post('/auth/resend-verification', { email });
  },

  setPin: async (data: SetPinRequest): Promise<void> => {
    await apiClient.post('/auth/set-pin', data);
  },

  removePin: async (data: RemovePinRequest): Promise<void> => {
    await apiClient.post('/auth/remove-pin', data);
  },

  deleteAccount: async (data: DeleteAccountRequest): Promise<void> => {
    await apiClient.post('/auth/delete-account', { password: data.password });
  },
};
