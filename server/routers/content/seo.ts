/**
 * SEO Settings Router
 * دورة إدارة SEO ضمن CMS: مسودة ونشر وأرشفة وحذف ناعم واستعادة.
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
import {
  contentApprovals,
  contentVersions,
  seoSettings,
  type SEOSettings,
} from '../../../drizzle/schema';
import { createLogger } from '../../_core/logger';
import { invalidateSEOCache } from '../public/content';
import { auditLogService } from '../../services/content/auditLogService';
import {
  assertPublicationQuality,
  evaluatePublicationQuality,
  getPublicationQualityScore,
} from '../../services/content/publicationQualityGate';

const logger = createLogger('seoSettings');
const seoStatusSchema = z.enum(['draft', 'published', 'archived']);

const seoSettingsSchema = z.object({
  pageId: z.number().int().nullable().optional(),
  pageKey: z.string().min(1).max(255).nullable().optional(),
  slug: z.string().min(1).max(255).nullable().optional(),
  language: z.string().min(1).max(10),
  title: z.string().max(255).nullable().optional(),
  description: z.string().nullable().optional(),
  keywords: z.string().nullable().optional(),
  ogTitle: z.string().max(255).nullable().optional(),
  ogDescription: z.string().nullable().optional(),
  ogImage: z.string().max(500).nullable().optional(),
  canonicalUrl: z.string().max(500).nullable().optional(),
  robots: z.string().nullable().optional(),
  structuredData: z.string().nullable().optional(),
  isActive: z.enum(['yes', 'no']).default('yes'),
  status: seoStatusSchema.default('draft'),
  publishedAt: z.coerce.date().nullable().optional(),
  qualityOverrideReason: z.string().max(500).optional(),
});

async function saveSeoVersion(
  db: any,
  seo: SEOSettings,
  userId: number | undefined,
  reason: string
) {
  const [latest] = await db
    .select({ versionNumber: contentVersions.versionNumber })
    .from(contentVersions)
    .where(and(eq(contentVersions.entityType, 'seo'), eq(contentVersions.entityId, seo.id)))
    .orderBy(desc(contentVersions.versionNumber))
    .limit(1);
  await db.insert(contentVersions).values({
    entityType: 'seo',
    entityId: seo.id,
    versionNumber: (latest?.versionNumber ?? 0) + 1,
    data: JSON.stringify(seo),
    userId: userId ?? null,
    reason,
  });
}

async function getSeoOrThrow(db: any, id: number): Promise<SEOSettings> {
  const [seo] = await db
    .select()
    .from(seoSettings)
    .where(and(eq(seoSettings.id, id), isNull(seoSettings.deletedAt)))
    .limit(1);
  if (!seo) {
    throw new Error('إعداد SEO غير موجود أو تم حذفه.');
  }
  return seo;
}

function toSeoValues(input: z.infer<typeof seoSettingsSchema>, publishingNow = false) {
  return {
    pageId: input.pageId ?? null,
    pageKey: input.pageKey ?? null,
    slug: input.slug ?? null,
    language: input.language,
    title: input.title ?? null,
    description: input.description ?? null,
    keywords: input.keywords ?? null,
    ogTitle: input.ogTitle ?? null,
    ogDescription: input.ogDescription ?? null,
    ogImage: input.ogImage ?? null,
    canonicalUrl: input.canonicalUrl ?? null,
    robots: input.robots ?? null,
    structuredData: input.structuredData ?? null,
    isActive: input.isActive,
    status: input.status,
    publishedAt:
      input.status === 'published' && publishingNow ? new Date() : (input.publishedAt ?? null),
  };
}

export const seoSettingsRouter = router({
  list: contentReadProcedure
    .input(
      z.object({
        language: z.string().optional(),
        isActive: z.enum(['yes', 'no']).optional(),
        status: seoStatusSchema.optional(),
        includeDeleted: z.boolean().optional().default(false),
        search: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await ensureDatabaseAvailable();
      const conditions = [
        input.includeDeleted ? isNotNull(seoSettings.deletedAt) : isNull(seoSettings.deletedAt),
      ];
      if (input.language) {
        conditions.push(eq(seoSettings.language, input.language));
      }
      if (input.isActive) {
        conditions.push(eq(seoSettings.isActive, input.isActive));
      }
      if (input.status) {
        conditions.push(eq(seoSettings.status, input.status));
      }
      if (input.search) {
        const searchCondition = or(
          like(seoSettings.pageKey, `%${input.search}%`),
          like(seoSettings.slug, `%${input.search}%`),
          like(seoSettings.title, `%${input.search}%`)
        );
        if (searchCondition) {
          conditions.push(searchCondition);
        }
      }
      return db
        .select()
        .from(seoSettings)
        .where(and(...conditions))
        .orderBy(seoSettings.createdAt);
    }),

  getByPageId: contentReadProcedure
    .input(z.object({ pageId: z.number(), language: z.string().optional() }))
    .query(async ({ input }) => {
      const db = await ensureDatabaseAvailable();
      const conditions = [eq(seoSettings.pageId, input.pageId), isNull(seoSettings.deletedAt)];
      if (input.language) {
        conditions.push(eq(seoSettings.language, input.language));
      }
      const [seo] = await db
        .select()
        .from(seoSettings)
        .where(and(...conditions))
        .limit(1);
      return seo ?? null;
    }),

  getByPageKey: contentReadProcedure
    .input(z.object({ pageKey: z.string(), language: z.string().optional() }))
    .query(async ({ input }) => {
      const db = await ensureDatabaseAvailable();
      const conditions = [eq(seoSettings.pageKey, input.pageKey), isNull(seoSettings.deletedAt)];
      if (input.language) {
        conditions.push(eq(seoSettings.language, input.language));
      }
      const [seo] = await db
        .select()
        .from(seoSettings)
        .where(and(...conditions))
        .limit(1);
      return seo ?? null;
    }),

  getBySlug: contentReadProcedure
    .input(z.object({ slug: z.string(), language: z.string().optional() }))
    .query(async ({ input }) => {
      const db = await ensureDatabaseAvailable();
      const conditions = [eq(seoSettings.slug, input.slug), isNull(seoSettings.deletedAt)];
      if (input.language) {
        conditions.push(eq(seoSettings.language, input.language));
      }
      const [seo] = await db
        .select()
        .from(seoSettings)
        .where(and(...conditions))
        .limit(1);
      return seo ?? null;
    }),

  getById: contentReadProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = await ensureDatabaseAvailable();
    const [seo] = await db
      .select()
      .from(seoSettings)
      .where(and(eq(seoSettings.id, input.id), isNull(seoSettings.deletedAt)))
      .limit(1);
    return seo ?? null;
  }),

  create: contentEditProcedure.input(seoSettingsSchema).mutation(async ({ input, ctx }) => {
    const db = await ensureDatabaseAvailable();
    let qualityOverridden = false;
    if (input.status === 'published') {
      assertContentCapability(ctx.user.role, 'publish');
      const quality = await assertPublicationQuality(db, {
        entityType: 'seo',
        candidate: input,
        role: ctx.user.role,
        userId: ctx.user.id,
        overrideReason: input.qualityOverrideReason,
      });
      qualityOverridden = quality.overridden;
    }
    const inserted = await db.insert(seoSettings).values(toSeoValues(input, true)).$returningId();
    const id = Number(inserted[0].id);
    const seo = await getSeoOrThrow(db, id);
    await auditLogService.logChange(db, {
      entityType: 'seo',
      entityId: id,
      action: 'create',
      userId: ctx.user.id,
      newValue: JSON.stringify(seo),
      reason: qualityOverridden
        ? `تجاوز جودة النشر: ${input.qualityOverrideReason?.trim()}`
        : 'إنشاء إعداد SEO',
    });
    await saveSeoVersion(db, seo, ctx.user.id, 'إنشاء إعداد SEO');
    await invalidateSEOCache();
    return { success: true, id, qualityOverride: qualityOverridden };
  }),

  update: contentEditProcedure
    .input(seoSettingsSchema.extend({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDatabaseAvailable();
      const previous = await getSeoOrThrow(db, input.id);
      let qualityOverridden = false;
      if (input.status === 'published') {
        assertContentCapability(ctx.user.role, 'publish');
        const quality = await assertPublicationQuality(db, {
          entityType: 'seo',
          entityId: input.id,
          candidate: input,
          role: ctx.user.role,
          userId: ctx.user.id,
          overrideReason: input.qualityOverrideReason,
        });
        qualityOverridden = quality.overridden;
      }
      await saveSeoVersion(db, previous, ctx.user.id, 'نسخة قبل تحديث إعداد SEO');
      await db
        .update(seoSettings)
        .set(toSeoValues(input, input.status === 'published'))
        .where(eq(seoSettings.id, input.id));
      const current = await getSeoOrThrow(db, input.id);
      await auditLogService.logChange(db, {
        entityType: 'seo',
        entityId: input.id,
        action: 'update',
        userId: ctx.user.id,
        oldValue: JSON.stringify(previous),
        newValue: JSON.stringify(current),
        reason: qualityOverridden
          ? `تجاوز جودة النشر: ${input.qualityOverrideReason?.trim()}`
          : 'تحديث إعداد SEO',
      });
      await invalidateSEOCache();
      return { success: true, qualityOverride: qualityOverridden };
    }),

  publish: contentPublishProcedure
    .input(z.object({ id: z.number(), qualityOverrideReason: z.string().max(500).optional() }))
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDatabaseAvailable();
      const seo = await getSeoOrThrow(db, input.id);
      const quality = await assertPublicationQuality(db, {
        entityType: 'seo',
        entityId: seo.id,
        candidate: seo,
        role: ctx.user.role,
        userId: ctx.user.id,
        overrideReason: input.qualityOverrideReason,
      });
      await saveSeoVersion(db, seo, ctx.user.id, 'نسخة قبل نشر إعداد SEO');
      await db
        .update(seoSettings)
        .set({ status: 'published', publishedAt: new Date() })
        .where(eq(seoSettings.id, seo.id));
      await auditLogService.logChange(db, {
        entityType: 'seo',
        entityId: seo.id,
        action: 'update',
        userId: ctx.user.id,
        oldValue: JSON.stringify(seo),
        newValue: JSON.stringify({ ...seo, status: 'published' }),
        reason: quality.overridden
          ? `تجاوز جودة النشر: ${input.qualityOverrideReason?.trim()}`
          : 'نشر إعداد SEO',
      });
      await invalidateSEOCache();
      return { success: true, qualityOverride: quality.overridden };
    }),

  archive: contentPublishProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDatabaseAvailable();
      const seo = await getSeoOrThrow(db, input.id);
      await saveSeoVersion(db, seo, ctx.user.id, 'نسخة قبل أرشفة إعداد SEO');
      await db.update(seoSettings).set({ status: 'archived' }).where(eq(seoSettings.id, seo.id));
      await auditLogService.logChange(db, {
        entityType: 'seo',
        entityId: seo.id,
        action: 'update',
        userId: ctx.user.id,
        oldValue: JSON.stringify(seo),
        newValue: JSON.stringify({ ...seo, status: 'archived' }),
        reason: 'أرشفة إعداد SEO',
      });
      await invalidateSEOCache();
      return { success: true };
    }),

  delete: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    const db = await ensureDatabaseAvailable();
    const seo = await getSeoOrThrow(db, input.id);
    await saveSeoVersion(db, seo, ctx.user.id, 'نسخة قبل حذف إعداد SEO');
    await db.update(seoSettings).set({ deletedAt: new Date() }).where(eq(seoSettings.id, seo.id));
    await auditLogService.logChange(db, {
      entityType: 'seo',
      entityId: seo.id,
      action: 'delete',
      userId: ctx.user.id,
      oldValue: JSON.stringify(seo),
      reason: 'حذف ناعم لإعداد SEO',
    });
    await invalidateSEOCache();
    return { success: true };
  }),

  restore: adminProcedure.input(z.object({ id: z.number() })).mutation(async ({ input, ctx }) => {
    const db = await ensureDatabaseAvailable();
    const [seo] = await db.select().from(seoSettings).where(eq(seoSettings.id, input.id)).limit(1);
    if (!seo) {
      throw new Error('إعداد SEO غير موجود.');
    }
    await db
      .update(seoSettings)
      .set({ deletedAt: null, status: 'draft', publishedAt: null })
      .where(eq(seoSettings.id, input.id));
    await auditLogService.logChange(db, {
      entityType: 'seo',
      entityId: input.id,
      action: 'update',
      userId: ctx.user.id,
      oldValue: JSON.stringify(seo),
      newValue: JSON.stringify({ ...seo, deletedAt: null, status: 'draft', publishedAt: null }),
      reason: 'استعادة إعداد SEO كمسودة',
    });
    await invalidateSEOCache();
    return { success: true };
  }),

  getOverview: contentReadProcedure.query(async () => {
    const db = await ensureDatabaseAvailable();
    const [allSeo, pendingApprovals] = await Promise.all([
      db.select().from(seoSettings),
      db
        .select({ entityId: contentApprovals.entityId })
        .from(contentApprovals)
        .where(and(eq(contentApprovals.entityType, 'seo'), eq(contentApprovals.status, 'pending'))),
    ]);
    const activeSeo = allSeo.filter((item) => !item.deletedAt);
    const total = activeSeo.length;
    const published = activeSeo.filter((item) => item.status === 'published').length;
    const drafts = activeSeo.filter((item) => item.status === 'draft').length;
    const archived = activeSeo.filter((item) => item.status === 'archived').length;
    const active = activeSeo.filter((item) => item.isActive === 'yes').length;
    return {
      total,
      active,
      published,
      drafts,
      archived,
      deleted: allSeo.length - total,
      pendingApprovals: pendingApprovals.length,
      inactive: total - active,
    };
  }),

  getReport: contentReadProcedure.query(async () => {
    const db = await ensureDatabaseAvailable();
    const [allSeo, pendingApprovals] = await Promise.all([
      db.select().from(seoSettings).orderBy(seoSettings.createdAt),
      db
        .select({ entityId: contentApprovals.entityId })
        .from(contentApprovals)
        .where(and(eq(contentApprovals.entityType, 'seo'), eq(contentApprovals.status, 'pending'))),
    ]);
    const pendingEntityIds = new Set(pendingApprovals.map((approval) => approval.entityId));
    const rows = await Promise.all(
      allSeo.map(async (seo) => {
        const qualityIssues = await evaluatePublicationQuality(db, 'seo', seo);
        return {
          ...seo,
          pendingApproval: pendingEntityIds.has(seo.id),
          qualityScore: getPublicationQualityScore(qualityIssues),
          qualityIssueCodes: qualityIssues.map((issue) => issue.code),
        };
      })
    );
    return { generatedAt: new Date(), rows };
  }),
});
