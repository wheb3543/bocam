import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(
  resolve(process.cwd(), 'server/routers/public/content.ts'),
  'utf8'
);

describe('فصل أزرار الأقسام المنشورة عن معاينة المسودة', () => {
  it('يفرض حالة النشر في مسار محتوى الصفحة العام', () => {
    const getPageContentSource = source.slice(
      source.indexOf('getPageContentByPageId: publicProcedure'),
      source.indexOf('getDraftPreview: publicProcedure')
    );

    expect(getPageContentSource).toContain("eq(sectionButtons.status, 'published')");
    expect(getPageContentSource).not.toContain("ne(sectionButtons.status, 'archived')");
  });

  it('يسمح بالمسودات غير المؤرشفة فقط داخل معاينة الرمز المؤقت', () => {
    const draftPreviewSource = source.slice(
      source.indexOf('getDraftPreview: publicProcedure'),
      source.indexOf('getSectionButtons: publicProcedure')
    );

    expect(draftPreviewSource).toContain("ne(sectionButtons.status, 'archived')");
    expect(draftPreviewSource).not.toContain("eq(sectionButtons.status, 'published')");
  });

  it('يفرض النشر عند جلب أزرار قسم منفرد من API العام', () => {
    const sectionButtonsSource = source.slice(source.indexOf('getSectionButtons: publicProcedure'));

    expect(sectionButtonsSource).toContain("eq(sectionButtons.status, 'published')");
    expect(sectionButtonsSource).toContain('isNull(sectionButtons.deletedAt)');
  });
});
