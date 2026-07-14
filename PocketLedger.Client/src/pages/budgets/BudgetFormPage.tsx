import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { budgetsApi } from '../../api/budgets.api';
import { categoriesApi } from '../../api/categories.api';
import { budgetSchema, type BudgetInput } from '../../lib/validators';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { BUDGET_PERIODS } from '../../lib/constants';
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

export default function BudgetFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const { data: existing, isLoading: loadingExisting } = useQuery({
    queryKey: ['budget', id],
    queryFn: () => budgetsApi.getById(Number(id)),
    enabled: isEdit,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories-dropdown'],
    queryFn: () => categoriesApi.getAll(),
  });

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      currency: 'USD',
      period: 1,
      startDate: new Date().toISOString().split('T')[0],
      alertThreshold: 80,
      notifyOnAlert: true,
      notifyOnExceed: true,
    },
    mode: 'onBlur',
  });

  const selectedPeriod = Number(watch('period'));

  useEffect(() => {
    register('period');
  }, [register]);

  useEffect(() => {
    if (existing?.data) {
      const b = existing.data;
      reset({
        name: b.name,
        amount: b.amount,
        currency: b.currency,
        period: b.period,
        startDate: b.startDate.split('T')[0],
        endDate: b.endDate ? b.endDate.split('T')[0] : undefined,
        alertThreshold: b.alertThreshold ?? undefined,
        notifyOnAlert: b.notifyOnAlert,
        notifyOnExceed: b.notifyOnExceed,
        categoryId: b.categoryId ?? undefined,
      });
    }
  }, [existing, reset]);

  const mutation = useMutation({
    mutationFn: (data: BudgetInput) =>
      isEdit ? budgetsApi.update(Number(id), data) : budgetsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget-analytics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      toast.success(isEdit ? 'Budget updated' : 'Budget created');
      navigate('/budgets');
    },
  });

  const categories = categoriesData?.data || [];

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
        <Link to="/budgets" className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg hover:bg-muted transition-colors">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-xl md:text-3xl font-bold">{isEdit ? 'Edit Budget' : 'New Budget'}</h1>
      </div>

      <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
        <SectionCard title="Budget Info">
          <Input
            label="Budget Name"
            placeholder="e.g., Monthly Food Budget"
            autoComplete="off"
            error={errors.name?.message}
            {...register('name')}
          />
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-muted-foreground pointer-events-none">$</span>
            <Input
              label="Budget Amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              placeholder="0.00"
              autoComplete="off"
              className="pl-8 text-lg font-medium"
              error={errors.amount?.message}
              {...register('amount', { valueAsNumber: true })}
            />
          </div>
        </SectionCard>

        <SectionCard title="Schedule">
          <div>
            <label className="block text-sm font-medium mb-2">Period</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {BUDGET_PERIODS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => {
                    setValue('period', p.value, { shouldDirty: true, shouldValidate: true });
                  }}
                  className={`flex flex-col items-center gap-1 px-3 py-3 min-h-[64px] rounded-lg border-2 transition-all text-center active:scale-[0.98] ${
                    selectedPeriod === p.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-muted-foreground/30 text-muted-foreground'
                  }`}
                >
                  <span className="text-lg">
                    {p.value === 0 ? '📅' : p.value === 1 ? '📆' : p.value === 2 ? '🗓️' : '📋'}
                  </span>
                  <span className="text-xs font-medium">{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              inputMode="numeric"
              autoComplete="off"
              error={errors.startDate?.message}
              {...register('startDate')}
            />
            <Input
              label="End Date (optional)"
              type="date"
              inputMode="numeric"
              autoComplete="off"
              {...register('endDate')}
            />
          </div>
        </SectionCard>

        <SectionCard title="Settings">
          <Select
            label="Category (optional)"
            placeholder="All categories"
            autoComplete="off"
            options={categories.map((c: any) => ({ value: c.id, label: c.name }))}
            {...register('categoryId')}
          />

          <Input
            label="Alert Threshold %"
            type="number"
            inputMode="numeric"
            placeholder="80"
            autoComplete="off"
            error={errors.alertThreshold?.message}
            {...register('alertThreshold')}
          />

          <div>
            <label className="block text-sm font-medium mb-2">Notifications</label>
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer min-h-[48px] py-2">
                <input
                  type="checkbox"
                  className="w-5 h-5 mt-0.5 rounded border-input text-primary focus:ring-primary"
                  {...register('notifyOnAlert')}
                />
                <div>
                  <span className="text-sm font-medium">Alert when approaching limit</span>
                  <p className="text-xs text-muted-foreground">Get notified when spending reaches the threshold</p>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer min-h-[48px] py-2">
                <input
                  type="checkbox"
                  className="w-5 h-5 mt-0.5 rounded border-input text-primary focus:ring-primary"
                  {...register('notifyOnExceed')}
                />
                <div>
                  <span className="text-sm font-medium">Alert when exceeding budget</span>
                  <p className="text-xs text-muted-foreground">Get notified when spending goes over the budget</p>
                </div>
              </label>
            </div>
          </div>
        </SectionCard>
      </form>

      {/* Sticky submit bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-card/95 backdrop-blur-sm safe-area-pb md:relative md:border-0 md:bg-transparent md:backdrop-blur-none">
        <div className="max-w-2xl mx-auto px-4 py-3 md:px-0 md:py-0">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="submit"
              loading={mutation.isPending}
              className="w-full sm:flex-1 min-h-[48px]"
              onClick={handleSubmit((data) => mutation.mutate(data))}
            >
              {isEdit ? 'Update' : 'Create'} Budget
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/budgets')}
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
