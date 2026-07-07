import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { adminApi } from '../../api/admin.api';
import { Card, CardContent } from '../../components/ui/Card';
import Skeleton from '../../components/ui/Skeleton';
import FilterBar from '../../components/admin/FilterBar';
import Pagination from '../../components/admin/Pagination';

const LEVEL_COLORS: Record<string, string> = {
  Information: 'text-blue-500',
  Warning: 'text-yellow-500',
  Error: 'text-red-500',
  Debug: 'text-gray-500',
};

export default function AdminSystemLogsPage() {
  const [page, setPage] = useState(1);
  const [levelFilter, setLevelFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-system-logs', page, levelFilter],
    queryFn: () => adminApi.getSystemLogs({ page, pageSize: 50, level: levelFilter || undefined }),
  });

  const logs = data?.data?.items || [];
  const totalPages = Math.ceil((data?.data?.totalCount || 0) / 50);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="space-y-2">{[...Array(10)].map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}</div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-3xl font-bold">System Logs</h1>
        <p className="text-muted-foreground">{data?.data?.totalCount || 0} entries</p>
      </div>

      <FilterBar
        activeFilter={levelFilter}
        onFilterChange={(v) => { setLevelFilter(v); setPage(1); }}
        options={[
          { value: '', label: 'All Levels' },
          { value: 'Information', label: 'Info' },
          { value: 'Warning', label: 'Warning' },
          { value: 'Error', label: 'Error' },
          { value: 'Debug', label: 'Debug' },
        ]}
        filters={[]}
      />

      <Card>
        <CardContent className="p-0">
          <div className="font-mono text-xs">
            {logs.map((log, i) => (
              <div key={i} className="flex items-start gap-3 p-3 border-b last:border-0 hover:bg-muted/30">
                <span className="text-muted-foreground shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                <span className={`font-bold shrink-0 w-16 ${LEVEL_COLORS[log.level] || ''}`}>{log.level}</span>
                <span className="flex-1 break-all">{log.message}</span>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">No logs found</div>
            )}
          </div>
        </CardContent>
      </Card>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </motion.div>
  );
}
