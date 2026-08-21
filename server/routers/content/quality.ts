import { and, eq, isNull } from 'drizzle-orm';
import { router } from '../../_core/trpc';
import { ensureDatabaseAvailable } from '../../_core/databaseGuard';
import { contentReadProcedure } from './authorization';
import {
  images,
  media,
  pages,
  sectionButtons,
  sections,
  seoSettings,
  textContent,
} from '../../../drizzle/schema';

export type ContentQualityIssue = {
  code: string;
  severity: 'warning' | 'error';
  entityType: 'image' | 'page' | 'seo' | 'text' | 'sectionButton';
  entityId: number;
  title: string;
  description: string;
};

/**
 * فحص بنيوي محلي للروابط. لا تنفذ إدارة المحتوى طلبات HTTP خارجية؛ لأن الرابط
 * الخارجي قد يكون متاحاً مؤقتاً أو يتطلب تفويضاً، بينما الروابط الفارغة أو ذات
 * المخطط غير الآمن تعطل التجربة حتماً.
 */
function hasInvalidLink(value: string | null | undefined) {
  const link = value?.trim();
  if (!link || /^javascript:/i.test(link) || /^data:/i.test(link)) {
    return true;
  }
  if (
    link.startsWith('/') ||
    link.startsWith('#') ||
    link.startsWith('mailto:') ||
    link.startsWith('tel:')
  ) {
    return false;
  }
  try {
    const parsed = new URL(link);
    return !['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return true;
  }
}

function translationKey(key: string) {
  return key.trim().replace(/[._-](ar|en)$/i, '');
}

export const qualityRouter = router({
  getReport: contentReadProcedure.query(async () => {
    const db = await ensureDatabaseAvailable();
    const issues: ContentQualityIssue[] = [];

    const [
      publishedImages,
      publishedMedia,
      publishedPages,
      activeSEO,
      publishedSections,
      publishedTextContent,
      activeSectionButtons,
    ] = await Promise.all([
      db
        .select()
        .from(images)
        .where(
          and(eq(images.status, 'published'), eq(images.isActive, 'yes'), isNull(images.deletedAt))
        ),
      db
        .select()
        .from(media)
        .where(
          and(
            eq(media.type, 'image'),
            eq(media.status, 'published'),
            eq(media.isActive, 'yes'),
            isNull(media.deletedAt)
          )
        ),
      db
        .select()
        .from(pages)
        .where(
          and(eq(pages.status, 'published'), eq(pages.isActive, 'yes'), isNull(pages.deletedAt))
        ),
      db.select().from(seoSettings).where(eq(seoSettings.isActive, 'yes')),
      db
        .select()
        .from(sections)
        .where(
          and(
            eq(sections.status, 'published'),
            eq(sections.isActive, 'yes'),
            isNull(sections.deletedAt)
          )
        ),
      db
        .select()
        .from(textContent)
        .where(
          and(
            eq(textContent.status, 'published'),
            eq(textContent.isActive, 'yes'),
            isNull(textContent.deletedAt)
          )
        ),
      db.select().from(sectionButtons).where(isNull(sectionButtons.deletedAt)),
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
      if (hasInvalidLink(image.url)) {
        issues.push({
          code: 'image-link-invalid',
          severity: 'error',
          entityType: 'image',
          entityId: image.id,
          title: 'صورة منشورة برابط غير صالح',
          description: `الصورة «${image.key}» تحتوي رابطاً فارغاً أو غير صالح ولا يمكن عرضه للزوار.`,
        });
      }
      if (!image.altAr || !image.altEn) {
        issues.push({
          code: 'image-secondary-language-missing',
          severity: 'warning',
          entityType: 'image',
          entityId: image.id,
          title: 'النص البديل للصورة غير مكتمل لغوياً',
          description: `الصورة «${image.key}» تحتاج نصاً بديلاً بالعربية والإنجليزية.`,
        });
      }
    }

    for (const item of publishedMedia) {
      if (hasInvalidLink(item.url)) {
        issues.push({
          code: 'media-link-invalid',
          severity: 'error',
          entityType: 'image',
          entityId: item.id,
          title: 'وسيط منشور برابط غير صالح',
          description: `الوسيط «${item.fileName || item.key}» يحتوي رابطاً فارغاً أو غير صالح.`,
        });
      }
      if (!item.altAr || !item.altEn) {
        issues.push({
          code: 'media-secondary-language-missing',
          severity: 'warning',
          entityType: 'image',
          entityId: item.id,
          title: 'النص البديل للوسيط غير مكتمل لغوياً',
          description: `الوسيط «${item.fileName || item.key}» يحتاج نصاً بديلاً بالعربية والإنجليزية.`,
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

    const textByKey = new Map<string, typeof publishedTextContent>();
    for (const item of publishedTextContent) {
      const matches = textByKey.get(item.key) ?? [];
      matches.push(item);
      textByKey.set(item.key, matches);
    }
    for (const [key, matches] of Array.from(textByKey.entries())) {
      if (matches.length > 1) {
        for (const item of matches) {
          issues.push({
            code: 'text-key-duplicate',
            severity: 'error',
            entityType: 'text',
            entityId: item.id,
            title: 'مفتاح محتوى مكرر',
            description: `مفتاح المحتوى «${key}» مكرر ضمن المحتوى المنشور وقد ينتج عنه عرض غير متوقع.`,
          });
        }
      }
    }

    const languageCoverage = new Map<string, { id: number; languages: Set<string> }>();
    for (const item of publishedTextContent) {
      const key = translationKey(item.key);
      const coverage = languageCoverage.get(key) ?? { id: item.id, languages: new Set<string>() };
      coverage.languages.add(item.language.toLowerCase());
      languageCoverage.set(key, coverage);
    }
    for (const [key, coverage] of Array.from(languageCoverage.entries())) {
      if (!coverage.languages.has('ar') || !coverage.languages.has('en')) {
        issues.push({
          code: 'text-secondary-language-missing',
          severity: 'warning',
          entityType: 'text',
          entityId: coverage.id,
          title: 'المحتوى المنشور لا يغطي اللغتين',
          description: `المفتاح «${key}» يحتاج نسخة عربية ونسخة إنجليزية قبل اكتمال الترجمة.`,
        });
      }
    }

    const seoCoverage = new Map<string, { id: number; languages: Set<string> }>();
    for (const seo of activeSEO) {
      const key = String(seo.pageId ?? seo.pageKey ?? seo.slug ?? seo.id);
      const coverage = seoCoverage.get(key) ?? { id: seo.id, languages: new Set<string>() };
      coverage.languages.add((seo.language || 'ar').toLowerCase());
      seoCoverage.set(key, coverage);
    }
    for (const [key, coverage] of Array.from(seoCoverage.entries())) {
      if (!coverage.languages.has('ar') || !coverage.languages.has('en')) {
        issues.push({
          code: 'seo-secondary-language-missing',
          severity: 'warning',
          entityType: 'seo',
          entityId: coverage.id,
          title: 'إعداد SEO لا يغطي اللغتين',
          description: `إعداد SEO «${key}» يحتاج نسخة عربية ونسخة إنجليزية.`,
        });
      }
    }

    for (const button of activeSectionButtons) {
      if (hasInvalidLink(button.link)) {
        issues.push({
          code: 'section-button-link-invalid',
          severity: 'error',
          entityType: 'sectionButton',
          entityId: button.id,
          title: 'زر قسم برابط غير صالح',
          description: `زر القسم «${button.textAr || button.textEn}» يحتاج رابطاً صالحاً قبل النشر.`,
        });
      }
    }

    return {
      generatedAt: new Date(),
      summary: {
        errors: issues.filter((issue) => issue.severity === 'error').length,
        warnings: issues.filter((issue) => issue.severity === 'warning').length,
        checkedImages: publishedImages.length,
        checkedMedia: publishedMedia.length,
        checkedPages: publishedPages.length,
        checkedSEO: activeSEO.length,
        checkedTextContent: publishedTextContent.length,
      },
      issues,
    };
  }),
});
