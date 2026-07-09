import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { budgetsApi } from '../../api/budgets.api';
import { categoriesApi } from '../../api/categories.api';
import { budgetSchema, type BudgetInput } from '../../lib/validators';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { BUDGET_PERIODS } from '../../lib/constants';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

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

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      currency: 'USD',
      period: 1,
      startDate: new Date().toISOString().split('T')[0],
      alertThreshold: 80,
      notifyOnAlert: true,
      notifyOnExceed: true,
    },
  });

  const selectedPeriod = watch('period');

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
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-96 bg-muted rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      <div className="flex items-center gap-4">
        <Link to="/budgets" className="p-2 rounded-lg hover:bg-muted">
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-3xl font-bold">{isEdit ? 'Edit Budget' : 'New Budget'}</h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-5">
            <Input
              label="Budget Name"
              placeholder="e.g., Monthly Food Budget"
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="Budget Amount"
              type="number"
              step="0.01"
              placeholder="0.00"
              error={errors.amount?.message}
              {...register('amount', { valueAsNumber: true })}
            />

            <div>
              <label className="block text-sm font-medium mb-2">Period</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {BUDGET_PERIODS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => {
                      const input = document.querySelector(`input[name="period"]`) as HTMLInputElement;
                      if (input) {
                        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!;
                        nativeInputValueSetter.call(input, p.value.toString());
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                        input.dispatchEvent(new Event('change', { bubbles: true }));
                      }
                    }}
                    className={`flex flex-col items-center gap-1 px-3 py-3 rounded-lg border-2 transition-all text-center ${
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
              <input type="hidden" {...register('period', { valueAsNumber: true })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                error={errors.startDate?.message}
                {...register('startDate')}
              />
              <Input
                label="End Date (optional)"
                type="date"
                {...register('endDate')}
              />
            </div>

            <Select
              label="Category (optional)"
              placeholder="All categories"
              options={categories.map((c: any) => ({ value: c.id, label: c.name }))}
              {...register('categoryId', {
                valueAsNumber: true,
                setValueAs: (v) => (v === '' ? null : Number(v)),
              })}
            />

            <Input
              label="Alert Threshold %"
              type="number"
              placeholder="80"
              error={errors.alertThreshold?.message}
              {...register('alertThreshold', {
                valueAsNumber: true,
                setValueAs: (v) => (v === '' ? null : Number(v)),
              })}
            />

            {/* Notification Settings */}
            <div>
              <label className="block text-sm font-medium mb-2">Notifications</label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
                    {...register('notifyOnAlert')}
                  />
                  <div>
                    <span className="text-sm">Alert when approaching limit</span>
                    <p className="text-xs text-muted-foreground">Get notified when spending reaches the threshold</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
                    {...register('notifyOnExceed')}
                  />
                  <div>
                    <span className="text-sm">Alert when exceeding budget</span>
                    <p className="text-xs text-muted-foreground">Get notified when spending goes over the budget</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <Button type="submit" loading={mutation.isPending} className="flex-1">
                {isEdit ? 'Update' : 'Create'} Budget
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/budgets')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
