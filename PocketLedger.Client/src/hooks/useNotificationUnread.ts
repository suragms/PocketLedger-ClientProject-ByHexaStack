import { useQuery } from '@tanstack/react-query';
import { notificationsApi } from '../api/notifications.api';

export function useNotificationUnread() {
  const { data, isLoading } = useQuery({
    queryKey: ['notifications-unread'],
    queryFn: () => notificationsApi.getUnreadCount(),
    refetchInterval: 60000,
    refetchIntervalInBackground: false,
  });

  return { unreadCount: data?.data ?? 0, isLoading };
}
