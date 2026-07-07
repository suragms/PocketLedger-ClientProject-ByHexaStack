import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { transactionsApi } from '../../api/transactions.api';
import { Card, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/shared/EmptyState';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import TransactionFilterPanel from '../../components/transactions/TransactionFilterPanel';
import TransactionDayGroup from '../../components/transactions/TransactionDayGroup';
import { useDebounce } from '../../hooks/useDebounce';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { formatCurrency } from '../../lib/utils';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowUturnLeftIcon,
  ArrowDownTrayIcon,
  TableCellsIcon,
  Squares2X2Icon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import type { Transaction, TransactionFilters } from '../../types';

export default function TransactionsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [showDeleted, setShowDeleted] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const debouncedSearch = useDebounce(search, 300);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['transactions', page, debouncedSearch, filters],
    queryFn: async () => {
      const response = await transactionsApi.getAll({
        page,
        pageSize: 30,
        search: debouncedSearch,
        ...filters,
      });
      return response.data;
    },
  });

  const { data: deletedData } = useQuery({
    queryKey: ['transactions-deleted'],
    queryFn: () => transactionsApi.getDeleted(),
    enabled: showDeleted,
  });

  // Accumulate pages for infinite scroll
  useEffect(() => {
    if (data?.items) {
      if (page === 1) {
        setAllTransactions(data.items);
      } else {
        setAllTransactions((prev) => {
          const existingIds = new Set(prev.map((t) => t.id));
          const newItems = data.items.filter((t) => !existingIds.has(t.id));
          return [...prev, ...newItems];
        });
      }
    }
  }, [data, page]);

  // Reset on filter/search change
  useEffect(() => {
    setPage(1);
    setAllTransactions([]);
  }, [debouncedSearch, filters]);

  const deleteMutation = useMutation({
    mutationFn: (id: number) => transactionsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setDeleteTarget(null);
      toast.success('Transaction deleted');
    },
  });

  const undoMutation = useMutation({
    mutationFn: (id: number) => transactionsApi.undoDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactions-deleted'] });
      toast.success('Transaction restored');
    },
  });

  const exportMutation = useMutation({
    mutationFn: () => transactionsApi.exportCsv(filters),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Transactions exported');
    },
    onError: () => toast.error('Export failed'),
  });

  const transactions = allTransactions;
  const deletedTransactions = deletedData?.data || [];
  const hasMore = data?.hasNext ?? false;
  const totalCount = data?.totalCount ?? 0;

  const loadMore = useCallback(() => {
    if (!isFetching && hasMore) {
      setPage((p) => p + 1);
    }
  }, [isFetching, hasMore]);

  const { lastElementRef } = useInfiniteScroll({ hasMore, loading: isFetching, onLoadMore: loadMore });

  const handleClearFilters = () => {
    setFilters({});
    setSearch('');
    setPage(1);
  };

  const activeFilterCount = [
    filters.startDate,
    filters.endDate,
    filters.type !== undefined,
    filters.accountId,
    filters.categoryId,
    filters.minAmount,
    filters.maxAmount,
    filters.search,
  ].filter(Boolean).length;

  // Group by date
  const groupedTransactions = transactions.reduce<Record<string, Transaction[]>>((acc, t) => {
    const dateKey = t.date.split('T')[0];
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(t);
    return acc;
  }, {});

  const totalIncome = transactions.filter((t) => t.type === 0).reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === 1).reduce((sum, t) => sum + t.amount, 0);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">
            {totalCount > 0 ? `${totalCount} transaction${totalCount !== 1 ? 's' : ''}` : 'Track your income and expenses'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => exportMutation.mutate()} loading={exportMutation.isPending}>
            <ArrowDownTrayIcon className="h-4 w-4 mr-1.5" />Export
          </Button>
          <Link to="/transactions/new">
            <Button><PlusIcon className="h-4 w-4 mr-2" />Add Transaction</Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-3 md:p-4 text-center">
            <p className="text-[10px] md:text-xs text-muted-foreground">Income</p>
            <p className="text-sm md:text-lg font-bold text-green-600">{formatCurrency(totalIncome)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4 text-center">
            <p className="text-[10px] md:text-xs text-muted-foreground">Expense</p>
            <p className="text-sm md:text-lg font-bold text-red-600">{formatCurrency(totalExpense)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4 text-center">
            <p className="text-[10px] md:text-xs text-muted-foreground">Net</p>
            <p className={`text-sm md:text-lg font-bold ${totalIncome - totalExpense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(Math.abs(totalIncome - totalExpense))}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search & View Toggle */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<MagnifyingGlassIcon className="h-4 w-4" />}
          />
        </div>
        <div className="flex border rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 transition-colors ${viewMode === 'table' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80 text-muted-foreground'}`}
          >
            <TableCellsIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('card')}
            className={`p-2 transition-colors ${viewMode === 'card' ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80 text-muted-foreground'}`}
          >
            <Squares2X2Icon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Filters */}
      <TransactionFilterPanel filters={filters} onFiltersChange={setFilters} onClear={handleClearFilters} />

      {/* Deleted Transactions */}
      {deletedTransactions.length > 0 && (
        <div>
          <Button variant="outline" size="sm" onClick={() => setShowDeleted(!showDeleted)}>
            <ArrowUturnLeftIcon className="h-4 w-4 mr-1" />
            {showDeleted ? 'Hide' : 'Show'} Deleted ({deletedTransactions.length})
          </Button>

          <AnimatePresence>
            {showDeleted && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-3"
              >
                <Card>
                  <CardContent className="p-0">
                    <div className="p-3 bg-muted/30 border-b">
                      <p className="text-sm font-medium text-muted-foreground">Deleted Transactions</p>
                    </div>
                    <div className="divide-y max-h-64 overflow-y-auto">
                      {deletedTransactions.map((t) => (
                        <div key={t.id} className="flex items-center justify-between p-4 opacity-60">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                            <div>
                              <p className="text-sm line-through">{t.payee || t.note || 'Transaction'}</p>
                              <p className="text-xs text-muted-foreground">
                                Deleted {t.deletedAt ? new Date(t.deletedAt).toLocaleDateString() : ''}
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => undoMutation.mutate(t.id)}>
                            <ArrowPathIcon className="h-3 w-3 mr-1" />Restore
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Transaction List */}
      {isLoading ? (
        viewMode === 'table' ? (
          <Card>
            <CardContent className="p-0">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border-b border-border/50 last:border-0">
                  <Skeleton className="h-8 w-8 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        )
      ) : transactions.length === 0 ? (
        <EmptyState
          title="No transactions found"
          description={activeFilterCount > 0 ? 'Try adjusting your filters' : 'Add your first transaction to get started'}
          actionLabel={activeFilterCount > 0 ? 'Clear Filters' : 'Add Transaction'}
          onAction={activeFilterCount > 0 ? handleClearFilters : undefined}
        />
      ) : viewMode === 'table' ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left py-3 pl-4 pr-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Transaction</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Category</th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                    <th className="text-right py-3 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amount</th>
                    <th className="py-3 pr-4 pl-3 w-20"></th>
                  </tr>
                </thead>
              </table>
              {Object.entries(groupedTransactions).map(([date, dayTransactions]) => (
                <TransactionDayGroup
                  key={date}
                  date={date}
                  transactions={dayTransactions}
                  onDelete={(id) => {
                    const t = transactions.find((tx) => tx.id === id);
                    if (t) setDeleteTarget(t);
                  }}
                  viewMode="table"
                />
              ))}
            </div>
            {hasMore && (
              <div ref={lastElementRef} className="p-4">
                {isFetching && (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                    Loading more...
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTransactions).map(([date, dayTransactions]) => (
            <TransactionDayGroup
              key={date}
              date={date}
              transactions={dayTransactions}
              onDelete={(id) => {
                const t = transactions.find((tx) => tx.id === id);
                if (t) setDeleteTarget(t);
              }}
              viewMode="card"
            />
          ))}
          {hasMore && (
            <div ref={lastElementRef} className="py-4">
              {isFetching && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  Loading more...
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title="Delete Transaction"
        description={`Are you sure you want to delete "${deleteTarget?.payee || deleteTarget?.note || 'this transaction'}"? You can restore it from the deleted items.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </motion.div>
  );
}
