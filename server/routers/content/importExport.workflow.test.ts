import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const routerSource = readFileSync(
  resolve(process.cwd(), 'server/routers/content/importExport.ts'),
  'utf8'
);
const componentSource = readFileSync(
  resolve(process.cwd(), 'client/src/pages/admin/content/components/ContentImportExport.tsx'),
  'utf8'
);
const hookSource = readFileSync(
  resolve(process.cwd(), 'client/src/pages/admin/content/hooks/useImportExport.ts'),
  'utf8'
);

describe('النسخة الاحتياطية الموسعة لمحتوى CMS', () => {
  it('يصدر ويقبل الحزمة الموسعة للألوان وSEO والوسائط وسجل التدقيق من خلال صلاحية المدير', () => {
    expect(routerSource).toContain('export: adminProcedure');
    expect(routerSource).toContain('includeColors');
    expect(routerSource).toContain('includeSeoSettings');
    expect(routerSource).toContain('includeMedia');
    expect(routerSource).toContain('includeAuditLog');
    expect(routerSource).toContain('exportData.colors = await db.select().from(colorScheme)');
    expect(routerSource).toContain('exportData.seoSettings = await db.select().from(seoSettings)');
    expect(routerSource).toContain('exportData.auditLog = await db.select().from(contentAuditLog)');
  });

  it('يفرض حدود الحزمة وتفرد المفاتيح وإعادة ربط العلاقات قبل الاستيراد الذري', () => {
    expect(routerSource).toContain('MAX_AUDIT_LOG_ITEMS');
    expect(routerSource).toContain("assertUnique(records(bundle, 'colors'), 'key', 'الألوان')");
    expect(routerSource).toContain("assertUnique(records(bundle, 'mediaFolders'), 'path', 'مجلدات الوسائط')");
    expect(routerSource).toContain("assertUnique(records(bundle, 'media'), 'key', 'الوسائط')");
    expect(routerSource).toContain('await db.transaction');
    expect(routerSource).toContain('pendingPages');
    expect(routerSource).toContain('pendingMediaFolders');
    expect(routerSource).toContain('data.folderId = relationId');
    expect(routerSource).toContain('data.pageId = relationId(record.pageId, pageIdMap, \'إعداد SEO بالصفحة\')');
  });

  it('يحفظ السجل التاريخي فقط بعد إعادة ربط الكيان ويستبعد بيانات المستخدم الحساسة', () => {
    expect(routerSource).toContain('function cleanAuditRecord');
    expect(routerSource).toContain('const entityIdMaps');
    expect(routerSource).toContain('سجل تاريخي مستورد');
    expect(routerSource).toContain('skippedAuditLog');
    expect(routerSource).not.toContain('userId: record.userId');
    expect(routerSource).not.toContain('ipAddress: record.ipAddress');
  });

  it('يتيح اختيار المجموعات ومعاينة الملف وتأكيد الاستيراد من الواجهة', () => {
    expect(componentSource).toContain('تحسين محركات البحث');
    expect(componentSource).toContain('الوسائط');
    expect(componentSource).toContain('سجل التدقيق');
    expect(componentSource).toContain('معاينة حزمة CMS قبل الاستيراد');
    expect(componentSource).toContain('تأكيد الاستيراد الذري');
    expect(hookSource).toContain('asImportPayload');
    expect(hookSource).toContain('utils.content.importExport.export.fetch');
  });
});
