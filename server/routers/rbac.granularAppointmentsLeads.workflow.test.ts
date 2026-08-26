import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = (file: string) => readFileSync(resolve(process.cwd(), file), 'utf8');

describe('الإنفاذ التفصيلي للمواعيد والعملاء المحتملين', () => {
  it('يفصل عرض وتعديل وإلغاء وحذف المواعيد على الخادم', () => {
    const appointmentsSource = source('server/routers/appointments.ts');

    expect(appointmentsSource).toContain("permissionProcedure('appointments.view'");
    expect(appointmentsSource).toContain("permissionProcedure('appointments.update'");
    expect(appointmentsSource).toContain("permissionProcedure('appointments.cancel'");
    expect(appointmentsSource).toContain("permissionProcedure('appointments.delete'");
    expect(appointmentsSource).toContain('list: appointmentsViewProcedure');
    expect(appointmentsSource).toContain('cancel: appointmentsCancelProcedure');
    expect(appointmentsSource).toContain('delete: appointmentsDeleteProcedure');
    expect(appointmentsSource).toContain("assertRolePermission(user, 'appointments.cancel'");
  });

  it('يفصل عرض وتعديل العملاء المحتملين من الإجراءات العامة للمستخدم المسجل', () => {
    const leadsSource = source('server/routers/leads.ts');

    expect(leadsSource).toContain("permissionProcedure('leads.view'");
    expect(leadsSource).toContain("permissionProcedure('leads.update'");
    expect(leadsSource).toContain('list: leadsViewProcedure');
    expect(leadsSource).toContain('updateStatus: leadsUpdateProcedure');
    expect(leadsSource).toContain('getStatusHistory: leadsViewProcedure');
  });

  it('لا يرفع صلاحية إدارة عامة قديمة إلى الحذف الحساس للمواعيد', () => {
    const permissionsSource = source('server/services/rolePermissionService.ts');
    expect(permissionsSource).toContain("'appointments.update': 'appointments.manage'");
    expect(permissionsSource).not.toContain("'appointments.delete': 'appointments.manage'");
  });
});
