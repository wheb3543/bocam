/**
 * Notification Center Component
 * مركز الإشعارات - يعرض جميع الإشعارات للمستخدم
 */

import { useState } from 'react';
import {
  Bell,
  Check,
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
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        'relative p-4 border-b last:border-b-0 transition-colors',
        notification.isRead === 'no' ? 'bg-muted/50' : 'bg-background',
        'hover:bg-muted/80'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p
              className={cn(
                'text-sm font-medium',
                notification.isRead === 'no' ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              {notification.title}
            </p>
            {notification.priority === 'high' && (
              <div
                className={cn('w-2 h-2 rounded-full', getPriorityColor(notification.priority))}
              />
            )}
          </div>

          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{notification.message}</p>

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

        {isHovered && (
          <div className="flex items-center gap-1">
            {notification.isRead === 'no' && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onMarkAsRead(notification.id)}
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(notification.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
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
          className={`relative ${unreadCount && unreadCount > 0 ? 'text-green-700 hover:bg-green-50 hover:text-green-800' : ''}`}
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

      <DropdownMenuContent align="end" className="w-96 p-0">
        <DropdownMenuLabel className="p-4 border-b">
          <div className="flex items-center justify-between">
            <span className="font-semibold">الإشعارات</span>
            <div className="flex items-center gap-2">
              {unreadCount && unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={markAllAsRead.isPending}
                >
                  <Check className="h-4 w-4 mr-1" />
                  تحديد الكل كمقروء
                </Button>
              )}
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeleteRead}
                  disabled={deleteReadNotifications.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  حذف المقروءة
                </Button>
              )}
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد إشعارات</p>
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
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
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
