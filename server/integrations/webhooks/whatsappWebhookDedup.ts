import crypto from 'crypto';
import { and, eq, inArray, lt } from 'drizzle-orm';
import { getDb } from '../../database/db';
import { whatsappWebhookDeliveries } from '../../../drizzle/schema';

type WebhookChange = {
  field?: string;
  value?: {
    messages?: Array<{ id?: string; from?: string; [key: string]: unknown }>;
    statuses?: Array<{ id?: string; status?: string; timestamp?: string }>;
    [key: string]: unknown;
  };
};

type WebhookBody = {
  entry?: Array<{ id?: string; changes?: WebhookChange[]; [key: string]: unknown }>;
  [key: string]: unknown;
};

export type WebhookDeduplicationStats = {
  acceptedMessages: number;
  acceptedStatuses: number;
  skippedMessages: number;
  skippedStatuses: number;
  acceptedDeliveryKeys: string[];
};

export type DeliveryReservation = (delivery: {
  deliveryKey: string;
  eventType: 'message' | 'status';
  metaMessageId: string;
}) => Promise<boolean>;

/**
 * ينشئ مفتاحاً ثابتاً فريداً لكل أثر أعمال من Meta.
 * حالة الرسالة تستخدم الحالة والطابع الزمني حتى تبقى sent/delivered/read أحداثاً مستقلة للرسالة نفسها.
 */
export function createWhatsAppDeliveryKey(
  eventType: 'message' | 'status',
  metaMessageId: string,
  status?: string,
  timestamp?: string
): string {
  const source =
    eventType === 'message'
      ? `message:${metaMessageId}`
      : `status:${metaMessageId}:${status || 'unknown'}:${timestamp || 'unknown'}`;
  return crypto.createHash('sha256').update(source).digest('hex');
}

const DELIVERY_PROCESSING_LEASE_MS = 2 * 60 * 1000;

export function canRetryWhatsAppWebhookDelivery(
  processingStatus: string,
  updatedAt: Date,
  now: Date = new Date()
): boolean {
  return (
    processingStatus === 'failed' ||
    (processingStatus === 'processing' &&
      updatedAt < new Date(now.getTime() - DELIVERY_PROCESSING_LEASE_MS))
  );
}

function getAffectedRows(result: unknown): number {
  const candidate = Array.isArray(result) ? result[0] : result;
  return Number((candidate as { affectedRows?: number } | undefined)?.affectedRows ?? 0);
}

/**
 * يحجز أثراً جديداً أو يعيد أخذ أثر فشل سابق / حجزاً منتهياً.
 * لا يمكن لإعادة التسليم تخطي عملية فشلت قبل آثارها الجانبية، ولا يمكن لنسختين معالجته في وقت واحد.
 */
export const reserveWhatsAppWebhookDelivery: DeliveryReservation = async (delivery) => {
  const db = await getDb();
  if (!db) {
    throw new Error('Database unavailable while reserving WhatsApp webhook delivery');
  }

  try {
    await db.insert(whatsappWebhookDeliveries).values({
      deliveryKey: delivery.deliveryKey,
      eventType: delivery.eventType,
      metaMessageId: delivery.metaMessageId,
      processingStatus: 'processing',
      attempts: 1,
      processingStartedAt: new Date(),
    });
    return true;
  } catch (error) {
    const code = (error as { code?: string })?.code;
    if (code !== 'ER_DUP_ENTRY') {
      throw error;
    }

    const [existing] = await db
      .select({
        processingStatus: whatsappWebhookDeliveries.processingStatus,
        updatedAt: whatsappWebhookDeliveries.updatedAt,
      })
      .from(whatsappWebhookDeliveries)
      .where(eq(whatsappWebhookDeliveries.deliveryKey, delivery.deliveryKey))
      .limit(1);
    if (!existing || existing.processingStatus === 'processed') {
      return false;
    }

    const now = new Date();
    if (!canRetryWhatsAppWebhookDelivery(existing.processingStatus, existing.updatedAt, now)) {
      return false;
    }

    const currentAttempts =
      (
        await db
          .select({ attempts: whatsappWebhookDeliveries.attempts })
          .from(whatsappWebhookDeliveries)
          .where(eq(whatsappWebhookDeliveries.deliveryKey, delivery.deliveryKey))
          .limit(1)
      )[0]?.attempts ?? 1;

    const canRetryFailed = existing.processingStatus === 'failed';
    const result = await db
      .update(whatsappWebhookDeliveries)
      .set({
        processingStatus: 'processing',
        processingStartedAt: now,
        processedAt: null,
        lastError: null,
        attempts: Number(currentAttempts) + 1,
      })
      .where(
        canRetryFailed
          ? and(
              eq(whatsappWebhookDeliveries.deliveryKey, delivery.deliveryKey),
              eq(whatsappWebhookDeliveries.processingStatus, 'failed')
            )
          : and(
              eq(whatsappWebhookDeliveries.deliveryKey, delivery.deliveryKey),
              eq(whatsappWebhookDeliveries.processingStatus, 'processing'),
              lt(
                whatsappWebhookDeliveries.updatedAt,
                new Date(now.getTime() - DELIVERY_PROCESSING_LEASE_MS)
              )
            )
      );
    return getAffectedRows(result) === 1;
  }
};

export async function markWhatsAppWebhookDeliveriesProcessed(
  deliveryKeys: string[]
): Promise<void> {
  if (!deliveryKeys.length) {
    return;
  }
  const db = await getDb();
  if (!db) {
    throw new Error('Database unavailable while completing WhatsApp webhook deliveries');
  }
  await db
    .update(whatsappWebhookDeliveries)
    .set({
      processingStatus: 'processed',
      processedAt: new Date(),
      lastError: null,
    })
    .where(inArray(whatsappWebhookDeliveries.deliveryKey, deliveryKeys));
}

export async function markWhatsAppWebhookDeliveriesFailed(
  deliveryKeys: string[],
  error: unknown
): Promise<void> {
  if (!deliveryKeys.length) {
    return;
  }
  const db = await getDb();
  if (!db) {
    throw new Error('Database unavailable while failing WhatsApp webhook deliveries');
  }
  const message = error instanceof Error ? error.message : String(error);
  await db
    .update(whatsappWebhookDeliveries)
    .set({
      processingStatus: 'failed',
      lastError: message.slice(0, 1000),
    })
    .where(inArray(whatsappWebhookDeliveries.deliveryKey, deliveryKeys));
}

/**
 * يبقي في الحمولة الرسائل والحالات التي نجح حجزها فقط، قبل أي رد تلقائي أو تعديل
 * لعدادات المحادثة. لا يغير الكائن الأصلي ليستطيع المتصل تسجيله عند الحاجة.
 */
export async function filterDuplicateWhatsAppDeliveries(
  body: WebhookBody,
  reserve: DeliveryReservation = reserveWhatsAppWebhookDelivery
): Promise<{ body: WebhookBody; stats: WebhookDeduplicationStats }> {
  const stats: WebhookDeduplicationStats = {
    acceptedMessages: 0,
    acceptedStatuses: 0,
    skippedMessages: 0,
    skippedStatuses: 0,
    acceptedDeliveryKeys: [],
  };

  if (!Array.isArray(body.entry)) {
    return { body, stats };
  }

  const entries: NonNullable<WebhookBody['entry']> = [];
  for (const entry of body.entry) {
    if (!Array.isArray(entry.changes)) {
      entries.push(entry);
      continue;
    }

    const changes: WebhookChange[] = [];
    for (const change of entry.changes) {
      if (change.field !== 'messages' || !change.value) {
        changes.push(change);
        continue;
      }

      const value = change.value;
      const nextMessages: NonNullable<typeof value.messages> = [];
      for (const message of value.messages || []) {
        if (!message.id) {
          nextMessages.push(message);
          continue;
        }
        const deliveryKey = createWhatsAppDeliveryKey('message', message.id);
        const accepted = await reserve({
          deliveryKey,
          eventType: 'message',
          metaMessageId: message.id,
        });
        if (accepted) {
          nextMessages.push(message);
          stats.acceptedMessages += 1;
          stats.acceptedDeliveryKeys.push(deliveryKey);
        } else {
          stats.skippedMessages += 1;
        }
      }

      const nextStatuses: NonNullable<typeof value.statuses> = [];
      for (const status of value.statuses || []) {
        if (!status.id) {
          nextStatuses.push(status);
          continue;
        }
        const deliveryKey = createWhatsAppDeliveryKey(
          'status',
          status.id,
          status.status,
          status.timestamp
        );
        const accepted = await reserve({
          deliveryKey,
          eventType: 'status',
          metaMessageId: status.id,
        });
        if (accepted) {
          nextStatuses.push(status);
          stats.acceptedStatuses += 1;
          stats.acceptedDeliveryKeys.push(deliveryKey);
        } else {
          stats.skippedStatuses += 1;
        }
      }

      const hadMessages = Array.isArray(value.messages);
      const hadStatuses = Array.isArray(value.statuses);
      if ((hadMessages || hadStatuses) && nextMessages.length === 0 && nextStatuses.length === 0) {
        continue;
      }

      changes.push({
        ...change,
        value: {
          ...value,
          ...(hadMessages ? { messages: nextMessages } : {}),
          ...(hadStatuses ? { statuses: nextStatuses } : {}),
        },
      });
    }

    if (changes.length > 0) {
      entries.push({ ...entry, changes });
    }
  }

  return { body: { ...body, entry: entries }, stats };
}
