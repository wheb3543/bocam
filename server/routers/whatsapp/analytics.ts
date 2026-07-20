import { protectedProcedure, router } from '../../_core/trpc';
import { ensureDatabaseAvailable } from '../../_core/databaseGuard';
import { z } from 'zod';
import { createLogger } from '../../_core/logger';

const logger = createLogger('whatsapp-analytics');

export const analyticsRouter = router({
  getMessageStats: protectedProcedure.query(async () => {
    try {
      const dbConn = await ensureDatabaseAvailable();

      const { whatsappMessages } = await import('../../../drizzle/schema');
      const { gte } = await import('drizzle-orm');

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const messages = await dbConn
        .select()
        .from(whatsappMessages)
        .where(gte(whatsappMessages.createdAt, sevenDaysAgo));

      const days = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
      const dailyStats = days.map((day, index) => {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() - (6 - index));
        targetDate.setHours(0, 0, 0, 0);
        const nextDate = new Date(targetDate);
        nextDate.setDate(nextDate.getDate() + 1);

        const dayMessages = messages.filter((m: Record<string, unknown>) => {
          const msgDate = new Date(m.sentAt as Date);
          return msgDate >= targetDate && msgDate < nextDate;
        });

        return {
          name: day,
          sent: dayMessages.filter((m: Record<string, unknown>) => m.direction === 'outbound')
            .length,
          delivered: dayMessages.filter((m: Record<string, unknown>) => m.status === 'delivered')
            .length,
          failed: dayMessages.filter((m: Record<string, unknown>) => m.status === 'failed').length,
        };
      });

      const typeStats = [
        {
          name: 'نصية',
          value: messages.filter((m: Record<string, unknown>) => m.messageType === 'text').length,
        },
        {
          name: 'قوالب',
          value: messages.filter((m: Record<string, unknown>) => m.messageType === 'template')
            .length,
        },
        {
          name: 'وسائط',
          value: messages.filter((m: Record<string, unknown>) =>
            ['image', 'video', 'document', 'audio'].includes(m.messageType as string)
          ).length,
        },
        {
          name: 'تفاعلية',
          value: messages.filter((m: Record<string, unknown>) => m.messageType === 'interactive')
            .length,
        },
      ];

      const totalMessages = messages.length || 1;
      const typeStatsWithPercentage = typeStats.map((stat) => ({
        ...stat,
        value: Math.round((stat.value / totalMessages) * 100),
      }));

      return {
        success: true,
        dailyStats,
        typeStats: typeStatsWithPercentage,
      };
    } catch (error) {
      logger.error(error instanceof Error ? error.message : String(error));
      logger.error('Failed to get message stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        dailyStats: [],
        typeStats: [],
      };
    }
  }),

  getAuditLogs: protectedProcedure
    .input(
      z.object({
        phone: z.string().optional(),
        type: z.string().optional(),
        limit: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const { getAuditLogs } = await import('../../services/whatsappAuditLog');
      return getAuditLogs(input);
    }),

  getAuditStats: protectedProcedure.query(async () => {
    const { getAuditStats } = await import('../../services/whatsappAuditLog');
    return getAuditStats();
  }),

  exportAuditLogs: protectedProcedure
    .input(
      z.object({
        phone: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { exportAuditLogs } = await import('../../services/whatsappAuditLog');
      return exportAuditLogs(input);
    }),

  getNotificationLogs: protectedProcedure
    .input(
      z.object({
        entityType: z.enum(['appointment', 'camp_registration', 'offer_lead']).optional(),
        status: z.enum(['pending', 'sent', 'delivered', 'read', 'failed']).optional(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      const { getNotificationLogs } = await import('../../services/whatsappAppointments');
      return getNotificationLogs(input);
    }),

  getNotificationStats: protectedProcedure.query(async () => {
    const { getNotificationStats } = await import('../../services/whatsappAppointments');
    return getNotificationStats();
  }),

  getEntityWhatsAppStatus: protectedProcedure
    .input(
      z.object({
        entityType: z.enum(['appointment', 'camp_registration', 'offer_lead']),
        entityId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const { getEntityNotifications } = await import('../../services/whatsappAppointments');
      const result = await getEntityNotifications({
        entityType: input.entityType,
        entityId: input.entityId,
      });
      const notifications = result.notifications || [];
      const latest = notifications[notifications.length - 1] || null;
      return {
        hasSent: notifications.length > 0,
        status: latest?.status || null,
        sentAt: latest?.sentAt || null,
        messageId: latest?.messageId || null,
        count: notifications.length,
      };
    }),

  getConversationCosts: protectedProcedure
    .input(z.object({ startDate: z.string().optional(), endDate: z.string().optional() }))
    .query(async ({ input }) => {
      const dbConn = await ensureDatabaseAvailable();
      const { whatsappConversations } = await import('../../../drizzle/schema');
      const { desc, and, gte, lte } = await import('drizzle-orm');

      const conditions = [];
      if (input.startDate) {
        conditions.push(gte(whatsappConversations.createdAt, new Date(input.startDate)));
      }
      if (input.endDate) {
        conditions.push(lte(whatsappConversations.createdAt, new Date(input.endDate)));
      }

      const query =
        conditions.length > 0
          ? dbConn
              .select()
              .from(whatsappConversations)
              .where(and(...conditions))
          : dbConn.select().from(whatsappConversations);

      return query.orderBy(desc(whatsappConversations.createdAt)).limit(100);
    }),

  getContacts: protectedProcedure
    .input(z.object({ phoneNumber: z.string().optional(), limit: z.number().default(50) }))
    .query(async ({ input }) => {
      const dbConn = await ensureDatabaseAvailable();
      const { whatsappContacts } = await import('../../../drizzle/schema');
      const { desc, eq } = await import('drizzle-orm');

      const query = input.phoneNumber
        ? dbConn
            .select()
            .from(whatsappContacts)
            .where(eq(whatsappContacts.phoneNumber, input.phoneNumber))
        : dbConn.select().from(whatsappContacts);

      return query.orderBy(desc(whatsappContacts.createdAt)).limit(input.limit);
    }),

  getOrders: protectedProcedure
    .input(z.object({ status: z.string().optional(), limit: z.number().default(50) }))
    .query(async ({ input }) => {
      const dbConn = await ensureDatabaseAvailable();
      const { whatsappOrders } = await import('../../../drizzle/schema');
      const { desc, eq } = await import('drizzle-orm');

      const query = input.status
        ? dbConn
            .select()
            .from(whatsappOrders)
            // @ts-expect-error - Type mismatch between input.status and whatsappOrders.status
            .where(eq(whatsappOrders.status, input.status as string))
        : dbConn.select().from(whatsappOrders);

      return query.orderBy(desc(whatsappOrders.createdAt)).limit(input.limit);
    }),

  getReferrals: protectedProcedure
    .input(z.object({ sourceType: z.string().optional(), limit: z.number().default(50) }))
    .query(async ({ input }) => {
      const dbConn = await ensureDatabaseAvailable();
      const { whatsappReferrals } = await import('../../../drizzle/schema');
      const { desc, eq } = await import('drizzle-orm');

      const query = input.sourceType
        ? dbConn
            .select()
            .from(whatsappReferrals)
            .where(eq(whatsappReferrals.sourceType, input.sourceType))
        : dbConn.select().from(whatsappReferrals);

      return query.orderBy(desc(whatsappReferrals.createdAt)).limit(input.limit);
    }),

  getReactions: protectedProcedure
    .input(z.object({ emoji: z.string().optional(), limit: z.number().default(50) }))
    .query(async ({ input }) => {
      const dbConn = await ensureDatabaseAvailable();
      const { whatsappReactions } = await import('../../../drizzle/schema');
      const { desc, eq } = await import('drizzle-orm');

      const query = input.emoji
        ? dbConn.select().from(whatsappReactions).where(eq(whatsappReactions.emoji, input.emoji))
        : dbConn.select().from(whatsappReactions);

      return query.orderBy(desc(whatsappReactions.createdAt)).limit(input.limit);
    }),

  getTransactions: protectedProcedure
    .input(z.object({ status: z.string().optional(), limit: z.number().default(50) }))
    .query(async ({ input }) => {
      const dbConn = await ensureDatabaseAvailable();
      const { whatsappTransactions } = await import('../../../drizzle/schema');
      const { desc, eq } = await import('drizzle-orm');

      const query = input.status
        ? dbConn
            .select()
            .from(whatsappTransactions)
            .where(eq(whatsappTransactions.status, input.status as string))
        : dbConn.select().from(whatsappTransactions);

      return query.orderBy(desc(whatsappTransactions.createdAt)).limit(input.limit);
    }),
});
