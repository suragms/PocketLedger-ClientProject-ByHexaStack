import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsApi } from '../../api/transactions.api';
import { accountsApi } from '../../api/accounts.api';
import { categoriesApi } from '../../api/categories.api';
import { transactionSchema, transferSchema, type TransferInput } from '../../lib/validators';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import ReceiptUpload from '../../components/transactions/ReceiptUpload';
import TagInput from '../../components/transactions/TagInput';
import { useNavigationGuard } from '../../hooks/useNavigationGuard';
import { TRANSACTION_TYPES, PAYMENT_METHODS } from '../../lib/constants';
import toast from 'react-hot-toast';
import type { Transaction } from '../../types';
import Modal from '../../components/ui/Modal';
import { cn } from '../../lib/utils';

const SUGGESTED_INCOME_CATEGORIES = [
  { name: 'Salary', icon: 'currency-dollar', color: '#22c55e' },
  { name: 'Freelance', icon: 'briefcase', color: '#14b8a6' },
  { name: 'Investments', icon: 'chart-bar', color: '#06b6d4' },
  { name: 'Gifts', icon: 'gift', color: '#ec4899' },
  { name: 'Other Income', icon: 'folder', color: '#6b7280' },
];

const SUGGESTED_EXPENSE_CATEGORIES = [
  { name: 'Food & Dining', icon: 'utensils', color: '#ef4444' },
  { name: 'Shopping', icon: 'shopping-bag', color: '#3b82f6' },
  { name: 'Transportation', icon: 'car', color: '#f97316' },
  { name: 'Bills & Utilities', icon: 'bolt', color: '#eab308' },
  { name: 'Entertainment', icon: 'film', color: '#22c55e' },
  { name: 'Health', icon: 'heart', color: '#ec4899' },
  { name: 'Travel', icon: 'plane', color: '#0ea5e9' },
  { name: 'Other Expense', icon: 'folder', color: '#6b7280' },
];

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 md:p-5 space-y-4">
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</h2>
      {children}
    </div>
  );
}

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

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [customCategoryColor, setCustomCategoryColor] = useState('#6366f1');
  const [customCategoryIcon] = useState('folder');

  const createCategoryMutation = useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['categories-dropdown'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setValue('categoryId', response.data.id);
      setShowCategoryModal(false);
      setCustomCategoryName('');
      toast.success('Category added');
    },
    onError: () => {
      toast.error('Failed to add category');
    }
  });

  const { register, handleSubmit, reset, watch, setValue, getValues, formState: { errors, dirtyFields } } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: { currency: 'USD', type: initialType, paymentMethod: 0, date: new Date().toISOString().split('T')[0], amount: 0 },
    mode: 'onBlur',
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
        tagIds: t.tagIds || [],
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

  const { guardedNavigate } = useNavigationGuard(isDirty);

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

  const transferMutation = useMutation({
    mutationFn: (data: TransferInput) => transactionsApi.transferFunds(data),
    onSuccess: () => {
      invalidateAll();
      toast.success('Transfer completed');
      navigate('/transactions');
    },
  });

  const createAnotherMutation = useMutation({
    mutationFn: (data: any) => transactionsApi.create(data),
    onSuccess: () => {
      invalidateAll();
      toast.success('Transaction created');
      reset({ currency: 'USD', type: Number(watch('type')), paymentMethod: 0, date: new Date().toISOString().split('T')[0], amount: 0 });
      setIsDirty(false);
    },
  });

  const accounts = (accountsData?.data?.items || []).filter((a: any) => !a.isArchived);
  const selectedType = Number(watch('type'));
  const categories = (categoriesData?.data || []).filter((c: any) => {
    if (selectedType === 0) return c.type === 0 || c.type === 2;
    if (selectedType === 1) return c.type === 1 || c.type === 2;
    return true;
  });

  const onSubmit = (data: any) => {
    if (selectedType === 2) {
      const vals = getValues();
      transferMutation.mutate({
        amount: vals.amount,
        currency: vals.currency,
        fromAccountId: vals.accountId,
        toAccountId: vals.targetAccountId,
        date: vals.date,
        note: vals.note,
      });
    } else {
      mutation.mutate(data);
    }
  };

  const onSubmitAddAnother = (data: any) => {
    if (isEdit) {
      mutation.mutate(data);
    } else if (selectedType === 2) {
      const vals = getValues();
      transferMutation.mutate({
        amount: vals.amount,
        currency: vals.currency,
        fromAccountId: vals.accountId,
        toAccountId: vals.targetAccountId,
        date: vals.date,
        note: vals.note,
      });
    } else {
      createAnotherMutation.mutate(data);
    }
  };

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
    <div className="max-w-2xl mx-auto space-y-4 px-4 pb-32 md:pb-8">
      <h1 className="text-xl md:text-3xl font-bold pt-2">{isEdit ? 'Edit Transaction' : 'New Transaction'}</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <SectionCard title="Details">
          <div>
            <label className="block text-sm font-medium mb-2">Transaction Type</label>
            <div className="grid grid-cols-3 gap-2">
              {TRANSACTION_TYPES.map((type) => (
                <label key={type.value}
                  className={`flex items-center justify-center min-h-[48px] rounded-lg border-2 cursor-pointer transition-all active:scale-[0.98] ${selectedType === type.value ? 'border-primary bg-primary/5' : 'border-input hover:border-muted-foreground/50'}`}>
                  <input type="radio" value={type.value} className="sr-only" {...register('type', { valueAsNumber: true })} />
                  <span className={`text-sm font-medium ${selectedType === type.value ? 'text-primary' : ''}`}>{type.label}</span>
                </label>
              ))}
            </div>
            {errors.type && <p className="mt-1.5 text-xs text-destructive">{errors.type.message}</p>}
          </div>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-muted-foreground pointer-events-none">$</span>
            <Input
              label="Amount"
              type="number"
              inputMode="decimal"
              step="0.01"
              autoComplete="off"
              className="pl-8 text-lg font-medium"
              error={errors.amount?.message}
              {...register('amount', { valueAsNumber: true })}
            />
          </div>
        </SectionCard>

        <SectionCard title="When & How">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              inputMode="numeric"
              autoComplete="off"
              error={errors.date?.message}
              {...register('date')}
            />
            <Select
              label="Payment Method"
              autoComplete="off"
              options={PAYMENT_METHODS.map((p) => ({ value: p.value, label: p.label }))}
              error={errors.paymentMethod?.message}
              {...register('paymentMethod', { valueAsNumber: true })}
            />
          </div>
        </SectionCard>

        <SectionCard title={selectedType === 2 ? 'Transfer Accounts' : 'Account & Category'}>
          {selectedType === 2 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="From Account"
                placeholder="Select source"
                autoComplete="off"
                options={accounts.map((a: any) => ({ value: a.id, label: a.name }))}
                error={errors.accountId?.message}
                {...register('accountId', { valueAsNumber: true })}
              />
              <Select
                label="To Account"
                placeholder="Select destination"
                autoComplete="off"
                options={accounts.map((a: any) => ({ value: a.id, label: a.name }))}
                {...register('targetAccountId')}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Account"
                placeholder="Select account"
                autoComplete="off"
                options={accounts.map((a: any) => ({ value: a.id, label: a.name }))}
                error={errors.accountId?.message}
                {...register('accountId', { valueAsNumber: true })}
              />
              <div>
                <div className="flex justify-between items-baseline mb-1">
                  <label className="block text-sm font-medium">Category</label>
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(true)}
                    className="text-xs text-primary hover:underline font-semibold"
                  >
                    + Add Category
                  </button>
                </div>
                <Select
                  placeholder="Select category"
                  autoComplete="off"
                  options={categories.map((c: any) => ({ value: c.id, label: c.name }))}
                  {...register('categoryId')}
                />
              </div>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Additional Info">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Payee"
              placeholder="Who was this paid to?"
              autoComplete="off"
              {...register('payee')}
            />
            <Input
              label="Reference"
              placeholder="Invoice #, receipt #"
              autoComplete="off"
              {...register('reference')}
            />
          </div>
          <Input
            label="Note"
            placeholder="Additional notes about this transaction"
            autoComplete="off"
            {...register('note')}
          />
          <TagInput
            label="Tags"
            value={watch('tagIds') || []}
            onChange={(ids) => setValue('tagIds', ids, { shouldDirty: true })}
          />
        </SectionCard>

        {isEdit && transaction && (
          <SectionCard title="Receipt">
            <ReceiptUpload transaction={transaction} onUpdate={setTransaction} />
          </SectionCard>
        )}
      </form>

      {/* Sticky submit bar */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-card/95 backdrop-blur-sm safe-area-pb md:relative md:border-0 md:bg-transparent md:backdrop-blur-none">
        <div className="max-w-2xl mx-auto px-4 py-3 md:px-0 md:py-0">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="submit"
              loading={selectedType === 2 ? transferMutation.isPending : mutation.isPending}
              className="w-full sm:flex-1 min-h-[48px]"
              onClick={handleSubmit(onSubmit)}
            >
              {selectedType === 2 ? 'Transfer' : isEdit ? 'Update' : 'Create'} {selectedType === 2 ? 'Funds' : 'Transaction'}
            </Button>
            {!isEdit && (
              <Button
                type="button"
                variant="secondary"
                loading={selectedType === 2 ? false : createAnotherMutation.isPending}
                onClick={handleSubmit(onSubmitAddAnother)}
                className="w-full sm:flex-1 min-h-[48px]"
                disabled={selectedType === 2}
              >
                {selectedType === 2 ? 'Transfer' : 'Save & Add Another'}
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => guardedNavigate('/transactions')}
              className="w-full sm:w-auto min-h-[48px]"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showCategoryModal}
        onClose={() => {
          setShowCategoryModal(false);
          setCustomCategoryName('');
        }}
        title="Add Category"
      >
        <div className="space-y-6">
          {/* Suggestions */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-3">Quick Suggestions</p>
            <div className="grid grid-cols-2 gap-2">
              {(selectedType === 0 ? SUGGESTED_INCOME_CATEGORIES : SUGGESTED_EXPENSE_CATEGORIES).map((sug) => {
                const exists = categories.some((c: any) => c.name.toLowerCase() === sug.name.toLowerCase());
                if (exists) return null;

                return (
                  <button
                    key={sug.name}
                    type="button"
                    onClick={() => {
                      createCategoryMutation.mutate({
                        name: sug.name,
                        icon: sug.icon,
                        color: sug.color,
                        type: selectedType === 0 ? 0 : 1,
                      });
                    }}
                    disabled={createCategoryMutation.isPending}
                    className="flex items-center gap-2 rounded-xl border border-border p-2.5 hover:bg-muted text-left transition-colors active:scale-[0.98] w-full"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: sug.color }}
                    >
                      <span className="text-white text-sm font-semibold">
                        {sug.name.substring(0, 1).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-foreground truncate">{sug.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-border my-4" />

          {/* Custom Category Form */}
          <div className="space-y-4">
            <p className="text-sm font-medium text-muted-foreground">Or Create Custom</p>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
                Category Name
              </label>
              <input
                type="text"
                value={customCategoryName}
                onChange={(e) => setCustomCategoryName(e.target.value)}
                placeholder="e.g. Subscriptions, Rent..."
                className="w-full rounded-xl border border-border bg-muted/35 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/50 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">
                Choose Color
              </label>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setCustomCategoryColor(color)}
                    className={cn(
                      'w-8 h-8 rounded-full shrink-0 transition-transform active:scale-95 flex items-center justify-center',
                      customCategoryColor === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
                    )}
                    style={{ backgroundColor: color }}
                  >
                    {customCategoryColor === color && (
                      <span className="text-white text-xs font-bold">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-border">
            <button
              type="button"
              className="flex-1 py-2.5 border border-input rounded-xl text-sm font-medium hover:bg-muted transition-all active:scale-[0.98] min-h-[44px]"
              onClick={() => {
                setShowCategoryModal(false);
                setCustomCategoryName('');
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!customCategoryName.trim() || createCategoryMutation.isPending}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-sm font-medium text-primary-foreground transition-all active:scale-[0.98] min-h-[44px] flex items-center justify-center",
                customCategoryName.trim() && !createCategoryMutation.isPending
                  ? "bg-primary hover:bg-primary/90"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
              onClick={() => {
                createCategoryMutation.mutate({
                  name: customCategoryName.trim(),
                  icon: customCategoryIcon,
                  color: customCategoryColor,
                  type: selectedType === 0 ? 0 : 1,
                });
              }}
            >
              {createCategoryMutation.isPending ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
