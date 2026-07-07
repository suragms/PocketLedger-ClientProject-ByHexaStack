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

export default function AdminAuditLogsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-audit-logs', page, search, actionFilter],
    queryFn: () => adminApi.getAuditLogs({
      page, pageSize: 20, search: search || undefined,
      action: actionFilter || undefined,
    }),
  });

  const logs = data?.data?.items || [];
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
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <p className="text-muted-foreground">{data?.data?.totalCount || 0} entries</p>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <SearchBar value={search} onChange={setSearch} placeholder="Search logs..." className="w-64" />
        <FilterBar
          activeFilter={actionFilter}
          onFilterChange={setActionFilter}
          options={[
            { value: '', label: 'All Actions' },
            { value: 'Create', label: 'Create' },
            { value: 'Update', label: 'Update' },
            { value: 'Delete', label: 'Delete' },
            { value: 'Login', label: 'Login' },
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
                  <th className="text-left p-3 font-medium text-muted-foreground">Time</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">User</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Action</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Entity</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">IP</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="p-3 text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="p-3">{log.userEmail}</td>
                    <td className="p-3"><Badge variant="outline">{log.action}</Badge></td>
                    <td className="p-3">{log.entity} {log.entityId && <span className="text-muted-foreground">#{log.entityId}</span>}</td>
                    <td className="p-3 text-muted-foreground font-mono text-xs">{log.ipAddress || '-'}</td>
                    <td className="p-3 text-center">
                      <Badge variant={log.isSuccess ? 'success' : 'destructive'}>
                        {log.isSuccess ? 'Success' : 'Failed'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </motion.div>
  );
}
