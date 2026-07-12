import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('A valid email is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false),
});

export const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('A valid email is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one digit')
    .regex(/[^a-zA-Z0-9]/, 'Must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('A valid email is required'),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one digit')
    .regex(/[^a-zA-Z0-9]/, 'Must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one digit')
    .regex(/[^a-zA-Z0-9]/, 'Must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
}).refine((data) => data.newPassword !== data.currentPassword, {
  message: 'New password must be different from current password',
  path: ['newPassword'],
});

export const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  defaultCurrency: z.string().length(3).default('USD'),
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required to delete account'),
  confirmation: z.literal('DELETE', { error: 'Type DELETE to confirm' }),
});

export const setPinSchema = z.object({
  pin: z.string().regex(/^\d{4}$/, 'PIN must be exactly 4 digits'),
  currentPassword: z.string().min(1, 'Password is required'),
});

export const verifyPinSchema = z.object({
  pin: z.string().regex(/^\d{4}$/, 'PIN must be exactly 4 digits'),
});

export const pinLoginSchema = z.object({
  email: z.string().email('A valid email is required'),
  pin: z.string().regex(/^\d{4}$/, 'PIN must be exactly 4 digits'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;
export type SetPinInput = z.infer<typeof setPinSchema>;
export type VerifyPinInput = z.infer<typeof verifyPinSchema>;
export type PinLoginInput = z.infer<typeof pinLoginSchema>;

export const accountSchema = z.object({
  name: z.string().min(1, 'Account name is required').max(100),
  description: z.string().max(500).optional(),
  type: z.coerce.number().min(0).max(8),
  balance: z.coerce.number().min(0, 'Balance cannot be negative'),
  currency: z.string().length(3, 'Currency must be 3 characters').default('USD'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  icon: z.string().max(50).optional(),
  includeInBalance: z.boolean().default(true),
});

export const transactionSchema = z.object({
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  currency: z.string().length(3).default('USD'),
  type: z.coerce.number().min(0).max(2),
  date: z.string().min(1, 'Date is required'),
  note: z.string().max(500).optional(),
  payee: z.string().max(200).optional(),
  reference: z.string().max(100).optional(),
  paymentMethod: z.coerce.number().min(0).max(6).default(0),
  accountId: z.coerce.number().positive('Account is required'),
  categoryId: z.coerce.number().positive().optional().nullable(),
  tagIds: z.array(z.number()).optional(),
});

export const transactionFilterSchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  type: z.number().optional(),
  accountId: z.number().optional(),
  categoryId: z.number().optional(),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.string().optional(),
});

export type TransactionFilterInput = z.infer<typeof transactionFilterSchema>;

export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100),
  description: z.string().max(500).optional(),
  icon: z.string().default('folder'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color').default('#6366f1'),
  type: z.coerce.number().min(0).max(2).default(2),
  parentId: z.coerce.number().optional().nullable(),
});

export const budgetSchema = z.object({
  name: z.string().min(1, 'Budget name is required').max(100),
  amount: z.coerce.number().positive('Budget amount must be greater than 0'),
  currency: z.string().length(3).default('USD'),
  period: z.coerce.number().min(0).max(3),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional().nullable(),
  alertThreshold: z.coerce.number().min(0).max(100).optional().nullable(),
  notifyOnAlert: z.boolean().default(true),
  notifyOnExceed: z.boolean().default(true),
  categoryId: z.coerce.number().optional().nullable(),
});

export type AccountInput = z.infer<typeof accountSchema>;
export type TransactionInput = z.infer<typeof transactionSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type BudgetInput = z.infer<typeof budgetSchema>;

export const updateAppearanceSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  language: z.string().min(2).max(10),
  currency: z.string().length(3),
});

export const updateNotificationsSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  budgetAlerts: z.boolean(),
  weeklyReport: z.boolean(),
  monthlyReport: z.boolean(),
});

export const updatePrivacySchema = z.object({
  showBalance: z.boolean(),
  showTransactions: z.boolean(),
  publicProfile: z.boolean(),
});

export const updateSecuritySettingsSchema = z.object({
  loginNotifications: z.boolean(),
  sessionTimeout: z.boolean(),
  sessionTimeoutMinutes: z.number().min(5).max(480),
});

export const enable2FASchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'Code must be 6 digits'),
});

export const disable2FASchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

export type UpdateAppearanceInput = z.infer<typeof updateAppearanceSchema>;
export type UpdateNotificationsSettingsInput = z.infer<typeof updateNotificationsSettingsSchema>;
export type UpdatePrivacyInput = z.infer<typeof updatePrivacySchema>;
export type UpdateSecuritySettingsInput = z.infer<typeof updateSecuritySettingsSchema>;
export type Enable2FAInput = z.infer<typeof enable2FASchema>;
export type Disable2FAInput = z.infer<typeof disable2FASchema>;
