import { describe, expect, it } from 'vitest';
import {
  buildBlogPostHref,
  clampExcerpt,
  formatBlogDate,
  formatMonthName,
  formatReadingTime,
  parseBlogTags,
  stripHtml,
} from './blogPresentation';

describe('تنسيق تاريخ المقال', () => {
  it('ينسّق تاريخاً صالحاً بصيغة عربية مقروءة', () => {
    const formatted = formatBlogDate('2026-04-15T10:00:00.000Z');
    expect(formatted).toMatch(/2026/);
    expect(formatted.length).toBeGreaterThan(4);
  });

  it('يقبل كائن Date', () => {
    expect(formatBlogDate(new Date('2026-01-20T10:00:00.000Z'))).toMatch(/2026/);
  });

  it('يعيد نصاً فارغاً للقيم الفارغة أو غير الصالحة', () => {
    expect(formatBlogDate(null)).toBe('');
    expect(formatBlogDate(undefined)).toBe('');
    expect(formatBlogDate('')).toBe('');
    expect(formatBlogDate('نص-غير-تاريخ')).toBe('');
  });
});

describe('أسماء الشهور', () => {
  it('يعيد اسم شهر عربي ضمن النطاق الآمن', () => {
    expect(formatMonthName(3)).toBe('أبريل');
    expect(formatMonthName(-5)).toBe('يناير');
    expect(formatMonthName(99)).toBe('ديسمبر');
  });

  it('يدعم الاسم الإنجليزي', () => {
    expect(formatMonthName(0, 'en')).toBe('January');
  });
});

describe('اشتقاق المقتطف', () => {
  it('يزيل الوسوم والكيانات من HTML', () => {
    expect(stripHtml('<p>عنوان &amp; نص</p>')).toBe('عنوان & نص');
  });

  it('يعيد النص كما هو إن كان أقصر من الحد', () => {
    expect(clampExcerpt('مقتطف قصير')).toBe('مقتطف قصير');
  });

  it('يقتطع ولا يقطع الكلمة الأخيرة', () => {
    const long = `${Array.from({ length: 40 }, (_, i) => `الجملة${i}`).join(' ')}`;
    const excerpt = clampExcerpt(long, 60);

    expect(excerpt.length).toBeLessThanOrEqual(61);
    expect(excerpt.endsWith('…')).toBe(true);
    expect(excerpt).not.toContain('الجملة39');
  });

  it('يتعامل مع القيم الفارغة بأمان', () => {
    expect(clampExcerpt(null)).toBe('');
    expect(clampExcerpt(undefined)).toBe('');
  });
});

describe('صياغة وقت القراءة', () => {
  it('يستخدم «أقل من دقيقة» للزمن الصفري', () => {
    expect(formatReadingTime(0)).toBe('أقل من دقيقة');
    expect(formatReadingTime(null)).toBe('أقل من دقيقة');
  });

  it('يستخدم المفرد للدقيقة الواحدة', () => {
    expect(formatReadingTime(1)).toBe('1 دقيقة قراءة');
  });

  it('يستخدم الجمع للدقائق المتعددة', () => {
    expect(formatReadingTime(5)).toBe('5 دقائق قراءة');
  });
});

describe('قراءة وسوم المقال', () => {
  it('يحل مصفوفة JSON إلى وسوم نظيفة', () => {
    expect(parseBlogTags('["سكري","قلب","  ضغط  "]')).toEqual(['سكري', 'قلب', 'ضغط']);
  });

  it('يدعم النص المفصول بفواصل كصيغة احتياطية', () => {
    expect(parseBlogTags('سكري, قلب')).toEqual(['سكري', 'قلب']);
  });

  it('يعيد قائمة فارغة للقيم التالفة أو الفارغة', () => {
    expect(parseBlogTags(null)).toEqual([]);
    expect(parseBlogTags('')).toEqual([]);
    expect(parseBlogTags('{ليس JSON}')).toEqual([]);
  });
});

describe('بناء رابط المقال', () => {
  it('يبني المسار من الـ slug', () => {
    expect(buildBlogPostHref('abc')).toBe('/blog/abc');
  });

  it('يشفّر المحارف الخاصة بالعربية', () => {
    expect(buildBlogPostHref('جرح القدم')).toBe(`/blog/${encodeURIComponent('جرح القدم')}`);
  });

  it('يعود إلى صفحة المدونة عند غياب الرابط', () => {
    expect(buildBlogPostHref(null)).toBe('/blog');
    expect(buildBlogPostHref('  ')).toBe('/blog');
  });

  it('يتجاهل الشرطات المائلة الزائدة', () => {
    expect(buildBlogPostHref('/abc')).toBe('/blog/abc');
  });
});
