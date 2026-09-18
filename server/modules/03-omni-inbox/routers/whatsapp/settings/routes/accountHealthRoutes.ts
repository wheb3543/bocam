/**
 * WhatsApp Account Health Routes
 * مسارات صحة الحساب وتنبيهات أمان واتساب
 */

import { router } from '../../../../../../_core/trpc';
import { ensureDatabaseAvailable } from '../../../../../../_core/databaseGuard';
import { z } from 'zod';
import { permissionProcedure } from '../../../../../../routers/permissionProcedures';

const accountHealthViewProcedure = permissionProcedure(
  'communications.security.view',
  'عرض صحة حساب WhatsApp'
);
const accountHealthManageProcedure = permissionProcedure(
  'communications.security.manage',
  'إدارة تنبيهات WhatsApp'
);

export const accountHealthRouter = router({
  getAlerts: accountHealthViewProcedure
    .input(
      z
        .object({
          severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
          resolved: z.boolean().optional(),
          limit: z.number().default(50),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const dbConn = await ensureDatabaseAvailable();
      const { whatsappAccountAlerts } = await import('../../../../../../../drizzle/schema');
      const { eq, and, desc } = await import('drizzle-orm');

      const conditions = [];
      if (input?.severity) {
        conditions.push(eq(whatsappAccountAlerts.severity, input.severity));
      }
      if (input?.resolved !== undefined) {
        conditions.push(eq(whatsappAccountAlerts.resolved, input.resolved));
      }

      const query =
        conditions.length > 0
          ? dbConn
              .select()
              .from(whatsappAccountAlerts)
              .where(and(...conditions))
          : dbConn.select().from(whatsappAccountAlerts);

      return query.orderBy(desc(whatsappAccountAlerts.createdAt)).limit(input?.limit || 50);
    }),

  getAlertStats: accountHealthViewProcedure.query(async () => {
    const dbConn = await ensureDatabaseAvailable();
    const { whatsappAccountAlerts, whatsappSecurityEvents } =
      await import('../../../../../../../drizzle/schema');
    const { sql } = await import('drizzle-orm');
    const [alerts, security] = await Promise.all([
      dbConn
        .select({
          severity: whatsappAccountAlerts.severity,
          resolved: whatsappAccountAlerts.resolved,
          count: sql<number>`count(*)`.as('count'),
        })
        .from(whatsappAccountAlerts)
        .groupBy(whatsappAccountAlerts.severity, whatsappAccountAlerts.resolved),
      dbConn.select({ count: sql<number>`count(*)`.as('count') }).from(whatsappSecurityEvents),
    ]);
    const getCount = (severity: 'critical' | 'high' | 'medium' | 'low', resolved: boolean) =>
      Number(
        alerts.find((item) => item.severity === severity && item.resolved === resolved)?.count || 0
      );
    return {
      criticalOpen: getCount('critical', false),
      highOpen: getCount('high', false),
      mediumOpen: getCount('medium', false),
      lowOpen: getCount('low', false),
      resolvedTotal: alerts
        .filter((item) => item.resolved)
        .reduce((total, item) => total + Number(item.count || 0), 0),
      securityTotal: Number(security[0]?.count || 0),
    };
  }),

  resolveAlert: accountHealthManageProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const dbConn = await ensureDatabaseAvailable();
      const { whatsappAccountAlerts } = await import('../../../../../../../drizzle/schema');
      const { eq } = await import('drizzle-orm');

      await dbConn
        .update(whatsappAccountAlerts)
        .set({
          resolved: true,
          resolvedAt: new Date(),
          resolvedBy: ctx.user.id,
        })
        .where(eq(whatsappAccountAlerts.id, input.id));

      return { success: true };
    }),

  getSecurityEvents: accountHealthViewProcedure
    .input(
      z
        .object({
          severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
          limit: z.number().default(50),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const dbConn = await ensureDatabaseAvailable();
      const { whatsappSecurityEvents } = await import('../../../../../../../drizzle/schema');
      const { eq, desc } = await import('drizzle-orm');

      const query = input?.severity
        ? dbConn
            .select()
            .from(whatsappSecurityEvents)
            .where(eq(whatsappSecurityEvents.severity, input.severity))
        : dbConn.select().from(whatsappSecurityEvents);

      return query.orderBy(desc(whatsappSecurityEvents.createdAt)).limit(input?.limit || 50);
    }),

  getCustomerServiceWindow: accountHealthViewProcedure.query(async () => {
    const dbConn = await ensureDatabaseAvailable();
    const { whatsappConversations } = await import('../../../../../../../drizzle/schema');
    const { and, desc, isNotNull, lt, sql } = await import('drizzle-orm');
    const now = new Date();
    const expiredCondition = and(
      isNotNull(whatsappConversations.expirationTimestamp),
      lt(whatsappConversations.expirationTimestamp, now)
    );
    const [countResult, items] = await Promise.all([
      dbConn
        .select({ count: sql<number>`count(*)`.as('count') })
        .from(whatsappConversations)
        .where(expiredCondition),
      dbConn
        .select({
          id: whatsappConversations.id,
          customerName: whatsappConversations.customerName,
          phoneNumber: whatsappConversations.phoneNumber,
          expirationTimestamp: whatsappConversations.expirationTimestamp,
        })
        .from(whatsappConversations)
        .where(expiredCondition)
        .orderBy(desc(whatsappConversations.expirationTimestamp))
        .limit(5),
    ]);
    return { count: Number(countResult[0]?.count || 0), items };
  }),
});
