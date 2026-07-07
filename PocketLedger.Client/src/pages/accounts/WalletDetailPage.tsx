import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { accountsApi } from '../../api/accounts.api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { formatCurrency, formatDateTime } from '../../lib/utils';
import { ACCOUNT_TYPES } from '../../lib/constants';
import {
  PencilIcon,
  ArrowLeftIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function WalletDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: accountData, isLoading: loadingAccount } = useQuery({
    queryKey: ['account', id],
    queryFn: () => accountsApi.getById(Number(id)),
    enabled: !!id,
  });

  const { data: statsData, isLoading: loadingStats } = useQuery({
    queryKey: ['wallet-statistics', id],
    queryFn: () => accountsApi.getStatistics(Number(id)),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: (walletId: number) => accountsApi.delete(walletId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Wallet deleted');
      navigate('/accounts');
    },
  });

  const account = accountData?.data;
  const stats = statsData?.data;

  if (loadingAccount || loadingStats) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!account) {
    return <p className="text-muted-foreground">Wallet not found</p>;
  }

  const typeInfo = ACCOUNT_TYPES.find((t) => t.value === account.type);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/accounts" className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shadow-sm"
          style={{ backgroundColor: account.color || '#6366f1' }}
        >
          {account.name.substring(0, 2).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{account.name}</h1>
            <Badge variant="outline">{typeInfo?.label || 'Other'}</Badge>
            {!account.includeInBalance && (
              <Badge variant="warning">Excluded from balance</Badge>
            )}
          </div>
          {account.description && (
            <p className="text-muted-foreground">{account.description}</p>
          )}
        </div>
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <Link to={`/accounts/${account.id}/edit`}>
            <Button variant="outline"><PencilIcon className="h-4 w-4 mr-2" />Edit</Button>
          </Link>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <TrashIcon className="h-4 w-4 mr-2" />Delete
          </Button>
        </div>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Current Balance</p>
            <p className={`text-5xl font-bold ${account.balance >= 0 ? '' : 'text-destructive'}`}>
              {formatCurrency(account.balance, account.currency)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Created {formatDateTime(account.createdAt)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <ArrowUpIcon className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Income</p>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(stats.incomeAmount, stats.currency)}</p>
                  <p className="text-[10px] text-muted-foreground">{stats.totalIncome} transactions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <ArrowDownIcon className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Expenses</p>
                  <p className="text-lg font-bold text-red-600">{formatCurrency(stats.expenseAmount, stats.currency)}</p>
                  <p className="text-[10px] text-muted-foreground">{stats.totalExpenses} transactions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <CurrencyDollarIcon className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Net Flow</p>
                  <p className={`text-lg font-bold ${stats.netAmount >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                    {formatCurrency(stats.netAmount, stats.currency)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Avg: {formatCurrency(stats.averageTransactionAmount, stats.currency)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <ClipboardDocumentListIcon className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Transactions</p>
                  <p className="text-lg font-bold">{stats.totalTransactions}</p>
                  <p className="text-[10px] text-muted-foreground">
                    {stats.lastTransactionDate ? `Last: ${new Date(stats.lastTransactionDate).toLocaleDateString()}` : 'No transactions'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Monthly Breakdown & Top Categories */}
      {stats && stats.monthlyBreakdown.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CalendarDaysIcon className="h-5 w-5" />
                Monthly Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.monthlyBreakdown.map((month) => {
                  const maxVal = Math.max(month.income, month.expense, 1);
                  return (
                    <div key={month.month}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{month.month}</span>
                        <span className={`text-xs font-medium ${month.net >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                          {month.net >= 0 ? '+' : ''}{formatCurrency(month.net, stats.currency)}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-12 text-[10px] text-muted-foreground">Income</div>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500 rounded-full transition-all"
                              style={{ width: `${(month.income / maxVal) * 100}%` }}
                            />
                          </div>
                          <div className="w-16 text-[10px] text-right text-muted-foreground">
                            {formatCurrency(month.income, stats.currency)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-12 text-[10px] text-muted-foreground">Expense</div>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-red-500 rounded-full transition-all"
                              style={{ width: `${(month.expense / maxVal) * 100}%` }}
                            />
                          </div>
                          <div className="w-16 text-[10px] text-right text-muted-foreground">
                            {formatCurrency(month.expense, stats.currency)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Top Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ChartBarIcon className="h-5 w-5" />
                Top Spending Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.topCategories.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No expense data yet</p>
              ) : (
                <div className="space-y-4">
                  {stats.topCategories.map((cat) => (
                    <div key={cat.categoryId}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                          <span className="text-sm font-medium">{cat.categoryName}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-semibold">{formatCurrency(cat.amount, stats.currency)}</span>
                          <span className="text-xs text-muted-foreground ml-1">({cat.percentage}%)</span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {cat.transactionCount} transaction{cat.transactionCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Summary Stats */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Wallet Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-xs text-muted-foreground">Highest Expense</p>
                <p className="text-lg font-bold text-red-600">{formatCurrency(stats.highestExpense, stats.currency)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Highest Income</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(stats.highestIncome, stats.currency)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">First Transaction</p>
                <p className="text-sm font-medium">
                  {stats.firstTransactionDate ? new Date(stats.firstTransactionDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Last Transaction</p>
                <p className="text-sm font-medium">
                  {stats.lastTransactionDate ? new Date(stats.lastTransactionDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={() => deleteMutation.mutate(account.id)}
        title="Delete Wallet"
        description={`Are you sure you want to delete "${account.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </motion.div>
  );
}
