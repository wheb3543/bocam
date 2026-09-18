import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const serviceSource = readFileSync(
  resolve(process.cwd(), 'server/services/content/contentVersionsService.ts'),
  'utf8'
);
const routerSource = readFileSync(
  resolve(process.cwd(), 'server/routers/content/contentVersions.ts'),
  'utf8'
);
const pagesSource = readFileSync(
  resolve(process.cwd(), 'server/routers/content/pages.ts'),
  'utf8'
);
const sectionsSource = readFileSync(
  resolve(process.cwd(), 'server/routers/content/sections.ts'),
  'utf8'
);
const managementSource = readFileSync(
  resolve(process.cwd(), 'client/src/pages/admin/content/ContentManagementPage.tsx'),
  'utf8'
);
const dialogSource = readFileSync(
  resolve(
    process.cwd(),
    'client/src/pages/admin/content/components/dialogs/VersionHistoryDialog.tsx'
  ),
  'utf8'
);

describe('نسخ واستعادة صفحات وأقسام CMS', () => {
  it('يقبل خدمة النسخ وراوترها الصفحة والقسم ككيانات محفوظة', () => {
    expect(serviceSource).toContain("| 'page'");
    expect(serviceSource).toContain("| 'section'");
    expect(routerSource).toContain("'page'");
    expect(routerSource).toContain("'section'");
  });

  it('ينشئ نسخة أمان ويسجل التدقيق ويستعيد الصفحة والقسم داخل معاملة الخادم', () => {
    expect(routerSource).toContain("if (entityType === 'page')");
    expect(routerSource).toContain("if (entityType === 'section')");
    expect(routerSource).toContain('نسخة أمان تلقائية قبل استعادة الصفحة');
    expect(routerSource).toContain('نسخة أمان تلقائية قبل استعادة القسم');
    expect(routerSource).toContain('استعادة نسخة سابقة للصفحة');
    expect(routerSource).toContain('استعادة نسخة سابقة للقسم');
    expect(routerSource).toContain('await db.transaction');
  });

  it('يحفظ راوترا الصفحة والقسم نسخة قبل التغييرات التي قد تحتاج للتراجع', () => {
    expect(pagesSource).toContain('savePageVersion');
    expect(pagesSource).toContain('نسخة قبل تحديث الصفحة');
    expect(pagesSource).toContain('نسخة قبل نشر الصفحة');
    expect(sectionsSource).toContain('saveSectionVersion');
    expect(sectionsSource).toContain('نسخة قبل تحديث القسم');
    expect(sectionsSource).toContain('نسخة قبل نشر القسم');
  });

  it('يربط البطاقات والحوار المركزي بتاريخ نسخ الصفحة والقسم ويحدث القوائم بعد الاستعادة', () => {
    expect(dialogSource).toContain("page: 'صفحة'");
    expect(dialogSource).toContain("section: 'قسم'");
    expect(managementSource).toContain("setSelectedVersionEntityType('page')");
    expect(managementSource).toContain("setSelectedVersionEntityType('section')");
    expect(managementSource).toContain('pages.refetch();');
    expect(managementSource).toContain('sections.refetch();');
  });
});
