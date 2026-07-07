import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { accountsApi } from '../../api/accounts.api';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/shared/EmptyState';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { accountSchema } from '../../lib/validators';
import type { AccountInput } from '../../lib/validators';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  WalletIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { ACCOUNT_TYPES, ACCOUNT_COLORS } from '../../lib/constants';
import { formatCurrency } from '../../lib/utils';
import { useDebounce } from '../../hooks/useDebounce';
import type { Account } from '../../types';

const WALLET_TABS = [
  { key: 'all', label: 'All Wallets' },
  { key: 'personal', label: 'Personal', type: 0 },
  { key: 'savings', label: 'Savings', type: 1 },
  { key: 'business', label: 'Business', type: 7 },
  { key: 'custom', label: 'Custom', type: 8 },
] as const;

export default function WalletsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Account | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingWallet, setDeletingWallet] = useState<Account | null>(null);
  const debouncedSearch = useDebounce(search, 300);

  const currentTab = WALLET_TABS.find((t) => t.key === activeTab) || WALLET_TABS[0];

  const { data, isLoading } = useQuery({
    queryKey: ['accounts', page, debouncedSearch, activeTab],
    queryFn: () => accountsApi.getAll({
      page,
      pageSize: 20,
      search: debouncedSearch || undefined,
      accountType: 'type' in currentTab ? currentTab.type : undefined,
    }),
  });

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: { name: '', description: '', color: '#6366f1', type: 0, currency: 'USD', balance: 0, includeInBalance: true },
  });

  const createMutation = useMutation({
    mutationFn: (d: AccountInput) => accountsApi.create(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Wallet created');
      closeModal();
    },
    onError: () => toast.error('Failed to create wallet'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: AccountInput }) => accountsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Wallet updated');
      closeModal();
    },
    onError: () => toast.error('Failed to update wallet'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => accountsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Wallet deleted');
      setDeleteDialogOpen(false);
      setDeletingWallet(null);
    },
    onError: () => toast.error('Failed to delete wallet'),
  });

  const accounts = data?.data?.items || [];
  const totalPages = data?.data?.totalPages || 1;
  const selectedColor = watch('color');

  const totalBalance = useMemo(() => {
    return accounts.filter((a) => a.includeInBalance).reduce((sum, a) => sum + a.balance, 0);
  }, [accounts]);

  const openModal = (wallet?: Account) => {
    if (wallet) {
      setEditingWallet(wallet);
      reset({
        name: wallet.name,
        description: wallet.description,
        type: wallet.type,
        balance: wallet.balance,
        currency: wallet.currency,
        color: wallet.color || '#6366f1',
        includeInBalance: wallet.includeInBalance,
      });
    } else {
      setEditingWallet(null);
      reset({ name: '', description: '', type: 0, balance: 0, currency: 'USD', color: '#6366f1', includeInBalance: true });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingWallet(null);
    reset();
  };

  const onSubmit = (d: AccountInput) => {
    if (editingWallet) updateMutation.mutate({ id: editingWallet.id, data: d });
    else createMutation.mutate(d);
  };

  const handleDelete = (wallet: Account) => {
    setDeletingWallet(wallet);
    setDeleteDialogOpen(true);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Wallets</h1>
          <p className="text-muted-foreground">Manage your wallets and track balances</p>
        </div>
        <Button onClick={() => openModal()}>
          <PlusIcon className="h-4 w-4 mr-2" />New Wallet
        </Button>
      </div>

      {/* Total Balance Card */}
      <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
              <WalletIcon className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Balance</p>
              <p className="text-3xl font-bold">{formatCurrency(totalBalance)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {accounts.length} wallet{accounts.length !== 1 ? 's' : ''} &middot; {accounts.filter((a) => a.includeInBalance).length} included
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        {WALLET_TABS.map((tab) => {
          const count = tab.key === 'all'
            ? accounts.length
            : accounts.filter((a) => a.type === tab.type).length;
          return (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 text-xs ${activeTab === tab.key ? 'opacity-80' : 'opacity-60'}`}>
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Input
          placeholder="Search wallets..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          icon={<MagnifyingGlassIcon className="h-4 w-4" />}
        />
      </div>

      {/* Wallet Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-xl" />
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <EmptyState
          title={debouncedSearch ? 'No wallets found' : 'No wallets yet'}
          description={debouncedSearch ? 'Try a different search term' : 'Create your first wallet to get started'}
          actionLabel={!debouncedSearch ? 'New Wallet' : undefined}
          onAction={!debouncedSearch ? () => openModal() : undefined}
        />
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {accounts.map((wallet, index) => {
              const typeInfo = ACCOUNT_TYPES.find((t) => t.value === wallet.type);
              return (
                <motion.div
                  key={wallet.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                >
                  <Card
                    className="group hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden"
                    onClick={() => navigate(`/accounts/${wallet.id}`)}
                  >
                    {/* Color stripe */}
                    <div className="h-1.5" style={{ backgroundColor: wallet.color || '#6366f1' }} />

                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm"
                            style={{ backgroundColor: wallet.color || '#6366f1' }}
                          >
                            {wallet.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-semibold">{wallet.name}</h3>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={wallet.type === 0 ? 'default' : wallet.type === 1 ? 'success' : 'outline'}
                                className="text-[10px] px-1.5 py-0"
                              >
                                {typeInfo?.label || 'Other'}
                              </Badge>
                              {!wallet.includeInBalance && (
                                <Badge variant="warning" className="text-[10px] px-1.5 py-0">Excluded</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => openModal(wallet)}
                            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                            title="Edit"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(wallet)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-destructive transition-colors"
                            title="Delete"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Balance */}
                      <div className="mb-4">
                        <p className={`text-2xl font-bold ${wallet.balance >= 0 ? '' : 'text-destructive'}`}>
                          {formatCurrency(wallet.balance, wallet.currency)}
                        </p>
                        {wallet.description && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">{wallet.description}</p>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/50">
                        <div>
                          <div className="flex items-center gap-1">
                            <ArrowUpIcon className="h-3 w-3 text-green-500" />
                            <span className="text-[10px] text-muted-foreground">Income</span>
                          </div>
                          <p className="text-sm font-semibold text-green-600">
                            {formatCurrency(wallet.totalIncome, wallet.currency)}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <ArrowDownIcon className="h-3 w-3 text-red-500" />
                            <span className="text-[10px] text-muted-foreground">Expenses</span>
                          </div>
                          <p className="text-sm font-semibold text-red-600">
                            {formatCurrency(wallet.totalExpenses, wallet.currency)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                        <span className="text-[10px] text-muted-foreground">
                          {wallet.transactionCount} transaction{wallet.transactionCount !== 1 ? 's' : ''}
                        </span>
                        {wallet.lastTransactionDate && (
                          <span className="text-[10px] text-muted-foreground">
                            Last: {new Date(wallet.lastTransactionDate).toLocaleDateString()}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            Next
          </Button>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingWallet ? 'Edit Wallet' : 'New Wallet'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Wallet Name"
            placeholder="e.g. Main Checking, Travel Fund"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Description"
            placeholder="Optional description"
            {...register('description')}
          />

          {/* Wallet Type */}
          <div>
            <label className="block text-sm font-medium mb-2">Wallet Type</label>
            <div className="grid grid-cols-3 gap-2">
              {ACCOUNT_TYPES.filter((t) => [0, 1, 7, 8].includes(t.value)).map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setValue('type', t.value)}
                  className={`flex flex-col items-center gap-1 px-3 py-3 rounded-lg border-2 transition-all text-center ${
                    watch('type') === t.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-muted-foreground/30 text-muted-foreground'
                  }`}
                >
                  <span className="text-lg">
                    {t.value === 0 ? '👤' : t.value === 1 ? '🏦' : t.value === 7 ? '💼' : '⚙️'}
                  </span>
                  <span className="text-xs font-medium">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Balance (only for new wallets) */}
          {!editingWallet && (
            <Input
              label="Initial Balance"
              type="number"
              step="0.01"
              error={errors.balance?.message}
              {...register('balance', { valueAsNumber: true })}
            />
          )}

          {/* Currency */}
          <Input
            label="Currency"
            placeholder="USD"
            error={errors.currency?.message}
            {...register('currency')}
          />

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium mb-2">Wallet Color</label>
            <div className="grid grid-cols-5 gap-2">
              {ACCOUNT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue('color', color)}
                  className={`w-10 h-10 rounded-xl transition-all flex items-center justify-center ${
                    selectedColor === color
                      ? 'ring-2 ring-offset-2 ring-primary scale-110'
                      : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: color }}
                >
                  {selectedColor === color && <CheckIcon className="h-4 w-4 text-white" />}
                </button>
              ))}
            </div>
            {errors.color && <p className="text-sm text-destructive mt-1">{errors.color.message}</p>}
          </div>

          {/* Include in Balance */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
              {...register('includeInBalance')}
            />
            <span className="text-sm">Include in total balance</span>
          </label>

          {/* Preview */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs shadow-sm"
              style={{ backgroundColor: selectedColor || '#6366f1' }}
            >
              {(watch('name') || 'WA').substring(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium">{watch('name') || 'Wallet Name'}</p>
              <p className="text-xs text-muted-foreground">
                {ACCOUNT_TYPES.find((t) => t.value === watch('type'))?.label || 'Personal'} wallet
                {watch('includeInBalance') ? ' &middot; Included in balance' : ''}
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              loading={createMutation.isPending || updateMutation.isPending}
              className="flex-1"
            >
              {editingWallet ? 'Update Wallet' : 'Create Wallet'}
            </Button>
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => { setDeleteDialogOpen(false); setDeletingWallet(null); }}
        onConfirm={() => deletingWallet && deleteMutation.mutate(deletingWallet.id)}
        title="Delete Wallet"
        description={`Are you sure you want to delete "${deletingWallet?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </motion.div>
  );
}
