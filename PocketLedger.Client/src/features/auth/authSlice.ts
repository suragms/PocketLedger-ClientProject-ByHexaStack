import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../../api/auth.api';
import type { User } from '../../types';
import type {
  LoginInput, RegisterInput, ChangePasswordInput,
  UpdateProfileInput, DeleteAccountInput,
} from '../../lib/validators';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const getInitialState = (): AuthState => {
  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refreshToken');
  const userStr = localStorage.getItem('user');
  let user: User | null = null;
  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch {
    user = null;
  }
  return {
    user,
    token,
    refreshToken,
    isAuthenticated: !!token && !!user,
    loading: false,
    error: null,
  };
};

export const login = createAsyncThunk('auth/login', async (data: LoginInput, { rejectWithValue }) => {
  try {
    const response = await authApi.login(data);
    localStorage.setItem('token', response.token);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.user));
    return response;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const register = createAsyncThunk('auth/register', async (data: RegisterInput, { rejectWithValue }) => {
  try {
    const response = await authApi.register(data);
    localStorage.setItem('token', response.token);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.user));
    return response;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const getCurrentUser = createAsyncThunk('auth/getCurrentUser', async (_, { rejectWithValue }) => {
  try {
    const response = await authApi.getCurrentUser();
    localStorage.setItem('user', JSON.stringify(response));
    return response;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(err.response?.data?.message || 'Failed to get user');
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (data: UpdateProfileInput, { rejectWithValue }) => {
  try {
    const response = await authApi.updateProfile(data);
    localStorage.setItem('user', JSON.stringify(response));
    return response;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(err.response?.data?.message || 'Failed to update profile');
  }
});

export const changePassword = createAsyncThunk('auth/changePassword', async (data: ChangePasswordInput, { rejectWithValue }) => {
  try {
    await authApi.changePassword(data);
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(err.response?.data?.message || 'Failed to change password');
  }
});

export const deleteAccount = createAsyncThunk('auth/deleteAccount', async (data: DeleteAccountInput, { rejectWithValue }) => {
  try {
    await authApi.deleteAccount(data);
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    return rejectWithValue(err.response?.data?.message || 'Failed to delete account');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    },
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(getCurrentUser.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError, setUser } = authSlice.actions;
export default authSlice.reducer;
