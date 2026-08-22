import { and, eq, isNull, lte } from 'drizzle-orm';
import {
  contentAuditLog,
  images,
  media,
  pages,
  sectionButtons,
  sections,
  textContent,
} from '../../../drizzle/schema';
import { ensureDatabaseAvailable } from '../../_core/databaseGuard';
import { createLogger } from '../../_core/logger';
import { invalidateImagesCache, invalidateTextContentCache } from '../../routers/public/content';
import { invalidateAdminPagesCache } from '../../routers/content/pages';
import { invalidateAdminSectionsCache } from '../../routers/content/sections';
import { invalidateAdminTextContentCache } from '../../routers/content/textContent';
import {
  evaluatePublicationQuality,
  type CmsPublishEntityType,
  type PublicationQualityIssue,
} from './publicationQualityGate';

const logger = createLogger('cmsDeferredPublication');

type DeferredEntityCounters = {
  textContent: number;
  images: number;
  media: number;
  pages: number;
  sections: number;
  sectionButtons: number;
};

export type DeferredCmsPublishResult = {
  taskUid: string;
  executedAt: string;
  inspected: number;
  published: DeferredEntityCounters;
  blocked: DeferredEntityCounters;
};

const emptyCounters = (): DeferredEntityCounters => ({
  textContent: 0,
  images: 0,
  media: 0,
  pages: 0,
  sections: 0,
  sectionButtons: 0,
});

/**
 * النشر المؤجل يعيد فحص الجودة في لحظة الاستحقاق. لا يوجد تجاوز إداري ضمن
 * مهمة Heartbeat: عند الفشل تبقى المسودة ويُلغى الموعد كي لا تُنتج المحاولات
 * المتكررة سجلات تدقيق مكررة، ثم يعيد المحرر الجدولة بعد التصحيح.
 */
export async function publishDueCmsContent(
  taskUid: string,
  now: Date = new Date()
): Promise<DeferredCmsPublishResult> {
  const db = await ensureDatabaseAvailable();

  const result = await db.transaction(async (tx) => {
    const [dueTextContent, dueImages, dueMedia, duePages, dueSections, dueSectionButtons] =
      await Promise.all([
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
        tx
          .select()
          .from(sectionButtons)
          .where(
            and(
              eq(sectionButtons.status, 'draft'),
              lte(sectionButtons.publishedAt, now),
              isNull(sectionButtons.deletedAt)
            )
          ),
      ]);

    const published = emptyCounters();
    const blocked = emptyCounters();

    async function qualityIssues(
      entityType: CmsPublishEntityType,
      item: Record<string, unknown>
    ): Promise<PublicationQualityIssue[]> {
      return evaluatePublicationQuality(tx, entityType, item);
    }

    async function recordBlockedPublication(options: {
      entityType: 'text' | 'image' | 'page' | 'section' | 'sectionButton';
      entityId: number;
      scheduledAt: Date | null;
      issues: PublicationQualityIssue[];
    }) {
      await tx.insert(contentAuditLog).values({
        entityType: options.entityType,
        entityId: options.entityId,
        action: 'update',
        oldValue: JSON.stringify({ status: 'draft', publishedAt: options.scheduledAt }),
        newValue: JSON.stringify({
          status: 'draft',
          publishedAt: null,
          publicationBlocked: true,
          issues: options.issues,
        }),
        reason: `تم منع النشر المؤجل بواسطة مهمة CMS ${taskUid}: ${options.issues
          .map((issue) => issue.message)
          .join(' | ')}`,
      });
    }

    for (const item of dueTextContent) {
      const issues = await qualityIssues('textContent', item);
      if (issues.length) {
        await tx.update(textContent).set({ publishedAt: null }).where(eq(textContent.id, item.id));
        await recordBlockedPublication({
          entityType: 'text',
          entityId: item.id,
          scheduledAt: item.publishedAt,
          issues,
        });
        blocked.textContent += 1;
        continue;
      }
      await tx.update(textContent).set({ status: 'published' }).where(eq(textContent.id, item.id));
      await tx.insert(contentAuditLog).values({
        entityType: 'text',
        entityId: item.id,
        action: 'update',
        oldValue: JSON.stringify({ status: 'draft', publishedAt: item.publishedAt }),
        newValue: JSON.stringify({ status: 'published', publishedAt: item.publishedAt }),
        reason: `نشر مؤجل بواسطة مهمة CMS ${taskUid}`,
      });
      published.textContent += 1;
    }

    for (const item of dueImages) {
      const issues = await qualityIssues('image', item);
      if (issues.length) {
        await tx.update(images).set({ publishedAt: null }).where(eq(images.id, item.id));
        await recordBlockedPublication({
          entityType: 'image',
          entityId: item.id,
          scheduledAt: item.publishedAt,
          issues,
        });
        blocked.images += 1;
        continue;
      }
      await tx.update(images).set({ status: 'published' }).where(eq(images.id, item.id));
      await tx.insert(contentAuditLog).values({
        entityType: 'image',
        entityId: item.id,
        action: 'update',
        oldValue: JSON.stringify({ status: 'draft', publishedAt: item.publishedAt }),
        newValue: JSON.stringify({ status: 'published', publishedAt: item.publishedAt }),
        reason: `نشر مؤجل بواسطة مهمة CMS ${taskUid}`,
      });
      published.images += 1;
    }

    for (const item of dueMedia) {
      const issues = await qualityIssues('media', item);
      if (issues.length) {
        await tx.update(media).set({ publishedAt: null }).where(eq(media.id, item.id));
        await recordBlockedPublication({
          // سجل التدقيق الحالي يطابق الوسيط تحت نوع الصورة مع توضيح النوع داخل الحمولة.
          entityType: 'image',
          entityId: item.id,
          scheduledAt: item.publishedAt,
          issues,
        });
        blocked.media += 1;
        continue;
      }
      await tx.update(media).set({ status: 'published' }).where(eq(media.id, item.id));
      await tx.insert(contentAuditLog).values({
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
      published.media += 1;
    }

    for (const item of duePages) {
      const issues = await qualityIssues('page', item);
      if (issues.length) {
        await tx.update(pages).set({ publishedAt: null }).where(eq(pages.id, item.id));
        await recordBlockedPublication({
          entityType: 'page',
          entityId: item.id,
          scheduledAt: item.publishedAt,
          issues,
        });
        blocked.pages += 1;
        continue;
      }
      await tx.update(pages).set({ status: 'published' }).where(eq(pages.id, item.id));
      await tx.insert(contentAuditLog).values({
        entityType: 'page',
        entityId: item.id,
        action: 'update',
        oldValue: JSON.stringify({ status: 'draft', publishedAt: item.publishedAt }),
        newValue: JSON.stringify({ status: 'published', publishedAt: item.publishedAt }),
        reason: `نشر مؤجل بواسطة مهمة CMS ${taskUid}`,
      });
      published.pages += 1;
    }

    for (const item of dueSections) {
      const issues = await qualityIssues('section', item);
      if (issues.length) {
        await tx.update(sections).set({ publishedAt: null }).where(eq(sections.id, item.id));
        await recordBlockedPublication({
          entityType: 'section',
          entityId: item.id,
          scheduledAt: item.publishedAt,
          issues,
        });
        blocked.sections += 1;
        continue;
      }
      await tx.update(sections).set({ status: 'published' }).where(eq(sections.id, item.id));
      await tx.insert(contentAuditLog).values({
        entityType: 'section',
        entityId: item.id,
        action: 'update',
        oldValue: JSON.stringify({ status: 'draft', publishedAt: item.publishedAt }),
        newValue: JSON.stringify({ status: 'published', publishedAt: item.publishedAt }),
        reason: `نشر مؤجل بواسطة مهمة CMS ${taskUid}`,
      });
      published.sections += 1;
    }

    for (const item of dueSectionButtons) {
      const issues = await qualityIssues('sectionButton', item);
      if (issues.length) {
        await tx
          .update(sectionButtons)
          .set({ publishedAt: null })
          .where(eq(sectionButtons.id, item.id));
        await recordBlockedPublication({
          entityType: 'sectionButton',
          entityId: item.id,
          scheduledAt: item.publishedAt,
          issues,
        });
        blocked.sectionButtons += 1;
        continue;
      }
      await tx
        .update(sectionButtons)
        .set({ status: 'published' })
        .where(eq(sectionButtons.id, item.id));
      await tx.insert(contentAuditLog).values({
        entityType: 'sectionButton',
        entityId: item.id,
        action: 'update',
        oldValue: JSON.stringify({ status: 'draft', publishedAt: item.publishedAt }),
        newValue: JSON.stringify({ status: 'published', publishedAt: item.publishedAt }),
        reason: `نشر مؤجل بواسطة مهمة CMS ${taskUid}`,
      });
      published.sectionButtons += 1;
    }

    return {
      taskUid,
      executedAt: now.toISOString(),
      inspected:
        dueTextContent.length +
        dueImages.length +
        dueMedia.length +
        duePages.length +
        dueSections.length +
        dueSectionButtons.length,
      published,
      blocked,
    };
  });

  if (result.published.textContent > 0 || result.blocked.textContent > 0) {
    await invalidateAdminTextContentCache();
    invalidateTextContentCache();
  }
  if (
    result.published.images > 0 ||
    result.published.media > 0 ||
    result.blocked.images > 0 ||
    result.blocked.media > 0
  ) {
    invalidateImagesCache();
  }
  if (result.published.pages > 0 || result.blocked.pages > 0) {
    await invalidateAdminPagesCache();
  }
  if (
    result.published.sections > 0 ||
    result.published.sectionButtons > 0 ||
    result.blocked.sections > 0 ||
    result.blocked.sectionButtons > 0
  ) {
    await invalidateAdminSectionsCache();
  }

  logger.info('Processed due CMS publications', result);
  return result;
}
