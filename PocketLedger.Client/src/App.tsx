import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAppSelector } from './app/hooks';
import ErrorBoundary from './components/shared/ErrorBoundary';
import Spinner from './components/ui/Spinner';

const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('./pages/auth/VerifyEmailPage'));
const MainLayout = lazy(() => import('./components/layout/MainLayout'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const AccountsPage = lazy(() => import('./pages/accounts/AccountsPage'));
const AccountDetailPage = lazy(() => import('./pages/accounts/AccountDetailPage'));
const AccountFormPage = lazy(() => import('./pages/accounts/AccountFormPage'));
const WalletsPage = lazy(() => import('./pages/accounts/WalletsPage'));
const WalletDetailPage = lazy(() => import('./pages/accounts/WalletDetailPage'));
const TransactionsPage = lazy(() => import('./pages/transactions/TransactionsPage'));
const TransactionFormPage = lazy(() => import('./pages/transactions/TransactionFormPage'));
const RecurringTransactionsPage = lazy(() => import('./pages/transactions/RecurringTransactionsPage'));
const CategoriesPage = lazy(() => import('./pages/categories/CategoriesPage'));
const BudgetsPage = lazy(() => import('./pages/budgets/BudgetsPage'));
const BudgetFormPage = lazy(() => import('./pages/budgets/BudgetFormPage'));
const BudgetDetailPage = lazy(() => import('./pages/budgets/BudgetDetailPage'));
const GoalsPage = lazy(() => import('./pages/goals/GoalsPage'));
const GoalFormPage = lazy(() => import('./pages/goals/GoalFormPage'));
const ReportsPage = lazy(() => import('./pages/reports/ReportsPage'));
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage'));
const PrivacyPage = lazy(() => import('./pages/settings/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/settings/TermsPage'));
const NotificationsPage = lazy(() => import('./pages/notifications/NotificationsPage'));
const NotificationPreferencesPage = lazy(() => import('./pages/notifications/NotificationPreferencesPage'));
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminTransactionsPage = lazy(() => import('./pages/admin/AdminTransactionsPage'));
const AdminCategoriesPage = lazy(() => import('./pages/admin/AdminCategoriesPage'));
const AdminWalletsPage = lazy(() => import('./pages/admin/AdminWalletsPage'));
const AdminBudgetsPage = lazy(() => import('./pages/admin/AdminBudgetsPage'));
const AdminReportsPage = lazy(() => import('./pages/admin/AdminReportsPage'));
const AdminAnalyticsPage = lazy(() => import('./pages/admin/AdminAnalyticsPage'));
const AdminNotificationsPage = lazy(() => import('./pages/admin/AdminNotificationsPage'));
const AdminAuditLogsPage = lazy(() => import('./pages/admin/AdminAuditLogsPage'));
const AdminSystemLogsPage = lazy(() => import('./pages/admin/AdminSystemLogsPage'));
const AdminRolesPage = lazy(() => import('./pages/admin/AdminRolesPage'));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Spinner size="lg" />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const location = useLocation();

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>

      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                <Route index element={<DashboardPage />} />
                <Route path="accounts" element={<AccountsPage />} />
                <Route path="accounts/new" element={<AccountFormPage />} />
                <Route path="accounts/:id" element={<AccountDetailPage />} />
                <Route path="accounts/:id/edit" element={<AccountFormPage />} />
                <Route path="wallets" element={<WalletsPage />} />
                <Route path="wallets/:id" element={<WalletDetailPage />} />
                <Route path="transactions" element={<TransactionsPage />} />
                <Route path="transactions/new" element={<TransactionFormPage />} />
                <Route path="transactions/:id/edit" element={<TransactionFormPage />} />
                <Route path="recurring-transactions" element={<RecurringTransactionsPage />} />
                <Route path="categories" element={<CategoriesPage />} />
                <Route path="budgets" element={<BudgetsPage />} />
                <Route path="budgets/new" element={<BudgetFormPage />} />
                <Route path="budgets/:id" element={<BudgetDetailPage />} />
                <Route path="budgets/:id/edit" element={<BudgetFormPage />} />
                <Route path="goals" element={<GoalsPage />} />
                <Route path="goals/new" element={<GoalFormPage />} />
                <Route path="goals/:id/edit" element={<GoalFormPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="notifications/preferences" element={<NotificationPreferencesPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="privacy" element={<PrivacyPage />} />
                <Route path="terms" element={<TermsPage />} />
              </Route>

              <Route path="/urlAdmin26" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="transactions" element={<AdminTransactionsPage />} />
                <Route path="categories" element={<AdminCategoriesPage />} />
                <Route path="wallets" element={<AdminWalletsPage />} />
                <Route path="budgets" element={<AdminBudgetsPage />} />
                <Route path="reports" element={<AdminReportsPage />} />
                <Route path="analytics" element={<AdminAnalyticsPage />} />
                <Route path="notifications" element={<AdminNotificationsPage />} />
                <Route path="audit-logs" element={<AdminAuditLogsPage />} />
                <Route path="system-logs" element={<AdminSystemLogsPage />} />
                <Route path="roles" element={<AdminRolesPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
              </Route>
            </Routes>
          </AnimatePresence>
        </Suspense>
      </ErrorBoundary>
    </>
  );
}
