import { TRPCError } from '@trpc/server';
import { and, eq, inArray, isNull } from 'drizzle-orm';
import { contentAuditLog, images, pages, sectionButtons, sections } from '../../../drizzle/schema';

export type CmsPublishEntityType =
  'page' | 'textContent' | 'image' | 'media' | 'section' | 'sectionButton' | 'seo';

export type PublicationQualityIssue = {
  code: string;
  message: string;
};

/**
 * مؤشر بسيط وموحد لواجهة الإدارة: تبدأ الإعدادات من 100% وتُخصم 20 نقطة
 * لكل ملاحظة نشر، مع عدم السماح بنزول النسبة عن الصفر.
 */
export function getPublicationQualityScore(issues: PublicationQualityIssue[]) {
  return Math.max(0, 100 - issues.length * 20);
}

type PublishCandidate = {
  [key: string]: unknown;
  id?: number;
  pageId?: number | null;
  sectionId?: number | null;
  key?: string | null;
  pageKey?: string | null;
  slug?: string | null;
  content?: string | null;
  url?: string | null;
  altAr?: string | null;
  altEn?: string | null;
  link?: string | null;
  canonicalUrl?: string | null;
  ogImage?: string | null;
  structuredData?: string | null;
  title?: string | null;
  description?: string | null;
  robots?: string | null;
};

type DatabaseLike = {
  select?: Function;
  insert?: Function;
  update?: Function;
  delete?: Function;
  transaction?: Function;
};

type SeoPageProfile = 'main' | 'sub' | 'general';

const seoQualityProfiles: Record<
  SeoPageProfile,
  {
    minTitleLength: number;
    minDescriptionLength: number;
    requiresCanonical: boolean;
    requiresRobots: boolean;
  }
> = {
  main: {
    minTitleLength: 30,
    minDescriptionLength: 120,
    requiresCanonical: true,
    requiresRobots: true,
  },
  sub: {
    minTitleLength: 20,
    minDescriptionLength: 70,
    requiresCanonical: true,
    requiresRobots: false,
  },
  general: {
    minTitleLength: 20,
    minDescriptionLength: 70,
    requiresCanonical: false,
    requiresRobots: false,
  },
};

async function getSeoPageProfile(
  db: DatabaseLike,
  candidate: PublishCandidate
): Promise<SeoPageProfile> {
  if (!candidate.pageId || !db?.select) {
    return 'general';
  }

  const [page] = await db
    .select({ type: pages.type })
    .from(pages)
    .where(eq(pages.id, candidate.pageId))
    .limit(1);

  return page?.type === 'main' || page?.type === 'sub' ? page.type : 'general';
}

function seoProfileIssues(profile: SeoPageProfile, candidate: PublishCandidate) {
  const rules = seoQualityProfiles[profile];
  const profileLabel =
    profile === 'main' ? 'الصفحة الرئيسية' : profile === 'sub' ? 'الصفحة الفرعية' : 'الإعداد العام';
  const issues: PublicationQualityIssue[] = [];
  const title = candidate.title?.trim() ?? '';
  const description = candidate.description?.trim() ?? '';

  if (title.length < rules.minTitleLength || title.length > 60) {
    issues.push({
      code: `seo-title-length-${profile}`,
      message: `${profileLabel}: يجب أن يتراوح عنوان SEO بين ${rules.minTitleLength} و60 حرفاً.`,
    });
  }
  if (description.length < rules.minDescriptionLength || description.length > 160) {
    issues.push({
      code: `seo-description-length-${profile}`,
      message: `${profileLabel}: يجب أن يتراوح وصف SEO بين ${rules.minDescriptionLength} و160 حرفاً.`,
    });
  }
  if (rules.requiresCanonical && !candidate.canonicalUrl?.trim()) {
    issues.push({
      code: `seo-canonical-required-${profile}`,
      message: `${profileLabel}: يتطلب رابطاً أساسياً Canonical قبل النشر.`,
    });
  }
  if (rules.requiresRobots && !candidate.robots?.trim()) {
    issues.push({
      code: `seo-robots-required-${profile}`,
      message: `${profileLabel}: تتطلب تعليمات robots صريحة قبل النشر.`,
    });
  }

  return issues;
}

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

function inlineIssues(entityType: CmsPublishEntityType, candidate: PublishCandidate) {
  const issues: PublicationQualityIssue[] = [];

  if (entityType === 'image' || entityType === 'media') {
    if (!(candidate.altAr?.trim() || candidate.altEn?.trim())) {
      issues.push({
        code: 'image-alt-missing',
        message: 'لا يمكن نشر صورة أو وسيط بصري بلا نص بديل عربي أو إنجليزي.',
      });
    }
    if (hasInvalidLink(candidate.url)) {
      issues.push({
        code: 'image-link-invalid',
        message: 'لا يمكن نشر صورة أو وسيط برابط فارغ أو غير صالح.',
      });
    }
  }

  if (entityType === 'textContent' && !candidate.content?.trim()) {
    issues.push({
      code: 'text-content-empty',
      message: 'لا يمكن نشر محتوى نصي فارغ.',
    });
  }

  if (entityType === 'sectionButton' && hasInvalidLink(candidate.link)) {
    issues.push({
      code: 'section-button-link-invalid',
      message: 'لا يمكن نشر زر قسم برابط فارغ أو غير صالح.',
    });
  }

  if (entityType === 'seo') {
    const hasTarget = Boolean(
      candidate.pageId || candidate.pageKey?.trim() || candidate.slug?.trim()
    );
    if (!hasTarget) {
      issues.push({
        code: 'seo-target-missing',
        message: 'لا يمكن نشر إعداد SEO بلا صفحة مرتبطة أو مفتاح صفحة أو رابط.',
      });
    }
    for (const [field, label] of [
      ['canonicalUrl', 'الرابط الأساسي'],
      ['ogImage', 'صورة Open Graph'],
    ] as const) {
      const value = candidate[field];
      if (typeof value === 'string' && value.trim() && hasInvalidLink(value)) {
        issues.push({
          code: `seo-${field}-invalid`,
          message: `لا يمكن نشر إعداد SEO لأن ${label} غير صالح أو غير آمن.`,
        });
      }
    }
    if (typeof candidate.structuredData === 'string' && candidate.structuredData.trim()) {
      try {
        JSON.parse(candidate.structuredData);
      } catch {
        issues.push({
          code: 'seo-structured-data-invalid',
          message: 'لا يمكن نشر إعداد SEO ببيانات منظمة غير صالحة JSON.',
        });
      }
    }
  }

  return issues;
}

/**
 * يفحص الأخطاء التي ستصبح مرئية فعلياً بعد النشر. التحذيرات اللغوية وSEO
 * تبقى ضمن تقرير الجودة ولا تمنع النشر؛ بينما الروابط غير الآمنة والنص البديل
 * المفقود يمنعان النشر إلا بتجاوز إداري موثق.
 */
export async function evaluatePublicationQuality(
  db: DatabaseLike,
  entityType: CmsPublishEntityType,
  candidate: PublishCandidate
): Promise<PublicationQualityIssue[]> {
  const issues = inlineIssues(entityType, candidate);

  if (entityType === 'seo') {
    issues.push(...seoProfileIssues(await getSeoPageProfile(db, candidate), candidate));
  }

  if (entityType === 'page' && candidate.id) {
    const select = db.select;
    if (!select) {
      return issues;
    }
    const pageImages = await select()
      .from(images)
      .where(
        and(
          eq(images.pageId, candidate.id),
          eq(images.status, 'published'),
          eq(images.isActive, 'yes'),
          isNull(images.deletedAt)
        )
      );

    for (const image of pageImages) {
      issues.push(
        ...inlineIssues('image', image).map((issue) => ({
          ...issue,
          message: `الصورة «${image.key}» المرتبطة بالصفحة: ${issue.message}`,
        }))
      );
    }
  }

  const sectionId = entityType === 'section' ? candidate.id : candidate.sectionId;
  if (sectionId) {
    const select = db.select;
    if (!select) {
      return issues;
    }
    const buttons = await select()
      .from(sectionButtons)
      .where(
        and(
          eq(sectionButtons.sectionId, sectionId),
          eq(sectionButtons.isActive, 'yes'),
          isNull(sectionButtons.deletedAt)
        )
      );

    for (const button of buttons) {
      if (hasInvalidLink(String(button.link ?? ''))) {
        issues.push({
          code: 'section-button-link-invalid',
          message: `زر القسم «${button.textAr || button.textEn}» يحتوي رابطاً غير صالح.`,
        });
      }
    }
  }

  if (entityType === 'page' && candidate.id) {
    const select = db.select;
    if (!select) {
      return issues;
    }
    const pageSections = await select({ id: sections.id })
      .from(sections)
      .where(
        and(
          eq(sections.pageId, candidate.id),
          eq(sections.status, 'published'),
          eq(sections.isActive, 'yes'),
          isNull(sections.deletedAt)
        )
      );
    const ids = pageSections.map((section: { id: number }) => section.id);
    if (ids.length) {
      const select = db.select;
      if (!select) {
        return issues;
      }
      const buttons = await select()
        .from(sectionButtons)
        .where(
          and(
            inArray(sectionButtons.sectionId, ids),
            eq(sectionButtons.isActive, 'yes'),
            isNull(sectionButtons.deletedAt)
          )
        );
      for (const button of buttons) {
        if (hasInvalidLink(String(button.link ?? ''))) {
          issues.push({
            code: 'section-button-link-invalid',
            message: `زر قسم منشور «${button.textAr || button.textEn}» يحتوي رابطاً غير صالح.`,
          });
        }
      }
    }
  }

  return issues;
}

export async function assertPublicationQuality(
  db: DatabaseLike,
  options: {
    entityType: CmsPublishEntityType;
    entityId?: number;
    candidate: PublishCandidate;
    role: string;
    userId: number;
    overrideReason?: string;
  }
) {
  const issues = await evaluatePublicationQuality(db, options.entityType, options.candidate);
  if (!issues.length) {
    return { issues, overridden: false };
  }

  const reason = options.overrideReason?.trim();
  if (!reason) {
    throw new TRPCError({
      code: 'PRECONDITION_FAILED',
      message: `فشل فحص جودة النشر:\n${issues.map((issue) => `• ${issue.message}`).join('\n')}`,
      cause: { issues },
    });
  }
  if (options.role !== 'admin') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'تجاوز أخطاء جودة المحتوى متاح للمدير فقط.',
    });
  }
  if (reason.length < 5) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'سبب تجاوز الجودة يجب أن يتكون من خمسة أحرف على الأقل.',
    });
  }

  if (options.entityId) {
    const insert = db.insert;
    if (!insert) {
      throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'قاعدة البيانات غير متاحة.' });
    }
    await insert(contentAuditLog).values({
      entityType:
        options.entityType === 'textContent'
          ? 'text'
          : options.entityType === 'media'
            ? 'image'
            : options.entityType,
      entityId: options.entityId,
      action: 'update',
      userId: options.userId,
      newValue: JSON.stringify({
        qualityOverride: true,
        issueCodes: issues.map((issue) => issue.code),
      }),
      reason: `تجاوز جودة النشر: ${reason}`,
    });
  }

  return { issues, overridden: true };
}
