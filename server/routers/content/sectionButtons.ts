/**
 * Section Buttons Router
 * Router لإدارة أزرار الأقسام
 */

import { z } from 'zod';
import { adminProcedure, router } from '../../_core/trpc';
import { contentEditProcedure, contentReadProcedure } from './authorization';
import { ensureDatabaseAvailable } from '../../_core/databaseGuard';
import { eq, and, like, or } from 'drizzle-orm';
import { sectionButtons } from '../../../drizzle/schema';
import { createLogger } from '../../_core/logger';

const logger = createLogger('sectionButtons');

/**
 * Schema للتحقق من بيانات أزرار الأقسام
 */
const sectionButtonSchema = z.object({
  sectionId: z.number(),
  textAr: z.string().min(1).max(255),
  textEn: z.string().min(1).max(255),
  link: z.string().min(1).max(500),
  style: z.enum(['primary', 'secondary', 'outline', 'ghost']).default('primary'),
  sortOrder: z.number().default(0),
  isActive: z.enum(['yes', 'no']).default('yes'),
});

export const sectionButtonsRouter = router({
  /**
   * الحصول على جميع أزرار الأقسام
   */
  list: contentReadProcedure
    .input(
      z.object({
        sectionId: z.number().optional(),
        style: z.enum(['primary', 'secondary', 'outline', 'ghost']).optional(),
        isActive: z.enum(['yes', 'no']).optional(),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await ensureDatabaseAvailable();

      const conditions = [];

      if (input.sectionId) {
        conditions.push(eq(sectionButtons.sectionId, input.sectionId));
      }
      if (input.style) {
        conditions.push(eq(sectionButtons.style, input.style));
      }
      if (input.isActive) {
        conditions.push(eq(sectionButtons.isActive, input.isActive));
      }
      if (input.search) {
        conditions.push(
          or(
            like(sectionButtons.textAr, `%${input.search}%`),
            like(sectionButtons.textEn, `%${input.search}%`),
            like(sectionButtons.link, `%${input.search}%`)
          )
        );
      }

      const result = await db
        .select()
        .from(sectionButtons)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(sectionButtons.sortOrder);

      return result;
    }),

  /**
   * الحصول على زر واحد بواسطة المعرف
   */
  getById: contentReadProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = await ensureDatabaseAvailable();

    const result = await db
      .select()
      .from(sectionButtons)
      .where(eq(sectionButtons.id, input.id))
      .limit(1);

    return result[0] || null;
  }),

  /**
   * الحصول على أزرار قسم معين
   */
  getBySectionId: contentReadProcedure
    .input(z.object({ sectionId: z.number() }))
    .query(async ({ input }) => {
      const db = await ensureDatabaseAvailable();

      const result = await db
        .select()
        .from(sectionButtons)
        .where(eq(sectionButtons.sectionId, input.sectionId))
        .orderBy(sectionButtons.sortOrder);

      return result;
    }),

  /**
   * الحصول على الأزرار النشطة لقسم معين
   */
  getActiveBySectionId: contentReadProcedure
    .input(z.object({ sectionId: z.number() }))
    .query(async ({ input }) => {
      const db = await ensureDatabaseAvailable();

      const result = await db
        .select()
        .from(sectionButtons)
        .where(
          and(eq(sectionButtons.sectionId, input.sectionId), eq(sectionButtons.isActive, 'yes'))
        )
        .orderBy(sectionButtons.sortOrder);

      return result;
    }),

  /**
   * إنشاء زر جديد
   */
  create: contentEditProcedure.input(sectionButtonSchema).mutation(async ({ input }) => {
    const db = await ensureDatabaseAvailable();

    const insertId = await db
      .insert(sectionButtons)
      .values({
        sectionId: input.sectionId,
        textAr: input.textAr,
        textEn: input.textEn,
        link: input.link,
        style: input.style,
        sortOrder: input.sortOrder,
        isActive: input.isActive,
      })
      .$returningId();

    logger.info(`Section button created: ${input.textAr}`);

    return { success: true, id: Number(insertId) };
  }),

  /**
   * تحديث زر موجود
   */
  update: contentEditProcedure
    .input(
      sectionButtonSchema.extend({
        id: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await ensureDatabaseAvailable();

      await db
        .update(sectionButtons)
        .set({
          sectionId: input.sectionId,
          textAr: input.textAr,
          textEn: input.textEn,
          link: input.link,
          style: input.style,
          sortOrder: input.sortOrder,
          isActive: input.isActive,
        })
        .where(eq(sectionButtons.id, input.id));

      logger.info(`Section button updated: ${input.id}`);

      return { success: true };
    }),

  /**
   * حذف زر
   */
  delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await ensureDatabaseAvailable();

    await db.delete(sectionButtons).where(eq(sectionButtons.id, input.id));

    logger.info(`Section button deleted: ${input.id}`);

    return { success: true };
  }),

  /**
   * تحديث ترتيب الأزرار
   */
  reorder: contentEditProcedure
    .input(
      z.object({
        buttons: z.array(
          z.object({
            id: z.number(),
            sortOrder: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const db = await ensureDatabaseAvailable();

      for (const button of input.buttons) {
        await db
          .update(sectionButtons)
          .set({ sortOrder: button.sortOrder })
          .where(eq(sectionButtons.id, button.id));
      }

      logger.info(`Section buttons reordered: ${input.buttons.length} buttons`);

      return { success: true };
    }),

  /**
   * الحصول على نظرة عامة على أزرار الأقسام
   */
  getOverview: contentReadProcedure.query(async () => {
    const db = await ensureDatabaseAvailable();

    const allButtons = await db.select().from(sectionButtons);

    const total = allButtons.length;
    const active = allButtons.filter((b) => b.isActive === 'yes').length;

    // Count by style
    const styleCounts: Record<string, number> = {};
    allButtons.forEach((b) => {
      styleCounts[b.style] = (styleCounts[b.style] || 0) + 1;
    });

    return {
      total,
      active,
      inactive: total - active,
      styleCounts,
    };
  }),
});
