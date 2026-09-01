import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('P1-F الإنفاذ التفصيلي لطلبات الوصول', () => {
  it('يفصل قراءة الطلبات عن اتخاذ قرار القبول والرفض في الراوتر الرئيسي', () => {
    const permissions = readFileSync(resolve(process.cwd(), 'shared/rolePermissions.ts'), 'utf8');
    const router = readFileSync(resolve(process.cwd(), 'server/routers/routers.ts'), 'utf8');

    expect(permissions).toContain("'users.access_requests.view'");
    expect(permissions).toContain("'users.access_requests.decide'");
    expect(permissions).toContain("'users.access_requests.view': 'عرض طلبات الوصول'");
    expect(permissions).toContain("'users.access_requests.decide': 'قبول ورفض طلبات الوصول'");
    expect(router).toContain("list: permissionProcedure('users.access_requests.view'");
    expect(router).toContain("pending: permissionProcedure('users.access_requests.view'");
    expect(router).toContain("approve: permissionProcedure('users.access_requests.decide'");
    expect(router).toContain("reject: permissionProcedure('users.access_requests.decide'");
    expect(router).not.toContain('list: adminProcedure');
    expect(router).not.toContain('pending: adminProcedure');
  });

  it('يحافظ على هوية صاحب القرار في تدفق القبول والرفض', () => {
    const router = readFileSync(resolve(process.cwd(), 'server/routers/routers.ts'), 'utf8');
    expect(router).toContain('approveAccessRequest(input.requestId, ctx.user.id)');
    expect(router).toContain('rejectAccessRequest(input.requestId, ctx.user.id)');
  });
});

