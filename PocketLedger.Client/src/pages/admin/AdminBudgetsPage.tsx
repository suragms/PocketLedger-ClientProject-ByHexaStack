import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { adminApi } from '../../api/admin.api';
import { Card, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import SearchBar from '../../components/admin/SearchBar';
import Pagination from '../../components/admin/Pagination';

const PERIOD_MAP: Record<number, string> = { 0: 'Weekly', 1: 'Monthly', 2: 'Quarterly', 3: 'Yearly' };

export default function AdminBudgetsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-budgets', page, search],
    queryFn: () => adminApi.getBudgets({ page, pageSize: 20, search: search || undefined }),
  });

  const budgets = data?.data?.items || [];
  const totalPages = data?.data?.totalPages || 1;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}</div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Budgets</h1>
        <p className="text-muted-foreground">{data?.data?.totalCount || 0} total</p>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search budgets..." className="w-64" />

      <div className="space-y-3">
        {budgets.map((b) => (
          <Card key={b.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="font-medium">{b.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {PERIOD_MAP[b.period] || 'Unknown'} · Started {new Date(b.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-bold">{b.amount.toFixed(2)} {b.currency}</p>
                    {b.alertThreshold && (
                      <p className="text-xs text-muted-foreground">Alert at {b.alertThreshold}%</p>
                    )}
                  </div>
                  <Badge variant="outline">{PERIOD_MAP[b.period]}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </motion.div>
  );
}
