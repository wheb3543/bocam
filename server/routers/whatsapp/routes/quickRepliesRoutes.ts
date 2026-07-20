/**
 * Quick Replies Routes
 * مسارات الردود السريعة
 */

import { TRPCError } from '@trpc/server';
import * as db from '../../../database/db';

interface Context {
  user: {
    id: number;
  };
}

export const quickRepliesRoutes = {
  list: async () => {
    const dbConn = await db.getDb();
    if (!dbConn) {
      return [];
    }
    const { quickReplies } = await import('../../../../drizzle/schema');
    return dbConn.select().from(quickReplies).orderBy(quickReplies.name);
  },

  create: async ({ input, ctx }: { input: Record<string, unknown>; ctx: Context }) => {
    const dbConn = await db.getDb();
    if (!dbConn) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'قاعدة البيانات غير متاحة',
      });
    }
    const { quickReplies } = await import('../../../../drizzle/schema');
    const insertId = await dbConn
      .insert(quickReplies)
      .values({
        name: input.name as string,
        content: input.content as string,
        category: input.category as string | undefined,
        createdBy: ctx.user.id,
      })
      .$returningId();
    return { id: insertId, ...input };
  },

  update: async ({ input }: { input: Record<string, unknown> }) => {
    const dbConn = await db.getDb();
    if (!dbConn) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'قاعدة البيانات غير متاحة',
      });
    }
    const { quickReplies } = await import('../../../../drizzle/schema');
    const { eq } = await import('drizzle-orm');
    const { id, ...updateData } = input;
    await dbConn
      .update(quickReplies)
      .set(updateData)
      .where(eq(quickReplies.id, id as number));
    return { success: true };
  },

  delete: async ({ input }: { input: Record<string, unknown> }) => {
    const dbConn = await db.getDb();
    if (!dbConn) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'قاعدة البيانات غير متاحة' });
    }
    const { quickReplies } = await import('../../../../drizzle/schema');
    const { eq } = await import('drizzle-orm');
    await dbConn.delete(quickReplies).where(eq(quickReplies.id, input.id as number));
    return { success: true };
  },
};
