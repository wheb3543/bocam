/** Hooks for the unified per-user notification inbox. */

import { trpc } from '@/lib/api/trpc';
import { toast } from 'sonner';
import type {
  NotificationPriority,
  NotificationSource,
  NotificationType,
} from '@shared/notifications';

export interface NotificationItem {
  id: number;
  userId: number;
  type: NotificationType;
  source: NotificationSource;
  title: string;
  message: string;
  data: string | null;
  entityType: string | null;
  entityId: string | null;
  isRead: 'yes' | 'no';
  readAt: Date | null;
  actionUrl: string | null;
  actionLabel: string | null;
  priority: NotificationPriority;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

function invalidateInbox(utils: ReturnType<typeof trpc.useUtils>) {
  utils.notifications.invalidate();
  utils.notifications.getUnreadCount.invalidate();
  utils.notifications.getUnread.invalidate();
  utils.notifications.overview.invalidate();
}

export function useNotifications(options?: {
  type?: NotificationType;
  source?: NotificationSource;
  isRead?: 'yes' | 'no';
  priority?: NotificationPriority;
  limit?: number;
  offset?: number;
}) {
  return trpc.notifications.list.useQuery(
    {
      type: options?.type,
      source: options?.source,
      isRead: options?.isRead,
      priority: options?.priority,
      limit: options?.limit,
      offset: options?.offset,
    },
    {
      staleTime: 30_000,
      refetchInterval: 30_000,
      refetchOnWindowFocus: true,
    }
  ) as {
    data:
      | {
          data: NotificationItem[];
          pagination: { limit: number; offset: number; total: number; hasMore: boolean };
        }
      | undefined;
    isLoading: boolean;
    isError: boolean;
  };
}

export function useUnreadNotifications() {
  return trpc.notifications.getUnread.useQuery(undefined, {
    staleTime: 30_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  }) as { data: NotificationItem[] | undefined };
}

export function useUnreadCount() {
  return trpc.notifications.getUnreadCount.useQuery(undefined, {
    staleTime: 30_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  }) as { data: number | undefined };
}

export function useNotificationsOverview() {
  return trpc.notifications.overview.useQuery(undefined, {
    staleTime: 30_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useCreateNotification() {
  const utils = trpc.useUtils();
  return trpc.notifications.create.useMutation({
    onSuccess: () => {
      invalidateInbox(utils);
      toast.success('تم إنشاء الإشعار بنجاح');
    },
    onError: (error) => {
      console.error('Error creating notification:', error);
      toast.error('حدث خطأ أثناء إنشاء الإشعار');
    },
  });
}

export function useMarkAsRead() {
  const utils = trpc.useUtils();
  return trpc.notifications.markAsRead.useMutation({
    onSuccess: () => invalidateInbox(utils),
    onError: (error) => {
      console.error('Error marking notification as read:', error);
      toast.error('حدث خطأ أثناء تحديد الإشعار كمقروء');
    },
  });
}

export function useMarkAsUnread() {
  const utils = trpc.useUtils();
  return trpc.notifications.markAsUnread.useMutation({
    onSuccess: () => invalidateInbox(utils),
    onError: (error) => {
      console.error('Error marking notification as unread:', error);
      toast.error('حدث خطأ أثناء تحديد الإشعار كغير مقروء');
    },
  });
}

export function useMarkAllAsRead() {
  const utils = trpc.useUtils();
  return trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      invalidateInbox(utils);
      toast.success('تم تحديد جميع الإشعارات كمقروءة');
    },
    onError: (error) => {
      console.error('Error marking all notifications as read:', error);
      toast.error('حدث خطأ أثناء تحديد جميع الإشعارات كمقروءة');
    },
  });
}

export function useDeleteNotification() {
  const utils = trpc.useUtils();
  return trpc.notifications.delete.useMutation({
    onSuccess: () => {
      invalidateInbox(utils);
      toast.success('تم حذف الإشعار بنجاح');
    },
    onError: (error) => {
      console.error('Error deleting notification:', error);
      toast.error('حدث خطأ أثناء حذف الإشعار');
    },
  });
}

export function useDeleteReadNotifications() {
  const utils = trpc.useUtils();
  return trpc.notifications.deleteRead.useMutation({
    onSuccess: () => {
      invalidateInbox(utils);
      toast.success('تم حذف جميع الإشعارات المقروءة');
    },
    onError: (error) => {
      console.error('Error deleting read notifications:', error);
      toast.error('حدث خطأ أثناء حذف الإشعارات');
    },
  });
}

export function useCreateNotificationForUser() {
  const utils = trpc.useUtils();
  return trpc.notifications.createForUser.useMutation({
    onSuccess: () => invalidateInbox(utils),
    onError: (error) => {
      console.error('Error creating notification for user:', error);
      toast.error('حدث خطأ أثناء إنشاء الإشعار');
    },
  });
}
