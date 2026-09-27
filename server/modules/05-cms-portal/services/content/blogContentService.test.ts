/**
 * Blog Content Service Tests
 * اختبارات خدمة تعقيم محتوى المدونة الطبية
 *
 * تغطي طبقات الدفاع ضد XSS وسلامة المحتوى، لأن جسم المقال يُعرض عبر
 * dangerouslySetInnerHTML في صفحة المقال العامة.
 */

import { describe, expect, it } from 'vitest';
import {
  buildBlogExcerpt,
  buildBlogSlug,
  calculateReadingTime,
  hasMeaningfulBlogContent,
  normalizeArabicForSlug,
  sanitizeBlogHtml,
} from './blogContentService';

describe('تعقيم HTML مقالات المدونة', () => {
  it('يحذف وسوم script و iframe و style بالكامل', () => {
    expect(sanitizeBlogHtml('<p>نص</p><script>alert(1)</script>')).not.toContain('script');
    expect(sanitizeBlogHtml('<iframe src="https://evil.test"></iframe>')).not.toContain('iframe');
    expect(sanitizeBlogHtml('<style>body{display:none}</style><p>مقال</p>')).not.toContain(
      '<style'
    );
  });

  it('يزيل معالجات الأحداث الخطرة من الوسوم', () => {
    const sanitized = sanitizeBlogHtml('<img src="x" onerror="alert(1)">');
    expect(sanitized).not.toContain('onerror');
    expect(sanitized).not.toContain('alert(1)');
  });

  it('يحذف روابط javascript: الخطرة', () => {
    const sanitized = sanitizeBlogHtml('<a href="javascript:alert(1)">اضغط</a>');
    expect(sanitized).not.toContain('javascript:');
  });

  it('يحافظ على الوسوم الطبية المسموحة', () => {
    const medical =
      '<h2>الأعراض</h2><p>ألم وحرارة</p><ul><li>صداع</li></ul>' +
      '<table><thead><tr><th scope="col">العلامة</th></tr></thead><tbody><tr><td>ألم</td></tr></tbody></table>';
    const sanitized = sanitizeBlogHtml(medical);

    expect(sanitized).toContain('<h2>الأعراض</h2>');
    expect(sanitized).toContain('<li>صداع</li>');
    expect(sanitized).toContain('<th scope="col">');
    expect(sanitized).toContain('<td>ألم</td>');
  });

  it('يضيف rel مضادة للتصيّد للروابط التي تفتح نافذة جديدة', () => {
    const sanitized = sanitizeBlogHtml(
      '<a href="https://saudigermanhealth.com" target="_blank">الموقع</a>'
    );
    expect(sanitized).toContain('noopener');
    expect(sanitized).toContain('noreferrer');
  });

  it('يجعل تحميل الصور كسولاً (lazy)', () => {
    expect(sanitizeBlogHtml('<img src="https://cdn.test/a.jpg" alt="صورة">')).toContain('lazy');
  });

  it('يعيد نصاً فارغاً آمناً لأي قيمة غير نصية', () => {
    expect(sanitizeBlogHtml(null)).toBe('');
    expect(sanitizeBlogHtml(undefined)).toBe('');
    expect(sanitizeBlogHtml(123)).toBe('');
    expect(sanitizeBlogHtml({ evil: true })).toBe('');
  });
});

describe('التحقق من اكتمال محتوى المقال', () => {
  it('يقبل محتوى حقيقياً طويلاً بما يكفي', () => {
    expect(
      hasMeaningfulBlogContent('<p>فقرة طبية تشرح أعراض الحالة وعلاجها بشكل صحيح.</p>')
    ).toBe(true);
  });

  it('يرفض القشرة الفارغة أو المحتوى التالف بالكامل', () => {
    expect(hasMeaningfulBlogContent('<p></p>')).toBe(false);
    expect(hasMeaningfulBlogContent('<script>alert(1)</script>')).toBe(false);
    expect(hasMeaningfulBlogContent('')).toBe(false);
  });
});

describe('حساب وقت القراءة', () => {
  it('يعيد صفراً لمحتوى فارغ', () => {
    expect(calculateReadingTime('')).toBe(0);
  });

  it('يحسب 시간اً معقولاً بمعيار 200 كلمة في الدقيقة', () => {
    const words = Array.from({ length: 400 }, (_, i) => `كلمة${i}`).join(' ');
    expect(calculateReadingTime(`<p>${words}</p>`)).toBe(2);
  });

  it('يعيد دقيقة واحدة على الأقل لأي محتوى غير فارغ', () => {
    expect(calculateReadingTime('<p>نص قصير.</p>')).toBe(1);
  });
});

describe('بناء المقتطف التلقائي', () => {
  it('يحوّل HTML إلى نص عادي', () => {
    expect(buildBlogExcerpt('<h2>عنوان</h2><p>محتوى المقال.</p>')).toBe('عنوان محتوى المقال.');
  });

  it('يقتطع عند الحد الأقصى دون قطع الكلمة الأخيرة', () => {
    const body = `<p>${Array.from({ length: 80 }, (_, i) => `الجملة${i}`).join(' ')}</p>`;
    const excerpt = buildBlogExcerpt(body, 100);

    expect(excerpt.length).toBeLessThanOrEqual(101);
    expect(excerpt.endsWith('…')).toBe(true);
    expect(excerpt).not.toContain('<');
  });

  it('يعيد نصاً فارغاً لمحتوى فارغ', () => {
    expect(buildBlogExcerpt('')).toBe('');
    expect(buildBlogExcerpt(null)).toBe('');
  });
});

describe('توليد روابط المقالات العربية', () => {
  it('يوحّد أشكال الهمزة والتاء المربوطة', () => {
    expect(normalizeArabicForSlug('أحمد')).toBe(normalizeArabicForSlug('احمد'));
    expect(normalizeArabicForSlug('إلتهاب')).toBe(normalizeArabicForSlug('التهاب'));
    expect(normalizeArabicForSlug('عيادة')).toBe(normalizeArabicForSlug('عياده'));
  });

  it('يزيل التشكيل والتطويل', () => {
    // «الـعَـلَـام» بعد إزالة التطويل والتشكيل تصبح «العلام»
    expect(normalizeArabicForSlug('الـعَـلَـام')).toBe('العلام');
  });

  it('يحوّل المسافات وعلامات الترقيم إلى شرطات', () => {
    expect(buildBlogSlug('أعراض الكلاميديا عند النساء')).toBe(
      'اعراض-الكلاميديا-عند-النساء'
    );
  });

  it('يحافظ على الحروف العربية في الرابط كما في الموقع المرجعي', () => {
    expect(buildBlogSlug('جرح القدم السكري')).toBe('جرح-القدم-السكري');
  });

  it('يدعم العناوين اللاتينية دون تغيير', () => {
    expect(buildBlogSlug('Diabetes Foot Care')).toBe('diabetes-foot-care');
  });

  it('يختصر الروابط الطويلة جداً', () => {
    const slug = buildBlogSlug('م '.repeat(300));
    expect(slug.length).toBeLessThanOrEqual(120);
  });

  it('يعيد رابطاً احتياطياً لعنوان بلا حروف', () => {
    expect(buildBlogSlug('!!! ???')).toBe('');
  });
});
