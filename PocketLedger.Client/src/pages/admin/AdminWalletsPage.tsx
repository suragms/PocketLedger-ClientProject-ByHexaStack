import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { adminApi } from '../../api/admin.api';
import { Card, CardContent } from '../../components/ui/Card';
import Skeleton from '../../components/ui/Skeleton';
import SearchBar from '../../components/admin/SearchBar';
import Pagination from '../../components/admin/Pagination';
import { BanknotesIcon } from '@heroicons/react/24/outline';

export default function AdminWalletsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-wallets', page, search],
    queryFn: () => adminApi.getWallets({ page, pageSize: 20, search: search || undefined }),
  });

  const wallets = data?.data?.items || [];
  const totalPages = data?.data?.totalPages || 1;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Wallets</h1>
        <p className="text-muted-foreground">{data?.data?.totalCount || 0} total</p>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search wallets..." className="w-64" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {wallets.map((w) => (
          <Card key={w.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: (w.color || '#6366f1') + '20' }}>
                  <BanknotesIcon className="h-5 w-5" style={{ color: w.color || '#6366f1' }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{w.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{w.description || 'No description'}</p>
                  <p className="text-lg font-bold mt-1">{w.balance.toFixed(2)} {w.currency}</p>
                  <p className="text-xs text-muted-foreground mt-1">Created {new Date(w.createdAt).toLocaleDateString()}</p>
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
