/**
 * Section Buttons Router
 * دورة إدارة أزرار الأقسام ضمن نظام CMS.
 */

import { z } from 'zod';
import { adminProcedure, router } from '../../_core/trpc';
import {
  assertContentCapability,
  contentEditProcedure,
  contentPublishProcedure,
  contentReadProcedure,
} from './authorization';
import { ensureDatabaseAvailable } from '../../_core/databaseGuard';
import { and, desc, eq, isNotNull, isNull, like, or } from 'drizzle-orm';
import { contentVersions, sectionButtons } from '../../../drizzle/schema';
import { createLogger } from '../../_core/logger';
import { auditLogService } from '../../services/content/auditLogService';
import { assertPublicationQuality } from '../../services/content/publicationQualityGate';
import { invalidateAdminSectionsCache } from './sections';

const logger = createLogger('sectionButtons');

const buttonStatusSchema = z.enum(['draft', 'published', 'archived']);

const sectionButtonSchema = z.object({
  sectionId: z.number(),
  textAr: z.string().min(1).max(255),
  textEn: z.string().min(1).max(255),
  link: z.string().min(1).max(500),
  style: z.enum(['primary', 'secondary', 'outline', 'ghost']).default('primary'),
  sortOrder: z.number().default(0),
  isActive: z.enum(['yes', 'no']).default('yes'),
  status: buttonStatusSchema.default('draft'),
  publishedAt: z.date().optional(),
  qualityOverrideReason: z.string().max(500).optional(),
});

type SectionButtonRow = typeof sectionButtons.$inferSelect;

async function saveButtonVersion(
  db: any,
  button: SectionButtonRow,
  userId: number | undefined,
  reason: string
) {
  const [latest] = await db
    .select({ versionNumber: contentVersions.versionNumber })
    .from(contentVersions)
    .where(
      and(eq(contentVersions.entityType, 'sectionButton'), eq(contentVersions.entityId, button.id))
    )
    .orderBy(desc(contentVersions.versionNumber))
    .limit(1);

  await db.insert(contentVersions).values({
    entityType: 'sectionButton',
    entityId: button.id,
    versionNumber: (latest?.versionNumber ?? 0) + 1,
    data: JSON.stringify(button),
    userId: userId ?? null,
    reason,
  });
}

async function getButtonOrThrow(db: any, id: number): Promise<SectionButtonRow> {
  const [button] = await db
    .select()
    .from(sectionButtons)
    .where(and(eq(sectionButtons.id, id), isNull(sectionButtons.deletedAt)))
    .limit(1);

  if (!button) {
    throw new Error('زر القسم غير موجود أو تم حذفه.');
  }
  return button;
}

export const sectionButtonsRouter = router({
  list: contentReadProcedure
    .input(
      z.object({
        sectionId: z.number().optional(),
        style: z.enum(['primary', 'secondary', 'outline', 'ghost']).optional(),
        isActive: z.enum(['yes', 'no']).optional(),
        status: buttonStatusSchema.optional(),
        includeDeleted: z.boolean().optional().default(false),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await ensureDatabaseAvailable();
      const conditions = [
        input.includeDeleted
          ? isNotNull(sectionButtons.deletedAt)
          : isNull(sectionButtons.deletedAt),
      ];

      if (input.sectionId) {
        conditions.push(eq(sectionButtons.sectionId, input.sectionId));
      }
      if (input.style) {
        conditions.push(eq(sectionButtons.style, input.style));
      }
      if (input.isActive) {
        conditions.push(eq(sectionButtons.isActive, input.isActive));
      }
      if (input.status) {
        conditions.push(eq(sectionButtons.status, input.status));
      }
      if (input.search) {
        const searchCondition = or(
          like(sectionButtons.textAr, `%${input.search}%`),
          like(sectionButtons.textEn, `%${input.search}%`),
          like(sectionButtons.link, `%${input.search}%`)
        );
        if (searchCondition) {
          conditions.push(searchCondition);
        }
      }

      return db
        .select()
        .from(sectionButtons)
        .where(and(...conditions))
        .orderBy(sectionButtons.sortOrder);
    }),

  getById: contentReadProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = await ensureDatabaseAvailable();
    const [button] = await db
      .select()
      .from(sectionButtons)
      .where(and(eq(sectionButtons.id, input.id), isNull(sectionButtons.deletedAt)))
      .limit(1);
    return button ?? null;
  }),

  getBySectionId: contentReadProcedure
    .input(z.object({ sectionId: z.number() }))
    .query(async ({ input }) => {
      const db = await ensureDatabaseAvailable();
      return db
        .select()
        .from(sectionButtons)
        .where(and(eq(sectionButtons.sectionId, input.sectionId), isNull(sectionButtons.deletedAt)))
        .orderBy(sectionButtons.sortOrder);
    }),

  getActiveBySectionId: contentReadProcedure
    .input(z.object({ sectionId: z.number() }))
    .query(async ({ input }) => {
      const db = await ensureDatabaseAvailable();
      return db
        .select()
        .from(sectionButtons)
        .where(
          and(
            eq(sectionButtons.sectionId, input.sectionId),
            eq(sectionButtons.isActive, 'yes'),
            eq(sectionButtons.status, 'published'),
            isNull(sectionButtons.deletedAt)
          )
        )
        .orderBy(sectionButtons.sortOrder);
    }),

  create: contentEditProcedure.input(sectionButtonSchema).mutation(async ({ input, ctx }) => {
    const db = await ensureDatabaseAvailable();
    let qualityOverridden = false;

    if (input.status === 'published') {
      assertContentCapability(ctx.user.role, 'publish');
      const quality = await assertPublicationQuality(db, {
        entityType: 'sectionButton',
        candidate: input,
        role: ctx.user.role,
        userId: ctx.user.id,
        overrideReason: input.qualityOverrideReason,
      });
      qualityOverridden = quality.overridden;
    }

    const inserted = await db
      .insert(sectionButtons)
      .values({
        sectionId: input.sectionId,
        textAr: input.textAr,
        textEn: input.textEn,
        link: input.link,
        style: input.style,
        sortOrder: input.sortOrder,
        isActive: input.isActive,
        status: input.status,
        publishedAt: input.status === 'published' ? new Date() : input.publishedAt,
      })
      .$returningId();
    const id = Number(inserted);
    const button = await getButtonOrThrow(db, id);

    await auditLogService.logChange(db, {
      entityType: 'sectionButton',
      entityId: id,
      action: 'create',
      userId: ctx.user.id,
      newValue: JSON.stringify(button),
      reason: qualityOverridden
        ? `تجاوز جودة النشر: ${input.qualityOverrideReason?.trim()}`
        : undefined,
    });
    await saveButtonVersion(db, button, ctx.user.id, 'إنشاء زر القسم');
    await invalidateAdminSectionsCache();

    logger.info(`Section button created: ${id}`);
    return { success: true, id, qualityOverride: qualityOverridden };
  }),

  update: contentEditProcedure
    .input(sectionButtonSchema.extend({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDatabaseAvailable();
      const previous = await getButtonOrThrow(db, input.id);
      let qualityOverridden = false;

      if (input.status === 'published') {
        assertContentCapability(ctx.user.role, 'publish');
        const quality = await assertPublicationQuality(db, {
          entityType: 'sectionButton',
          entityId: input.id,
          candidate: input,
          role: ctx.user.role,
          userId: ctx.user.id,
          overrideReason: input.qualityOverrideReason,
        });
        qualityOverridden = quality.overridden;
      }

      await saveButtonVersion(db, previous, ctx.user.id, 'نسخة قبل تحديث زر القسم');
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
          status: input.status,
          publishedAt: input.status === 'published' ? new Date() : input.publishedAt,
        })
        .where(eq(sectionButtons.id, input.id));
      const current = await getButtonOrThrow(db, input.id);

      await auditLogService.logChange(db, {
        entityType: 'sectionButton',
        entityId: input.id,
        action: 'update',
        userId: ctx.user.id,
        oldValue: JSON.stringify(previous),
        newValue: JSON.stringify(current),
        reason: qualityOverridden
          ? `تجاوز جودة النشر: ${input.qualityOverrideReason?.trim()}`
          : undefined,
      });
      await invalidateAdminSectionsCache();

      logger.info(`Section button updated: ${input.id}`);
      return { success: true, qualityOverride: qualityOverridden };
    }),

  publish: contentPublishProcedure
    .input(z.object({ id: z.number(), qualityOverrideReason: z.string().max(500).optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDatabaseAvailable();
      const button = await getButtonOrThrow(db, input.id);
      const quality = await assertPublicationQuality(db, {
        entityType: 'sectionButton',
        entityId: input.id,
        candidate: button,
        role: ctx.user.role,
        userId: ctx.user.id,
        overrideReason: input.qualityOverrideReason,
      });

      await saveButtonVersion(db, button, ctx.user.id, 'نسخة قبل نشر زر القسم');
      await db
        .update(sectionButtons)
        .set({ status: 'published', publishedAt: new Date() })
        .where(eq(sectionButtons.id, input.id));
      const current = await getButtonOrThrow(db, input.id);
      await auditLogService.logChange(db, {
        entityType: 'sectionButton',
        entityId: input.id,
        action: 'update',
        userId: ctx.user.id,
        oldValue: JSON.stringify(button),
        newValue: JSON.stringify(current),
        reason: quality.overridden
          ? `تجاوز جودة النشر: ${input.qualityOverrideReason?.trim()}`
          : 'نشر زر القسم',
      });
      await invalidateAdminSectionsCache();

      return { success: true, qualityOverride: quality.overridden };
    }),

  archive: contentPublishProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDatabaseAvailable();
      const button = await getButtonOrThrow(db, input.id);
      await saveButtonVersion(db, button, ctx.user.id, 'نسخة قبل أرشفة زر القسم');
      await db
        .update(sectionButtons)
        .set({ status: 'archived' })
        .where(eq(sectionButtons.id, input.id));
      await auditLogService.logChange(db, {
        entityType: 'sectionButton',
        entityId: input.id,
        action: 'update',
        userId: ctx.user.id,
        oldValue: JSON.stringify(button),
        newValue: JSON.stringify({ ...button, status: 'archived' }),
        reason: 'أرشفة زر القسم',
      });
      await invalidateAdminSectionsCache();
      return { success: true };
    }),

  delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    const db = await ensureDatabaseAvailable();
    const button = await getButtonOrThrow(db, input.id);
    await saveButtonVersion(db, button, ctx.user.id, 'نسخة قبل حذف زر القسم');
    await db
      .update(sectionButtons)
      .set({ deletedAt: new Date() })
      .where(eq(sectionButtons.id, input.id));
    await auditLogService.logChange(db, {
      entityType: 'sectionButton',
      entityId: input.id,
      action: 'delete',
      userId: ctx.user.id,
      oldValue: JSON.stringify(button),
      reason: 'حذف ناعم لزر القسم',
    });
    await invalidateAdminSectionsCache();
    return { success: true };
  }),

  restore: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    const db = await ensureDatabaseAvailable();
    const [button] = await db
      .select()
      .from(sectionButtons)
      .where(eq(sectionButtons.id, input.id))
      .limit(1);
    if (!button) {
      throw new Error('زر القسم غير موجود.');
    }

    await db
      .update(sectionButtons)
      .set({ deletedAt: null, status: 'draft', publishedAt: null })
      .where(eq(sectionButtons.id, input.id));
    await auditLogService.logChange(db, {
      entityType: 'sectionButton',
      entityId: input.id,
      action: 'update',
      userId: ctx.user.id,
      oldValue: JSON.stringify(button),
      newValue: JSON.stringify({ ...button, deletedAt: null, status: 'draft', publishedAt: null }),
      reason: 'استعادة زر القسم كمسودة',
    });
    await invalidateAdminSectionsCache();
    return { success: true };
  }),

  duplicate: contentEditProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDatabaseAvailable();
      const button = await getButtonOrThrow(db, input.id);
      const inserted = await db
        .insert(sectionButtons)
        .values({
          sectionId: button.sectionId,
          textAr: `${button.textAr} (نسخة)`,
          textEn: `${button.textEn} (Copy)`,
          link: button.link,
          style: button.style,
          sortOrder: button.sortOrder + 1,
          isActive: 'no',
          status: 'draft',
          publishedAt: null,
        })
        .$returningId();
      const id = Number(inserted);
      const copy = await getButtonOrThrow(db, id);
      await auditLogService.logChange(db, {
        entityType: 'sectionButton',
        entityId: id,
        action: 'create',
        userId: ctx.user.id,
        newValue: JSON.stringify(copy),
        reason: `نسخة من زر القسم ${button.id}`,
      });
      await saveButtonVersion(db, copy, ctx.user.id, 'إنشاء نسخة من زر القسم');
      await invalidateAdminSectionsCache();
      return { success: true, id };
    }),

  reorder: contentEditProcedure
    .input(z.object({ buttons: z.array(z.object({ id: z.number(), sortOrder: z.number() })) }))
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDatabaseAvailable();
      for (const button of input.buttons) {
        const previous = await getButtonOrThrow(db, button.id);
        await db
          .update(sectionButtons)
          .set({ sortOrder: button.sortOrder })
          .where(eq(sectionButtons.id, button.id));
        await auditLogService.logChange(db, {
          entityType: 'sectionButton',
          entityId: button.id,
          action: 'update',
          userId: ctx.user.id,
          oldValue: JSON.stringify(previous),
          newValue: JSON.stringify({ ...previous, sortOrder: button.sortOrder }),
          reason: 'تعديل ترتيب أزرار القسم',
        });
      }
      await invalidateAdminSectionsCache();
      return { success: true };
    }),

  getOverview: contentReadProcedure.query(async () => {
    const db = await ensureDatabaseAvailable();
    const allButtons = await db
      .select()
      .from(sectionButtons)
      .where(isNull(sectionButtons.deletedAt));
    const total = allButtons.length;
    const active = allButtons.filter((button) => button.isActive === 'yes').length;
    const published = allButtons.filter((button) => button.status === 'published').length;
    const styleCounts = allButtons.reduce<Record<string, number>>((counts, button) => {
      counts[button.style] = (counts[button.style] ?? 0) + 1;
      return counts;
    }, {});

    return { total, active, inactive: total - active, published, styleCounts };
  }),
});
