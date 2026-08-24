/**
 * Notification Center Component
 * مركز الإشعارات - يعرض جميع الإشعارات للمستخدم
 */

import { useState } from 'react';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  X,
  AlertCircle,
  Info,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  useDeleteReadNotifications,
  type NotificationItem as UnifiedNotificationItem,
} from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useLocation } from 'wouter';

/**
 * الحصول على أيقونة حسب نوع الإشعار
 */
function getNotificationIcon(type: string) {
  switch (type) {
    case 'approval_requested':
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    case 'approval_approved':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'approval_rejected':
      return <X className="h-4 w-4 text-red-500" />;
    case 'content_updated':
      return <Info className="h-4 w-4 text-blue-500" />;
    case 'content_deleted':
      return <Trash2 className="h-4 w-4 text-red-500" />;
    case 'content_published':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'system':
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    default:
      return <Bell className="h-4 w-4 text-gray-500" />;
  }
}

/**
 * الحصول على لون الأولوية
 */
function getPriorityColor(priority: string) {
  switch (priority) {
    case 'high':
      return 'bg-red-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'low':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
}

/**
 * Notification Item Component
 */
function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
}: {
  notification: UnifiedNotificationItem;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div
      className={cn(
        'group relative border-b border-border/60 px-4 py-3 transition-colors last:border-b-0',
        notification.isRead === 'no'
          ? 'border-r-2 border-r-primary bg-primary/[0.045] hover:bg-primary/[0.08]'
          : 'bg-background hover:bg-muted/60'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted/70">
          {getNotificationIcon(notification.type)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p
              className={cn(
                'line-clamp-1 text-sm font-medium',
                notification.isRead === 'no' ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              {notification.title}
            </p>
            {notification.isRead === 'no' && (
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                aria-label="غير مقروء"
              />
            )}
            {notification.priority === 'high' && (
              <div
                className={cn(
                  'h-1.5 w-1.5 shrink-0 rounded-full',
                  getPriorityColor(notification.priority)
                )}
                title="أولوية عالية"
              />
            )}
          </div>

          <p className="mb-2 line-clamp-2 text-sm leading-5 text-muted-foreground">
            {notification.message}
          </p>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>
              {formatDistanceToNow(new Date(notification.createdAt), {
                addSuffix: true,
                locale: ar,
              })}
            </span>
            {notification.actionUrl && notification.actionLabel && (
              <a
                href={notification.actionUrl}
                className="text-primary hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead(notification.id);
                }}
              >
                {notification.actionLabel}
              </a>
            )}
          </div>
        </div>

        <div className="ms-1 flex shrink-0 items-center gap-0.5 self-start">
          {notification.isRead === 'no' && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary hover:bg-primary/10 hover:text-primary"
              onClick={() => onMarkAsRead(notification.id)}
              aria-label="تحديد الإشعار كمقروء"
              title="تحديد كمقروء"
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
            onClick={() => onDelete(notification.id)}
            aria-label="حذف الإشعار"
            title="حذف الإشعار"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Notification Center Component
 */
export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { data: notificationsData } = useNotifications({ limit: 20 });
  const { data: unreadCount } = useUnreadCount();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();
  const deleteReadNotifications = useDeleteReadNotifications();

  const notifications = notificationsData?.data || [];

  const handleMarkAsRead = (id: number) => {
    markAsRead.mutate({ id });
  };

  const handleDelete = (id: number) => {
    deleteNotification.mutate({ id });
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  const handleDeleteRead = () => {
    deleteReadNotifications.mutate();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'relative rounded-full',
            unreadCount && unreadCount > 0
              ? 'bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary'
              : 'hover:bg-muted'
          )}
          aria-label={
            unreadCount && unreadCount > 0 ? `لديك ${unreadCount} إشعارات غير مقروءة` : 'الإشعارات'
          }
        >
          <Bell
            className={`h-5 w-5 ${unreadCount && unreadCount > 0 ? 'animate-[pulse_1.8s_ease-in-out_infinite]' : ''}`}
          />
          {unreadCount && unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center border-2 border-background px-1 text-[10px] font-bold shadow-sm"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="w-[calc(100vw-2rem)] max-w-[26rem] overflow-hidden rounded-xl border border-border/80 p-0 shadow-2xl"
      >
        <DropdownMenuLabel dir="rtl" className="p-0">
          <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-4">
            <div className="flex min-w-0 items-center gap-2">
              <span className="font-semibold text-foreground">الإشعارات</span>
              {unreadCount && unreadCount > 0 ? (
                <Badge
                  variant="secondary"
                  className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                >
                  {unreadCount > 99 ? '99+' : unreadCount} جديدة
                </Badge>
              ) : null}
            </div>
            {unreadCount && unreadCount > 0 ? (
              <Button
                variant="outline"
                size="sm"
                className="h-8 shrink-0 gap-1.5 border-primary/30 bg-primary/[0.03] text-xs text-primary hover:bg-primary/10 hover:text-primary"
                onClick={handleMarkAllAsRead}
                disabled={markAllAsRead.isPending}
                aria-label="تحديد جميع الإشعارات كمقروءة"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                {markAllAsRead.isPending ? 'جارٍ التحديث...' : 'قراءة الكل'}
              </Button>
            ) : null}
          </div>
          <div className="flex items-center justify-between gap-3 px-4 pb-3">
            <span className="text-xs font-normal text-muted-foreground" aria-live="polite">
              {unreadCount && unreadCount > 0
                ? `${unreadCount} إشعار يحتاج إلى مراجعتك`
                : 'تمت قراءة جميع الإشعارات'}
            </span>
            {notifications.some((notification) => notification.isRead === 'yes') ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1 px-1.5 text-xs font-normal text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                onClick={handleDeleteRead}
                disabled={deleteReadNotifications.isPending}
                aria-label="حذف الإشعارات المقروءة"
              >
                <Trash2 className="h-3.5 w-3.5" />
                حذف المقروءة
              </Button>
            ) : null}
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <ScrollArea className="h-[min(60vh,26rem)]">
          {notifications.length === 0 ? (
            <div className="px-8 py-10 text-center text-muted-foreground">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Bell className="h-6 w-6 opacity-70" />
              </div>
              <p className="text-sm font-medium text-foreground">لا توجد إشعارات حالياً</p>
              <p className="mt-1 text-xs leading-5">
                ستظهر هنا آخر التحديثات والتنبيهات الخاصة بك.
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
              />
            ))
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="bg-muted/20 p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full font-medium text-primary hover:bg-primary/10 hover:text-primary"
                onClick={() => {
                  setIsOpen(false);
                  setLocation('/admin/notifications');
                }}
              >
                عرض جميع الإشعارات
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
