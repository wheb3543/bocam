import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

function source(path: string) {
  return readFileSync(resolve(process.cwd(), path), 'utf8');
}

describe('إنفاذ صلاحيات الكتالوج والتسجيلات والمحتوى', () => {
  it('يحرس إجراءات الكتالوج الفعلية بصلاحياتها الدقيقة', () => {
    const doctors = source('server/routers/doctors.ts');
    const offers = source('server/routers/offers.ts');
    const camps = source('server/routers/camps.ts');

    expect(doctors).toContain("permissionProcedure('catalog.create'");
    expect(doctors).toContain("permissionProcedure('catalog.publish'");
    expect(offers).toContain("permissionProcedure('catalog.view'");
    expect(offers).toContain("permissionProcedure('catalog.archive'");
    expect(offers).toContain("assertRolePermission(ctx.user, 'catalog.publish'");
    expect(camps).toContain('getAllAdmin: catalogViewProcedure');
    expect(camps).toContain('create: catalogCreateProcedure');
    expect(camps).toContain('toggleActive: catalogUpdateProcedure');
    expect(camps).toContain("'catalog.archive'");
  });

  it('يحرس عرض وتعديل وحذف تسجيلات المخيمات والعروض', () => {
    const files = [
      'server/routers/campRegistrations/queries.ts',
      'server/routers/campRegistrations/status.ts',
      'server/routers/campRegistrations/admin.ts',
      'server/routers/offerLeads/queries.ts',
      'server/routers/offerLeads/status.ts',
      'server/routers/offerLeads/admin.ts',
    ].map(source);
    expect(files.join('\n')).toContain("permissionProcedure('registrations.view'");
    expect(files.join('\n')).toContain("permissionProcedure('registrations.update'");
    expect(files.join('\n')).toContain("permissionProcedure('registrations.delete'");
    expect(files.join('\n')).not.toContain('protectedProcedure');
  });

  it('يربط الجدولة بمسار خادمي ويخفي أفعال SEO والجدولة في الواجهة', () => {
    const publishing = source('server/routers/content/publishing.ts');
    const publishingPage = source('client/src/pages/admin/content/PublishingPage.tsx');
    const seoList = source('client/src/pages/admin/content/components/SEOList.tsx');
    const seoHook = source('client/src/pages/admin/content/hooks/useSEO.ts');

    expect(publishing).toContain("permissionProcedure('content.schedule'");
    expect(publishing).toContain('schedule: publishingScheduleProcedure');
    expect(publishingPage).toContain("can('content.schedule')");
    expect(publishingPage).toContain('canSchedulePublishing');
    expect(seoHook).toContain("can('content.seo.manage')");
    expect(seoList).toContain('canManageSEO');
    expect(seoList).toContain('PermissionHint');
  });

  it('ينسخ الدور إلى نموذج جديد قابل للمراجعة ولا يعدّل المصدر', () => {
    const panel = source('client/src/pages/admin/users/components/RolesPermissionsPanel.tsx');
    expect(panel).toContain('cloneCurrentRole');
    expect(panel).toContain('id: undefined');
    expect(panel).toContain('نسخ هذا الدور');
    expect(panel).toContain('راجع الاسم والمعرف والصلاحيات قبل الحفظ');
  });
});
