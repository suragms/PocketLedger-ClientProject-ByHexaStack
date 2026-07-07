import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { adminApi } from '../../api/admin.api';
import { Card, CardContent } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import FilterBar from '../../components/admin/FilterBar';
import Pagination from '../../components/admin/Pagination';
import { BellIcon } from '@heroicons/react/24/outline';

const TYPE_MAP: Record<number, string> = {
  0: 'Daily Reminder', 1: 'Weekly Summary', 2: 'Monthly Summary',
  3: 'Budget Alert', 4: 'Budget Exceeded', 5: 'System',
};

const STATUS_MAP: Record<number, { label: string; variant: 'default' | 'success' | 'outline' }> = {
  0: { label: 'Unread', variant: 'default' },
  1: { label: 'Read', variant: 'success' },
  2: { label: 'Archived', variant: 'outline' },
};

export default function AdminNotificationsPage() {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-notifications', page, typeFilter],
    queryFn: () => adminApi.getNotifications({
      page, pageSize: 20, type: typeFilter ? parseInt(typeFilter) : undefined,
    }),
  });

  const notifications = data?.data?.items || [];
  const totalPages = data?.data?.totalPages || 1;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="space-y-3">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}</div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-muted-foreground">{data?.data?.totalCount || 0} total</p>
      </div>

      <FilterBar
        activeFilter={typeFilter}
        onFilterChange={(v) => { setTypeFilter(v); setPage(1); }}
        options={[
          { value: '', label: 'All Types' },
          { value: '0', label: 'Daily' },
          { value: '1', label: 'Weekly' },
          { value: '3', label: 'Budget Alert' },
          { value: '5', label: 'System' },
        ]}
        filters={[]}
      />

      <div className="space-y-3">
        {notifications.map((n) => {
          const statusInfo = STATUS_MAP[n.status] || { label: 'Unknown', variant: 'outline' as const };
          return (
            <Card key={n.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <BellIcon className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{n.title}</p>
                      <Badge variant="outline">{TYPE_MAP[n.type] || 'Unknown'}</Badge>
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </motion.div>
  );
}
