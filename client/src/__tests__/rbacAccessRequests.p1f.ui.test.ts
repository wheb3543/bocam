import { describe, expect, it } from 'vitest';
import { readSourceFile } from './helpers/sourceReader';

const pageSource = readSourceFile('client/src/pages/admin/users/UsersManagementPage.tsx');
const hookSource = readSourceFile('client/src/pages/admin/users/hooks/useUsers.ts');
const tableSource = readSourceFile('client/src/pages/admin/users/components/AccessRequestsTable.tsx');

describe('P1-F واجهة طلبات الوصول', () => {
  it('يوقف استعلام الطلبات ويكشف صلاحيات العرض والقرار للصفحة', () => {
    expect(hookSource).toContain("can('users.access_requests.view')");
    expect(hookSource).toContain("can('users.access_requests.decide')");
    expect(hookSource).toContain('enabled: !arePermissionsLoading && canViewAccessRequests');
    expect(pageSource).toContain('canViewRequestsFromHook');
    expect(pageSource).toContain('canDecideRequestsFromHook');
  });

  it('يخفي التبويب غير المصرح به ويعرض تلميحاً ويعطل أزرار القرار', () => {
    expect(pageSource).toContain('activeSection === \'requests\' && canViewRequestsFromHook');
    expect(pageSource).toContain('<PermissionHint');
    expect(pageSource).toContain('canDecide={canDecideRequestsFromHook}');
    expect(tableSource).toContain('canDecide: boolean');
    expect(tableSource).toContain('disabled={!canDecide || isPending}');
  });
});

