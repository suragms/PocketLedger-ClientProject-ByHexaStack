export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  defaultCurrency: string;
  emailVerified: boolean;
  pinEnabled: boolean;
  roles: string[];
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiration: string;
  user: User;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

export interface VerifyEmailRequest {
  userId: string;
  token: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  defaultCurrency: string;
}

export interface DeleteAccountRequest {
  password: string;
}

export interface SetPinRequest {
  pin: string;
  currentPassword: string;
}

export interface VerifyPinRequest {
  email: string;
  pin: string;
}

export interface RemovePinRequest {
  currentPassword: string;
}

export interface RefreshTokenRequest {
  token: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  traceId?: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface Account {
  id: number;
  name: string;
  description?: string;
  type: number;
  typeName: string;
  balance: number;
  currency: string;
  color?: string;
  icon?: string;
  includeInBalance: boolean;
  isArchived: boolean;
  displayOrder: number;
  createdAt: string;
  transactionCount: number;
  totalIncome: number;
  totalExpenses: number;
  lastTransactionDate?: string;
}

export interface Transaction {
  id: number;
  amount: number;
  currency: string;
  type: number;
  typeName: string;
  date: string;
  note?: string;
  payee?: string;
  reference?: string;
  receiptUrl?: string;
  receiptThumbnailUrl?: string;
  paymentMethod: number;
  paymentMethodName: string;
  accountId: number;
  accountName: string;
  accountColor?: string;
  categoryId?: number;
  categoryName?: string;
  categoryColor?: string;
  categoryIcon?: string;
  createdAt: string;
  updatedAt?: string;
  isDeleted: boolean;
  deletedAt?: string;
  tags: string[];
}

export interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  type?: number;
  accountId?: number;
  categoryId?: number;
  paymentMethod?: number;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
  payee?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  icon: string;
  color: string;
  type: number;
  typeName: string;
  isDefault: boolean;
  isArchived: boolean;
  parentId?: number;
  displayOrder: number;
  createdAt: string;
  transactionCount: number;
  children: Category[];
}

export interface Budget {
  id: number;
  name: string;
  amount: number;
  currency: string;
  period: number;
  periodName: string;
  startDate: string;
  endDate?: string;
  alertThreshold?: number;
  isActive: boolean;
  notifyOnAlert: boolean;
  notifyOnExceed: boolean;
  categoryId?: number;
  categoryName?: string;
  categoryColor?: string;
  spentAmount: number;
  remainingAmount: number;
  percentUsed: number;
  isOverBudget: boolean;
  isNearLimit: boolean;
  status: string;
  createdAt: string;
}

export interface BudgetAnalytics {
  totalBudgeted: number;
  totalSpent: number;
  totalRemaining: number;
  overallPercentUsed: number;
  activeBudgets: number;
  overBudgetCount: number;
  nearLimitCount: number;
  onTrackCount: number;
  currency: string;
  periodSummaries: BudgetPeriodSummary[];
  categorySummaries: CategoryBudgetSummary[];
  dailySpending: DailySpending[];
}

export interface BudgetPeriodSummary {
  period: string;
  budgetCount: number;
  totalAmount: number;
  totalSpent: number;
  percentUsed: number;
}

export interface CategoryBudgetSummary {
  categoryId?: number;
  categoryName: string;
  color: string;
  budgetAmount: number;
  spentAmount: number;
  percentUsed: number;
}

export interface DailySpending {
  date: string;
  amount: number;
}

export interface IncomeVsExpenseDto {
  totalIncome: number;
  totalExpense: number;
  netIncome: number;
  monthlyBreakdown: MonthlyData[];
}

export interface MonthlyData {
  month: string;
  income: number;
  expense: number;
  net: number;
}

export interface CategorySpendingDto {
  categoryId: number;
  categoryName: string;
  color: string;
  amount: number;
  percentage: number;
}

export interface PeriodComparison {
  income: number;
  expenses: number;
  netIncome: number;
  savingsRate: number;
  incomeChangePercent: number;
  expenseChangePercent: number;
  netChangePercent: number;
  label: string;
}

export interface DashboardSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpenses: number;
  netIncome: number;
  savingsRate: number;
  totalAccounts: number;
  totalTransactions: number;
  periodLabel: string;
  periodStart: string;
  periodEnd: string;
  accounts: AccountSummary[];
  recentTransactions: RecentTransaction[];
  budgetProgress: BudgetProgress[];
  topSpendingCategories: CategorySpending[];
  previousPeriod?: PeriodComparison;
  monthlyBreakdown: DashboardMonthlyData[];
}

export interface DashboardMonthlyData {
  month: string;
  income: number;
  expense: number;
}

export interface AccountSummary {
  id: number;
  name: string;
  balance: number;
  currency: string;
  color?: string;
  type: number;
  typeName: string;
  transactionCount: number;
  totalIncome: number;
  totalExpenses: number;
  lastTransactionDate?: string;
}

export interface WalletStatistics {
  accountId: number;
  accountName: string;
  balance: number;
  currency: string;
  totalTransactions: number;
  totalIncome: number;
  totalExpenses: number;
  incomeAmount: number;
  expenseAmount: number;
  netAmount: number;
  averageTransactionAmount: number;
  highestExpense: number;
  highestIncome: number;
  lastTransactionDate?: string;
  firstTransactionDate?: string;
  monthlyBreakdown: MonthlyBreakdown[];
  topCategories: CategoryBreakdown[];
}

export interface MonthlyBreakdown {
  month: string;
  income: number;
  expense: number;
  net: number;
}

export interface CategoryBreakdown {
  categoryId: number;
  categoryName: string;
  color: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface RecentTransaction {
  id: number;
  amount: number;
  currency: string;
  type: number;
  typeName: string;
  date: string;
  payee?: string;
  note?: string;
  accountName: string;
  categoryName?: string;
  categoryColor?: string;
}

export interface BudgetProgress {
  id: number;
  name: string;
  amount: number;
  spentAmount: number;
  remainingAmount: number;
  percentUsed: number;
  categoryName?: string;
  isOverBudget: boolean;
}

export interface CategorySpending {
  categoryId: number;
  categoryName: string;
  color: string;
  amount: number;
  percentage: number;
}

export interface Report {
  period: string;
  startDate: string;
  endDate: string;
  totalIncome: number;
  totalExpense: number;
  netIncome: number;
  savingsRate: number;
  currency: string;
  monthlyBreakdown: ReportMonthlyData[];
  categoryBreakdown: ReportCategoryData[];
  walletAnalysis: WalletAnalysisReport[];
  budgetAnalysis: BudgetAnalysisReport[];
  dailyTrend: DailyTrend[];
  weeklyComparison: WeeklyComparison[];
  previousPeriod?: ReportPeriodComparison;
}

export interface ReportPeriodComparison {
  label: string;
  income: number;
  expense: number;
  netIncome: number;
  savingsRate: number;
  incomeChangePercent: number;
  expenseChangePercent: number;
  netChangePercent: number;
}

export interface ReportMonthlyData {
  month: string;
  income: number;
  expense: number;
  net: number;
}

export interface ReportCategoryData {
  categoryId: number;
  categoryName: string;
  color: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface WalletAnalysisReport {
  accountId: number;
  accountName: string;
  color?: string;
  typeName: string;
  balance: number;
  totalIncome: number;
  totalExpense: number;
  netAmount: number;
  transactionCount: number;
}

export interface BudgetAnalysisReport {
  budgetId: number;
  name: string;
  budgetAmount: number;
  spentAmount: number;
  remainingAmount: number;
  percentUsed: number;
  status: string;
  categoryName?: string;
}

export interface DailyTrend {
  date: string;
  income: number;
  expense: number;
}

export interface WeeklyComparison {
  week: string;
  income: number;
  expense: number;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: number;
  typeName: string;
  status: number;
  statusName: string;
  actionUrl?: string;
  icon?: string;
  userId: string;
  readAt?: string;
  archivedAt?: string;
  createdAt: string;
}

export interface NotificationPreference {
  id: number;
  userId: string;
  dailyReminderEnabled: boolean;
  dailyReminderHour: number;
  weeklySummaryEnabled: boolean;
  weeklySummaryDay: number;
  monthlySummaryEnabled: boolean;
  monthlySummaryDay: number;
  budgetAlertEnabled: boolean;
  budgetExceededEnabled: boolean;
  pushNotificationsEnabled: boolean;
  pushEndpoint?: string;
  pushP256dh?: string;
  pushAuth?: string;
}

export interface NotificationListResponse {
  items: Notification[];
  totalCount: number;
  unreadCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Settings
export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  currency: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  budgetAlerts: boolean;
  weeklyReport: boolean;
  monthlyReport: boolean;
  showBalance: boolean;
  showTransactions: boolean;
  publicProfile: boolean;
  loginNotifications: boolean;
  sessionTimeout: boolean;
  sessionTimeoutMinutes: number;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  defaultCurrency: string;
  emailVerified: boolean;
  pinEnabled: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
}

export interface Passkey {
  id: number;
  name: string;
  createdAt: string;
  lastUsedAt?: string;
}

export interface PasskeyList {
  passkeys: Passkey[];
}

export interface TwoFactorStatus {
  isEnabled: boolean;
  enabledAt?: string;
  recoveryCodesRemaining: number;
}

export interface TwoFactorSetup {
  secretKey: string;
  recoveryCodes: string[];
  qrCodeUri: string;
}

export interface AboutInfo {
  appName: string;
  version: string;
  description: string;
  author: string;
  website: string;
  supportEmail: string;
  license: string;
  releaseDate: string;
  features: string[];
  licenses: { name: string; license: string; copyright: string }[];
}

export interface ExportResult {
  downloadUrl: string;
  fileName: string;
  fileSize: number;
  exportedAt: string;
}

export interface ImportResult {
  accountsImported: number;
  transactionsImported: number;
  categoriesImported: number;
  budgetsImported: number;
  importedAt: string;
}
