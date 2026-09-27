import { describe, expect, it } from 'vitest';
import { buildPageWindow } from './BlogPagination';

describe('نافذة ترقيم صفحات المدونة', () => {
  it('يعرض صفحة واحدة فقط عند وجود صفحة واحدة', () => {
    expect(buildPageWindow(1, 1)).toEqual([1]);
  });

  it('يعرض كل الصفحات حين يكون العدد قليلاً', () => {
    expect(buildPageWindow(2, 4)).toEqual([1, 2, 3, 4]);
  });

  it('يضع علامة فجوة عند وجود صفحات بعيدة', () => {
    expect(buildPageWindow(1, 75)).toEqual([1, 2, 3, 'gap', 75]);
  });

  it('يوسّع حول الصفحة الحالية في المنتصف', () => {
    expect(buildPageWindow(10, 20)).toEqual([1, 'gap', 8, 9, 10, 11, 12, 'gap', 20]);
  });

  it('يحافظ على الصفحة الأولى والأخيرة دائماً', () => {
    const first = buildPageWindow(1, 30);
    const last = buildPageWindow(30, 30);
    expect(first[0]).toBe(1);
    expect(last[last.length - 1]).toBe(30);
  });

  it('لا يكرر الصفحات عند التداخل', () => {
    const pages = buildPageWindow(5, 9);
    expect(new Set(pages.filter((p) => p !== 'gap')).size).toBe(
      pages.filter((p) => p !== 'gap').length
    );
  });
});
