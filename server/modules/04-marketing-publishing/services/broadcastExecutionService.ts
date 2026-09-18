/**
 * Broadcast Execution Service
 * خدمة تنفيذ البث وتتبع النتائج
 */

import { getDb } from '../../../database/db';
import {
  whatsappBroadcasts,
  broadcastRecipients,
  broadcastRecipientResults,
} from '../../../../drizzle/schema';
import type { RecipientInfo } from './broadcastRecipientService';
import { eq, and, desc } from 'drizzle-orm';

/**
 * معلومات البث
 */
export interface BroadcastInfo {
  id: number;
  name: string;
  templateId: number;
  templateVariables?: Record<string, string>;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'document' | 'audio';
  filterCriteria?: any;
  createdBy: number;
}

/**
 * نتائج تنفيذ البث
 */
export interface BroadcastExecutionResult {
  broadcastId: number;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  errors: Array<{
    recipientId: number;
    phoneNumber: string;
    error: string;
  }>;
}

/**
 * إنشاء بث جديد
 */
export async function createBroadcast(broadcastInfo: BroadcastInfo): Promise<number> {
  const db = await getDb();
  if (!db) {
    throw new Error('قاعدة البيانات غير متاحة');
  }

  const result = await db.insert(whatsappBroadcasts).values({
    name: broadcastInfo.name,
    message: '',
    templateId: broadcastInfo.templateId,
    targetFilter: broadcastInfo.filterCriteria
      ? JSON.stringify(broadcastInfo.filterCriteria)
      : null,
    recipientCount: 0,
    sentCount: 0,
    deliveredCount: 0,
    readCount: 0,
    failedCount: 0,
    status: 'draft',
    createdBy: broadcastInfo.createdBy,
  });

  const resultHeader = Array.isArray(result) ? result[0] : result;
  const insertId = Number((resultHeader as any)?.insertId);
  return Number.isSafeInteger(insertId) ? insertId : 0;
}

/**
 * إضافة المستقبلين للبث
 */
export async function addBroadcastRecipients(
  broadcastId: number,
  recipients: RecipientInfo[]
): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error('قاعدة البيانات غير متاحة');
  }

  const values = recipients.map((recipient) => ({
    broadcastId,
    phoneNumber: recipient.phoneNumber,
    fullName: recipient.fullName,
    email: recipient.email,
    recipientType: recipient.recipientType,
    recipientId: recipient.recipientId,
    sourceId: recipient.sourceId,
    sourceType: recipient.sourceType,
    templateVariables: recipient.templateVariables
      ? JSON.stringify(recipient.templateVariables)
      : null,
    status: 'pending' as const,
  }));

  const batchSize = 100;
  for (let i = 0; i < values.length; i += batchSize) {
    const batch = values.slice(i, i + batchSize);
    await db.insert(broadcastRecipients).values(batch);
  }

  await db
    .update(whatsappBroadcasts)
    .set({ recipientCount: recipients.length })
    .where(eq(whatsappBroadcasts.id, broadcastId));
}

/**
 * تنفيذ البث
 */
export async function executeBroadcast(broadcastId: number): Promise<BroadcastExecutionResult> {
  const db = await getDb();
  if (!db) {
    throw new Error('قاعدة البيانات غير متاحة');
  }

  const broadcast = await db
    .select()
    .from(whatsappBroadcasts)
    .where(eq(whatsappBroadcasts.id, broadcastId))
    .limit(1);

  if (!broadcast || broadcast.length === 0) {
    throw new Error('البث غير موجود');
  }

  await db
    .update(whatsappBroadcasts)
    .set({ status: 'sending' })
    .where(eq(whatsappBroadcasts.id, broadcastId));

  const recipients = await db
    .select()
    .from(broadcastRecipients)
    .where(eq(broadcastRecipients.broadcastId, broadcastId));

  let sentCount = 0;
  let failedCount = 0;
  const errors: Array<{
    recipientId: number;
    phoneNumber: string;
    error: string;
  }> = [];

  for (const recipient of recipients) {
    try {
      const result = await sendToRecipient(broadcast[0], recipient);

      if (result.success) {
        sentCount++;
        await db
          .update(broadcastRecipients)
          .set({
            status: 'sent',
            sentAt: new Date(),
          })
          .where(eq(broadcastRecipients.id, recipient.id));

        if (result.messageId) {
          await db.insert(broadcastRecipientResults).values({
            broadcastId,
            recipientId: recipient.id,
            whatsappMessageId: result.messageId,
            status: 'sent',
            sentAt: new Date(),
          });
        }
      } else {
        failedCount++;
        await db
          .update(broadcastRecipients)
          .set({
            status: 'failed',
            errorInfo: result.error,
          })
          .where(eq(broadcastRecipients.id, recipient.id));

        errors.push({
          recipientId: recipient.id,
          phoneNumber: recipient.phoneNumber,
          error: result.error || 'خطأ غير معروف',
        });
      }
    } catch (error) {
      failedCount++;
      errors.push({
        recipientId: recipient.id,
        phoneNumber: recipient.phoneNumber,
        error: String(error),
      });
    }

    await new Promise((resolve) => {
      setTimeout(resolve, 50);
    });
  }

  await db
    .update(whatsappBroadcasts)
    .set({
      status: failedCount === 0 ? 'completed' : 'completed',
      sentCount,
      failedCount,
      completedAt: new Date(),
    })
    .where(eq(whatsappBroadcasts.id, broadcastId));

  return {
    broadcastId,
    totalRecipients: recipients.length,
    sentCount,
    failedCount,
    errors,
  };
}

async function sendToRecipient(
  broadcast: any,
  recipient: any
): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  try {
    return {
      success: true,
      messageId: `msg_${Date.now()}_${Math.random()}`,
    };
  } catch (error) {
    return {
      success: false,
      error: String(error),
    };
  }
}

/**
 * الحصول على إحصائيات البث
 */
export async function getBroadcastStats(broadcastId: number): Promise<{
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  failedCount: number;
  pendingCount: number;
}> {
  const db = await getDb();
  if (!db) {
    throw new Error('قاعدة البيانات غير متاحة');
  }

  const broadcast = await db
    .select()
    .from(whatsappBroadcasts)
    .where(eq(whatsappBroadcasts.id, broadcastId))
    .limit(1);

  if (!broadcast || broadcast.length === 0) {
    throw new Error('البث غير موجود');
  }

  const recipients = await db
    .select()
    .from(broadcastRecipients)
    .where(eq(broadcastRecipients.broadcastId, broadcastId));

  let sentCount = 0;
  let deliveredCount = 0;
  let readCount = 0;
  let failedCount = 0;
  let pendingCount = 0;

  for (const recipient of recipients) {
    switch (recipient.status) {
      case 'sent':
        sentCount++;
        break;
      case 'delivered':
        deliveredCount++;
        break;
      case 'read':
        readCount++;
        break;
      case 'failed':
        failedCount++;
        break;
      case 'pending':
        pendingCount++;
        break;
    }
  }

  return {
    totalRecipients: recipients.length,
    sentCount,
    deliveredCount,
    readCount,
    failedCount,
    pendingCount,
  };
}

/**
 * الحصول على نتائج المستقبلين
 */
export async function getBroadcastRecipients(
  broadcastId: number,
  page: number = 1,
  limit: number = 20,
  status?: string
): Promise<{
  recipients: any[];
  total: number;
  page: number;
  limit: number;
}> {
  const db = await getDb();
  if (!db) {
    throw new Error('قاعدة البيانات غير متاحة');
  }

  const conditions = [eq(broadcastRecipients.broadcastId, broadcastId)];
  if (status) {
    conditions.push(eq(broadcastRecipients.status, status as any));
  }

  const offset = (page - 1) * limit;
  const recipients = await db
    .select()
    .from(broadcastRecipients)
    .where(and(...conditions))
    .orderBy(desc(broadcastRecipients.createdAt))
    .limit(limit)
    .offset(offset);

  const allRecipients = await db
    .select({ id: broadcastRecipients.id })
    .from(broadcastRecipients)
    .where(and(...conditions));

  return {
    recipients,
    total: allRecipients.length,
    page,
    limit,
  };
}
