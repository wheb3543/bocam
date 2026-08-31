import { z } from 'zod';
import { and, desc, eq, isNotNull } from 'drizzle-orm';
import { adminProcedure, router } from '../../_core/trpc';
import { contentRestoreProcedure } from './authorization';
import { ensureDatabaseAvailable } from '../../_core/databaseGuard';
import {
  cmsTrashRetentionPolicies,
  images,
  pages,
  sectionButtons,
  sections,
  seoSettings,
  textContent,
} from '../../../drizzle/schema';
import { auditLogService } from '../../services/content/auditLogService';
import { contentVersionsService } from '../../services/content/contentVersionsService';
import {
  invalidateImagesCache,
  invalidateSEOCache,
  invalidateTextContentCache,
} from '../public/content';
import { invalidateAdminTextContentCache } from './textContent';
import { invalidateAdminPagesCache } from './pages';
import { invalidateAdminSectionsCache } from './sections';
import {
  DEFAULT_CMS_TRASH_RETENTION_DAYS,
  getCmsTrashRetentionPolicy,
} from '../../services/content/trashRetentionService';

const trashEntityTypeSchema = z.enum([
  'textContent',
  'image',
  'seo',
  'page',
  'section',
  'sectionButton',
]);
type TrashEntityType = z.infer<typeof trashEntityTypeSchema>;

export interface TrashItem {
  entityType: TrashEntityType;
  id: number;
  title: string;
  description: string;
  status: 'draft' | 'published' | 'archived';
  deletedAt: Date;
}

export function toTrashItem(
  entityType: TrashEntityType,
  record: Record<string, unknown>
): TrashItem {
  const deletedAt =
    record.deletedAt instanceof Date ? record.deletedAt : new Date(record.deletedAt as string);

  if (entityType === 'textContent') {
    return {
      entityType,
      id: record.id as number,
      title: record.key as string,
      description: String(record.content ?? '').slice(0, 140),
      status: record.status as TrashItem['status'],
      deletedAt,
    };
  }
  if (entityType === 'image') {
    return {
      entityType,
      id: record.id as number,
      title: record.key as string,
      description: String(record.altAr || record.altEn || record.url || ''),
      status: record.status as TrashItem['status'],
      deletedAt,
    };
  }
  if (entityType === 'seo') {
    return {
      entityType,
      id: record.id as number,
      title: String(record.pageKey || record.slug || record.title || 'إعداد SEO بلا عنوان'),
      description: `${record.language ?? 'ar'} · ${record.title ?? record.description ?? ''}`.slice(
        0,
        140
      ),
      status: record.status as TrashItem['status'],
      deletedAt,
    };
  }
  if (entityType === 'page') {
    return {
      entityType,
      id: record.id as number,
      title: record.name as string,
      description: `${record.titleAr ?? record.titleEn ?? ''} · /${record.slug ?? ''}`,
      status: record.status as TrashItem['status'],
      deletedAt,
    };
  }
  if (entityType === 'section') {
    return {
      entityType,
      id: record.id as number,
      title: String(record.titleAr || record.titleEn || record.name || 'قسم بلا عنوان'),
      description: `${record.name ?? ''} · الصفحة #${record.pageId ?? ''}`,
      status: record.status as TrashItem['status'],
      deletedAt,
    };
  }

  return {
    entityType,
    id: record.id as number,
    title: String(record.textAr || record.textEn || 'زر بلا عنوان'),
    description: String(record.link || ''),
    status: record.status as TrashItem['status'],
    deletedAt,
  };
}

function matchesSearch(item: TrashItem, search?: string) {
  if (!search?.trim()) {
    return true;
  }
  const normalizedSearch = search.trim().toLocaleLowerCase('ar');
  return `${item.title} ${item.description}`.toLocaleLowerCase('ar').includes(normalizedSearch);
}

function toPreviewFields(entityType: TrashEntityType, record: Record<string, unknown>) {
  const build = (label: string, value: unknown) => ({
    label,
    value: value === null || value === undefined ? '—' : String(value),
  });
  if (entityType === 'textContent') {
    return [
      build('المفتاح', record.key),
      build('اللغة', record.language),
      build('القسم', record.section),
      build('الصفحة', record.pageId),
      build('الحالة السابقة', record.status),
    ];
  }
  if (entityType === 'image') {
    return [
      build('المفتاح', record.key),
      build('النص البديل العربي', record.altAr),
      build('النص البديل الإنجليزي', record.altEn),
      build('الأبعاد', record.width && record.height ? `${record.width} × ${record.height}` : null),
      build('الصيغة', record.format),
    ];
  }
  if (entityType === 'seo') {
    return [
      build('مفتاح الصفحة', record.pageKey),
      build('الرابط', record.slug),
      build('اللغة', record.language),
      build('العنوان', record.title),
      build('الرابط الأساسي', record.canonicalUrl),
      build('الحالة السابقة', record.status),
    ];
  }
  if (entityType === 'page') {
    return [
      build('الاسم', record.name),
      build('الرابط', `/${record.slug ?? ''}`),
      build('العنوان العربي', record.titleAr),
      build('العنوان الإنجليزي', record.titleEn),
      build('نوع الصفحة', record.type),
    ];
  }
  if (entityType === 'section') {
    return [
      build('اسم القسم', record.name),
      build('العنوان العربي', record.titleAr),
      build('العنوان الإنجليزي', record.titleEn),
      build('نوع القسم', record.type),
      build('الصفحة المرتبطة', record.pageId),
    ];
  }
  return [
    build('النص العربي', record.textAr),
    build('النص الإنجليزي', record.textEn),
    build('الرابط', record.link),
    build('النمط', record.style),
    build('القسم المرتبط', record.sectionId),
  ];
}

type DbClient = Awaited<ReturnType<typeof ensureDatabaseAvailable>>;

async function getDeletedRecord(db: DbClient, entityType: TrashEntityType, id: number) {
  if (entityType === 'textContent') {
    return (
      await db
        .select()
        .from(textContent)
        .where(and(eq(textContent.id, id), isNotNull(textContent.deletedAt)))
        .limit(1)
    )[0];
  }
  if (entityType === 'image') {
    return (
      await db
        .select()
        .from(images)
        .where(and(eq(images.id, id), isNotNull(images.deletedAt)))
        .limit(1)
    )[0];
  }
  if (entityType === 'seo') {
    return (
      await db
        .select()
        .from(seoSettings)
        .where(and(eq(seoSettings.id, id), isNotNull(seoSettings.deletedAt)))
        .limit(1)
    )[0];
  }
  if (entityType === 'page') {
    return (
      await db
        .select()
        .from(pages)
        .where(and(eq(pages.id, id), isNotNull(pages.deletedAt)))
        .limit(1)
    )[0];
  }
  if (entityType === 'section') {
    return (
      await db
        .select()
        .from(sections)
        .where(and(eq(sections.id, id), isNotNull(sections.deletedAt)))
        .limit(1)
    )[0];
  }
  return (
    await db
      .select()
      .from(sectionButtons)
      .where(and(eq(sectionButtons.id, id), isNotNull(sectionButtons.deletedAt)))
      .limit(1)
  )[0];
}

type TransactionClient = Parameters<Parameters<DbClient['transaction']>[0]>[0];

async function restoreDeletedEntity(
  tx: TransactionClient,
  entityType: TrashEntityType,
  id: number,
  userId: number
) {
  const restoreConfig = {
    textContent: {
      table: textContent,
      versionEntityType: 'text' as const,
      auditEntityType: 'text' as const,
      versionReason: 'نسخة أمان قبل الاستعادة من سلة المحذوفات',
    },
    image: {
      table: images,
      versionEntityType: 'image' as const,
      auditEntityType: 'image' as const,
      versionReason: 'نسخة أمان قبل الاستعادة من سلة المحذوفات',
    },
    seo: {
      table: seoSettings,
      versionEntityType: 'seo' as const,
      auditEntityType: 'seo' as const,
      versionReason: 'نسخة أمان قبل الاستعادة من سلة المحذوفات',
    },
    page: {
      table: pages,
      versionEntityType: 'page' as const,
      auditEntityType: 'page' as const,
      versionReason: 'نسخة أمان قبل الاستعادة من سلة المحذوفات',
    },
    section: {
      table: sections,
      versionEntityType: 'section' as const,
      auditEntityType: 'section' as const,
      versionReason: 'نسخة أمان قبل الاستعادة من سلة المحذوفات',
    },
    sectionButton: {
      table: sectionButtons,
      versionEntityType: 'sectionButton' as const,
      auditEntityType: 'sectionButton' as const,
      versionReason: 'نسخة أمان قبل الاستعادة من سلة المحذوفات',
    },
  }[entityType];

  if (!restoreConfig) {
    throw new Error('نوع عنصر سلة المحذوفات غير مدعوم.');
  }

  const [current] = await tx
    .select()
    .from(restoreConfig.table)
    .where(and(eq(restoreConfig.table.id, id), isNotNull(restoreConfig.table.deletedAt)))
    .limit(1);

  if (!current) {
    return false;
  }

  await contentVersionsService.createVersion(
    tx as Parameters<typeof contentVersionsService.createVersion>[0],
    {
      entityType: restoreConfig.versionEntityType,
      entityId: id,
      data: current,
      userId,
      reason: restoreConfig.versionReason,
    }
  );

  const restoredValue = { ...current, deletedAt: null, status: 'draft', publishedAt: null };
  await tx
    .update(restoreConfig.table)
    .set({ deletedAt: null, status: 'draft', publishedAt: null })
    .where(eq(restoreConfig.table.id, id));
  await auditLogService.logChange(tx as Parameters<typeof auditLogService.logChange>[0], {
    entityType: restoreConfig.auditEntityType,
    entityId: id,
    action: 'update',
    userId,
    oldValue: JSON.stringify(current),
    newValue: JSON.stringify(restoredValue),
    reason: 'استعادة من سلة المحذوفات الموحدة كمسودة',
  });

  return true;
}

async function invalidateRestoredEntityCaches(entityTypes: Set<TrashEntityType>) {
  if (entityTypes.has('textContent')) {
    await invalidateAdminTextContentCache();
    invalidateTextContentCache();
  }
  if (entityTypes.has('image')) {
    invalidateImagesCache();
  }
  if (entityTypes.has('seo')) {
    await invalidateSEOCache();
  }
  if (entityTypes.has('page')) {
    await invalidateAdminPagesCache();
  }
  if (entityTypes.has('section')) {
    await invalidateAdminSectionsCache();
  }
}

export const trashRouter = router({
  getRetentionPolicy: adminProcedure.query(async () => {
    const db = await ensureDatabaseAvailable();
    const policy = await getCmsTrashRetentionPolicy(db);
    return {
      retentionDays: policy?.retentionDays ?? DEFAULT_CMS_TRASH_RETENTION_DAYS,
      isEnabled: policy?.isEnabled ?? true,
      isScheduled: Boolean(policy?.scheduleCronTaskUid),
      lastPurgeAt: policy?.lastPurgeAt ?? null,
      lastPurgeSummary: policy?.lastPurgeSummary ? JSON.parse(policy.lastPurgeSummary) : null,
    };
  }),

  updateRetentionPolicy: adminProcedure
    .input(
      z.object({
        retentionDays: z.number().int().min(7).max(365),
        isEnabled: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await ensureDatabaseAvailable();
      const policy = await getCmsTrashRetentionPolicy(db);
      if (!policy) {
        throw new Error('تعذر العثور على سياسة الاحتفاظ بسلة المحذوفات.');
      }
      await db
        .update(cmsTrashRetentionPolicies)
        .set({ retentionDays: input.retentionDays, isEnabled: input.isEnabled })
        .where(eq(cmsTrashRetentionPolicies.id, policy.id));
      return { retentionDays: input.retentionDays, isEnabled: input.isEnabled };
    }),

  list: adminProcedure
    .input(
      z.object({
        entityType: trashEntityTypeSchema.optional(),
        search: z.string().trim().max(255).optional(),
        limit: z.number().int().min(1).max(100).default(100),
      })
    )
    .query(async ({ input }) => {
      const db = await ensureDatabaseAvailable();
      const selectedTypes: TrashEntityType[] = input.entityType
        ? [input.entityType]
        : ['textContent', 'image', 'seo', 'page', 'section', 'sectionButton'];
      const requestedLimit = input.limit;

      const records = await Promise.all(
        selectedTypes.map(async (entityType) => {
          if (entityType === 'textContent') {
            const rows = await db
              .select()
              .from(textContent)
              .where(isNotNull(textContent.deletedAt))
              .orderBy(desc(textContent.deletedAt))
              .limit(requestedLimit);
            return rows.map((row) => toTrashItem(entityType, row));
          }
          if (entityType === 'image') {
            const rows = await db
              .select()
              .from(images)
              .where(isNotNull(images.deletedAt))
              .orderBy(desc(images.deletedAt))
              .limit(requestedLimit);
            return rows.map((row) => toTrashItem(entityType, row));
          }
          if (entityType === 'seo') {
            const rows = await db
              .select()
              .from(seoSettings)
              .where(isNotNull(seoSettings.deletedAt))
              .orderBy(desc(seoSettings.deletedAt))
              .limit(requestedLimit);
            return rows.map((row) => toTrashItem(entityType, row));
          }
          if (entityType === 'page') {
            const rows = await db
              .select()
              .from(pages)
              .where(isNotNull(pages.deletedAt))
              .orderBy(desc(pages.deletedAt))
              .limit(requestedLimit);
            return rows.map((row) => toTrashItem(entityType, row));
          }
          if (entityType === 'section') {
            const rows = await db
              .select()
              .from(sections)
              .where(isNotNull(sections.deletedAt))
              .orderBy(desc(sections.deletedAt))
              .limit(requestedLimit);
            return rows.map((row) => toTrashItem(entityType, row));
          }
          const rows = await db
            .select()
            .from(sectionButtons)
            .where(isNotNull(sectionButtons.deletedAt))
            .orderBy(desc(sectionButtons.deletedAt))
            .limit(requestedLimit);
          return rows.map((row) => toTrashItem(entityType, row));
        })
      );

      const data = records
        .flat()
        .filter((item) => matchesSearch(item, input.search))
        .sort((first, second) => second.deletedAt.getTime() - first.deletedAt.getTime())
        .slice(0, requestedLimit);

      return { data, total: data.length };
    }),

  preview: adminProcedure
    .input(z.object({ entityType: trashEntityTypeSchema, id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = await ensureDatabaseAvailable();
      const record = await getDeletedRecord(db, input.entityType, input.id);
      if (!record) {
        throw new Error('العنصر غير موجود أو لم يعد ضمن سلة المحذوفات.');
      }
      const rawRecord = record as Record<string, unknown>;
      return {
        item: toTrashItem(input.entityType, rawRecord),
        fields: toPreviewFields(input.entityType, rawRecord),
        body:
          input.entityType === 'textContent'
            ? String(rawRecord.content ?? '')
            : input.entityType === 'seo'
              ? String(rawRecord.description ?? '')
              : null,
        imageUrl: input.entityType === 'image' ? String(rawRecord.url ?? '') : null,
        settings: input.entityType === 'section' ? String(rawRecord.settings ?? '') : null,
      };
    }),

  restoreMany: contentRestoreProcedure
    .input(
      z.object({
        items: z
          .array(z.object({ entityType: trashEntityTypeSchema, id: z.number().int().positive() }))
          .min(1)
          .max(100),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDatabaseAvailable();
      const seen = new Set<string>();
      const uniqueItems = input.items.filter((item) => {
        const key = `${item.entityType}:${item.id}`;
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });
      const restored: Array<{ entityType: TrashEntityType; id: number }> = [];
      const skipped: Array<{ entityType: TrashEntityType; id: number; reason: string }> = [];

      await db.transaction(async (tx) => {
        for (const item of uniqueItems) {
          const wasRestored = await restoreDeletedEntity(tx, item.entityType, item.id, ctx.user.id);
          if (wasRestored) {
            restored.push(item);
          } else {
            skipped.push({ ...item, reason: 'العنصر غير موجود أو لم يعد في سلة المحذوفات.' });
          }
        }
      });

      await invalidateRestoredEntityCaches(new Set(restored.map((item) => item.entityType)));

      return { restored, skipped };
    }),
});
