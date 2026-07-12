import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionsApi } from '../../api/transactions.api';
import { categoriesApi } from '../../api/categories.api';
import { accountsApi } from '../../api/accounts.api';
import { cn } from '../../lib/utils';
import { CURRENCIES, ACCOUNT_TYPES } from '../../lib/constants';
import type { Category, Account } from '../../types';
import { PlusIcon } from '@heroicons/react/24/outline';
import Modal from '../ui/Modal';
import toast from 'react-hot-toast';

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

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const TYPE_OPTIONS = [
  { value: 1, label: 'Expense' },
  { value: 0, label: 'Income' },
] as const;

const DRAG_THRESHOLD = 150;

export default function QuickAddSheet({ isOpen, onClose }: Props) {
  const queryClient = useQueryClient();
  const amountRef = useRef<HTMLInputElement>(null);

  const [type, setType] = useState<number>(1);
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [accountId, setAccountId] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [currency] = useState('USD');

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [customCategoryColor, setCustomCategoryColor] = useState('#6366f1');
  const [customCategoryIcon, setCustomCategoryIcon] = useState('folder');

  const createCategoryMutation = useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setCategoryId(response.data.id);
      setShowCategoryModal(false);
      setCustomCategoryName('');
      toast.success('Category added');
    },
    onError: () => {
      toast.error('Failed to add category');
    }
  });

  const [showAccountModal, setShowAccountModal] = useState(false);
  const [customAccountName, setCustomAccountName] = useState('');
  const [customAccountType, setCustomAccountType] = useState<number>(3); // Default to Cash (value 3)
  const [customAccountBalance, setCustomAccountBalance] = useState('0');
  const [customAccountColor, setCustomAccountColor] = useState('#22c55e');

  const createAccountMutation = useMutation({
    mutationFn: accountsApi.create,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setAccountId(response.data.id);
      setShowAccountModal(false);
      setCustomAccountName('');
      setCustomAccountBalance('0');
      toast.success('Account added');
    },
    onError: () => {
      toast.error('Failed to add account');
    }
  });


  const currencySymbol = CURRENCIES.find((c) => c.code === currency)?.symbol ?? '$';

  const { data: categoriesData } = useQuery({
    queryKey: ['categories', 'quick', type],
    queryFn: () => categoriesApi.getAll({ type, isArchived: false }),
    enabled: isOpen,
  });

  const { data: accountsData } = useQuery({
    queryKey: ['accounts', 'quick'],
    queryFn: () => accountsApi.getAll({ page: 1, pageSize: 50 }),
    enabled: isOpen,
  });

  const createMutation = useMutation({
    mutationFn: transactionsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
      onClose();
      resetForm();
    },
  });

  const categories = useMemo(() => categoriesData?.data ?? [], [categoriesData?.data]);
  const accounts = useMemo(() => accountsData?.data?.items ?? [], [accountsData?.data?.items]);

  const resetForm = useCallback(() => {
    setAmount('');
    setCategoryId(null);
    setNote('');
    setType(1);
  }, []);

  useEffect(() => {
    if (isOpen) {
      resetForm();
      setTimeout(() => amountRef.current?.focus(), 300);
    }
  }, [isOpen, resetForm]);

  useEffect(() => {
    if (accounts.length > 0 && accountId === null) {
      setAccountId(accounts[0].id);
    }
  }, [accounts, accountId]);

  useEffect(() => {
    if (isOpen && accountsData && accounts.length === 0 && !createAccountMutation.isPending) {
      createAccountMutation.mutate({
        name: 'Primary Account',
        type: 3, // Cash
        balance: 0,
        currency: 'USD',
        color: '#22c55e',
        icon: 'BanknotesIcon',
        includeInBalance: true
      });
    }
  }, [isOpen, accountsData, accounts.length, createAccountMutation]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > DRAG_THRESHOLD) {
      onClose();
    }
  };

  const handleSave = () => {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0 || !accountId) return;

    createMutation.mutate({
      amount: parsedAmount,
      currency,
      type,
      date: new Date().toISOString(),
      note: note || undefined,
      paymentMethod: 0,
      accountId,
      categoryId: categoryId ?? undefined,
    });
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.]/g, '');
    const parts = raw.split('.');
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    setAmount(raw);
  };

  const handleAmountKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  const parsedAmount = parseFloat(amount);
  const isValid = !isNaN(parsedAmount) && parsedAmount > 0 && accountId !== null;

  return (
    <>
      <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <motion.div
            className="absolute inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            className="absolute bottom-0 left-0 right-0 flex flex-col rounded-t-2xl bg-card shadow-xl"
            style={{ maxHeight: 'calc(100vh - env(safe-area-inset-top, 0px))' }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
          >
            <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none">
              <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
            </div>

            <div className="px-4 pb-2">
              <div className="inline-flex rounded-xl bg-muted p-0.5 w-full">
                {TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setType(opt.value);
                      setCategoryId(null);
                    }}
                    className={cn(
                      'flex-1 rounded-lg py-2 text-sm font-medium transition-all duration-200 min-h-[44px]',
                      type === opt.value
                        ? 'bg-card text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-4 py-6 flex flex-col items-center">
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-light text-muted-foreground">{currencySymbol}</span>
                <input
                  ref={amountRef}
                  inputMode="decimal"
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  onKeyDown={handleAmountKeyDown}
                  placeholder="0.00"
                  className="text-5xl font-semibold tracking-tight bg-transparent outline-none text-center w-48 placeholder:text-muted-foreground/40 tabular-nums"
                  aria-label="Amount"
                />
              </div>
            </div>

            <div className="px-4 pb-3">
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Category</p>
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin items-center">
                {categories.map((cat: Category) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryId(categoryId === cat.id ? null : cat.id)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 min-w-[64px] rounded-xl p-2 transition-all duration-150 shrink-0',
                      categoryId === cat.id
                        ? 'bg-primary/10 ring-2 ring-primary'
                        : 'hover:bg-muted active:scale-95'
                    )}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${cat.color}20` }}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                    </div>
                    <span className="text-[11px] font-medium text-center leading-tight truncate w-full">
                      {cat.name}
                    </span>
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setShowCategoryModal(true)}
                  className="flex flex-col items-center gap-1.5 min-w-[64px] rounded-xl p-2 transition-all duration-150 hover:bg-muted active:scale-95 shrink-0"
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border-2 border-dashed border-muted-foreground/30 text-muted-foreground bg-muted/20">
                    <PlusIcon className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-medium text-center leading-tight truncate w-full text-muted-foreground">
                    Add Custom
                  </span>
                </button>

                {categories.length === 0 && (
                  <p className="text-sm text-muted-foreground py-4 shrink-0">No categories</p>
                )}
              </div>
            </div>

            <div className="px-4 pb-3">
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Account</p>
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin items-center">
                {accounts.map((acc: Account) => (
                  <button
                    key={acc.id}
                    onClick={() => setAccountId(acc.id)}
                    className={cn(
                      'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium whitespace-nowrap transition-all duration-150 shrink-0',
                      accountId === acc.id
                        ? 'bg-primary/10 ring-2 ring-primary text-foreground'
                        : 'bg-muted text-muted-foreground hover:text-foreground active:scale-95'
                    )}
                  >
                    {acc.color && (
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: acc.color }}
                      />
                    )}
                    {acc.name}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setShowAccountModal(true)}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium whitespace-nowrap transition-all duration-150 border-2 border-dashed border-muted-foreground/30 text-muted-foreground bg-muted/20 hover:bg-muted active:scale-95 shrink-0"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>New Account</span>
                </button>
              </div>
            </div>

            <div className="px-4 pb-3">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note..."
                className="w-full rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/60 min-h-[44px]"
                aria-label="Note"
              />
            </div>

            <div
              className="px-4 pb-2 pt-1"
              style={{ paddingBottom: 'max(var(--safe-area-bottom), 8px)' }}
            >
              <button
                onClick={handleSave}
                disabled={!isValid || createMutation.isPending}
                className={cn(
                  'w-full rounded-xl py-3.5 text-base font-semibold transition-all duration-200 min-h-[52px]',
                  isValid
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] shadow-lg shadow-primary/20'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                )}
              >
                {createMutation.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

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
            {(type === 0 ? SUGGESTED_INCOME_CATEGORIES : SUGGESTED_EXPENSE_CATEGORIES).map((sug) => {
              const exists = categories.some((c: Category) => c.name.toLowerCase() === sug.name.toLowerCase());
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
                      type: type === 0 ? 0 : 1,
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
                type: type === 0 ? 0 : 1,
              });
            }}
          >
            {createCategoryMutation.isPending ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </Modal>

    <Modal
      isOpen={showAccountModal}
      onClose={() => {
        setShowAccountModal(false);
        setCustomAccountName('');
        setCustomAccountBalance('0');
      }}
      title="Create Account"
    >
      <div className="space-y-5">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
            Account Name
          </label>
          <input
            type="text"
            value={customAccountName}
            onChange={(e) => setCustomAccountName(e.target.value)}
            placeholder="e.g. Savings, Wallet..."
            className="w-full rounded-xl border border-border bg-muted/35 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/50 min-h-[44px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
              Account Type
            </label>
            <select
              value={customAccountType}
              onChange={(e) => setCustomAccountType(Number(e.target.value))}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
            >
              {ACCOUNT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
              Initial Balance
            </label>
            <input
              type="number"
              value={customAccountBalance}
              onChange={(e) => setCustomAccountBalance(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl border border-border bg-muted/35 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground/50 min-h-[44px]"
            />
          </div>
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
                onClick={() => setCustomAccountColor(color)}
                className={cn(
                  'w-8 h-8 rounded-full shrink-0 transition-transform active:scale-95 flex items-center justify-center',
                  customAccountColor === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''
                )}
                style={{ backgroundColor: color }}
              >
                {customAccountColor === color && (
                  <span className="text-white text-xs font-bold">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-border">
          <button
            type="button"
            className="flex-1 py-2.5 border border-input rounded-xl text-sm font-medium hover:bg-muted transition-all active:scale-[0.98] min-h-[44px]"
            onClick={() => {
              setShowAccountModal(false);
              setCustomAccountName('');
              setCustomAccountBalance('0');
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!customAccountName.trim() || createAccountMutation.isPending}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-sm font-medium text-primary-foreground transition-all active:scale-[0.98] min-h-[44px] flex items-center justify-center",
              customAccountName.trim() && !createAccountMutation.isPending
                ? "bg-primary hover:bg-primary/90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
            onClick={() => {
              const selectedTypeObj = ACCOUNT_TYPES.find((t) => t.value === customAccountType);
              createAccountMutation.mutate({
                name: customAccountName.trim(),
                type: customAccountType,
                balance: parseFloat(customAccountBalance) || 0,
                currency: 'USD',
                color: customAccountColor,
                icon: selectedTypeObj?.icon || 'BanknotesIcon',
                includeInBalance: true,
              });
            }}
          >
            {createAccountMutation.isPending ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </Modal>
    </>
  );
}
