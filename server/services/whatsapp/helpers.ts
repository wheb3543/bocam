/**
 * WhatsApp Service Helpers
 * دوال مساعدة لخدمة WhatsApp
 */

import { eq } from 'drizzle-orm';
import { normalizePhoneNumber } from '../../database/db';
import { getDb } from '../../database/db';
import { whatsappNotifications, whatsappBlockedNumbers } from '../../../drizzle/schema';
import type { SaveNotificationParams } from './types';

// حفظ سجل الإشعار في قاعدة البيانات
export async function saveNotification(params: SaveNotificationParams): Promise<number | null> {
  try {
    const db = await getDb();
    if (!db) {
      return null;
    }
    const result = await db.insert(whatsappNotifications).values({
      entityType: params.entityType,
      entityId: params.entityId,
      notificationType: params.notificationType,
      phone: params.phone,
      recipientName: params.recipientName,
      templateName: params.templateName,
      messageContent: params.messageContent?.substring(0, 1000),
      status: params.status,
      metaMessageId: params.metaMessageId,
      errorMessage: params.errorMessage,
      sentBy: params.sentBy,
      isAutomatic: params.isAutomatic !== false,
      sentAt: params.status === 'sent' ? new Date() : undefined,
    });
    if (Array.isArray(result) && result.length > 0) {
      const first = result[0];
      if (typeof first === 'object' && first !== null && 'insertId' in first) {
        const insertId = (first as { insertId?: unknown }).insertId;
        if (typeof insertId === 'number') {
          return insertId;
        }
        if (typeof insertId === 'bigint') {
          return Number(insertId);
        }
      }
    }
    return null;
  } catch (err) {
    console.error('[WhatsApp Appointments] Failed to save notification:', err);
    return null;
  }
}

// التحقق من حظر الرقم
export async function isPhoneBlocked(phone: string): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) {
      return false;
    }
    const result = await db
      .select()
      .from(whatsappBlockedNumbers)
      .where(eq(whatsappBlockedNumbers.phone, phone))
      .limit(1);
    return result.length > 0;
  } catch {
    return false;
  }
}

// التحقق من صحة رقم الهاتف
export async function validatePhoneNumber(
  phone: string
): Promise<{ valid: boolean; normalized?: string; error?: string }> {
  const normalizedPhone = normalizePhoneNumber(phone);
  if (!normalizedPhone || normalizedPhone.length < 9) {
    return { valid: false, error: 'رقم الهاتف غير صحيح' };
  }
  if (await isPhoneBlocked(normalizedPhone)) {
    return { valid: false, error: 'الرقم محظور من استقبال الرسائل' };
  }
  return { valid: true, normalized: normalizedPhone };
}

/**
 * التحقق من صحة رقم الهاتف وإرجاع الرقم المعياري
 * @throws Error إذا كان الرقم غير صحيح أو محظوراً
 */
export async function validateAndNormalizePhone(phone: string): Promise<string> {
  const validation = await validatePhoneNumber(phone);
  if (!validation.valid || !validation.normalized) {
    throw new Error(validation.error || 'رقم الهاتف غير صحيح');
  }
  return validation.normalized;
}
