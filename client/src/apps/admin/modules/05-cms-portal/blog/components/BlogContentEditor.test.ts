import { describe, expect, it } from 'vitest';
import { wrapWithTag } from './BlogContentEditor';

const STRONG: readonly [string, string] = ['<strong>', '</strong>'];
const H2: readonly [string, string] = ['<h2>', '</h2>'];
const TABLE: readonly [string, string] = ['<table>…</table>', ''];

describe('إدراج وسوم HTML في محرر المقال', () => {
  it('يحيط النص المحدد بالوسم', () => {
    const { html } = wrapWithTag('أعراض وعلاج', STRONG, { start: 0, end: 11 });
    expect(html).toBe('<strong>أعراض وعلاج</strong>');
  });

  it('يحافظ على المحتوى قبل النص المحدد وبعده', () => {
    const source = '<p>قبل كلمات بعد</p>';
    const start = source.indexOf('كلمات');
    const { html } = wrapWithTag(source, STRONG, { start, end: start + 5 });
    expect(html).toContain('<p>قبل ');
    expect(html).toContain('كلمات</strong>');
    expect(html).toContain(' بعد</p>');
  });

  it('يضع المؤشر بعد الوسم الافتتاحي ليكتب المحرر داخله', () => {
    const { caret } = wrapWithTag('نص', STRONG, { start: 0, end: 3 });
    // طول <strong> هو 8 محارف.
    expect(caret).toBe('<strong>'.length + 'نص'.length + '</strong>'.length);
  });

  it('يُدرج وسماً فارغاً عندما لا يوجد تحديد', () => {
    const { html } = wrapWithTag('', H2, { start: 0, end: 0 });
    expect(html).toBe('<h2></h2>');
  });

  it('يتعامل مع الوسوم ذات الخاتمة الفارغة (الجداول)', () => {
    const { html } = wrapWithTag('نص', TABLE, { start: 0, end: 0 });
    expect(html).toBe('<table>…</table>نص');
  });

  it('يحصر المؤشر داخل حدود النص بدل رمي خطأ', () => {
    // المؤشر خارج النطاق (كما يحدث بعد إعادة تحميل النص) يُقصّ إلى النهاية،
    // فتُلحق الوسم فارغاً في نهاية المحتوى دون تحديد نص غير مقصود.
    const { html } = wrapWithTag('قصير', STRONG, { start: 50, end: 999 });
    expect(html).toBe('قصير<strong></strong>');
  });

  it('يبدأ التحديد السالب من صفر بأمان', () => {
    const { html } = wrapWithTag('نص', STRONG, { start: -5, end: 2 });
    expect(html).toBe('<strong>نص</strong>');
  });
});
