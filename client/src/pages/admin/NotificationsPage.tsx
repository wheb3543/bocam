import { useMemo, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import {
  AlertCircle,
  Bell,
  BellRing,
  Check,
  CheckCircle2,
  ChevronLeft,
  CircleAlert,
  Info,
  Loader2,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import { useLocation } from 'wouter';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  type NotificationItem,
  useDeleteNotification,
  useDeleteReadNotifications,
  useMarkAllAsRead,
  useMarkAsRead,
  useMarkAsUnread,
  useNotifications,
  useNotificationsOverview,
} from '@/hooks/useNotifications';
import type { NotificationPriority, NotificationSource } from '@shared/notifications';

type ReadFilter = 'all' | 'yes' | 'no';
type PriorityFilter = 'all' | NotificationPriority;
type SourceFilter = 'all' | NotificationSource;

const sourceLabels: Record<NotificationSource, string> = {
  content: 'المحتوى',
  bookings: 'الحجوزات',
  campaigns: 'الحملات',
  integrations: 'التكاملات',
  privacy: 'الخصوصية',
  security: 'الأمان',
  system: 'النظام',
  manual: 'إداري',
};

const priorityLabels: Record<NotificationPriority, string> = {
  low: 'منخفضة',
  medium: 'متوسطة',
  high: 'عالية',
};

function sourceIcon(source: NotificationSource) {
  if (source === 'security') {
    return ShieldAlert;
  }
  if (source === 'integrations') {
    return CircleAlert;
  }
  if (source === 'content') {
    return CheckCircle2;
  }
  return Info;
}

function priorityBadgeClass(priority: NotificationPriority) {
  if (priority === 'high') {
    return 'border-red-200 bg-red-50 text-red-700';
  }
  if (priority === 'medium') {
    return 'border-amber-200 bg-amber-50 text-amber-700';
  }
  return 'border-green-200 bg-green-50 text-green-700';
}

export default function NotificationsPage() {
  const [, setLocation] = useLocation();
  const [readFilter, setReadFilter] = useState<ReadFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [page, setPage] = useState(0);
  const limit = 20;
  const queryInput = useMemo(
    () => ({
      isRead: readFilter === 'all' ? undefined : readFilter,
      priority: priorityFilter === 'all' ? undefined : priorityFilter,
      source: sourceFilter === 'all' ? undefined : sourceFilter,
      limit,
      offset: page * limit,
    }),
    [page, priorityFilter, readFilter, sourceFilter]
  );
  const { data, isLoading, isError } = useNotifications(queryInput);
  const { data: overview } = useNotificationsOverview();
  const markAsRead = useMarkAsRead();
  const markAsUnread = useMarkAsUnread();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();
  const deleteReadNotifications = useDeleteReadNotifications();
  const notifications = data?.data || [];
  const pagination = data?.pagination;

  const changeFilters = (callback: () => void) => {
    callback();
    setPage(0);
  };

  const openNotification = (notification: NotificationItem) => {
    if (notification.isRead === 'no') {
      markAsRead.mutate({ id: notification.id });
    }
    if (notification.actionUrl) {
      setLocation(notification.actionUrl);
    }
  };

  return (
    <div className="min-h-full space-y-5 px-3 py-4 sm:px-5 lg:px-7" dir="rtl">
      <section className="flex flex-col gap-3 rounded-2xl border border-green-100 bg-gradient-to-l from-green-50 via-white to-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-green-700 p-2.5 text-white shadow-sm">
            <BellRing className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">مركز الإشعارات</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              متابعة موحدة لتنبيهات المحتوى والحجوزات والتكاملات والعمليات الإدارية.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => markAllAsRead.mutate()}
            disabled={!overview?.unread || markAllAsRead.isPending}
          >
            <Check className="ml-1.5 h-4 w-4" />
            تحديد الكل كمقروء
          </Button>
          <Button
            variant="outline"
            className="border-red-200 text-red-700 hover:bg-red-50"
            onClick={() => deleteReadNotifications.mutate()}
            disabled={deleteReadNotifications.isPending}
          >
            <Trash2 className="ml-1.5 h-4 w-4" />
            حذف المقروءة
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <MetricCard
          label="إجمالي الإشعارات"
          value={overview?.total ?? 0}
          icon={Bell}
          color="text-slate-700"
        />
        <MetricCard
          label="غير المقروءة"
          value={overview?.unread ?? 0}
          icon={BellRing}
          color="text-green-700"
        />
        <MetricCard
          label="عالية الأولوية"
          value={overview?.highPriority ?? 0}
          icon={AlertCircle}
          color="text-red-700"
        />
      </section>

      <Card className="border-border shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Select
              value={readFilter}
              onValueChange={(value: ReadFilter) => changeFilters(() => setReadFilter(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="حالة القراءة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الحالات</SelectItem>
                <SelectItem value="no">غير مقروءة</SelectItem>
                <SelectItem value="yes">مقروءة</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={priorityFilter}
              onValueChange={(value: PriorityFilter) =>
                changeFilters(() => setPriorityFilter(value))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="الأولوية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الأولويات</SelectItem>
                <SelectItem value="high">عالية</SelectItem>
                <SelectItem value="medium">متوسطة</SelectItem>
                <SelectItem value="low">منخفضة</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={sourceFilter}
              onValueChange={(value: SourceFilter) => changeFilters(() => setSourceFilter(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="المصدر" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل المصادر</SelectItem>
                {Object.entries(sourceLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border shadow-sm">
        {isLoading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-green-700" />
          </div>
        ) : isError ? (
          <EmptyState
            icon={AlertCircle}
            title="تعذر تحميل الإشعارات"
            description="أعد المحاولة أو تحقق من اتصالك."
          />
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="لا توجد إشعارات مطابقة"
            description="ستظهر هنا التنبيهات التي تخص حسابك عند حدوثها."
          />
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((notification) => {
              const Icon = sourceIcon(notification.source);
              return (
                <article
                  key={notification.id}
                  className={`group flex gap-3 p-4 transition-colors hover:bg-muted/40 sm:p-5 ${notification.isRead === 'no' ? 'bg-green-50/40' : 'bg-background'}`}
                >
                  <div className="mt-0.5 rounded-xl bg-muted p-2 text-green-700">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2
                            className={`text-sm ${notification.isRead === 'no' ? 'font-bold' : 'font-semibold'}`}
                          >
                            {notification.title}
                          </h2>
                          {notification.isRead === 'no' && (
                            <span
                              className="h-2 w-2 rounded-full bg-green-600"
                              aria-label="غير مقروء"
                            />
                          )}
                        </div>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {notification.message}
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.createdAt), {
                          addSuffix: true,
                          locale: ar,
                        })}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="font-normal">
                        {sourceLabels[notification.source]}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`font-normal ${priorityBadgeClass(notification.priority)}`}
                      >
                        {priorityLabels[notification.priority]}
                      </Badge>
                      {notification.actionUrl && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 text-green-700 hover:bg-green-50 hover:text-green-800"
                          onClick={() => openNotification(notification)}
                        >
                          {notification.actionLabel || 'فتح الإجراء'}{' '}
                          <ChevronLeft className="mr-1 h-4 w-4" />
                        </Button>
                      )}
                      <span className="flex-1" />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8"
                        onClick={() =>
                          notification.isRead === 'no'
                            ? markAsRead.mutate({ id: notification.id })
                            : markAsUnread.mutate({ id: notification.id })
                        }
                      >
                        {notification.isRead === 'no' ? 'تحديد كمقروء' : 'تحديد كغير مقروء'}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700"
                        aria-label="حذف الإشعار"
                        onClick={() => deleteNotification.mutate({ id: notification.id })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Card>

      {pagination && pagination.total > limit && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            إظهار {page * limit + 1}–{Math.min((page + 1) * limit, pagination.total)} من{' '}
            {pagination.total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((value) => Math.max(0, value - 1))}
            >
              السابق
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination.hasMore}
              onClick={() => setPage((value) => value + 1)}
            >
              التالي
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: typeof Bell;
  color: string;
}) {
  return (
    <Card className="border-border shadow-sm">
      <CardContent className="flex items-center gap-3 p-4">
        <div className={`rounded-xl bg-muted p-2.5 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="mt-0.5 text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Bell;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center px-4 text-center">
      <div className="rounded-full bg-green-50 p-4 text-green-700">
        <Icon className="h-8 w-8" />
      </div>
      <h2 className="mt-4 font-semibold">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
