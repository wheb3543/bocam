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
});
