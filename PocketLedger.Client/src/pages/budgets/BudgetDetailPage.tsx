import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { budgetsApi } from '../../api/budgets.api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/shared/EmptyState';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { formatCurrency, formatPercent } from '../../lib/utils';
import { BUDGET_PERIODS } from '../../lib/constants';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  BellIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function BudgetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['budget', id],
    queryFn: () => budgetsApi.getById(Number(id)),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: (budgetId: number) => budgetsApi.delete(budgetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget-analytics'] });
      toast.success('Budget deleted');
      navigate('/budgets');
    },
  });

  const budget = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  if (!budget) return (
    <EmptyState
      icon={<CurrencyDollarIcon className="h-12 w-12" />}
      title="Budget not found"
      description="This budget may have been deleted or doesn't exist."
      actionLabel="Back to Budgets"
      onAction={() => navigate('/budgets')}
    />
  );

  const progress = Math.min(budget.percentUsed, 100);
  const dailyBudget = budget.period === 0 ? budget.amount / 7 : budget.period === 1 ? budget.amount / 30 : budget.period === 2 ? budget.amount / 90 : budget.amount / 365;
  const daysInPeriod = budget.period === 0 ? 7 : budget.period === 1 ? 30 : budget.period === 2 ? 90 : 365;
  const daysElapsed = Math.min(daysInPeriod, Math.ceil((Date.now() - new Date(budget.startDate).getTime()) / (1000 * 60 * 60 * 24)));
  const expectedSpent = dailyBudget * daysElapsed;
  const spendingPace = expectedSpent > 0 ? (budget.spentAmount / expectedSpent) * 100 : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/budgets" className="p-2 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{budget.name}</h1>
            <Badge variant={budget.isOverBudget ? 'destructive' : budget.isNearLimit ? 'warning' : 'success'}>
              {budget.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {BUDGET_PERIODS.find((p) => p.value === budget.period)?.label} budget
            {budget.categoryName && ` for ${budget.categoryName}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to={`/budgets/${budget.id}/edit`}>
            <Button variant="outline"><PencilIcon className="h-4 w-4 mr-2" />Edit</Button>
          </Link>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <TrashIcon className="h-4 w-4 mr-2" />Delete
          </Button>
        </div>
      </div>

      {/* Alert Banner */}
      {budget.isOverBudget && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="p-4 flex items-center gap-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-destructive shrink-0" />
            <div>
              <p className="font-semibold text-destructive">Over Budget!</p>
              <p className="text-sm text-destructive/80">
                You've exceeded this budget by {formatCurrency(budget.spentAmount - budget.amount, budget.currency)}.
                {budget.notifyOnExceed && ' A notification has been triggered.'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {budget.isNearLimit && !budget.isOverBudget && (
        <Card className="border-amber-500 bg-amber-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <BellIcon className="h-6 w-6 text-amber-500 shrink-0" />
            <div>
              <p className="font-semibold text-amber-600">Approaching Limit</p>
              <p className="text-sm text-amber-600/80">
                You've used {formatPercent(budget.percentUsed)} of this budget. 
                {budget.notifyOnAlert && ' Alert threshold reached.'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <CurrencyDollarIcon className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">Budget Amount</p>
            <p className="text-3xl font-bold">{formatCurrency(budget.amount, budget.currency)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${
              budget.isOverBudget ? 'bg-destructive/10' : 'bg-blue-500/10'
            }`}>
              <ChartBarIcon className={`h-6 w-6 ${budget.isOverBudget ? 'text-destructive' : 'text-blue-500'}`} />
            </div>
            <p className="text-sm text-muted-foreground mb-1">Spent</p>
            <p className={`text-3xl font-bold ${budget.isOverBudget ? 'text-destructive' : ''}`}>
              {formatCurrency(budget.spentAmount, budget.currency)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${
              budget.remainingAmount < 0 ? 'bg-destructive/10' : 'bg-green-500/10'
            }`}>
              <CalendarDaysIcon className={`h-6 w-6 ${budget.remainingAmount < 0 ? 'text-destructive' : 'text-green-500'}`} />
            </div>
            <p className="text-sm text-muted-foreground mb-1">Remaining</p>
            <p className={`text-3xl font-bold ${budget.remainingAmount < 0 ? 'text-destructive' : 'text-green-600'}`}>
              {formatCurrency(budget.remainingAmount, budget.currency)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Section */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Progress Bar */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Usage</span>
              <span className={`font-semibold ${budget.isOverBudget ? 'text-destructive' : ''}`}>
                {formatPercent(budget.percentUsed)}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-5 rounded-full ${
                  budget.isOverBudget ? 'bg-destructive' : budget.isNearLimit ? 'bg-amber-500' : 'bg-primary'
                }`}
              />
            </div>
            {budget.alertThreshold && (
              <div className="relative mt-1">
                <div
                  className="absolute top-0 w-0.5 h-4 bg-muted-foreground/50"
                  style={{ left: `${Math.min(budget.alertThreshold, 100)}%` }}
                />
                <span className="text-[10px] text-muted-foreground" style={{ marginLeft: `${Math.min(budget.alertThreshold, 100)}%` }}>
                  Alert ({budget.alertThreshold}%)
                </span>
              </div>
            )}
          </div>

          {/* Spending Pace */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Daily Budget</p>
              <p className="text-lg font-semibold">{formatCurrency(dailyBudget, budget.currency)}/day</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Spending Pace</p>
              <p className={`text-lg font-semibold ${spendingPace > 100 ? 'text-destructive' : spendingPace > 80 ? 'text-amber-600' : 'text-green-600'}`}>
                {formatPercent(spendingPace)}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {spendingPace > 100 ? 'Ahead of schedule' : spendingPace > 80 ? 'Slightly fast' : 'On track'}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div>
              <p className="text-xs text-muted-foreground">Period</p>
              <p className="text-sm font-medium">
                {BUDGET_PERIODS.find((p) => p.value === budget.period)?.label}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Start Date</p>
              <p className="text-sm font-medium">
                {new Date(budget.startDate).toLocaleDateString()}
              </p>
            </div>
            {budget.endDate && (
              <div>
                <p className="text-xs text-muted-foreground">End Date</p>
                <p className="text-sm font-medium">
                  {new Date(budget.endDate).toLocaleDateString()}
                </p>
              </div>
            )}
            <div>
              <p className="text-xs text-muted-foreground">Alert Threshold</p>
              <p className="text-sm font-medium">{budget.alertThreshold || 'None'}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Category</p>
              <p className="text-sm font-medium">{budget.categoryName || 'All Categories'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Notifications</p>
              <div className="flex gap-2">
                {budget.notifyOnAlert && <Badge variant="outline" className="text-[10px]">Alert</Badge>}
                {budget.notifyOnExceed && <Badge variant="outline" className="text-[10px]">Exceed</Badge>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={() => deleteMutation.mutate(budget.id)}
        title="Delete Budget"
        description="Are you sure you want to delete this budget? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </motion.div>
  );
}
