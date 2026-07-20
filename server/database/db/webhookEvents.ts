/**
 * Webhook Events Database Functions
 * دوال قاعدة البيانات المتعلقة بأحداث Webhook
 */

import { eq, desc } from 'drizzle-orm';
import { whatsappWebhookEvents } from '../../../drizzle/schema';
import { getDb } from './connection';

/**
 * الحصول على جميع أحداث Webhook
 */
export async function getWebhookEvents(limit = 100) {
  const db = await getDb();
  if (!db) {
    return [];
  }
  return db
    .select()
    .from(whatsappWebhookEvents)
    .orderBy(desc(whatsappWebhookEvents.createdAt))
    .limit(limit);
}

/**
 * الحصول على عدد أحداث Webhook غير المعالجة
 */
export async function getUnhandledWebhookEventsCount() {
  const db = await getDb();
  if (!db) {
    return 0;
  }
  const { sql } = await import('drizzle-orm');
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(whatsappWebhookEvents)
    .where(eq(whatsappWebhookEvents.processed, false));
  return result[0]?.count || 0;
}

/**
 * الحصول على أنواع الأحداث الفريدة
 */
export async function getUniqueEventTypes() {
  const db = await getDb();
  if (!db) {
    return [];
  }
  const { sql } = await import('drizzle-orm');
  const result = await db
    .select({ eventType: sql<string>`DISTINCT eventType` })
    .from(whatsappWebhookEvents);
  return result.map((r) => r.eventType);
}

/**
 * تسجيل حدث Webhook
 */
export async function logWebhookEvent(event: {
  eventType: string;
  payload?: unknown;
  rawPayload?: string;
  processed?: boolean;
  handlerExists?: boolean;
  subType?: string;
  phoneNumber?: string;
}) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }
  const result = await db.insert(whatsappWebhookEvents).values({
    eventType: event.eventType,
    rawPayload: event.rawPayload || (event.payload ? JSON.stringify(event.payload) : '{}'),
    processed: event.processed ?? false,
    handlerExists: event.handlerExists ?? false,
  });
  return result;
}

/**
 * تحديد حدث Webhook كمعالج
 */
export async function markWebhookEventAsProcessed(id: number, handlerExists: boolean) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }
  return db
    .update(whatsappWebhookEvents)
    .set({ processed: true, handlerExists, processedAt: new Date() })
    .where(eq(whatsappWebhookEvents.id, id));
}
