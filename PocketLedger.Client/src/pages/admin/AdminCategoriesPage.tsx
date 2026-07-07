import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { adminApi } from '../../api/admin.api';
import { Card, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import SearchBar from '../../components/admin/SearchBar';
import Pagination from '../../components/admin/Pagination';
import { FolderIcon } from '@heroicons/react/24/outline';

const TYPE_MAP: Record<number, string> = { 0: 'Income', 1: 'Expense', 2: 'Both' };

export default function AdminCategoriesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-categories', page, search],
    queryFn: () => adminApi.getCategories({ page, pageSize: 20, search: search || undefined }),
  });

  const categories = data?.data?.items || [];
  const totalPages = data?.data?.totalPages || 1;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Categories</h1>
        <p className="text-muted-foreground">{data?.data?.totalCount || 0} total</p>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search categories..." className="w-64" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <Card key={c.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: c.color + '20' }}>
                  <FolderIcon className="h-5 w-5" style={{ color: c.color }} />
                </div>
                <div className="min-w-0">
                  <p className="font-medium truncate">{c.name}</p>
                  <p className="text-sm text-muted-foreground truncate">{c.description || 'No description'}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{TYPE_MAP[c.type] || 'Unknown'}</Badge>
                    <span className="text-xs text-muted-foreground">Created {new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
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
