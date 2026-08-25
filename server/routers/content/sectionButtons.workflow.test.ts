import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const routerSource = readFileSync(
  resolve(process.cwd(), 'server/routers/content/sectionButtons.ts'),
  'utf8'
);
const qualitySource = readFileSync(
  resolve(process.cwd(), 'server/services/content/publicationQualityGate.ts'),
  'utf8'
);
const listSource = readFileSync(
  resolve(process.cwd(), 'client/src/pages/admin/content/components/SectionButtonsList.tsx'),
  'utf8'
);
const dialogSource = readFileSync(
  resolve(
    process.cwd(),
    'client/src/pages/admin/content/components/dialogs/SectionButtonDialog.tsx'
  ),
  'utf8'
);
const approvalsSource = readFileSync(
  resolve(process.cwd(), 'server/routers/content/approvals.ts'),
  'utf8'
);

describe('دورة CMS لأزرار الأقسام', () => {
  it('تدعم حالات المسودة والنشر والأرشفة والحذف الناعم والاستعادة والنسخ', () => {
    expect(routerSource).toContain("z.enum(['draft', 'published', 'archived'])");
    expect(routerSource).toContain('publish: contentPublishProcedure');
    expect(routerSource).toContain('archive: contentPublishProcedure');
    expect(routerSource).toContain('restore: adminProcedure');
    expect(routerSource).toContain('duplicate: contentCreateProcedure');
    expect(routerSource).toContain("set({ deletedAt: new Date() })");
    expect(routerSource).toContain("set({ deletedAt: null, status: 'draft', publishedAt: null })");
  });

  it('يفرض جودة الرابط قبل النشر ويسجل النسخ والتدقيق في جميع التغييرات الحرجة', () => {
    expect(qualitySource).toContain("'sectionButton'");
    expect(qualitySource).toContain('لا يمكن نشر زر قسم برابط فارغ أو غير صالح.');
    expect(routerSource).toContain("entityType: 'sectionButton'");
    expect(routerSource).toContain('assertPublicationQuality');
    expect(routerSource).toContain('saveButtonVersion');
    expect(routerSource).toContain('auditLogService.logChange');
  });

  it('يوفر الواجهة الفعلية للنشر والجدولة وأخطاء الجودة وسجل النسخ', () => {
    expect(listSource).toContain('SectionButtonDialog');
    expect(listSource).toContain('onVersionHistory');
    expect(listSource).toContain('onRestoreButton');
    expect(dialogSource).toContain('حالة النشر');
    expect(dialogSource).toContain('موعد النشر المؤجل');
    expect(dialogSource).toContain('PublicationQualityFeedback');
  });

  it('يقبل طلب مراجعة زر القسم ويعيد فحص الجودة عند اعتماد النشر', () => {
    expect(approvalsSource).toContain("'sectionButton'");
    expect(approvalsSource).toContain('sectionButtonChangeSchema');
    expect(approvalsSource).toContain("pendingApproval.entityType === 'sectionButton'");
    expect(approvalsSource).toContain('assertPublicationQuality(tx');
  });
});
