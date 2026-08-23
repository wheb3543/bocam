import { describe, expect, it, vi } from 'vitest';
import {
  assertPublicationQuality,
  evaluatePublicationQuality,
  getPublicationQualityScore,
} from './publicationQualityGate';

function createAuditDb() {
  const values = vi.fn().mockResolvedValue(undefined);
  return {
    insert: vi.fn().mockReturnValue({ values }),
    values,
  };
}

function createSeoPageDb(type: 'main' | 'sub') {
  const limit = vi.fn().mockResolvedValue([{ type }]);
  const where = vi.fn().mockReturnValue({ limit });
  const from = vi.fn().mockReturnValue({ where });
  return { select: vi.fn().mockReturnValue({ from }) };
}

const imageWithoutAlt = {
  key: 'hero-image',
  url: 'https://cdn.example.test/hero.avif',
  altAr: '',
  altEn: '',
};

describe('assertPublicationQuality', () => {
  it('يحوّل عدد ملاحظات النشر إلى نسبة جودة محكومة بين صفر ومئة', () => {
    expect(getPublicationQualityScore([])).toBe(100);
    expect(getPublicationQualityScore([{ code: 'a', message: 'ملاحظة' }])).toBe(80);
    expect(
      getPublicationQualityScore(Array.from({ length: 8 }, (_, index) => ({ code: `${index}`, message: '' })))
    ).toBe(0);
  });

  it('يرفض نشر صورة بلا نص بديل برمز PRECONDITION_FAILED', async () => {
    await expect(
      assertPublicationQuality({}, {
        entityType: 'image',
        entityId: 41,
        candidate: imageWithoutAlt,
        role: 'admin',
        userId: 7,
      })
    ).rejects.toMatchObject({ code: 'PRECONDITION_FAILED' });
  });

  it('يسمح للمدير بتجاوز خطأ الجودة عند توثيق السبب في سجل التدقيق', async () => {
    const db = createAuditDb();

    const result = await assertPublicationQuality(db, {
      entityType: 'image',
      entityId: 42,
      candidate: imageWithoutAlt,
      role: 'admin',
      userId: 8,
      overrideReason: 'الصورة مؤقتة بانتظار استلام الوصف المعتمد.',
    });

    expect(result.overridden).toBe(true);
    expect(db.insert).toHaveBeenCalledTimes(1);
    expect(db.values).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: 'image',
        entityId: 42,
        userId: 8,
        reason: expect.stringContaining('تجاوز جودة النشر'),
      })
    );
  });

  it('يرفض طلب التجاوز من مستخدم ليس مديراً', async () => {
    const db = createAuditDb();

    await expect(
      assertPublicationQuality(db, {
        entityType: 'image',
        entityId: 43,
        candidate: imageWithoutAlt,
        role: 'editor',
        userId: 9,
        overrideReason: 'سبب موثق لتجاوز الفحص مؤقتاً.',
      })
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });

    expect(db.insert).not.toHaveBeenCalled();
  });

  it('يفرض متطلبات SEO الأشد للصفحة الرئيسية قبل النشر', async () => {
    const issues = await evaluatePublicationQuality(createSeoPageDb('main'), 'seo', {
      pageId: 1,
      title: 'عنوان قصير',
      description: 'وصف قصير',
      canonicalUrl: null,
      robots: null,
    });

    expect(issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining([
        'seo-title-length-main',
        'seo-description-length-main',
        'seo-canonical-required-main',
        'seo-robots-required-main',
      ])
    );
  });

  it('يطبق نطاقات SEO المناسبة للصفحات الفرعية دون اشتراط robots', async () => {
    const issues = await evaluatePublicationQuality(createSeoPageDb('sub'), 'seo', {
      pageId: 2,
      title: 'عنوان صفحة فرعية مناسب للاختبار',
      description: 'وصف صفحة فرعية مناسب لاختبار سياسة الجودة ويحتوي عدداً كافياً من الأحرف المطلوبة.',
      canonicalUrl: 'https://example.test/services',
      robots: null,
    });

    expect(issues.filter((issue) => issue.code.startsWith('seo-'))).toEqual([]);
  });
});
