import { z } from 'zod';
import { router, protectedProcedure } from '../_core/trpc';

export const whatsappBroadcastsRouter = router({
  list: protectedProcedure
    .query(async () => {
      const { getDb } = await import('../db');
      const db = await getDb();
      if (!db) return [];
      const { whatsappBroadcasts } = await import('../../drizzle/schema');
      return db.select().from(whatsappBroadcasts).orderBy(whatsappBroadcasts.createdAt);
    }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const { getDb } = await import('../db');
      const db = await getDb();
      if (!db) return null;
      const { whatsappBroadcasts } = await import('../../drizzle/schema');
      const res = await db.select().from(whatsappBroadcasts).where(whatsappBroadcasts.id.eq(input.id)).limit(1 as any);
      return res[0] || null;
    }),

  create: protectedProcedure
    .input(z.object({ name: z.string(), message: z.string(), templateId: z.number().optional(), targetFilter: z.string().optional(), scheduledAt: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { getDb } = await import('../db');
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const { whatsappBroadcasts } = await import('../../drizzle/schema');
      const result = await db.insert(whatsappBroadcasts).values({
        name: input.name,
        message: input.message,
        templateId: input.templateId || null,
        targetFilter: input.targetFilter || null,
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
        createdBy: ctx.user.id,
      } as any);
      return { success: true, id: result[0]?.insertId || null };
    }),

  update: protectedProcedure
    .input(z.object({ id: z.number(), name: z.string().optional(), message: z.string().optional(), templateId: z.number().nullable().optional(), targetFilter: z.string().nullable().optional(), scheduledAt: z.string().nullable().optional(), status: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const { getDb } = await import('../db');
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const { whatsappBroadcasts } = await import('../../drizzle/schema');
      const updateObj: any = {};
      if (typeof input.name !== 'undefined') updateObj.name = input.name;
      if (typeof input.message !== 'undefined') updateObj.message = input.message;
      if (typeof input.templateId !== 'undefined') updateObj.templateId = input.templateId;
      if (typeof input.targetFilter !== 'undefined') updateObj.targetFilter = input.targetFilter;
      if (typeof input.scheduledAt !== 'undefined') updateObj.scheduledAt = input.scheduledAt ? new Date(input.scheduledAt) : null;
      if (typeof input.status !== 'undefined') updateObj.status = input.status;

      await db.update(whatsappBroadcasts).set(updateObj).where(whatsappBroadcasts.id.eq(input.id));
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const { getDb } = await import('../db');
      const db = await getDb();
      if (!db) throw new Error('Database not available');
      const { whatsappBroadcasts } = await import('../../drizzle/schema');
      await db.delete(whatsappBroadcasts).where(whatsappBroadcasts.id.eq(input.id));
      return { success: true };
    })
});
