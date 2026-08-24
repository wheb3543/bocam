/** Shared server-side helpers for the unified per-user notification inbox. */

import { notifications } from '../../drizzle/schema';
import type {
  NotificationPriority,
  NotificationSource,
  NotificationType,
} from '../../shared/notifications';
import { shouldDeliverNotification } from '../services/notificationPolicy';

type NotificationOptions = {
  userId: number;
  type: NotificationType;
  source?: NotificationSource;
  title: string;
  message: string;
  data?: string;
  entityType?: string;
  entityId?: string | number;
  actionUrl?: string;
  actionLabel?: string;
  priority?: NotificationPriority;
  expiresAt?: Date;
};

export async function createNotification(db: any, options: NotificationOptions) {
  const source = options.source || 'system';
  const priority = options.priority || 'medium';
  if (!(await shouldDeliverNotification(db, { userId: options.userId, source, priority }))) {
    return null;
  }

  const [notification] = await db
    .insert(notifications)
    .values({
      userId: options.userId,
      type: options.type,
      source,
      title: options.title,
      message: options.message,
      data: options.data || null,
      entityType: options.entityType || null,
      entityId: options.entityId ? String(options.entityId) : null,
      actionUrl: options.actionUrl || null,
      actionLabel: options.actionLabel || null,
      priority,
      expiresAt: options.expiresAt || null,
    })
    .$returningId();

  return notification.id;
}

export async function createBulkNotifications(
  db: any,
  userIds: number[],
  notificationOptions: Omit<NotificationOptions, 'userId'>
) {
  const notificationIds: number[] = [];
  for (const userId of userIds) {
    const notificationId = await createNotification(db, { userId, ...notificationOptions });
    if (notificationId !== null) {
      notificationIds.push(notificationId);
    }
  }
  return notificationIds;
}

type ContentNotificationOptions = {
  userId: number;
  entityType: string;
  entityId: number;
  entityName: string;
};

function contentData(options: ContentNotificationOptions, extras: Record<string, unknown> = {}) {
  return JSON.stringify({ entityType: options.entityType, entityId: options.entityId, ...extras });
}

const contentAction = '/admin/content/content';

export async function createApprovalRequestedNotification(
  db: any,
  options: ContentNotificationOptions
) {
  return createNotification(db, {
    ...options,
    type: 'approval_requested',
    source: 'content',
    title: 'طلب موافقة جديد',
    message: `تم تقديم طلب موافقة لـ ${options.entityName} (${options.entityType})`,
    data: contentData(options),
    actionUrl: '/admin/campaigns/review-approval',
    actionLabel: 'عرض الطلب',
    priority: 'high',
  });
}

export async function createApprovalApprovedNotification(
  db: any,
  options: ContentNotificationOptions
) {
  return createNotification(db, {
    ...options,
    type: 'approval_approved',
    source: 'content',
    title: 'تمت الموافقة',
    message: `تمت الموافقة على طلبك لـ ${options.entityName} (${options.entityType})`,
    data: contentData(options),
    actionUrl: '/admin/campaigns/review-approval',
    actionLabel: 'عرض التفاصيل',
    priority: 'medium',
  });
}

export async function createApprovalRejectedNotification(
  db: any,
  options: ContentNotificationOptions & { rejectionReason?: string }
) {
  return createNotification(db, {
    ...options,
    type: 'approval_rejected',
    source: 'content',
    title: 'تم الرفض',
    message: `تم رفض طلبك لـ ${options.entityName} (${options.entityType})${options.rejectionReason ? `: ${options.rejectionReason}` : ''}`,
    data: contentData(options, { rejectionReason: options.rejectionReason }),
    actionUrl: '/admin/campaigns/review-approval',
    actionLabel: 'عرض التفاصيل',
    priority: 'high',
  });
}

export async function createContentUpdatedNotification(
  db: any,
  options: ContentNotificationOptions
) {
  return createNotification(db, {
    ...options,
    type: 'content_updated',
    source: 'content',
    title: 'تحديث المحتوى',
    message: `تم تحديث ${options.entityName} (${options.entityType})`,
    data: contentData(options),
    actionUrl: contentAction,
    actionLabel: 'عرض المحتوى',
    priority: 'low',
  });
}

export async function createContentDeletedNotification(
  db: any,
  options: ContentNotificationOptions
) {
  return createNotification(db, {
    ...options,
    type: 'content_deleted',
    source: 'content',
    title: 'حذف المحتوى',
    message: `تم حذف ${options.entityName} (${options.entityType})`,
    data: contentData(options),
    priority: 'medium',
  });
}

export async function createContentPublishedNotification(
  db: any,
  options: ContentNotificationOptions
) {
  return createNotification(db, {
    ...options,
    type: 'content_published',
    source: 'content',
    title: 'نشر المحتوى',
    message: `تم نشر ${options.entityName} (${options.entityType})`,
    data: contentData(options),
    actionUrl: contentAction,
    actionLabel: 'عرض المحتوى',
    priority: 'medium',
  });
}
