import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { notificationsApi } from '../../api/notifications.api';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Skeleton from '../../components/ui/Skeleton';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import EmptyState from '../../components/shared/EmptyState';
import { formatDateTime } from '../../lib/utils';
import {
  BellIcon,
  CheckIcon,
  CheckCircleIcon,
  TrashIcon,
  ArchiveBoxIcon,
  Cog6ToothIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import type { Notification } from '../../types';

const NOTIFICATION_ICONS: Record<number, string> = {
  0: '📅', 1: '📊', 2: '📈', 3: '⚠️', 4: '🚨', 5: '🔔',
};

const NOTIFICATION_TYPES = [
  { value: -1, label: 'All' },
  { value: 0, label: 'Daily Reminder' },
  { value: 1, label: 'Weekly Summary' },
  { value: 2, label: 'Monthly Summary' },
  { value: 3, label: 'Budget Alert' },
  { value: 4, label: 'Budget Exceeded' },
  { value: 5, label: 'System' },
];

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState(-1);
  const [deleteTarget, setDeleteTarget] = useState<Notification | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['notifications', page],
    queryFn: () => notificationsApi.getAll(page, 20),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
      toast.success('All marked as read');
    },
  });

  const archiveMutation = useMutation({
    mutationFn: (id: number) => notificationsApi.archive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
      toast.success('Notification archived');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => notificationsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
      setDeleteTarget(null);
      toast.success('Notification deleted');
    },
  });

  const notifications = data?.data?.items || [];
  const unreadCount = data?.data?.unreadCount || 0;
  const totalPages = data?.data?.totalPages || 1;

  const filtered = typeFilter === -1
    ? notifications
    : notifications.filter((n) => n.type === typeFilter);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={() => markAllMutation.mutate()}>
              <CheckCircleIcon className="h-4 w-4 mr-1.5" />Mark all read
            </Button>
          )}
          <Link to="/notifications/preferences">
            <Button variant="outline" size="sm">
              <Cog6ToothIcon className="h-4 w-4 mr-1.5" />Preferences
            </Button>
          </Link>
        </div>
      </div>

      {/* Type Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <FunnelIcon className="h-4 w-4 text-muted-foreground" />
        {NOTIFICATION_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setTypeFilter(t.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              typeFilter === t.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80 text-muted-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Notification List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<BellIcon className="h-12 w-12" />}
          title="No notifications"
          description="You're all caught up! Notifications will appear here."
        />
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((n) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`group flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                  n.status === 0
                    ? 'bg-primary/5 border-primary/20 hover:border-primary/40'
                    : 'bg-card hover:bg-muted/30'
                }`}
              >
                <span className="text-2xl shrink-0">{NOTIFICATION_ICONS[n.type] || '🔔'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm ${n.status === 0 ? 'font-bold' : 'font-medium'}`}>{n.title}</h3>
                    {n.status === 0 && (
                      <Badge variant="default" className="text-[10px] px-1.5 py-0">New</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">{formatDateTime(n.createdAt)}</p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  {n.status === 0 && (
                    <button
                      onClick={() => markReadMutation.mutate(n.id)}
                      className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title="Mark as read"
                    >
                      <CheckIcon className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => archiveMutation.mutate(n.id)}
                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title="Archive"
                  >
                    <ArchiveBoxIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(n)}
                    className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    title="Delete"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        title="Delete Notification"
        description={`Delete "${deleteTarget?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </motion.div>
  );
}
