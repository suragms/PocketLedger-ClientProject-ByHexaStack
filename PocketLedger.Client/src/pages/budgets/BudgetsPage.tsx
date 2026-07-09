import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { budgetsApi } from '../../api/budgets.api';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/shared/EmptyState';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { formatCurrency, formatPercent } from '../../lib/utils';
import { BUDGET_PERIODS } from '../../lib/constants';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChartBarIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const BUDGET_TABS = [
  { key: 'all', label: 'All Budgets' },
  { key: 'active', label: 'Active' },
  { key: 'over', label: 'Over Budget' },
  { key: 'near', label: 'Near Limit' },
  { key: 'ontrack', label: 'On Track' },
] as const;

export default function BudgetsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['budgets'],
    queryFn: () => budgetsApi.getAll(),
  });

  const { data: analyticsData } = useQuery({
    queryKey: ['budget-analytics'],
    queryFn: () => budgetsApi.getAnalytics(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => budgetsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success('Budget deleted');
      setDeleteId(null);
    },
  });

  const analytics = analyticsData?.data;

  const filteredBudgets = useMemo(() => {
    const budgets = data?.data || [];
    switch (activeTab) {
      case 'active': return budgets.filter((b) => b.isActive);
      case 'over': return budgets.filter((b) => b.isOverBudget);
      case 'near': return budgets.filter((b) => b.isNearLimit && !b.isOverBudget);
      case 'ontrack': return budgets.filter((b) => !b.isOverBudget && !b.isNearLimit);
      default: return budgets;
    }
  }, [data, activeTab]);

  const tabCounts = useMemo(() => {
    const budgets = data?.data || [];
    return {
      all: budgets.length,
      active: budgets.filter((b) => b.isActive).length,
      over: budgets.filter((b) => b.isOverBudget).length,
      near: budgets.filter((b) => b.isNearLimit && !b.isOverBudget).length,
      ontrack: budgets.filter((b) => !b.isOverBudget && !b.isNearLimit).length,
    };
  }, [data]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Budgets</h1>
          <p className="text-muted-foreground">Track your spending limits and stay on budget</p>
        </div>
        <Link to="/budgets/new">
          <Button><PlusIcon className="h-4 w-4 mr-2" />New Budget</Button>
        </Link>
      </div>

      {/* Analytics Summary */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ChartBarIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Budget</p>
                  <p className="text-lg font-bold">{formatCurrency(analytics.totalBudgeted, analytics.currency)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Spent</p>
                  <p className="text-lg font-bold">{formatCurrency(analytics.totalSpent, analytics.currency)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Over Budget</p>
                  <p className="text-lg font-bold text-red-600">{analytics.overBudgetCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <BellIcon className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Near Limit</p>
                  <p className="text-lg font-bold text-amber-600">{analytics.nearLimitCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">On Track</p>
                  <p className="text-lg font-bold text-green-600">{analytics.onTrackCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        {BUDGET_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {tab.label}
            <span className={`ml-1.5 text-xs ${activeTab === tab.key ? 'opacity-80' : 'opacity-60'}`}>
              ({tabCounts[tab.key as keyof typeof tabCounts] ?? 0})
            </span>
          </button>
        ))}
      </div>

      {/* Budget Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
        </div>
      ) : filteredBudgets.length === 0 ? (
        <EmptyState
          title={activeTab === 'all' ? 'No budgets yet' : 'No budgets in this category'}
          description={activeTab === 'all' ? 'Create your first budget to start tracking spending limits' : 'Try a different filter'}
          actionLabel={activeTab === 'all' ? 'New Budget' : undefined}
          onAction={activeTab === 'all' ? () => {} : undefined}
        />
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredBudgets.map((budget, index) => {
              const progress = Math.min(budget.percentUsed, 100);
              return (
                <motion.div
                  key={budget.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                >
                  <Card className={`group hover:shadow-md transition-all duration-200 ${
                    budget.isOverBudget ? 'border-destructive/50' : budget.isNearLimit ? 'border-amber-500/50' : ''
                  }`}>
                    {/* Status stripe */}
                    <div className={`h-1.5 ${
                      budget.isOverBudget ? 'bg-destructive' : budget.isNearLimit ? 'bg-amber-500' : 'bg-green-500'
                    }`} />

                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="min-w-0 flex-1">
                          <Link to={`/budgets/${budget.id}`} className="hover:underline">
                            <h3 className="font-semibold truncate">{budget.name}</h3>
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-[10px]">
                              {BUDGET_PERIODS.find((p) => p.value === budget.period)?.label}
                            </Badge>
                            {budget.categoryName && (
                              <Badge variant="outline" className="text-[10px]">
                                <div className="w-1.5 h-1.5 rounded-full mr-1" style={{ backgroundColor: budget.categoryColor || '#6b7280' }} />
                                {budget.categoryName}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link to={`/budgets/${budget.id}/edit`} className="p-1.5 rounded-lg hover:bg-muted">
                            <PencilIcon className="h-4 w-4" />
                          </Link>
                          <button onClick={() => setDeleteId(budget.id)} className="p-1.5 rounded-lg hover:bg-muted text-destructive">
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Amount Display */}
                      <div className="flex items-baseline justify-between mb-2">
                        <span className={`text-2xl font-bold ${budget.isOverBudget ? 'text-destructive' : ''}`}>
                          {formatCurrency(budget.spentAmount, budget.currency)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          / {formatCurrency(budget.amount, budget.currency)}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className={`h-3 rounded-full ${
                              budget.isOverBudget ? 'bg-destructive' : budget.isNearLimit ? 'bg-amber-500' : 'bg-primary'
                            }`}
                          />
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{formatPercent(budget.percentUsed)} used</span>
                          <span className={`font-medium ${
                            budget.isOverBudget ? 'text-destructive' : budget.isNearLimit ? 'text-amber-600' : 'text-green-600'
                          }`}>
                            {budget.isOverBudget
                              ? `Over by ${formatCurrency(budget.spentAmount - budget.amount, budget.currency)}`
                              : `${formatCurrency(budget.remainingAmount, budget.currency)} left`
                            }
                          </span>
                        </div>
                      </div>

                      {/* Status Footer */}
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                        <Badge
                          variant={budget.isOverBudget ? 'destructive' : budget.isNearLimit ? 'warning' : 'success'}
                          className="text-[10px]"
                        >
                          {budget.status}
                        </Badge>
                        {budget.alertThreshold && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <BellIcon className="h-3 w-3" />
                            Alert at {budget.alertThreshold}%
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete Budget"
        description="Are you sure you want to delete this budget? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </motion.div>
  );
}
