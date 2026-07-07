import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { adminApi } from '../../api/admin.api';
import { Card, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import SearchBar from '../../components/admin/SearchBar';
import FilterBar from '../../components/admin/FilterBar';
import Pagination from '../../components/admin/Pagination';

const TYPE_LABELS: Record<number, { label: string; variant: 'success' | 'destructive' | 'outline' }> = {
  0: { label: 'Income', variant: 'success' },
  1: { label: 'Expense', variant: 'destructive' },
  2: { label: 'Transfer', variant: 'outline' },
};

export default function AdminTransactionsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-transactions', page, search, typeFilter],
    queryFn: () => adminApi.getTransactions({
      page, pageSize: 20, search: search || undefined,
      type: typeFilter ? parseInt(typeFilter) : undefined,
    }),
  });

  const transactions = data?.data?.items || [];
  const totalPages = data?.data?.totalPages || 1;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="space-y-3">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <p className="text-muted-foreground">{data?.data?.totalCount || 0} total</p>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <SearchBar value={search} onChange={setSearch} placeholder="Search transactions..." className="w-64" />
        <FilterBar
          activeFilter={typeFilter}
          onFilterChange={setTypeFilter}
          options={[
            { value: '', label: 'All Types' },
            { value: '0', label: 'Income' },
            { value: '1', label: 'Expense' },
            { value: '2', label: 'Transfer' },
          ]}
          filters={[]}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Payee</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Note</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Amount</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">Type</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => {
                  const typeInfo = TYPE_LABELS[t.type] || { label: 'Unknown', variant: 'outline' as const };
                  return (
                    <tr key={t.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="p-3">{new Date(t.date).toLocaleDateString()}</td>
                      <td className="p-3 font-medium">{t.payee || '-'}</td>
                      <td className="p-3 text-muted-foreground truncate max-w-[200px]">{t.note || '-'}</td>
                      <td className={`p-3 text-right font-medium ${t.type === 0 ? 'text-green-500' : t.type === 1 ? 'text-red-500' : ''}`}>
                        {t.type === 0 ? '+' : t.type === 1 ? '-' : ''}{t.amount.toFixed(2)} {t.currency}
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </motion.div>
  );
}
