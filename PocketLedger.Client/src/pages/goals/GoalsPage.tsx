import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { goalsApi } from '../../api/goals.api';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/shared/EmptyState';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import ContributeDialog from './ContributeDialog';
import { formatCurrency, formatDate, formatPercent } from '../../lib/utils';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  BanknotesIcon,
  FlagIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const GOAL_TABS = [
  { key: 'all', label: 'All Goals' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'archived', label: 'Archived' },
] as const;

export default function GoalsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('all');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [contributeGoal, setContributeGoal] = useState<{ id: number; name: string } | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: () => goalsApi.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => goalsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success('Goal deleted');
      setDeleteId(null);
    },
  });

  const goals = data?.data || [];

  const filteredGoals = useMemo(() => {
    switch (activeTab) {
      case 'active': return goals.filter((g) => !g.isArchived && !g.isCompleted);
      case 'completed': return goals.filter((g) => g.isCompleted);
      case 'archived': return goals.filter((g) => g.isArchived);
      default: return goals;
    }
  }, [goals, activeTab]);

  const summary = useMemo(() => {
    const active = goals.filter((g) => !g.isArchived);
    return {
      total: active.length,
      completed: goals.filter((g) => g.isCompleted).length,
      totalTarget: active.reduce((s, g) => s + g.targetAmount, 0),
      totalCurrent: active.reduce((s, g) => s + g.currentAmount, 0),
    };
  }, [goals]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Savings Goals</h1>
          <p className="text-muted-foreground">Track your savings goals and watch your progress</p>
        </div>
        <Link to="/goals/new">
          <Button><PlusIcon className="h-4 w-4 mr-2" />New Goal</Button>
        </Link>
      </div>

      {summary.total > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FlagIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Active Goals</p>
                  <p className="text-lg font-bold">{summary.total}</p>
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
                  <p className="text-xs text-muted-foreground">Completed</p>
                  <p className="text-lg font-bold text-green-600">{summary.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ChartBarIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Saved</p>
                  <p className="text-lg font-bold">{formatCurrency(summary.totalCurrent)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BanknotesIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Target</p>
                  <p className="text-lg font-bold">{formatCurrency(summary.totalTarget)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        {GOAL_TABS.map((tab) => (
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
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-xl" />)}
        </div>
      ) : filteredGoals.length === 0 ? (
        <EmptyState
          title={activeTab === 'all' ? 'No goals yet' : 'No goals in this category'}
          description={activeTab === 'all' ? 'Set your first savings goal to start tracking progress' : 'Try a different filter'}
          actionLabel={activeTab === 'all' ? 'New Goal' : undefined}
          onAction={activeTab === 'all' ? () => {} : undefined}
        />
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredGoals.map((goal, index) => {
              const progress = Math.min(goal.percentComplete, 100);
              const daysLeft = Math.ceil((new Date(goal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              return (
                <motion.div
                  key={goal.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                >
                  <Card className={`group hover:shadow-md transition-all duration-200 ${
                    goal.isCompleted ? 'border-green-500/50' : goal.isArchived ? 'opacity-60' : ''
                  }`}>
                    <div className={`h-1.5 ${
                      goal.isCompleted ? 'bg-green-500' : 'bg-primary'
                    }`} />

                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold truncate">{goal.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            {goal.isCompleted && (
                              <Badge variant="success" className="text-[10px]">Completed</Badge>
                            )}
                            {goal.isArchived && (
                              <Badge variant="outline" className="text-[10px]">Archived</Badge>
                            )}
                            {!goal.isCompleted && daysLeft >= 0 && (
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <ClockIcon className="h-3 w-3" />
                                {daysLeft === 0 ? 'Due today' : `${daysLeft} days left`}
                              </span>
                            )}
                          </div>
                          {goal.linkedAccountName && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Linked to {goal.linkedAccountName}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!goal.isArchived && !goal.isCompleted && (
                            <button
                              onClick={() => setContributeGoal({ id: goal.id, name: goal.name })}
                              className="p-1.5 rounded-lg hover:bg-muted text-primary"
                              title="Contribute"
                            >
                              <BanknotesIcon className="h-4 w-4" />
                            </button>
                          )}
                          {!goal.isArchived && (
                            <Link to={`/goals/${goal.id}/edit`} className="p-1.5 rounded-lg hover:bg-muted">
                              <PencilIcon className="h-4 w-4" />
                            </Link>
                          )}
                          <button onClick={() => setDeleteId(goal.id)} className="p-1.5 rounded-lg hover:bg-muted text-destructive">
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-baseline justify-between mb-2">
                        <span className={`text-2xl font-bold ${goal.isCompleted ? 'text-green-600' : ''}`}>
                          {formatCurrency(goal.currentAmount)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          / {formatCurrency(goal.targetAmount)}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className={`h-3 rounded-full ${
                              goal.isCompleted ? 'bg-green-500' : 'bg-primary'
                            }`}
                          />
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{formatPercent(goal.percentComplete)} complete</span>
                          {!goal.isCompleted && (
                            <span className="font-medium">
                              {formatCurrency(goal.remainingAmount)} remaining
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                        <span className="text-xs text-muted-foreground">
                          Target: {formatDate(goal.targetDate)}
                        </span>
                        {!goal.isCompleted && !goal.isArchived && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setContributeGoal({ id: goal.id, name: goal.name })}
                          >
                            <PlusIcon className="h-3 w-3 mr-1" />Add
                          </Button>
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
        title="Delete Goal"
        description="Are you sure you want to delete this goal? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
      />

      {contributeGoal && (
        <ContributeDialog
          goalId={contributeGoal.id}
          goalName={contributeGoal.name}
          onClose={() => setContributeGoal(null)}
        />
      )}
    </motion.div>
  );
}


