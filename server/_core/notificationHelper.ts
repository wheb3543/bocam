/**
 * Notification Helper
 * دوال مساعدة لإنشاء الإشعارات
 */

import { notifications } from '../../drizzle/schema';
import { eq } from 'drizzle-orm';

/**
 * إنشاء إشعار جديد
 */
export async function createNotification(
  db: any,
  options: {
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
    data?: string; // JSON string
    actionUrl?: string;
    actionLabel?: string;
    priority?: 'low' | 'medium' | 'high';
    expiresAt?: Date;
  }
) {
  const [notification] = await db
    .insert(notifications)
    .values({
      userId: options.userId,
      type: options.type,
      title: options.title,
      message: options.message,
      data: options.data || null,
      actionUrl: options.actionUrl || null,
      actionLabel: options.actionLabel || null,
      priority: options.priority || 'medium',
      expiresAt: options.expiresAt || null,
    })
    .$returningId();

  return notification.id;
}

/**
 * إنشاء إشعار لعدة مستخدمين
 */
export async function createBulkNotifications(
  db: any,
  userIds: number[],
  notificationOptions: {
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
    data?: string;
    actionUrl?: string;
    actionLabel?: string;
    priority?: 'low' | 'medium' | 'high';
    expiresAt?: Date;
  }
) {
  const notificationIds = [];

  for (const userId of userIds) {
    const id = await createNotification(db, {
      userId,
      ...notificationOptions,
    });
    notificationIds.push(id);
  }

  return notificationIds;
}

/**
 * إنشاء إشعار طلب موافقة
 */
export async function createApprovalRequestedNotification(
  db: any,
  options: {
    userId: number;
    entityType: string;
    entityId: number;
    entityName: string;
  }
) {
  return createNotification(db, {
    userId: options.userId,
    type: 'approval_requested',
    title: 'طلب موافقة جديد',
    message: `تم تقديم طلب موافقة لـ ${options.entityName} (${options.entityType})`,
    data: JSON.stringify({
      entityType: options.entityType,
      entityId: options.entityId,
    }),
    actionUrl: `/admin/content/approvals`,
    actionLabel: 'عرض الطلب',
    priority: 'high',
  });
}

/**
 * إنشاء إشعار موافقة
 */
export async function createApprovalApprovedNotification(
  db: any,
  options: {
    userId: number;
    entityType: string;
    entityId: number;
    entityName: string;
  }
) {
  return createNotification(db, {
    userId: options.userId,
    type: 'approval_approved',
    title: 'تمت الموافقة',
    message: `تمت الموافقة على طلبك لـ ${options.entityName} (${options.entityType})`,
    data: JSON.stringify({
      entityType: options.entityType,
      entityId: options.entityId,
    }),
    actionUrl: `/admin/content/approvals`,
    actionLabel: 'عرض التفاصيل',
    priority: 'medium',
  });
}

/**
 * إنشاء إشعار رفض
 */
export async function createApprovalRejectedNotification(
  db: any,
  options: {
    userId: number;
    entityType: string;
    entityId: number;
    entityName: string;
    rejectionReason?: string;
  }
) {
  return createNotification(db, {
    userId: options.userId,
    type: 'approval_rejected',
    title: 'تم الرفض',
    message: `تم رفض طلبك لـ ${options.entityName} (${options.entityType})${options.rejectionReason ? `: ${options.rejectionReason}` : ''}`,
    data: JSON.stringify({
      entityType: options.entityType,
      entityId: options.entityId,
      rejectionReason: options.rejectionReason,
    }),
    actionUrl: `/admin/content/approvals`,
    actionLabel: 'عرض التفاصيل',
    priority: 'high',
  });
}

/**
 * إنشاء إشعار تحديث المحتوى
 */
export async function createContentUpdatedNotification(
  db: any,
  options: {
    userId: number;
    entityType: string;
    entityId: number;
    entityName: string;
  }
) {
  return createNotification(db, {
    userId: options.userId,
    type: 'content_updated',
    title: 'تحديث المحتوى',
    message: `تم تحديث ${options.entityName} (${options.entityType})`,
    data: JSON.stringify({
      entityType: options.entityType,
      entityId: options.entityId,
    }),
    actionUrl: `/admin/content/${options.entityType}s`,
    actionLabel: 'عرض التفاصيل',
    priority: 'low',
  });
}

/**
 * إنشاء إشعار حذف المحتوى
 */
export async function createContentDeletedNotification(
  db: any,
  options: {
    userId: number;
    entityType: string;
    entityId: number;
    entityName: string;
  }
) {
  return createNotification(db, {
    userId: options.userId,
    type: 'content_deleted',
    title: 'حذف المحتوى',
    message: `تم حذف ${options.entityName} (${options.entityType})`,
    data: JSON.stringify({
      entityType: options.entityType,
      entityId: options.entityId,
    }),
    priority: 'medium',
  });
}

/**
 * إنشاء إشعار نشر المحتوى
 */
export async function createContentPublishedNotification(
  db: any,
  options: {
    userId: number;
    entityType: string;
    entityId: number;
    entityName: string;
  }
) {
  return createNotification(db, {
    userId: options.userId,
    type: 'content_published',
    title: 'نشر المحتوى',
    message: `تم نشر ${options.entityName} (${options.entityType})`,
    data: JSON.stringify({
      entityType: options.entityType,
      entityId: options.entityId,
    }),
    actionUrl: `/admin/content/${options.entityType}s`,
    actionLabel: 'عرض التفاصيل',
    priority: 'medium',
  });
}
