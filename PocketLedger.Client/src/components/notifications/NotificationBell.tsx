import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { notificationsApi } from '../../api/notifications.api';
import { formatDateTime } from '../../lib/utils';
import { BellIcon } from '@heroicons/react/24/outline';
import { useState, useRef, useEffect, useCallback } from 'react';

const NOTIFICATION_ICONS: Record<number, string> = {
  0: '\u{1F4C5}', 1: '\u{1F4CA}', 2: '\u{1F4C8}', 3: '\u26A0\uFE0F', 4: '\u{1F6A8}', 5: '\u{1F514}',
};

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: unreadData } = useQuery({
    queryKey: ['notifications-unread'],
    queryFn: () => notificationsApi.getUnreadCount(),
    refetchInterval: 60000,
    refetchIntervalInBackground: false,
  });

  const { data } = useQuery({
    queryKey: ['notifications-recent'],
    queryFn: () => notificationsApi.getAll(1, 5),
    enabled: isOpen,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-recent'] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-recent'] });
    },
  });

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [handleClickOutside]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const unreadCount = unreadData?.data || 0;
  const notifications = data?.data?.items || [];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-muted transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <BellIcon className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center"
            aria-hidden="true"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-80 bg-card rounded-xl shadow-xl border z-50 overflow-hidden"
            role="menu"
            aria-label="Notifications"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-semibold text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllMutation.mutate()}
                  className="text-xs text-primary hover:underline"
                  aria-label="Mark all notifications as read"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto" role="list">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  No notifications yet
                </div>
              ) : (
                notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      markReadMutation.mutate(n.id);
                      if (n.actionUrl) setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors border-b last:border-0 ${
                      n.status === 0 ? 'bg-primary/5' : ''
                    }`}
                    role="listitem"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg shrink-0" aria-hidden="true">{NOTIFICATION_ICONS[n.type] || '\u{1F514}'}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{n.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{n.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{formatDateTime(n.createdAt)}</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="block text-center py-2.5 text-sm text-primary hover:bg-muted/50 border-t font-medium"
            >
              View all notifications
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
