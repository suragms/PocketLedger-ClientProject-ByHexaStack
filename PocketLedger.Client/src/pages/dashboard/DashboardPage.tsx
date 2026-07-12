import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { dashboardApi } from '../../api/dashboard.api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import PageHeader from '../../components/ui/PageHeader';
import { formatCurrency, formatDate, formatPercent } from '../../lib/utils';
import { ACCOUNT_TYPES, DASHBOARD_PERIODS } from '../../lib/constants';
import Select from '../../components/ui/Select';
import {
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  WalletIcon,
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChartBarIcon,
  ReceiptPercentIcon,
  CurrencyDollarIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import {
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316', '#eab308', '#22c55e'];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const [period, setPeriod] = useState('monthly');

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', period],
    queryFn: () => dashboardApi.getSummary({ period }),
  });

  const summary = data?.data;

  const prev = summary?.previousPeriod;

  const stats = summary
    ? [
        {
          title: 'Total Balance',
          value: summary.totalBalance,
          icon: WalletIcon,
          color: 'text-primary',
        },
        {
          title: 'Income',
          value: summary.totalIncome,
          changePercent: prev?.incomeChangePercent,
          icon: ArrowTrendingUpIcon,
          color: 'text-success',
        },
        {
          title: 'Expenses',
          value: summary.totalExpenses,
          changePercent: prev?.expenseChangePercent,
          icon: ArrowTrendingDownIcon,
          color: 'text-destructive',
        },
        {
          title: 'Savings Rate',
          value: summary.savingsRate,
          icon: BanknotesIcon,
          color: 'text-info',
          isPercent: true,
        },
      ]
    : [];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <PageHeader
          title="Dashboard"
          description={summary?.periodLabel ?? 'Overview of your finances'}
          actions={
            <div className="flex items-center gap-2">
              <div className="w-36 md:w-44">
                <Select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  options={DASHBOARD_PERIODS.map((p) => ({ value: p.value, label: p.label }))}
                />
              </div>
              <Link to="/transactions/new">
                <Button size="sm">
                  <PlusIcon className="h-4 w-4 mr-1" />
                  <span className="hidden md:inline">Transaction</span>
                  <span className="md:hidden">Add</span>
                </Button>
              </Link>
              <Link to="/accounts/new" className="hidden md:inline-flex">
                <Button size="sm" variant="outline">
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Account
                </Button>
              </Link>
            </div>
          }
        />
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? [...Array(4)].map((_, i) => (
              <motion.div key={i} variants={item}>
                <Card>
                  <CardContent className="p-4">
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-8 w-28" />
                  </CardContent>
                </Card>
              </motion.div>
            ))
          : stats.map((stat) => (
              <motion.div key={stat.title} variants={item}>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">{stat.title}</p>
                        <p className={`text-xl font-bold ${stat.color}`}>
                          {stat.isPercent
                            ? formatPercent(stat.value)
                            : formatCurrency(stat.value)}
                        </p>
                        {stat.changePercent !== undefined && (
                          <div className="flex items-center gap-1 mt-0.5">
                            {stat.changePercent >= 0 ? (
                              <ArrowUpIcon className="h-3 w-3 text-success" />
                            ) : (
                              <ArrowDownIcon className="h-3 w-3 text-destructive" />
                            )}
                            <span
                              className={`text-xs font-medium ${
                                stat.changePercent >= 0 ? 'text-success' : 'text-destructive'
                              }`}
                            >
                              {Math.abs(stat.changePercent).toFixed(1)}% vs {prev?.label}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                        <stat.icon className="h-5 w-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending by Category Chart */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : !summary?.topSpendingCategories?.length ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <ReceiptPercentIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium mb-1">No spending data yet</p>
                  <p className="text-xs text-muted-foreground mb-3">Start tracking expenses to see category breakdowns</p>
                  <Link to="/transactions/new">
                    <Button size="sm"><PlusIcon className="h-4 w-4 mr-1" />Add Transaction</Button>
                  </Link>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart className="chart-min-height">
                    <Pie
                      data={summary.topSpendingCategories}
                      dataKey="amount"
                      nameKey="categoryName"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={(props: any) => `${props.categoryName} (${props.percentage}%)`}
                      labelLine={false}
                    >
                      {summary.topSpendingCategories.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Budget Progress */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Budget Overview</CardTitle>
              <Link to="/budgets" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : !summary?.budgetProgress?.length ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <CurrencyDollarIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium mb-1">No budgets set</p>
                  <p className="text-xs text-muted-foreground mb-3">Create a budget to start managing your spending</p>
                  <Link to="/budgets/new">
                    <Button size="sm"><PlusIcon className="h-4 w-4 mr-1" />Create Budget</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {summary.budgetProgress.slice(0, 5).map((budget) => {
                    const progress = Math.min(budget.percentUsed, 100);
                    const isOver = budget.percentUsed > 100;
                    const isNear = budget.percentUsed >= 80 && !isOver;
                    return (
                      <Link
                        key={budget.id}
                        to={`/budgets/${budget.id}`}
                        className="block p-3 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="flex justify-between text-sm mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{budget.name}</span>
                            {isOver && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium">Over</span>}
                            {isNear && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 font-medium">Near</span>}
                          </div>
                          <span
                            className={isOver ? 'text-destructive font-medium' : isNear ? 'text-amber-600 font-medium' : ''}
                          >
                            {formatPercent(budget.percentUsed)}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isOver ? 'bg-destructive' : isNear ? 'bg-amber-500' : 'bg-primary'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>
                            {formatCurrency(budget.spentAmount)} / {formatCurrency(budget.amount)}
                          </span>
                          <span>{formatCurrency(budget.remainingAmount)} left</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Income vs Expense Trend */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : !summary?.monthlyBreakdown?.length ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <ChartBarIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium mb-1">No data for this period</p>
                <p className="text-xs text-muted-foreground">Try selecting a different time range</p>
              </div>
            ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={summary.monthlyBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" fontSize={11} tickLine={false} />
                  <YAxis fontSize={11} tickLine={false} tickFormatter={(v) => `$${(Number(v) / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="income" name="Income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Transactions</CardTitle>
              <Link to="/transactions" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : !summary?.recentTransactions?.length ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <ClipboardDocumentListIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium mb-1">No transactions yet</p>
                  <p className="text-xs text-muted-foreground mb-3">Record your first income or expense</p>
                  <Link to="/transactions/new">
                    <Button size="sm"><PlusIcon className="h-4 w-4 mr-1" />Add Transaction</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {summary.recentTransactions.slice(0, 5).map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor:
                              t.type === 0 ? '#22c55e' : t.type === 1 ? '#ef4444' : '#3b82f6',
                          }}
                        />
                        <div>
                          <p className="text-sm font-medium">{t.payee || t.note || 'Transaction'}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(t.date)}
                            {t.categoryName && ` • ${t.categoryName}`}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-sm font-semibold ${
                          t.type === 0
                            ? 'text-success'
                            : t.type === 1
                              ? 'text-destructive'
                              : ''
                        }`}
                      >
                        {t.type === 0 ? '+' : t.type === 1 ? '-' : ''}
                        {formatCurrency(t.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Accounts Overview */}
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Accounts</CardTitle>
              <Link to="/accounts" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : !summary?.accounts?.length ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <WalletIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium mb-1">No accounts yet</p>
                  <p className="text-xs text-muted-foreground mb-3">Add a wallet or bank account to get started</p>
                  <Link to="/accounts/new">
                    <Button size="sm"><PlusIcon className="h-4 w-4 mr-1" />Add Account</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {summary.accounts.map((a) => (
                    <Link
                      key={a.id}
                      to={`/accounts/${a.id}`}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: a.color || '#6366f1' }}
                        >
                          <span className="text-white text-xs font-bold">
                            {a.name.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{a.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {ACCOUNT_TYPES.find((t) => t.value === a.type)?.label}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`font-semibold text-sm ${a.balance >= 0 ? '' : 'text-destructive'}`}
                      >
                        {formatCurrency(a.balance, a.currency)}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
