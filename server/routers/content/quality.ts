import { and, eq, isNull } from 'drizzle-orm';
import { router } from '../../_core/trpc';
import { ensureDatabaseAvailable } from '../../_core/databaseGuard';
import { contentReadProcedure } from './authorization';
import { images, pages, sections, seoSettings } from '../../../drizzle/schema';

export type ContentQualityIssue = {
  code: string;
  severity: 'warning' | 'error';
  entityType: 'image' | 'page' | 'seo';
  entityId: number;
  title: string;
  description: string;
};

export const qualityRouter = router({
  getReport: contentReadProcedure.query(async () => {
    const db = await ensureDatabaseAvailable();
    const issues: ContentQualityIssue[] = [];

    const [publishedImages, publishedPages, activeSEO, publishedSections] = await Promise.all([
      db
        .select()
        .from(images)
        .where(
          and(eq(images.status, 'published'), eq(images.isActive, 'yes'), isNull(images.deletedAt))
        ),
      db
        .select()
        .from(pages)
        .where(
          and(eq(pages.status, 'published'), eq(pages.isActive, 'yes'), isNull(pages.deletedAt))
        ),
      db.select().from(seoSettings).where(eq(seoSettings.isActive, 'yes')),
      db
        .select({ pageId: sections.pageId })
        .from(sections)
        .where(
          and(
            eq(sections.status, 'published'),
            eq(sections.isActive, 'yes'),
            isNull(sections.deletedAt)
          )
        ),
    ]);

    for (const image of publishedImages) {
      if (!(image.altAr || image.altEn)) {
        issues.push({
          code: 'image-alt-missing',
          severity: 'error',
          entityType: 'image',
          entityId: image.id,
          title: 'صورة منشورة بلا نص بديل',
          description: `الصورة «${image.key}» تحتاج نصاً بديلاً عربياً أو إنجليزياً قبل اعتمادها للوصولية.`,
        });
      }
    }

    const sectionPageIds = new Set(publishedSections.map((section) => section.pageId));
    for (const page of publishedPages) {
      if (!sectionPageIds.has(page.id)) {
        issues.push({
          code: 'page-without-sections',
          severity: 'warning',
          entityType: 'page',
          entityId: page.id,
          title: 'صفحة منشورة بلا أقسام منشورة',
          description: `الصفحة «${page.titleAr || page.name}» لا تحتوي أقساماً منشورة ظاهرة للزوار.`,
        });
      }
    }

    for (const seo of activeSEO) {
      if (!seo.title || seo.title.length < 30 || seo.title.length > 60) {
        issues.push({
          code: 'seo-title-length',
          severity: 'warning',
          entityType: 'seo',
          entityId: seo.id,
          title: 'طول عنوان SEO يحتاج مراجعة',
          description: `إعداد «${seo.pageKey || seo.slug || seo.id}» يجب أن يتراوح عنوانه بين 30 و60 حرفاً.`,
        });
      }
      if (!seo.description || seo.description.length < 120 || seo.description.length > 160) {
        issues.push({
          code: 'seo-description-length',
          severity: 'warning',
          entityType: 'seo',
          entityId: seo.id,
          title: 'طول وصف SEO يحتاج مراجعة',
          description: `إعداد «${seo.pageKey || seo.slug || seo.id}» يحتاج وصفاً بين 120 و160 حرفاً.`,
        });
      }
    }

    return {
      generatedAt: new Date(),
      summary: {
        errors: issues.filter((issue) => issue.severity === 'error').length,
        warnings: issues.filter((issue) => issue.severity === 'warning').length,
        checkedImages: publishedImages.length,
        checkedPages: publishedPages.length,
        checkedSEO: activeSEO.length,
      },
      issues,
    };
  }),
});
