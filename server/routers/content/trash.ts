import { z } from 'zod';
import { and, desc, eq, isNotNull } from 'drizzle-orm';
import { adminProcedure, router } from '../../_core/trpc';
import { ensureDatabaseAvailable } from '../../_core/databaseGuard';
import { images, pages, sectionButtons, sections, textContent } from '../../../drizzle/schema';
import { auditLogService } from '../../services/content/auditLogService';
import { contentVersionsService } from '../../services/content/contentVersionsService';
import { invalidateImagesCache, invalidateTextContentCache } from '../public/content';
import { invalidateAdminTextContentCache } from './textContent';
import { invalidateAdminPagesCache } from './pages';
import { invalidateAdminSectionsCache } from './sections';

const trashEntityTypeSchema = z.enum(['textContent', 'image', 'page', 'section', 'sectionButton']);
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

async function restoreDeletedEntity(
  tx: any,
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

  const [current] = await tx
    .select()
    .from(restoreConfig.table)
    .where(and(eq(restoreConfig.table.id, id), isNotNull(restoreConfig.table.deletedAt)))
    .limit(1);

  if (!current) {
    return false;
  }

  await contentVersionsService.createVersion(tx, {
    entityType: restoreConfig.versionEntityType,
    entityId: id,
    data: current,
    userId,
    reason: restoreConfig.versionReason,
  });

  const restoredValue = { ...current, deletedAt: null, status: 'draft', publishedAt: null };
  await tx
    .update(restoreConfig.table)
    .set({ deletedAt: null, status: 'draft', publishedAt: null })
    .where(eq(restoreConfig.table.id, id));
  await auditLogService.logChange(tx, {
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
  if (entityTypes.has('page')) {
    await invalidateAdminPagesCache();
  }
  if (entityTypes.has('section')) {
    await invalidateAdminSectionsCache();
  }
}

export const trashRouter = router({
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
        : ['textContent', 'image', 'page', 'section', 'sectionButton'];
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

  restoreMany: adminProcedure
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

      await db.transaction(async (tx: any) => {
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
