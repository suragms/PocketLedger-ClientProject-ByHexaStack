import apiClient from './client';
import type { ApiResponse } from '../types';

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

export interface AccountSummary {
  id: number;
  name: string;
  balance: number;
  currency: string;
  color?: string;
  type: number;
  typeName: string;
  isArchived?: boolean;
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

export const dashboardApi = {
  getSummary: async (params?: {
    period?: string;
    customStartDate?: string;
    customEndDate?: string;
  }): Promise<ApiResponse<DashboardSummary>> => {
    const response = await apiClient.get('/dashboard/summary', { params });
    return response.data;
  },
};
