/**
 * Notifications Hooks
 * Hooks لإدارة الإشعارات في الواجهة الأمامية
 */

import { trpc } from '@/lib/api/trpc';
import { toast } from 'sonner';

interface NotificationItem {
  id: number;
  userId: number;
  type:
    | 'approval_requested'
    | 'approval_approved'
    | 'approval_rejected'
    | 'content_updated'
    | 'content_deleted'
    | 'content_published'
    | 'system';
  title: string;
  message: string;
  data: string | null;
  isRead: 'yes' | 'no';
  readAt: Date | null;
  actionUrl: string | null;
  actionLabel: string | null;
  priority: 'low' | 'medium' | 'high';
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Hook للحصول على جميع الإشعارات
 */
export function useNotifications(options?: {
  type?:
    | 'approval_requested'
    | 'approval_approved'
    | 'approval_rejected'
    | 'content_updated'
    | 'content_deleted'
    | 'content_published'
    | 'system';
  isRead?: 'yes' | 'no';
  priority?: 'low' | 'medium' | 'high';
  limit?: number;
  offset?: number;
}) {
  return trpc.notifications.list.useQuery(
    {
      type: options?.type,
      isRead: options?.isRead,
      priority: options?.priority,
      limit: options?.limit,
      offset: options?.offset,
    },
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      refetchOnWindowFocus: false,
    }
  ) as {
    data:
      | {
          data: NotificationItem[];
          pagination: { limit: number; offset: number; total: number; hasMore: boolean };
        }
      | undefined;
  };
}

/**
 * Hook للحصول على إشعار محدد
 */
export function useNotification(id: number) {
  return trpc.notifications.getById.useQuery(
    { id },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    }
  ) as { data: NotificationItem | undefined };
}

/**
 * Hook للحصول على الإشعارات غير المقروءة
 */
export function useUnreadNotifications() {
  return trpc.notifications.getUnread.useQuery(undefined, {
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
  }) as { data: NotificationItem[] | undefined };
}

/**
 * Hook للحصول على عدد الإشعارات غير المقروءة
 */
export function useUnreadCount() {
  return trpc.notifications.getUnreadCount.useQuery(undefined, {
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  }) as { data: number };
}

/**
 * Hook لإنشاء إشعار جديد
 */
export function useCreateNotification() {
  const utils = trpc.useUtils();

  return trpc.notifications.create.useMutation({
    onSuccess: () => {
      utils.notifications.invalidate();
      utils.notifications.getUnreadCount.invalidate();
      utils.notifications.getUnread.invalidate();
      toast.success('تم إنشاء الإشعار بنجاح');
    },
    onError: (error) => {
      console.error('Error creating notification:', error);
      toast.error('حدث خطأ أثناء إنشاء الإشعار');
    },
  });
}

/**
 * Hook لتحديث إشعار
 */
export function useUpdateNotification() {
  const utils = trpc.useUtils();

  return trpc.notifications.update.useMutation({
    onSuccess: () => {
      utils.notifications.invalidate();
      utils.notifications.getUnreadCount.invalidate();
      utils.notifications.getUnread.invalidate();
      toast.success('تم تحديث الإشعار بنجاح');
    },
    onError: (error) => {
      console.error('Error updating notification:', error);
      toast.error('حدث خطأ أثناء تحديث الإشعار');
    },
  });
}

/**
 * Hook لتحديد إشعار كمقروء
 */
export function useMarkAsRead() {
  const utils = trpc.useUtils();

  return trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.invalidate();
      utils.notifications.getUnreadCount.invalidate();
      utils.notifications.getUnread.invalidate();
    },
    onError: (error) => {
      console.error('Error marking notification as read:', error);
      toast.error('حدث خطأ أثناء تحديد الإشعار كمقروء');
    },
  });
}

/**
 * Hook لتحديد جميع الإشعارات كمقروءة
 */
export function useMarkAllAsRead() {
  const utils = trpc.useUtils();

  return trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.invalidate();
      utils.notifications.getUnreadCount.invalidate();
      utils.notifications.getUnread.invalidate();
      toast.success('تم تحديد جميع الإشعارات كمقروءة');
    },
    onError: (error) => {
      console.error('Error marking all notifications as read:', error);
      toast.error('حدث خطأ أثناء تحديد جميع الإشعارات كمقروءة');
    },
  });
}

/**
 * Hook لحذف إشعار
 */
export function useDeleteNotification() {
  const utils = trpc.useUtils();

  return trpc.notifications.delete.useMutation({
    onSuccess: () => {
      utils.notifications.invalidate();
      utils.notifications.getUnreadCount.invalidate();
      utils.notifications.getUnread.invalidate();
      toast.success('تم حذف الإشعار بنجاح');
    },
    onError: (error) => {
      console.error('Error deleting notification:', error);
      toast.error('حدث خطأ أثناء حذف الإشعار');
    },
  });
}

/**
 * Hook لحذف جميع الإشعارات المقروءة
 */
export function useDeleteReadNotifications() {
  const utils = trpc.useUtils();

  return trpc.notifications.deleteRead.useMutation({
    onSuccess: () => {
      utils.notifications.invalidate();
      utils.notifications.getUnreadCount.invalidate();
      utils.notifications.getUnread.invalidate();
      toast.success('تم حذف جميع الإشعارات المقروءة');
    },
    onError: (error) => {
      console.error('Error deleting read notifications:', error);
      toast.error('حدث خطأ أثناء حذف الإشعارات المقروءة');
    },
  });
}

/**
 * Hook لإنشاء إشعار لمستخدم محدد (للاستخدام الداخلي)
 */
export function useCreateNotificationForUser() {
  const utils = trpc.useUtils();

  return trpc.notifications.createForUser.useMutation({
    onSuccess: () => {
      utils.notifications.invalidate();
      utils.notifications.getUnreadCount.invalidate();
      utils.notifications.getUnread.invalidate();
    },
    onError: (error) => {
      console.error('Error creating notification for user:', error);
      toast.error('حدث خطأ أثناء إنشاء الإشعار');
    },
  });
}
