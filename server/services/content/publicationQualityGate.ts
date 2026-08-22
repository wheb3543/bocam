import { TRPCError } from '@trpc/server';
import { and, eq, inArray, isNull } from 'drizzle-orm';
import { contentAuditLog, images, sectionButtons, sections } from '../../../drizzle/schema';

export type CmsPublishEntityType = 'page' | 'textContent' | 'image' | 'media' | 'section';

export type PublicationQualityIssue = {
  code: string;
  message: string;
};

type PublishCandidate = {
  [key: string]: unknown;
  id?: number;
  pageId?: number | null;
  sectionId?: number | null;
  key?: string | null;
  content?: string | null;
  url?: string | null;
  altAr?: string | null;
  altEn?: string | null;
  link?: string | null;
};

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

  return issues;
}

/**
 * يفحص الأخطاء التي ستصبح مرئية فعلياً بعد النشر. التحذيرات اللغوية وSEO
 * تبقى ضمن تقرير الجودة ولا تمنع النشر؛ بينما الروابط غير الآمنة والنص البديل
 * المفقود يمنعان النشر إلا بتجاوز إداري موثق.
 */
export async function evaluatePublicationQuality(
  db: any,
  entityType: CmsPublishEntityType,
  candidate: PublishCandidate
): Promise<PublicationQualityIssue[]> {
  const issues = inlineIssues(entityType, candidate);

  if (entityType === 'page' && candidate.id) {
    const pageImages = await db
      .select()
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
    const buttons = await db
      .select()
      .from(sectionButtons)
      .where(
        and(
          eq(sectionButtons.sectionId, sectionId),
          eq(sectionButtons.isActive, 'yes'),
          isNull(sectionButtons.deletedAt)
        )
      );

    for (const button of buttons) {
      if (hasInvalidLink(button.link)) {
        issues.push({
          code: 'section-button-link-invalid',
          message: `زر القسم «${button.textAr || button.textEn}» يحتوي رابطاً غير صالح.`,
        });
      }
    }
  }

  if (entityType === 'page' && candidate.id) {
    const pageSections = await db
      .select({ id: sections.id })
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
      const buttons = await db
        .select()
        .from(sectionButtons)
        .where(
          and(
            inArray(sectionButtons.sectionId, ids),
            eq(sectionButtons.isActive, 'yes'),
            isNull(sectionButtons.deletedAt)
          )
        );
      for (const button of buttons) {
        if (hasInvalidLink(button.link)) {
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
  db: any,
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
    await db.insert(contentAuditLog).values({
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
