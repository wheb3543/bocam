/**
 * Import / Export Router
 * يستورد لقطة محتوى كاملة بصورة ذرية بعد معاينة صريحة من المستخدم.
 */

import { z } from 'zod';
import { inArray } from 'drizzle-orm';
import { adminProcedure, router } from '../../_core/trpc';
import { ensureDatabaseAvailable } from '../../_core/databaseGuard';
import { pages, sections, sectionButtons, textContent, images } from '../../../drizzle/schema';
import { createLogger } from '../../_core/logger';
import { contentReadProcedure } from './authorization';

const logger = createLogger('importExport');
const MAX_IMPORT_ITEMS = 2_000;
const collectionNames = ['pages', 'sections', 'sectionButtons', 'textContent', 'images'] as const;
type CollectionName = (typeof collectionNames)[number];
type ContentRecord = Record<string, unknown>;

const exportSchema = z.object({
  includePages: z.boolean().default(true),
  includeSections: z.boolean().default(true),
  includeSectionButtons: z.boolean().default(true),
  includeTextContent: z.boolean().default(true),
  includeImages: z.boolean().default(true),
});

const bundleSchema = z.object({
  pages: z.array(z.record(z.string(), z.unknown())).optional(),
  sections: z.array(z.record(z.string(), z.unknown())).optional(),
  sectionButtons: z.array(z.record(z.string(), z.unknown())).optional(),
  textContent: z.array(z.record(z.string(), z.unknown())).optional(),
  images: z.array(z.record(z.string(), z.unknown())).optional(),
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

  assertUnique(records(bundle, 'pages'), 'slug', 'الصفحات');
  assertUnique(records(bundle, 'textContent'), 'key', 'النصوص');
  assertUnique(records(bundle, 'images'), 'key', 'الصور');

  records(bundle, 'pages').forEach((record) => sourceId(record, 'صفحة'));
  records(bundle, 'sections').forEach((record) => sourceId(record, 'قسم'));
  records(bundle, 'sectionButtons').forEach((record) => sourceId(record, 'زر قسم'));

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

  const [existingPages, existingText, existingImages] = await Promise.all([
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
  ]);

  const conflicts = [
    ...existingPages.map((item: { slug: string }) => `صفحة: ${item.slug}`),
    ...existingText.map((item: { key: string }) => `نص: ${item.key}`),
    ...existingImages.map((item: { key: string }) => `صورة: ${item.key}`),
  ];

  if (conflicts.length) {
    throw new Error(
      `لن يستبدل الاستيراد الآمن سجلات قائمة. تعارضات: ${conflicts.slice(0, 5).join('، ')}`
    );
  }
}

export const importExportRouter = router({
  export: contentReadProcedure.input(exportSchema).query(async ({ input }) => {
    const db = await ensureDatabaseAvailable();
    const exportData: Record<string, unknown> = {
      exportDate: new Date().toISOString(),
      version: '2.0',
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

    return exportData;
  }),

  previewImport: adminProcedure.input(bundleSchema).mutation(async ({ input }) => {
    const summary = validateBundle(input);
    return {
      ...summary,
      canImport: true,
      policy:
        'سيُضاف المحتوى داخل معاملة واحدة فقط، ولن تُستبدل السجلات التي تملك مفاتيح أو روابط قائمة.',
    };
  }),

  import: adminProcedure.input(importSchema).mutation(async ({ input, ctx }) => {
    const db = await ensureDatabaseAvailable();
    const summary = validateBundle(input);
    await assertNoKeyConflicts(db, input);

    await db.transaction(async (tx: any) => {
      const pageIdMap = new Map<number, number>();
      const sectionIdMap = new Map<number, number>();

      for (const record of records(input, 'pages')) {
        const source = sourceId(record, 'صفحة');
        const result = await tx
          .insert(pages)
          .values(cleanRecord(record) as any)
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
        const data = cleanRecord(record);
        data.sectionId = relationId(record.sectionId, sectionIdMap, 'الزر بالقسم');
        await tx.insert(sectionButtons).values(data as any);
      }

      for (const record of records(input, 'textContent')) {
        const data = cleanRecord(record);
        data.pageId = relationId(record.pageId, pageIdMap, 'النص بالصفحة');
        data.sectionId = relationId(record.sectionId, sectionIdMap, 'النص بالقسم');
        await tx.insert(textContent).values(data as any);
      }

      for (const record of records(input, 'images')) {
        const data = cleanRecord(record);
        data.pageId = relationId(record.pageId, pageIdMap, 'الصورة بالصفحة');
        data.sectionId = relationId(record.sectionId, sectionIdMap, 'الصورة بالقسم');
        await tx.insert(images).values(data as any);
      }
    });

    logger.info('Content import completed atomically', {
      userId: ctx.user.id,
      total: summary.total,
    });
    return { success: true, ...summary };
  }),

  getOverview: contentReadProcedure.query(async () => {
    const db = await ensureDatabaseAvailable();
    const [pagesData, sectionsData, buttonsData, textData, imagesData] = await Promise.all([
      db.select().from(pages),
      db.select().from(sections),
      db.select().from(sectionButtons),
      db.select().from(textContent),
      db.select().from(images),
    ]);
    return {
      pages: pagesData.length,
      sections: sectionsData.length,
      sectionButtons: buttonsData.length,
      textContent: textData.length,
      images: imagesData.length,
    };
  }),
});
