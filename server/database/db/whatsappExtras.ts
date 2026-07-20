/**
 * WhatsApp Extras Database Functions
 * دوال إضافية لـ WhatsApp (Alerts, Security, Quality, etc.)
 */

import { eq } from 'drizzle-orm';
import {
  InsertWhatsappAccountAlert,
  InsertWhatsappSecurityEvent,
  InsertWhatsappPhoneQuality,
  InsertWhatsappConversationQuality,
  InsertWhatsappUserOptIn,
  InsertWhatsappTemplateQuality,
} from '../../../drizzle/schema';
import { getDb } from './connection';

/**
 * إنشاء تنبيه حساب WhatsApp
 */
export async function createWhatsAppAccountAlert(alert: InsertWhatsappAccountAlert) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }
  const { whatsappAccountAlerts } = await import('../../../drizzle/schema');
  const result = await db.insert(whatsappAccountAlerts).values(alert);
  return result;
}

/**
 * إنشاء حدث أمان WhatsApp
 */
export async function createWhatsAppSecurityEvent(event: InsertWhatsappSecurityEvent) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }
  const { whatsappSecurityEvents } = await import('../../../drizzle/schema');
  const result = await db.insert(whatsappSecurityEvents).values(event);
  return result;
}

/**
 * إنشاء جودة هاتف WhatsApp
 */
export async function createWhatsAppPhoneQuality(quality: InsertWhatsappPhoneQuality) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }
  const { whatsappPhoneQuality } = await import('../../../drizzle/schema');
  const result = await db.insert(whatsappPhoneQuality).values(quality);
  return result;
}

/**
 * إنشاء جودة محادثة WhatsApp
 */
export async function createWhatsAppConversationQuality(
  quality: InsertWhatsappConversationQuality
) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }
  const { whatsappConversationQuality } = await import('../../../drizzle/schema');
  const result = await db.insert(whatsappConversationQuality).values(quality);
  return result;
}

/**
 * إنشاء Opt-In مستخدم WhatsApp
 */
export async function createWhatsAppUserOptIn(optIn: InsertWhatsappUserOptIn) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }
  const { whatsappUserOptIns } = await import('../../../drizzle/schema');
  const result = await db.insert(whatsappUserOptIns).values(optIn);
  return result;
}

/**
 * تحديث Opt-In مستخدم WhatsApp
 */
export async function updateWhatsAppUserOptIn(
  phoneNumber: string,
  optIn: Partial<InsertWhatsappUserOptIn>
) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }
  const { whatsappUserOptIns } = await import('../../../drizzle/schema');
  return db
    .update(whatsappUserOptIns)
    .set(optIn)
    .where(eq(whatsappUserOptIns.phoneNumber, phoneNumber));
}

/**
 * إنشاء جودة قالب WhatsApp
 */
export async function createWhatsAppTemplateQuality(quality: InsertWhatsappTemplateQuality) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }
  const { whatsappTemplateQuality } = await import('../../../drizzle/schema');
  const result = await db.insert(whatsappTemplateQuality).values(quality);
  return result;
}

/**
 * الحصول على قالب WhatsApp حسب اسم Meta
 */
export async function getWhatsAppTemplateByMetaName(metaTemplateId: string) {
  const db = await getDb();
  if (!db) {
    return undefined;
  }
  const { whatsappTemplates } = await import('../../../drizzle/schema');
  const result = await db
    .select()
    .from(whatsappTemplates)
    .where(eq(whatsappTemplates.metaTemplateId, metaTemplateId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}
