import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { goalsApi } from '../../api/goals.api';
import { accountsApi } from '../../api/accounts.api';
import { goalSchema, type GoalInput } from '../../lib/validators';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 md:p-5 space-y-4">
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</h2>
      {children}
    </div>
  );
}

export default function GoalFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const { data: existing, isLoading: loadingExisting } = useQuery({
    queryKey: ['goal', id],
    queryFn: () => goalsApi.getById(Number(id)),
    enabled: isEdit,
  });

  const { data: accountsData } = useQuery({
    queryKey: ['accounts-dropdown'],
    queryFn: () => accountsApi.getAll(),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      currentAmount: 0,
      targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
    mode: 'onBlur',
  });

  useEffect(() => {
    if (existing?.data) {
      const g = existing.data;
      reset({
        name: g.name,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount,
        targetDate: g.targetDate.split('T')[0],
        linkedAccountId: g.linkedAccountId ?? undefined,
      });
    }
  }, [existing, reset]);

  const mutation = useMutation({
    mutationFn: (data: GoalInput & { isArchived?: boolean }) =>
      isEdit ? goalsApi.update(Number(id), data) : goalsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(isEdit ? 'Goal updated' : 'Goal created');
      navigate('/goals');
    },
  });

  const accounts = accountsData?.data || [];

  if (isEdit && loadingExisting) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 px-4">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 md:p-5 space-y-4">
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              <div className="space-y-3">
                <div className="h-12 bg-muted rounded-lg animate-pulse" />
                <div className="h-12 bg-muted rounded-lg animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-4 px-4 pb-32 md:pb-8"
    >
      <div className="flex items-center gap-3 pt-2">
        <Link to="/goals" className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg hover:bg-muted transition-colors">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-xl md:text-3xl font-bold">{isEdit ? 'Edit Goal' : 'New Savings Goal'}</h1>
      </div>

      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
        <SectionCard title="Goal Details">
          <Input
            label="Goal Name"
            placeholder="e.g., Emergency Fund, Vacation"
            autoComplete="off"
            error={errors.name?.message}
            {...register('name')}
          />
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-muted-foreground pointer-events-none">$</span>
            <Input
              label="Target Amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              placeholder="0.00"
              autoComplete="off"
              className="pl-8 text-lg font-medium"
              error={errors.targetAmount?.message}
              {...register('targetAmount', { valueAsNumber: true })}
            />
          </div>
        </SectionCard>

        <SectionCard title="Timeline & Progress">
          <Input
            label="Target Date"
            type="date"
            inputMode="numeric"
            autoComplete="off"
            error={errors.targetDate?.message}
            {...register('targetDate')}
          />
          <Input
            label="Current Amount Saved"
            type="number"
            inputMode="decimal"
            step="0.01"
            placeholder="0.00"
            autoComplete="off"
            error={errors.currentAmount?.message}
            {...register('currentAmount', { valueAsNumber: true })}
          />
        </SectionCard>

        <SectionCard title="Linked Account (optional)">
          <Select
            label="Account"
            placeholder="No account linked"
            autoComplete="off"
            options={accounts.map((a: any) => ({ value: a.id, label: a.name }))}
            {...register('linkedAccountId', {
              setValueAs: (v) => (v === '' ? null : Number(v)),
            })}
          />
          <p className="text-xs text-muted-foreground">
            Link an account to automatically create a transaction record when you contribute.
          </p>
        </SectionCard>
      </form>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-card/95 backdrop-blur-sm safe-area-pb md:relative md:border-0 md:bg-transparent md:backdrop-blur-none">
        <div className="max-w-2xl mx-auto px-4 py-3 md:px-0 md:py-0">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="submit"
              loading={mutation.isPending}
              className="w-full sm:flex-1 min-h-[48px]"
              onClick={handleSubmit((data) => mutation.mutate(data))}
            >
              {isEdit ? 'Update' : 'Create'} Goal
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/goals')}
              className="w-full sm:w-auto min-h-[48px]"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
