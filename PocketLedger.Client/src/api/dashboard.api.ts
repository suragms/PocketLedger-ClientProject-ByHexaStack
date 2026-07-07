import apiClient from './client';
import type { ApiResponse } from '../types';

export interface DashboardSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyNet: number;
  totalAccounts: number;
  totalTransactionsThisMonth: number;
  accounts: AccountSummary[];
  recentTransactions: RecentTransaction[];
  budgetProgress: BudgetProgress[];
  topSpendingCategories: CategorySpending[];
}

export interface AccountSummary {
  id: number;
  name: string;
  balance: number;
  currency: string;
  color?: string;
  type: number;
  typeName: string;
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
  getSummary: async (): Promise<ApiResponse<DashboardSummary>> => {
    const response = await apiClient.get('/dashboard/summary');
    return response.data;
  },
};
