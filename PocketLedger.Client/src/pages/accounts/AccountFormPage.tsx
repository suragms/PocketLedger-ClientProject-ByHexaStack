import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountsApi } from '../../api/accounts.api';
import { accountSchema } from '../../lib/validators';
import type { AccountInput } from '../../lib/validators';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { ACCOUNT_TYPES } from '../../lib/constants';
import toast from 'react-hot-toast';

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 md:p-5 space-y-4">
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</h2>
      {children}
    </div>
  );
}

export default function AccountFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const { data: existingAccount, isLoading: loadingExisting } = useQuery({
    queryKey: ['account', id],
    queryFn: () => accountsApi.getById(Number(id)),
    enabled: isEdit,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: { name: '', type: 0, balance: 0, currency: 'USD', includeInBalance: true },
    mode: 'onBlur',
  });

  useEffect(() => {
    if (existingAccount?.data) {
      const a = existingAccount.data;
      reset({ name: a.name, description: a.description, type: a.type, balance: a.balance, currency: a.currency, color: a.color, includeInBalance: a.includeInBalance });
    }
  }, [existingAccount, reset]);

  const mutation = useMutation({
    mutationFn: (data: AccountInput) => isEdit ? accountsApi.update(Number(id), data) : accountsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success(isEdit ? 'Account updated' : 'Account created');
      navigate('/accounts');
    },
  });

  const onSubmit = (data: AccountInput) => mutation.mutate(data);

  if (isEdit && loadingExisting) {
    return (
      <div className="max-w-2xl mx-auto space-y-4 px-4">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="space-y-4">
          {[1, 2].map((i) => (
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
    <div className="max-w-2xl mx-auto space-y-4 px-4 pb-32 md:pb-8">
      <h1 className="text-xl md:text-3xl font-bold pt-2">{isEdit ? 'Edit Account' : 'New Account'}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <SectionCard title="Account Info">
          <Input
            label="Account Name"
            placeholder="My Checking Account"
            autoComplete="organization"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Description"
            placeholder="Optional description"
            autoComplete="off"
            {...register('description')}
          />
          <Select
            label="Account Type"
            autoComplete="off"
            options={ACCOUNT_TYPES.map((t) => ({ value: t.value, label: t.label }))}
            error={errors.type?.message}
            {...register('type', { valueAsNumber: true })}
          />
        </SectionCard>

        <SectionCard title="Balance">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-muted-foreground pointer-events-none">$</span>
            <Input
              label="Initial Balance"
              type="number"
              inputMode="decimal"
              step="0.01"
              autoComplete="off"
              className="pl-8 text-lg font-medium"
              error={errors.balance?.message}
              {...register('balance', { valueAsNumber: true })}
            />
          </div>
          <label className="flex items-start gap-3 cursor-pointer min-h-[48px] py-2">
            <input
              type="checkbox"
              className="w-5 h-5 mt-0.5 rounded border-input text-primary focus:ring-primary"
              {...register('includeInBalance')}
            />
            <div>
              <span className="text-sm font-medium">Include in total balance</span>
              <p className="text-xs text-muted-foreground">This account will be counted in your net worth</p>
            </div>
          </label>
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
              onClick={handleSubmit(onSubmit)}
            >
              {isEdit ? 'Update' : 'Create'} Account
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/accounts')}
              className="w-full sm:w-auto min-h-[48px]"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
