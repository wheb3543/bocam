import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('الإنفاذ التفصيلي للمستخدمين والتقارير', () => {
  it('يفصل إجراءات المستخدمين الخادمية بحسب الصلاحية المطلوبة', () => {
    const source = readFileSync(resolve(process.cwd(), 'server/routers/users.ts'), 'utf8');
    expect(source).toContain("permissionProcedure('users.view'");
    expect(source).toContain("permissionProcedure('users.create'");
    expect(source).toContain("permissionProcedure('users.update'");
    expect(source).toContain("permissionProcedure('users.deactivate'");
    expect(source).toContain("permissionProcedure('users.delete'");
    expect(source).toContain("'users.assign_role'");
    expect(source).toContain('create: usersCreateProcedure');
    expect(source).toContain('update: usersUpdateProcedure');
    expect(source).toContain('delete: usersDeleteProcedure');
  });

  it('يحمي قراءة التقارير وتصدير البيانات بصلاحيتين خادميتين منفصلتين', () => {
    const source = readFileSync(resolve(process.cwd(), 'server/routers/reports.ts'), 'utf8');
    expect(source).toContain("permissionProcedure('reports.view'");
    expect(source).toContain("permissionProcedure('reports.export'");
    expect(source).toContain('getBookingsReport: reportsViewProcedure');
    expect(source).toContain('getDetailedBookingsList: reportsExportProcedure');
    expect(source).toContain('requireReportsFeature()');
  });

  it('يحرس الرسوم وتحليلات التتبع وإحصاءات PWA بصلاحيات العرض وسجل الفرص بصلاحيات العملاء المحتملين', () => {
    const charts = readFileSync(resolve(process.cwd(), 'server/routers/charts.ts'), 'utf8');
    const tracking = readFileSync(resolve(process.cwd(), 'server/routers/tracking.ts'), 'utf8');
    const pwa = readFileSync(resolve(process.cwd(), 'server/routers/pwa.ts'), 'utf8');

    expect(charts).toContain("permissionProcedure('reports.view', 'عرض الرسوم والتحليلات')");
    expect(charts).toContain('registrationsTrend: reportsViewProcedure');
    expect(charts).toContain('summaryComparison: reportsViewProcedure');
    expect(tracking).toContain("permissionProcedure('reports.view', 'عرض تحليلات التتبع')");
    expect(tracking).toContain("permissionProcedure('leads.view', 'عرض الفرص المهجورة')");
    expect(tracking).toContain("permissionProcedure('leads.update', 'تحديث متابعة الفرص المهجورة')");
    expect(tracking).toContain('abandonedFormsList: leadsViewProcedure');
    expect(tracking).toContain('markAbandonedContacted: leadsUpdateProcedure');
    expect(pwa).toContain("permissionProcedure('reports.view', 'عرض إحصاءات PWA')");
    expect(pwa).toContain('getStats: reportsViewProcedure');
  });

  it('يعزل عدادات الشريط الجانبي وإحصاءات القنوات بحسب صلاحية الوحدة', () => {
    const source = readFileSync(resolve(process.cwd(), 'server/routers/routers.ts'), 'utf8');

    expect(source).toContain("permissionProcedure('reports.view', 'عرض تحليلات القنوات')");
    expect(source).toContain("hasRolePermission(db, ctx.user.id, ctx.user.role, 'leads.view')");
    expect(source).toContain("hasRolePermission(db, ctx.user.id, ctx.user.role, 'tasks.view')");
    expect(source).toContain("hasRolePermission(db, ctx.user.id, ctx.user.role, 'communications.view')");
    expect(source).toContain("hasRolePermission(db, ctx.user.id, ctx.user.role, 'users.manage')");
    expect(source).toContain("Partial<Record<'leads' | 'tasks' | 'whatsapp' | 'management', number>>");
    expect(source).toContain('return badges;');
    expect(source).toContain('return {};');
  });
});
