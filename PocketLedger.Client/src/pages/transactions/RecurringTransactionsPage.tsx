import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { recurringTransactionsApi } from '../../api/recurringTransactions.api';
import { accountsApi } from '../../api/accounts.api';
import { categoriesApi } from '../../api/categories.api';
import { recurringTransactionSchema } from '../../lib/validators';
import { TRANSACTION_TYPES } from '../../lib/constants';
import { formatCurrency, formatDate } from '../../lib/utils';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import { Card, CardContent } from '../../components/ui/Card';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/shared/EmptyState';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  PauseIcon,
  PlayIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import type { RecurringTransaction } from '../../types';

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 md:p-5 space-y-4">
      <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</h2>
      {children}
    </div>
  );
}

export default function RecurringTransactionsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RecurringTransaction | null>(null);

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['recurring-transactions'] });
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['reports'] });
  };

  const { data: recurringData, isLoading } = useQuery({
    queryKey: ['recurring-transactions'],
    queryFn: () => recurringTransactionsApi.getAll(),
  });

  const { data: accountsData } = useQuery({
    queryKey: ['accounts-dropdown'],
    queryFn: () => accountsApi.getAll({ page: 1, pageSize: 100 }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories-dropdown'],
    queryFn: () => categoriesApi.getAll(),
  });

  const accounts = (accountsData?.data?.items || []).filter((a: any) => !a.isArchived);
  const categories = (categoriesData?.data || []);
  const recurringList = recurringData?.data || [];

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(recurringTransactionSchema),
    defaultValues: {
      currency: 'USD',
      type: 1,
      frequencyDays: 30,
      nextDueDate: new Date().toISOString().split('T')[0],
    },
    mode: 'onBlur',
  });

  useEffect(() => {
    if (editingId) {
      const item = recurringList.find((r) => r.id === editingId);
      if (item) {
        reset({
          amount: item.amount,
          currency: item.currency,
          type: item.type,
          note: item.note || undefined,
          payee: item.payee || undefined,
          frequencyDays: item.frequencyDays,
          nextDueDate: item.nextDueDate.split('T')[0],
          endDate: item.endDate ? item.endDate.split('T')[0] : null,
          accountId: item.accountId,
          categoryId: item.categoryId ?? null,
        });
      }
    }
  }, [editingId, recurringList, reset]);

  const openCreate = () => {
    setEditingId(null);
    reset({
      amount: 0,
      currency: 'USD',
      type: 1,
      note: undefined,
      payee: undefined,
      frequencyDays: 30,
      nextDueDate: new Date().toISOString().split('T')[0],
      endDate: null,
      accountId: undefined as any,
      categoryId: null,
    });
    setShowForm(true);
  };

  const openEdit = (item: RecurringTransaction) => {
    setEditingId(item.id);
    setShowForm(true);
  };

  const createMutation = useMutation({
    mutationFn: (data: any) => recurringTransactionsApi.create(data),
    onSuccess: () => {
      invalidateAll();
      toast.success('Recurring transaction created');
      setShowForm(false);
    },
    onError: () => toast.error('Failed to create recurring transaction'),
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => recurringTransactionsApi.update(editingId!, data),
    onSuccess: () => {
      invalidateAll();
      toast.success('Recurring transaction updated');
      setShowForm(false);
    },
    onError: () => toast.error('Failed to update recurring transaction'),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => recurringTransactionsApi.toggle(id),
    onSuccess: (res) => {
      invalidateAll();
      toast.success(res.data.isActive ? 'Recurring transaction resumed' : 'Recurring transaction paused');
    },
    onError: () => toast.error('Failed to toggle recurring transaction'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => recurringTransactionsApi.delete(id),
    onSuccess: () => {
      invalidateAll();
      setDeleteTarget(null);
      toast.success('Recurring transaction deleted');
    },
    onError: () => toast.error('Failed to delete recurring transaction'),
  });

  const onSubmit = (data: any) => {
    if (editingId) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const selectedType = Number(watch('type'));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Recurring Transactions</h1>
          <p className="text-muted-foreground">
            {recurringList.length > 0
              ? `${recurringList.filter((r) => r.isActive).length} active rule${recurringList.filter((r) => r.isActive).length !== 1 ? 's' : ''}`
              : 'Automate your regular income and expenses'}
          </p>
        </div>
        <Button onClick={openCreate}>
          <PlusIcon className="h-4 w-4 mr-2" />Add Rule
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : recurringList.length === 0 ? (
        <EmptyState
          title="No recurring rules"
          description="Create rules to automatically record recurring transactions like salary, rent, or subscriptions."
          actionLabel="Add Rule"
          onAction={openCreate}
        />
      ) : (
        <div className="space-y-3">
          {recurringList.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${item.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm">
                          {item.payee || item.note || 'Recurring'}
                        </span>
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${item.type === 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : item.type === 1 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                          {item.typeName}
                        </span>
                        {!item.isActive && (
                          <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
                            Paused
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                        <span>{formatCurrency(item.amount, item.currency)}</span>
                        <span>Every {item.frequencyDays} day{item.frequencyDays !== 1 ? 's' : ''}</span>
                        <span>Next: {formatDate(item.nextDueDate)}</span>
                        {item.endDate && <span>Until {formatDate(item.endDate)}</span>}
                        <span className="hidden sm:inline">{item.accountName}</span>
                        {item.categoryName && <span className="hidden sm:inline">· {item.categoryName}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleMutation.mutate(item.id)}
                      loading={toggleMutation.isPending}
                      title={item.isActive ? 'Pause' : 'Resume'}
                    >
                      {item.isActive ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(item)} title="Edit">
                      <PencilSquareIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(item)} title="Delete">
                      <TrashIcon className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editingId ? 'Edit Recurring Rule' : 'New Recurring Rule'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <SectionCard title="Details">
            <div>
              <label className="block text-sm font-medium mb-2">Transaction Type</label>
              <div className="grid grid-cols-3 gap-2">
                {TRANSACTION_TYPES.map((type) => (
                  <label key={type.value}
                    className={`flex items-center justify-center min-h-[44px] rounded-lg border-2 cursor-pointer transition-all active:scale-[0.98] ${selectedType === type.value ? 'border-primary bg-primary/5' : 'border-input hover:border-muted-foreground/50'}`}>
                    <input type="radio" value={type.value} className="sr-only" {...register('type', { valueAsNumber: true })} />
                    <span className={`text-sm font-medium ${selectedType === type.value ? 'text-primary' : ''}`}>{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-muted-foreground pointer-events-none z-10">$</span>
              <Input
                label="Amount"
                type="number"
                inputMode="decimal"
                step="0.01"
                className="pl-8"
                error={errors.amount?.message}
                {...register('amount', { valueAsNumber: true })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Payee"
                placeholder="Who is this for?"
                {...register('payee')}
              />
              <Input
                label="Note"
                placeholder="Optional note"
                {...register('note')}
              />
            </div>
          </SectionCard>

          <SectionCard title="Schedule">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Frequency (days)"
                type="number"
                min={1}
                error={errors.frequencyDays?.message}
                {...register('frequencyDays', { valueAsNumber: true })}
              />
              <Input
                label="Next Due Date"
                type="date"
                error={errors.nextDueDate?.message}
                {...register('nextDueDate')}
              />
            </div>
            <Input
              label="End Date (optional)"
              type="date"
              {...register('endDate')}
            />
          </SectionCard>

          <SectionCard title="Account & Category">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Account"
                placeholder="Select account"
                options={accounts.map((a: any) => ({ value: a.id, label: a.name }))}
                error={errors.accountId?.message}
                {...register('accountId', { valueAsNumber: true })}
              />
              <Select
                label="Category"
                placeholder="Select category"
                options={categories.map((c: any) => ({ value: c.id, label: c.name }))}
                {...register('categoryId', { valueAsNumber: true, setValueAs: (v: any) => v === '' ? null : Number(v) })}
              />
            </div>
          </SectionCard>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
              {editingId ? 'Update' : 'Create'} Rule
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title="Delete Recurring Rule"
        description={`Are you sure you want to delete "${deleteTarget?.payee || deleteTarget?.note || 'this recurring rule'}"? Future transactions will not be generated.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </motion.div>
  );
}
