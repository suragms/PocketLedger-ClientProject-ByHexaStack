import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useBlocker, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsApi } from '../../api/transactions.api';
import { accountsApi } from '../../api/accounts.api';
import { categoriesApi } from '../../api/categories.api';
import { transactionSchema } from '../../lib/validators';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import ReceiptUpload from '../../components/transactions/ReceiptUpload';
import { TRANSACTION_TYPES, PAYMENT_METHODS } from '../../lib/constants';
import toast from 'react-hot-toast';
import type { Transaction } from '../../types';

export default function TransactionFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const isEdit = !!id;
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const initialType = searchParams.get('type') ? Number(searchParams.get('type')) : 1;

  const { data: existing, isLoading: loadingExisting } = useQuery({
    queryKey: ['transaction', id],
    queryFn: () => transactionsApi.getById(Number(id)),
    enabled: isEdit,
  });

  const { data: accountsData } = useQuery({ queryKey: ['accounts-dropdown'], queryFn: () => accountsApi.getAll({ page: 1, pageSize: 100 }) });
  const { data: categoriesData } = useQuery({ queryKey: ['categories-dropdown'], queryFn: () => categoriesApi.getAll() });

  const { register, handleSubmit, reset, watch, formState: { errors, dirtyFields } } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: { currency: 'USD', type: initialType, paymentMethod: 0, date: new Date().toISOString().split('T')[0], amount: 0 },
  });

  const formValues = watch();
  useEffect(() => {
    const hasDirty = Object.keys(dirtyFields).length > 0;
    setIsDirty(hasDirty);
  }, [dirtyFields, formValues]);

  useEffect(() => {
    if (existing?.data) {
      const t = existing.data;
      setTransaction(t);
      reset({
        amount: t.amount, currency: t.currency, type: t.type,
        date: t.date.split('T')[0], note: t.note || undefined, payee: t.payee || undefined,
        reference: t.reference || undefined, paymentMethod: t.paymentMethod,
        accountId: t.accountId, categoryId: t.categoryId ?? undefined,
      });
    }
  }, [existing, reset]);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  useBlocker(
    useCallback(() => {
      if (!isDirty) return false;
      return !window.confirm('You have unsaved changes. Are you sure you want to leave?');
    }, [isDirty])
  );

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['reports'] });
    queryClient.invalidateQueries({ queryKey: ['budgets'] });
  };

  const mutation = useMutation({
    mutationFn: (data: any) => isEdit ? transactionsApi.update(Number(id), data) : transactionsApi.create(data),
    onSuccess: () => {
      invalidateAll();
      toast.success(isEdit ? 'Transaction updated' : 'Transaction created');
      navigate('/transactions');
    },
  });

  const createAnotherMutation = useMutation({
    mutationFn: (data: any) => transactionsApi.create(data),
    onSuccess: () => {
      invalidateAll();
      toast.success('Transaction created');
      reset({ currency: 'USD', type: watch('type'), paymentMethod: 0, date: new Date().toISOString().split('T')[0], amount: 0 });
      setIsDirty(false);
    },
  });

  const accounts = (accountsData?.data?.items || []).filter((a: any) => !a.isArchived);
  const categories = (categoriesData?.data || []).filter((c: any) => {
    const type = watch('type');
    if (type === 0) return c.type === 0 || c.type === 2;
    if (type === 1) return c.type === 1 || c.type === 2;
    return true;
  });
  const selectedType = watch('type');

  const onSubmit = (data: any) => mutation.mutate(data);
  const onSubmitAddAnother = (data: any) => {
    if (isEdit) {
      mutation.mutate(data);
    } else {
      createAnotherMutation.mutate(data);
    }
  };

  if (isEdit && loadingExisting) {
    return <div className="max-w-2xl mx-auto space-y-6"><div className="animate-pulse space-y-4">
      <div className="h-8 w-48 bg-muted rounded" /><div className="h-96 bg-muted rounded-xl" /></div></div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">{isEdit ? 'Edit Transaction' : 'New Transaction'}</h1>

      <Card>
        <CardContent className="p-6">
          <form className="space-y-6">
            {/* Type Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Transaction Type</label>
              <div className="grid grid-cols-3 gap-2">
                {TRANSACTION_TYPES.map((type) => (
                  <label key={type.value}
                    className={`flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all ${selectedType === type.value ? 'border-primary bg-primary/5' : 'border-input hover:border-muted-foreground/50'}`}>
                    <input type="radio" value={type.value} className="sr-only" {...register('type', { valueAsNumber: true })} />
                    <span className={`text-sm font-medium ${selectedType === type.value ? 'text-primary' : ''}`}>{type.label}</span>
                  </label>
                ))}
              </div>
              {errors.type && <p className="text-sm text-destructive mt-1">{errors.type.message}</p>}
            </div>

            {/* Amount */}
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-muted-foreground">$</span>
              <Input label="Amount" type="number" step="0.01" className="pl-8 text-lg"
                error={errors.amount?.message} {...register('amount', { valueAsNumber: true })} />
            </div>

            {/* Date & Payment Method */}
            <div className="grid grid-cols-2 gap-4">
              <Input label="Date" type="date" error={errors.date?.message} {...register('date')} />
              <Select label="Payment Method" options={PAYMENT_METHODS.map((p) => ({ value: p.value, label: p.label }))}
                error={errors.paymentMethod?.message} {...register('paymentMethod', { valueAsNumber: true })} />
            </div>

            {/* Account & Category */}
            <div className="grid grid-cols-2 gap-4">
              <Select label="Account" placeholder="Select account"
                options={accounts.map((a: any) => ({ value: a.id, label: a.name }))}
                error={errors.accountId?.message} {...register('accountId', { valueAsNumber: true })} />
              <Select label="Category" placeholder="Select category"
                options={categories.map((c: any) => ({ value: c.id, label: c.name }))}
                {...register('categoryId', { valueAsNumber: true, setValueAs: (v) => v === '' ? null : Number(v) })} />
            </div>

            {/* Payee & Reference */}
            <div className="grid grid-cols-2 gap-4">
              <Input label="Payee" placeholder="Who was this paid to?" {...register('payee')} />
              <Input label="Reference" placeholder="Invoice #, receipt #" {...register('reference')} />
            </div>

            {/* Note */}
            <Input label="Note" placeholder="Additional notes about this transaction" {...register('note')} />

            {/* Receipt Upload */}
            {isEdit && transaction && (
              <ReceiptUpload transaction={transaction} onUpdate={setTransaction} />
            )}

            {/* Actions */}
            <div className="flex gap-4 pt-2">
              <Button type="submit" loading={mutation.isPending} className="flex-1"
                onClick={handleSubmit(onSubmit)}>
                {isEdit ? 'Update' : 'Create'} Transaction
              </Button>
              {!isEdit && (
                <Button type="button" variant="secondary" loading={createAnotherMutation.isPending}
                  onClick={handleSubmit(onSubmitAddAnother)}>
                  Save & Add Another
                </Button>
              )}
              <Button type="button" variant="outline" onClick={() => navigate('/transactions')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
