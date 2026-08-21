import { and, eq, isNull, lte } from 'drizzle-orm';
import {
  contentAuditLog,
  images,
  media,
  pages,
  sections,
  textContent,
} from '../../../drizzle/schema';
import { ensureDatabaseAvailable } from '../../_core/databaseGuard';
import { createLogger } from '../../_core/logger';
import { invalidateImagesCache, invalidateTextContentCache } from '../../routers/public/content';
import { invalidateAdminPagesCache } from '../../routers/content/pages';
import { invalidateAdminSectionsCache } from '../../routers/content/sections';
import { invalidateAdminTextContentCache } from '../../routers/content/textContent';

const logger = createLogger('cmsDeferredPublication');

export type DeferredCmsPublishResult = {
  taskUid: string;
  executedAt: string;
  inspected: number;
  published: {
    textContent: number;
    images: number;
    media: number;
    pages: number;
    sections: number;
  };
};

/**
 * ينشر الكيانات ذات حالة draft وموعد publishedAt المستحق. الدالة idempotent:
 * فبعد أول نجاح تنتقل السجلات إلى published فلا تلتقطها المحاولات اللاحقة.
 */
export async function publishDueCmsContent(
  taskUid: string,
  now: Date = new Date()
): Promise<DeferredCmsPublishResult> {
  const db = await ensureDatabaseAvailable();

  const result = await db.transaction(async (tx) => {
    const [dueTextContent, dueImages, dueMedia, duePages, dueSections] = await Promise.all([
      tx
        .select()
        .from(textContent)
        .where(
          and(
            eq(textContent.status, 'draft'),
            lte(textContent.publishedAt, now),
            isNull(textContent.deletedAt)
          )
        ),
      tx
        .select()
        .from(images)
        .where(
          and(eq(images.status, 'draft'), lte(images.publishedAt, now), isNull(images.deletedAt))
        ),
      tx
        .select()
        .from(media)
        .where(
          and(eq(media.status, 'draft'), lte(media.publishedAt, now), isNull(media.deletedAt))
        ),
      tx
        .select()
        .from(pages)
        .where(
          and(eq(pages.status, 'draft'), lte(pages.publishedAt, now), isNull(pages.deletedAt))
        ),
      tx
        .select()
        .from(sections)
        .where(
          and(
            eq(sections.status, 'draft'),
            lte(sections.publishedAt, now),
            isNull(sections.deletedAt)
          )
        ),
    ]);

    for (const item of dueTextContent) {
      await tx.update(textContent).set({ status: 'published' }).where(eq(textContent.id, item.id));
      await tx.insert(contentAuditLog).values({
        entityType: 'text',
        entityId: item.id,
        action: 'update',
        oldValue: JSON.stringify({ status: 'draft', publishedAt: item.publishedAt }),
        newValue: JSON.stringify({ status: 'published', publishedAt: item.publishedAt }),
        reason: `نشر مؤجل بواسطة مهمة CMS ${taskUid}`,
      });
    }

    for (const item of dueImages) {
      await tx.update(images).set({ status: 'published' }).where(eq(images.id, item.id));
      await tx.insert(contentAuditLog).values({
        entityType: 'image',
        entityId: item.id,
        action: 'update',
        oldValue: JSON.stringify({ status: 'draft', publishedAt: item.publishedAt }),
        newValue: JSON.stringify({ status: 'published', publishedAt: item.publishedAt }),
        reason: `نشر مؤجل بواسطة مهمة CMS ${taskUid}`,
      });
    }

    for (const item of dueMedia) {
      await tx.update(media).set({ status: 'published' }).where(eq(media.id, item.id));
      await tx.insert(contentAuditLog).values({
        // سجل التدقيق الحالي لا يملك قيمة media مستقلة؛ نوثّق النوع الحقيقي داخل الحمولة.
        entityType: 'image',
        entityId: item.id,
        action: 'update',
        oldValue: JSON.stringify({
          entityType: 'media',
          status: 'draft',
          publishedAt: item.publishedAt,
        }),
        newValue: JSON.stringify({
          entityType: 'media',
          status: 'published',
          publishedAt: item.publishedAt,
        }),
        reason: `نشر مؤجل بواسطة مهمة CMS ${taskUid}`,
      });
    }

    for (const item of duePages) {
      await tx.update(pages).set({ status: 'published' }).where(eq(pages.id, item.id));
      await tx.insert(contentAuditLog).values({
        entityType: 'page',
        entityId: item.id,
        action: 'update',
        oldValue: JSON.stringify({ status: 'draft', publishedAt: item.publishedAt }),
        newValue: JSON.stringify({ status: 'published', publishedAt: item.publishedAt }),
        reason: `نشر مؤجل بواسطة مهمة CMS ${taskUid}`,
      });
    }

    for (const item of dueSections) {
      await tx.update(sections).set({ status: 'published' }).where(eq(sections.id, item.id));
      await tx.insert(contentAuditLog).values({
        entityType: 'section',
        entityId: item.id,
        action: 'update',
        oldValue: JSON.stringify({ status: 'draft', publishedAt: item.publishedAt }),
        newValue: JSON.stringify({ status: 'published', publishedAt: item.publishedAt }),
        reason: `نشر مؤجل بواسطة مهمة CMS ${taskUid}`,
      });
    }

    return {
      taskUid,
      executedAt: now.toISOString(),
      inspected:
        dueTextContent.length +
        dueImages.length +
        dueMedia.length +
        duePages.length +
        dueSections.length,
      published: {
        textContent: dueTextContent.length,
        images: dueImages.length,
        media: dueMedia.length,
        pages: duePages.length,
        sections: dueSections.length,
      },
    };
  });

  if (result.published.textContent > 0) {
    await invalidateAdminTextContentCache();
    invalidateTextContentCache();
  }
  if (result.published.images > 0 || result.published.media > 0) {
    invalidateImagesCache();
  }
  if (result.published.pages > 0) {
    await invalidateAdminPagesCache();
  }
  if (result.published.sections > 0) {
    await invalidateAdminSectionsCache();
  }

  logger.info('Processed due CMS publications', result);
  return result;
}
