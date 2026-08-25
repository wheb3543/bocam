/**
 * Color Scheme Router
 * Router لإدارة نظام الألوان
 */

import { z } from 'zod';
import { adminProcedure, router } from '../../_core/trpc';
import {
  contentCreateProcedure,
  contentReadProcedure,
  contentUpdateProcedure,
} from './authorization';
import { ensureDatabaseAvailable } from '../../_core/databaseGuard';
import { eq, and, like, or } from 'drizzle-orm';
import { colorScheme } from '../../../drizzle/schema';
import { createLogger } from '../../_core/logger';

const logger = createLogger('colorScheme');

/**
 * Schema للتحقق من بيانات الألوان
 */
const colorSchemeSchema = z.object({
  key: z.string().min(1).max(255),
  value: z.string().min(1).max(50),
  type: z.enum(['primary', 'secondary', 'accent', 'background', 'text', 'border']),
  shade: z.string().max(20).optional(),
  isActive: z.enum(['yes', 'no']).default('yes'),
});

export const colorSchemeRouter = router({
  /**
   * الحصول على جميع الألوان
   */
  list: contentReadProcedure
    .input(
      z.object({
        type: z.string().optional(),
        shade: z.string().optional(),
        isActive: z.enum(['yes', 'no']).optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await ensureDatabaseAvailable();

      const conditions = [];

      if (input.type) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        conditions.push(eq(colorScheme.type, input.type as any));
      }
      if (input.shade) {
        conditions.push(eq(colorScheme.shade, input.shade));
      }
      if (input.isActive) {
        conditions.push(eq(colorScheme.isActive, input.isActive));
      }
      if (input.search) {
        conditions.push(
          or(
            like(colorScheme.key, `%${input.search}%`),
            like(colorScheme.value, `%${input.search}%`)
          )
        );
      }

      const result = await db
        .select()
        .from(colorScheme)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(colorScheme.createdAt);

      return result;
    }),

  /**
   * الحصول على لون واحد بواسطة المفتاح
   */
  getByKey: contentReadProcedure.input(z.object({ key: z.string() })).query(async ({ input }) => {
    const db = await ensureDatabaseAvailable();

    const result = await db
      .select()
      .from(colorScheme)
      .where(eq(colorScheme.key, input.key))
      .limit(1);

    return result[0] || null;
  }),

  /**
   * الحصول على لون واحد بواسطة المعرف
   */
  getById: contentReadProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = await ensureDatabaseAvailable();

    const result = await db.select().from(colorScheme).where(eq(colorScheme.id, input.id)).limit(1);

    return result[0] || null;
  }),

  /**
   * إنشاء لون جديد
   */
  create: contentCreateProcedure.input(colorSchemeSchema).mutation(async ({ input }) => {
    const db = await ensureDatabaseAvailable();

    const insertId = await db
      .insert(colorScheme)
      .values({
        key: input.key,
        value: input.value,
        type: input.type,
        shade: input.shade,
        isActive: input.isActive,
      })
      .$returningId();

    logger.info(`Color scheme created: ${input.key}`);

    return { success: true, id: Number(insertId) };
  }),

  /**
   * تحديث لون موجود
   */
  update: contentUpdateProcedure
    .input(
      colorSchemeSchema.extend({
        id: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await ensureDatabaseAvailable();

      await db
        .update(colorScheme)
        .set({
          key: input.key,
          value: input.value,
          type: input.type,
          shade: input.shade,
          isActive: input.isActive,
        })
        .where(eq(colorScheme.id, input.id));

      logger.info(`Color scheme updated: ${input.id}`);

      return { success: true };
    }),

  /**
   * حذف لون
   */
  delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await ensureDatabaseAvailable();

    await db.delete(colorScheme).where(eq(colorScheme.id, input.id));

    logger.info(`Color scheme deleted: ${input.id}`);

    return { success: true };
  }),

  /**
   * الحصول على نظرة عامة على الألوان
   */
  getOverview: contentReadProcedure.query(async () => {
    const db = await ensureDatabaseAvailable();

    const allColors = await db.select().from(colorScheme);

    const total = allColors.length;
    const active = allColors.filter((c) => c.isActive === 'yes').length;

    return {
      total,
      active,
      inactive: total - active,
    };
  }),
});
