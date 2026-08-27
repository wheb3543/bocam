/**
 * Import / Export Router
 * يستورد لقطة محتوى كاملة بصورة ذرية بعد معاينة صريحة من المستخدم.
 */

import { z } from 'zod';
import { inArray } from 'drizzle-orm';
import { router } from '../../_core/trpc';
import { ensureDatabaseAvailable } from '../../_core/databaseGuard';
import {
  colorScheme,
  contentAuditLog,
  images,
  media,
  mediaFolders,
  pages,
  sections,
  sectionButtons,
  seoSettings,
  textContent,
} from '../../../drizzle/schema';
import { createLogger } from '../../_core/logger';
import { contentReadProcedure } from './authorization';
import { recordContentOperation } from '../../services/contentOperationNotificationService';
import { assertRolePermission, permissionProcedure } from '../permissionProcedures';

const logger = createLogger('importExport');
const contentExportProcedure = permissionProcedure('content.export', 'تصدير حزم المحتوى');
const contentImportProcedure = permissionProcedure('content.import', 'استيراد حزم المحتوى');
const MAX_IMPORT_ITEMS = 10_000;
const MAX_AUDIT_LOG_ITEMS = 5_000;
const collectionNames = [
  'pages',
  'sections',
  'sectionButtons',
  'textContent',
  'images',
  'colors',
  'seoSettings',
  'mediaFolders',
  'media',
  'auditLog',
] as const;
type CollectionName = (typeof collectionNames)[number];
type ContentRecord = Record<string, unknown>;

const exportSchema = z.object({
  includePages: z.boolean().default(true),
  includeSections: z.boolean().default(true),
  includeSectionButtons: z.boolean().default(true),
  includeTextContent: z.boolean().default(true),
  includeImages: z.boolean().default(true),
  includeColors: z.boolean().default(true),
  includeSeoSettings: z.boolean().default(true),
  includeMedia: z.boolean().default(true),
  includeAuditLog: z.boolean().default(true),
});

const bundleSchema = z.object({
  pages: z.array(z.record(z.string(), z.unknown())).optional(),
  sections: z.array(z.record(z.string(), z.unknown())).optional(),
  sectionButtons: z.array(z.record(z.string(), z.unknown())).optional(),
  textContent: z.array(z.record(z.string(), z.unknown())).optional(),
  images: z.array(z.record(z.string(), z.unknown())).optional(),
  colors: z.array(z.record(z.string(), z.unknown())).optional(),
  seoSettings: z.array(z.record(z.string(), z.unknown())).optional(),
  mediaFolders: z.array(z.record(z.string(), z.unknown())).optional(),
  media: z.array(z.record(z.string(), z.unknown())).optional(),
  auditLog: z.array(z.record(z.string(), z.unknown())).optional(),
  exportDate: z.string().optional(),
  version: z.string().optional(),
});

const importSchema = bundleSchema.extend({
  confirm: z.literal(true, {
    error: 'يجب معاينة ملف الاستيراد وتأكيد العملية قبل تعديل المحتوى.',
  }),
});

function records(bundle: z.infer<typeof bundleSchema>, name: CollectionName): ContentRecord[] {
  return bundle[name] ?? [];
}

function sourceId(record: ContentRecord, label: string): number {
  const id = Number(record.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(`ملف الاستيراد يحتوي ${label} بلا معرّف مصدر صالح.`);
  }
  return id;
}

function requiredString(record: ContentRecord, field: string, label: string): string {
  const value = record[field];
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`الحقل ${field} مطلوب في ${label}.`);
  }
  return value;
}

function cleanRecord(record: ContentRecord): ContentRecord {
  const { id, createdAt, updatedAt, deletedAt, ...clean } = record;
  void id;
  void createdAt;
  void updatedAt;
  void deletedAt;
  return clean;
}

function cleanAuditRecord(
  record: ContentRecord,
  entityIdMaps: Record<string, Map<number, number>>
): ContentRecord | null {
  const entityType = record.entityType;
  const action = record.action;
  const validEntityTypes = ['text', 'image', 'color', 'seo', 'page', 'section', 'sectionButton'];
  const validActions = ['create', 'update', 'delete'];
  if (typeof entityType !== 'string' || !validEntityTypes.includes(entityType)) {
    throw new Error('سجل التدقيق يحتوي نوع كيان غير مدعوم.');
  }
  if (typeof action !== 'string' || !validActions.includes(action)) {
    throw new Error('سجل التدقيق يحتوي إجراء غير مدعوم.');
  }

  const sourceEntityId = record.entityId;
  const entityMap = entityIdMaps[entityType];
  let entityId: number | null = null;
  if (sourceEntityId !== null && sourceEntityId !== undefined) {
    if (!entityMap) {
      return null;
    }
    entityId = entityMap.get(Number(sourceEntityId)) ?? null;
    if (!entityId) {
      return null;
    }
  }

  const originalReason = typeof record.reason === 'string' ? record.reason : null;
  const importedAt = record.createdAt ? new Date(String(record.createdAt)) : null;
  return {
    entityType,
    entityId,
    action,
    oldValue: typeof record.oldValue === 'string' ? record.oldValue : null,
    newValue: typeof record.newValue === 'string' ? record.newValue : null,
    reason: originalReason
      ? `سجل تاريخي مستورد: ${originalReason}`
      : 'سجل تاريخي مستورد من نسخة CMS احتياطية',
    createdAt: importedAt && !Number.isNaN(importedAt.getTime()) ? importedAt : new Date(),
  };
}

function relationId(
  sourceRelationId: unknown,
  map: Map<number, number>,
  relationLabel: string
): number | undefined {
  if (sourceRelationId === null || sourceRelationId === undefined) {
    return undefined;
  }
  const targetId = map.get(Number(sourceRelationId));
  if (!targetId) {
    throw new Error(`تعذر ربط ${relationLabel} لأن الكيان الأب غير موجود ضمن ملف الاستيراد.`);
  }
  return targetId;
}

function assertUnique(recordsToCheck: ContentRecord[], field: string, label: string) {
  const values = recordsToCheck.map((record) => requiredString(record, field, label));
  if (new Set(values).size !== values.length) {
    throw new Error(`ملف الاستيراد يحتوي قيماً مكررة للحقل ${field} ضمن ${label}.`);
  }
}

function validateBundle(bundle: z.infer<typeof bundleSchema>) {
  const total = collectionNames.reduce((sum, name) => sum + records(bundle, name).length, 0);
  if (total === 0) {
    throw new Error('ملف الاستيراد لا يحتوي أي محتوى قابل للاستيراد.');
  }
  if (total > MAX_IMPORT_ITEMS) {
    throw new Error(`يتجاوز ملف الاستيراد الحد الآمن (${MAX_IMPORT_ITEMS} عنصر).`);
  }
  if (records(bundle, 'auditLog').length > MAX_AUDIT_LOG_ITEMS) {
    throw new Error(`يتجاوز سجل التدقيق الحد الآمن (${MAX_AUDIT_LOG_ITEMS} سجل).`);
  }

  assertUnique(records(bundle, 'pages'), 'slug', 'الصفحات');
  assertUnique(records(bundle, 'textContent'), 'key', 'النصوص');
  assertUnique(records(bundle, 'images'), 'key', 'الصور');
  assertUnique(records(bundle, 'colors'), 'key', 'الألوان');
  assertUnique(records(bundle, 'mediaFolders'), 'path', 'مجلدات الوسائط');
  assertUnique(records(bundle, 'media'), 'key', 'الوسائط');

  records(bundle, 'pages').forEach((record) => sourceId(record, 'صفحة'));
  records(bundle, 'sections').forEach((record) => sourceId(record, 'قسم'));
  records(bundle, 'sectionButtons').forEach((record) => sourceId(record, 'زر قسم'));
  records(bundle, 'textContent').forEach((record) => sourceId(record, 'نص'));
  records(bundle, 'images').forEach((record) => sourceId(record, 'صورة'));
  records(bundle, 'colors').forEach((record) => sourceId(record, 'لون'));
  records(bundle, 'seoSettings').forEach((record) => sourceId(record, 'إعداد SEO'));
  records(bundle, 'mediaFolders').forEach((record) => sourceId(record, 'مجلد وسائط'));
  records(bundle, 'media').forEach((record) => sourceId(record, 'وسيط'));

  return {
    total,
    counts: Object.fromEntries(
      collectionNames.map((name) => [name, records(bundle, name).length])
    ) as Record<CollectionName, number>,
  };
}

async function assertNoKeyConflicts(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  db: any,
  bundle: z.infer<typeof bundleSchema>
) {
  const pageSlugs = records(bundle, 'pages').map((record) =>
    requiredString(record, 'slug', 'الصفحات')
  );
  const textKeys = records(bundle, 'textContent').map((record) =>
    requiredString(record, 'key', 'النصوص')
  );
  const imageKeys = records(bundle, 'images').map((record) =>
    requiredString(record, 'key', 'الصور')
  );
  const colorKeys = records(bundle, 'colors').map((record) =>
    requiredString(record, 'key', 'الألوان')
  );
  const mediaFolderPaths = records(bundle, 'mediaFolders').map((record) =>
    requiredString(record, 'path', 'مجلدات الوسائط')
  );
  const mediaKeys = records(bundle, 'media').map((record) =>
    requiredString(record, 'key', 'الوسائط')
  );
  const seoCandidates = records(bundle, 'seoSettings')
    .map((record) => ({
      pageKey: typeof record.pageKey === 'string' ? record.pageKey : null,
      slug: typeof record.slug === 'string' ? record.slug : null,
      language: typeof record.language === 'string' ? record.language : 'ar',
    }))
    .filter((record) => record.pageKey || record.slug);

  const [
    existingPages,
    existingText,
    existingImages,
    existingColors,
    existingMediaFolders,
    existingMedia,
    existingSeoSettings,
  ] = await Promise.all([
    pageSlugs.length
      ? db.select({ slug: pages.slug }).from(pages).where(inArray(pages.slug, pageSlugs))
      : [],
    textKeys.length
      ? db
          .select({ key: textContent.key })
          .from(textContent)
          .where(inArray(textContent.key, textKeys))
      : [],
    imageKeys.length
      ? db.select({ key: images.key }).from(images).where(inArray(images.key, imageKeys))
      : [],
    colorKeys.length
      ? db
          .select({ key: colorScheme.key })
          .from(colorScheme)
          .where(inArray(colorScheme.key, colorKeys))
      : [],
    mediaFolderPaths.length
      ? db
          .select({ path: mediaFolders.path })
          .from(mediaFolders)
          .where(inArray(mediaFolders.path, mediaFolderPaths))
      : [],
    mediaKeys.length
      ? db.select({ key: media.key }).from(media).where(inArray(media.key, mediaKeys))
      : [],
    seoCandidates.length
      ? db
          .select({
            pageKey: seoSettings.pageKey,
            slug: seoSettings.slug,
            language: seoSettings.language,
          })
          .from(seoSettings)
      : [],
  ]);

  const conflicts = [
    ...existingPages.map((item: { slug: string }) => `صفحة: ${item.slug}`),
    ...existingText.map((item: { key: string }) => `نص: ${item.key}`),
    ...existingImages.map((item: { key: string }) => `صورة: ${item.key}`),
    ...existingColors.map((item: { key: string }) => `لون: ${item.key}`),
    ...existingMediaFolders.map((item: { path: string }) => `مجلد وسائط: ${item.path}`),
    ...existingMedia.map((item: { key: string }) => `وسيط: ${item.key}`),
    ...existingSeoSettings
      .filter(
        (existing: { pageKey: string | null; slug: string | null; language: string | null }) =>
          seoCandidates.some(
            (candidate) =>
              candidate.language === (existing.language ?? 'ar') &&
              ((candidate.pageKey && candidate.pageKey === existing.pageKey) ||
                (candidate.slug && candidate.slug === existing.slug))
          )
      )
      .map(
        (item: { pageKey: string | null; slug: string | null }) =>
          `SEO: ${item.pageKey ?? item.slug ?? 'إعداد بلا مفتاح'}`
      ),
  ];

  if (conflicts.length) {
    throw new Error(
      `لن يستبدل الاستيراد الآمن سجلات قائمة. تعارضات: ${conflicts.slice(0, 5).join('، ')}`
    );
  }
}

export const importExportRouter = router({
  export: contentExportProcedure.input(exportSchema).query(async ({ input, ctx }) => {
    const db = await ensureDatabaseAvailable();
    try {
      if (input.includeAuditLog) {
        await assertRolePermission(ctx.user, 'audit.export', 'تصدير سجل التدقيق');
      }
      const exportData: Record<string, unknown> = {
        exportDate: new Date().toISOString(),
        version: '3.0',
      };

      if (input.includePages) {
        exportData.pages = await db.select().from(pages);
      }
      if (input.includeSections) {
        exportData.sections = await db.select().from(sections);
      }
      if (input.includeSectionButtons) {
        exportData.sectionButtons = await db.select().from(sectionButtons);
      }
      if (input.includeTextContent) {
        exportData.textContent = await db.select().from(textContent);
      }
      if (input.includeImages) {
        exportData.images = await db.select().from(images);
      }
      if (input.includeColors) {
        exportData.colors = await db.select().from(colorScheme);
      }
      if (input.includeSeoSettings) {
        exportData.seoSettings = await db.select().from(seoSettings);
      }
      if (input.includeMedia) {
        const [folderRows, mediaRows] = await Promise.all([
          db.select().from(mediaFolders),
          db.select().from(media),
        ]);
        exportData.mediaFolders = folderRows;
        exportData.media = mediaRows;
      }
      if (input.includeAuditLog) {
        exportData.auditLog = await db.select().from(contentAuditLog);
      }
      exportData.collections = Object.keys(exportData).filter(
        (key) => !['exportDate', 'version', 'collections'].includes(key)
      );

      const exportedItems = Object.values(exportData).reduce<number>(
        (total, value) => total + (Array.isArray(value) ? value.length : 0),
        0
      );
      void recordContentOperation(db, {
        operation: 'cms_export',
        status: 'succeeded',
        attemptedItems: exportedItems,
        completedItems: exportedItems,
        actorId: ctx.user.id,
        details: { collections: exportData.collections },
      });

      return exportData;
    } catch (error) {
      void recordContentOperation(db, {
        operation: 'cms_export',
        status: 'failed',
        attemptedItems: 0,
        actorId: ctx.user.id,
      });
      throw error;
    }
  }),

  previewImport: contentImportProcedure.input(bundleSchema).mutation(async ({ input }) => {
    const summary = validateBundle(input);
    return {
      ...summary,
      canImport: true,
      policy:
        'سيُضاف المحتوى داخل معاملة واحدة فقط، ولن تُستبدل السجلات التي تملك مفاتيح أو روابط قائمة.',
    };
  }),

  import: contentImportProcedure.input(importSchema).mutation(async ({ input, ctx }) => {
    const db = await ensureDatabaseAvailable();
    const summary = validateBundle(input);
    try {
      await assertNoKeyConflicts(db, input);

      const importResult = await db.transaction(async (tx: any) => {
        const pageIdMap = new Map<number, number>();
        const sectionIdMap = new Map<number, number>();
        const sectionButtonIdMap = new Map<number, number>();
        const textContentIdMap = new Map<number, number>();
        const imageIdMap = new Map<number, number>();
        const colorIdMap = new Map<number, number>();
        const seoIdMap = new Map<number, number>();
        const mediaFolderIdMap = new Map<number, number>();
        const mediaIdMap = new Map<number, number>();

        const pendingPages = [...records(input, 'pages')];
        while (pendingPages.length) {
          const nextIndex = pendingPages.findIndex(
            (record) =>
              record.parentId === null ||
              record.parentId === undefined ||
              pageIdMap.has(Number(record.parentId))
          );
          if (nextIndex < 0) {
            throw new Error(
              'تعذر ترتيب الصفحات لأن علاقة الصفحة الأب غير صالحة داخل ملف الاستيراد.'
            );
          }
          const record = pendingPages.splice(nextIndex, 1)[0];
          const source = sourceId(record, 'صفحة');
          const data = cleanRecord(record);
          data.parentId = relationId(record.parentId, pageIdMap, 'الصفحة بالصفحة الأب');
          const result = await tx
            .insert(pages)
            .values(data as any)
            .$returningId();
          pageIdMap.set(source, Number(result[0].id));
        }

        for (const record of records(input, 'sections')) {
          const source = sourceId(record, 'قسم');
          const data = cleanRecord(record);
          data.pageId = relationId(record.pageId, pageIdMap, 'القسم بالصفحة');
          const result = await tx
            .insert(sections)
            .values(data as any)
            .$returningId();
          sectionIdMap.set(source, Number(result[0].id));
        }

        for (const record of records(input, 'sectionButtons')) {
          const source = sourceId(record, 'زر قسم');
          const data = cleanRecord(record);
          data.sectionId = relationId(record.sectionId, sectionIdMap, 'الزر بالقسم');
          const result = await tx
            .insert(sectionButtons)
            .values(data as any)
            .$returningId();
          sectionButtonIdMap.set(source, Number(result[0].id));
        }

        for (const record of records(input, 'textContent')) {
          const source = sourceId(record, 'نص');
          const data = cleanRecord(record);
          data.pageId = relationId(record.pageId, pageIdMap, 'النص بالصفحة');
          data.sectionId = relationId(record.sectionId, sectionIdMap, 'النص بالقسم');
          const result = await tx
            .insert(textContent)
            .values(data as any)
            .$returningId();
          textContentIdMap.set(source, Number(result[0].id));
        }

        for (const record of records(input, 'images')) {
          const source = sourceId(record, 'صورة');
          const data = cleanRecord(record);
          data.pageId = relationId(record.pageId, pageIdMap, 'الصورة بالصفحة');
          data.sectionId = relationId(record.sectionId, sectionIdMap, 'الصورة بالقسم');
          const result = await tx
            .insert(images)
            .values(data as any)
            .$returningId();
          imageIdMap.set(source, Number(result[0].id));
        }

        for (const record of records(input, 'colors')) {
          const source = sourceId(record, 'لون');
          const result = await tx
            .insert(colorScheme)
            .values(cleanRecord(record) as any)
            .$returningId();
          colorIdMap.set(source, Number(result[0].id));
        }

        for (const record of records(input, 'seoSettings')) {
          const source = sourceId(record, 'إعداد SEO');
          const data = cleanRecord(record);
          data.pageId = relationId(record.pageId, pageIdMap, 'إعداد SEO بالصفحة');
          const result = await tx
            .insert(seoSettings)
            .values(data as any)
            .$returningId();
          seoIdMap.set(source, Number(result[0].id));
        }

        const pendingMediaFolders = [...records(input, 'mediaFolders')];
        while (pendingMediaFolders.length) {
          const nextIndex = pendingMediaFolders.findIndex(
            (record) =>
              record.parentId === null ||
              record.parentId === undefined ||
              mediaFolderIdMap.has(Number(record.parentId))
          );
          if (nextIndex < 0) {
            throw new Error(
              'تعذر ترتيب مجلدات الوسائط لأن علاقة المجلد الأب غير صالحة داخل ملف الاستيراد.'
            );
          }
          const record = pendingMediaFolders.splice(nextIndex, 1)[0];
          const source = sourceId(record, 'مجلد وسائط');
          const data = cleanRecord(record);
          data.parentId = relationId(record.parentId, mediaFolderIdMap, 'مجلد الوسائط الأب');
          const result = await tx
            .insert(mediaFolders)
            .values(data as any)
            .$returningId();
          mediaFolderIdMap.set(source, Number(result[0].id));
        }

        for (const record of records(input, 'media')) {
          const source = sourceId(record, 'وسيط');
          const data = cleanRecord(record);
          data.folderId = relationId(record.folderId, mediaFolderIdMap, 'الوسيط بالمجلد');
          data.pageId = relationId(record.pageId, pageIdMap, 'الوسيط بالصفحة');
          data.sectionId = relationId(record.sectionId, sectionIdMap, 'الوسيط بالقسم');
          const result = await tx
            .insert(media)
            .values(data as any)
            .$returningId();
          mediaIdMap.set(source, Number(result[0].id));
        }

        const entityIdMaps: Record<string, Map<number, number>> = {
          text: textContentIdMap,
          image: imageIdMap,
          color: colorIdMap,
          seo: seoIdMap,
          page: pageIdMap,
          section: sectionIdMap,
          sectionButton: sectionButtonIdMap,
        };
        const auditRows = records(input, 'auditLog')
          .map((record) => cleanAuditRecord(record, entityIdMaps))
          .filter((record): record is ContentRecord => record !== null);
        if (auditRows.length) {
          await tx.insert(contentAuditLog).values(auditRows as any);
        }
        return {
          importedAuditLog: auditRows.length,
          skippedAuditLog: records(input, 'auditLog').length - auditRows.length,
        };
      });

      logger.info('Content import completed atomically', {
        userId: ctx.user.id,
        total: summary.total,
      });
      void recordContentOperation(db, {
        operation: 'cms_import',
        status: 'succeeded',
        attemptedItems: summary.total,
        completedItems: summary.total,
        actorId: ctx.user.id,
        details: { collections: Object.keys(summary.counts) },
      });
      return { success: true, ...summary, ...importResult };
    } catch (error) {
      void recordContentOperation(db, {
        operation: 'cms_import',
        status: 'failed',
        attemptedItems: summary.total,
        actorId: ctx.user.id,
      });
      throw error;
    }
  }),

  getOverview: contentReadProcedure.query(async () => {
    const db = await ensureDatabaseAvailable();
    const [
      pagesData,
      sectionsData,
      buttonsData,
      textData,
      imagesData,
      colorsData,
      seoData,
      mediaData,
      auditData,
    ] = await Promise.all([
      db.select().from(pages),
      db.select().from(sections),
      db.select().from(sectionButtons),
      db.select().from(textContent),
      db.select().from(images),
      db.select().from(colorScheme),
      db.select().from(seoSettings),
      db.select().from(media),
      db.select().from(contentAuditLog),
    ]);
    return {
      pages: pagesData.length,
      sections: sectionsData.length,
      sectionButtons: buttonsData.length,
      textContent: textData.length,
      images: imagesData.length,
      colors: colorsData.length,
      seoSettings: seoData.length,
      media: mediaData.length,
      auditLog: auditData.length,
    };
  }),
});
