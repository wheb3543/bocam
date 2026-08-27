/**
 * WhatsApp Webhook Events Routes
 * مسارات أحداث الويب هوك لواتساب
 */

import { router } from '../../../../_core/trpc';
import { TRPCError } from '@trpc/server';
import { ensureDatabaseAvailable } from '../../../../_core/databaseGuard';
import * as db from '../../../../database/db';
import { z } from 'zod';
import { permissionProcedure } from '../../../permissionProcedures';

const webhookLogsProcedure = permissionProcedure('integrations.logs.view', 'عرض سجلات Webhooks');
const webhooksManagementProcedure = permissionProcedure(
  'integrations.webhooks.manage',
  'إدارة أحداث Webhooks'
);

type WebhookEventRow = {
  id: number;
  eventId: string | null;
  eventType: string;
  subType: string | null;
  phoneNumber: string | null;
  processed: boolean;
  handlerExists: boolean;
  createdAt: Date;
  processedAt: Date | null;
};

function maskPhoneNumber(phoneNumber: string | null): string | null {
  if (!phoneNumber) {
    return null;
  }
  const lastDigits = phoneNumber.replace(/\D/g, '').slice(-4);
  return lastDigits ? `••••${lastDigits}` : '••••';
}

function toWebhookEventSummary(event: WebhookEventRow) {
  return {
    id: event.id,
    eventId: event.eventId,
    eventType: event.eventType,
    subType: event.subType,
    phoneNumber: maskPhoneNumber(event.phoneNumber),
    processed: event.processed,
    handlerExists: event.handlerExists,
    createdAt: event.createdAt,
    processedAt: event.processedAt,
  };
}

export const webhookRouter = router({
  getAll: webhookLogsProcedure
    .input(
      z
        .object({
          eventType: z.string().optional(),
          processed: z.boolean().optional(),
          handlerExists: z.boolean().optional(),
          limit: z.number().int().min(1).max(100).default(100),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const dbConn = await ensureDatabaseAvailable();
      const { whatsappWebhookEvents } = await import('../../../../../drizzle/schema');
      const { eq, and, desc } = await import('drizzle-orm');

      const conditions = [];
      if (input?.eventType) {
        conditions.push(eq(whatsappWebhookEvents.eventType, input.eventType));
      }
      if (input?.processed !== undefined) {
        conditions.push(eq(whatsappWebhookEvents.processed, input.processed));
      }
      if (input?.handlerExists !== undefined) {
        conditions.push(eq(whatsappWebhookEvents.handlerExists, input.handlerExists));
      }

      const query =
        conditions.length > 0
          ? dbConn
              .select()
              .from(whatsappWebhookEvents)
              .where(and(...conditions))
          : dbConn.select().from(whatsappWebhookEvents);

      const events = await query
        .orderBy(desc(whatsappWebhookEvents.createdAt))
        .limit(input?.limit || 100);
      return events.map(toWebhookEventSummary);
    }),

  getUnhandledCount: webhookLogsProcedure.query(async () => {
    return db.getUnhandledWebhookEventsCount();
  }),

  getEventTypes: webhookLogsProcedure.query(async () => {
    return db.getUniqueEventTypes();
  }),

  markAsProcessed: webhooksManagementProcedure
    .input(z.object({ id: z.number(), handlerExists: z.boolean().default(true) }))
    .mutation(async ({ input }: { input: { id: number; handlerExists: boolean } }) => {
      await db.markWebhookEventAsProcessed(input.id, input.handlerExists);
      return { success: true };
    }),

  getStatsByType: webhookLogsProcedure.query(async () => {
    const dbConn = await db.getDb();
    if (!dbConn) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'قاعدة البيانات غير متاحة' });
    }
    const { whatsappWebhookEvents } = await import('../../../../../drizzle/schema');
    const { sql } = await import('drizzle-orm');

    const stats = await dbConn
      .select({
        eventType: whatsappWebhookEvents.eventType,
        count: sql<number>`count(*)`.as('count'),
      })
      .from(whatsappWebhookEvents)
      .groupBy(whatsappWebhookEvents.eventType);

    return stats;
  }),

  getEventsByCategory: webhookLogsProcedure
    .input(
      z.object({
        category: z.enum([
          'messages',
          'templates',
          'template_status',
          'account',
          'security',
          'quality',
          'subscriptions',
        ]),
        limit: z.number().int().min(1).max(100).default(50),
      })
    )
    .query(
      async ({
        input,
      }: {
        input: {
          category:
            | 'messages'
            | 'templates'
            | 'template_status'
            | 'account'
            | 'security'
            | 'quality'
            | 'subscriptions';
          limit: number;
        };
      }) => {
        const dbConn = await db.getDb();
        if (!dbConn) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'قاعدة البيانات غير متاحة',
          });
        }
        const { whatsappWebhookEvents } = await import('../../../../../drizzle/schema');
        const { like, desc } = await import('drizzle-orm');

        const categoryPatterns = {
          messages: 'message%',
          templates: 'message_template%',
          template_status: 'template_status%',
          account: 'account%',
          security: 'security',
          quality: 'quality%',
          subscriptions: 'opt%',
        };

        const events = await dbConn
          .select()
          .from(whatsappWebhookEvents)
          .where(like(whatsappWebhookEvents.eventType, categoryPatterns[input.category]))
          .orderBy(desc(whatsappWebhookEvents.createdAt))
          .limit(input.limit);
        return events.map(toWebhookEventSummary);
      }
    ),

  getTemplateEvents: webhookLogsProcedure
    .input(
      z.object({
        templateId: z.string().optional(),
        limit: z.number().int().min(1).max(100).default(100),
      })
    )
    .query(async ({ input }: { input: { templateId?: string; limit: number } }) => {
      const dbConn = await db.getDb();
      if (!dbConn) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'قاعدة البيانات غير متاحة',
        });
      }
      const { whatsappWebhookEvents } = await import('../../../../../drizzle/schema');
      const { like, desc } = await import('drizzle-orm');

      const query = dbConn
        .select()
        .from(whatsappWebhookEvents)
        .where(like(whatsappWebhookEvents.eventType, 'message_template%'));

      if (input.templateId) {
        const events = await query
          .orderBy(desc(whatsappWebhookEvents.createdAt))
          .limit(input.limit);
        return events
          .filter((e) => {
            try {
              const payload = JSON.parse(e.rawPayload);
              return payload.message_template_id === input.templateId;
            } catch {
              return false;
            }
          })
          .map(toWebhookEventSummary);
      }

      const events = await query.orderBy(desc(whatsappWebhookEvents.createdAt)).limit(input.limit);
      return events.map(toWebhookEventSummary);
    }),
});
