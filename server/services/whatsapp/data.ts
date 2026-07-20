/**
 * WhatsApp Data Service
 * خدمة جلب بيانات إشعارات WhatsApp
 */

import { eq, and } from 'drizzle-orm';
import { getDb } from '../../database/db';
import { whatsappNotifications, type WhatsappNotification } from '../../../drizzle/schema';
import type { EntityType, NotificationStatus, NotificationStats } from './types';

// جلب إشعارات سجل معين
export async function getEntityNotifications(params: {
  entityType: EntityType;
  entityId: number;
}): Promise<{ success: boolean; notifications?: Record<string, unknown>[]; error?: string }> {
  try {
    const db = await getDb();
    if (!db) {
      return { success: false, error: 'قاعدة البيانات غير متاحة' };
    }

    const notifications = await db
      .select()
      .from(whatsappNotifications)
      .where(
        and(
          eq(whatsappNotifications.entityType, params.entityType),
          eq(whatsappNotifications.entityId, params.entityId)
        )
      )
      .orderBy(whatsappNotifications.createdAt);

    return { success: true, notifications };
  } catch (error) {
    console.error('[WhatsApp Appointments] Failed to get notifications:', error);
    return { success: false, error: error instanceof Error ? error.message : 'خطأ غير معروف' };
  }
}

// إحصائيات الإشعارات
export async function getNotificationStats(): Promise<{
  success: boolean;
  stats?: NotificationStats;
  error?: string;
}> {
  try {
    const db = await getDb();
    if (!db) {
      return { success: false, error: 'قاعدة البيانات غير متاحة' };
    }

    const all = await db.select().from(whatsappNotifications);

    const stats: NotificationStats = {
      total: all.length,
      sent: all.filter(
        (n) => n.status === 'sent' || n.status === 'delivered' || n.status === 'read'
      ).length,
      failed: all.filter((n) => n.status === 'failed').length,
      pending: all.filter((n) => n.status === 'pending').length,
      byType: {} as Record<string, number>,
      byEntity: {} as Record<string, number>,
    };

    for (const n of all) {
      stats.byType[n.notificationType] = (stats.byType[n.notificationType] || 0) + 1;
      stats.byEntity[n.entityType] = (stats.byEntity[n.entityType] || 0) + 1;
    }

    return { success: true, stats };
  } catch (error) {
    console.error('[WhatsApp Appointments] Failed to get stats:', error);
    return { success: false, error: error instanceof Error ? error.message : 'خطأ غير معروف' };
  }
}

// جلب سجلات الإشعارات مع فلترة ودعم pagination
export async function getNotificationLogs(params: {
  entityType?: EntityType;
  status?: NotificationStatus;
  limit?: number;
  offset?: number;
}): Promise<{ success: boolean; logs?: WhatsappNotification[]; total?: number; error?: string }> {
  try {
    const db = await getDb();
    if (!db) {
      return { success: false, error: 'قاعدة البيانات غير متاحة' };
    }

    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;

    // Build conditions
    const conditions = [];
    if (params.entityType) {
      conditions.push(eq(whatsappNotifications.entityType, params.entityType));
    }
    if (params.status) {
      conditions.push(eq(whatsappNotifications.status, params.status));
    }

    const query = db.select().from(whatsappNotifications);
    const whereQuery = conditions.length > 0 ? query.where(and(...conditions)) : query;
    const logs = await whereQuery
      .orderBy(whatsappNotifications.createdAt)
      .limit(limit)
      .offset(offset);

    const allQuery = db.select().from(whatsappNotifications);
    const allWithFilter = conditions.length > 0 ? allQuery.where(and(...conditions)) : allQuery;
    const allLogs = await allWithFilter;

    return { success: true, logs, total: allLogs.length };
  } catch (error) {
    console.error('[WhatsApp Appointments] Failed to get notification logs:', error);
    return { success: false, error: error instanceof Error ? error.message : 'خطأ غير معروف' };
  }
}

// للتوافق مع الكود القديم
export async function getAppointmentNotificationStatus(appointmentId: number) {
  return getEntityNotifications({ entityType: 'appointment', entityId: appointmentId });
}

export async function checkAndSendReminders() {
  return { success: true, sent: 0 };
}
