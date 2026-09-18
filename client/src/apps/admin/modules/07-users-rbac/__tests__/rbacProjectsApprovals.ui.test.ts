import { describe, expect, it } from 'vitest';
import { readSourceFile } from '@core/testing/helpers/sourceReader';

const sidebarSource = readSourceFile('client/src/apps/admin/layout/config/sidebarNavigation.ts');
const editableNavigationSource = readSourceFile('client/src/apps/admin/layout/config/sidebarNavigation.ts');
const reviewPageSource = readSourceFile('client/src/apps/admin/modules/04-marketing-publishing/publishing/ReviewApprovalPage.tsx');
const queueSource = readSourceFile('client/src/apps/admin/modules/05-cms-portal/components/dialogs/ApprovalQueueDialog.tsx');

describe('P1-D واجهات المشاريع والمراجعة والاعتماد', () => {
  it('يحمي رابط المشاريع بوصفه عرضاً للحملات في نسختي التنقل', () => {
    expect(sidebarSource).toContain("id: 'projects'");
    expect(sidebarSource).toContain("requiredPermission: 'campaigns.view'");
    expect(editableNavigationSource).toContain("id: 'projects'");
    expect(editableNavigationSource).toContain("requiredPermission?: RolePermission");
  });

  it('يحمي رابط المراجعة ويعرض طابور الموافقات الفعلي بدلاً من طلبات الوصول', () => {
    expect(sidebarSource).toContain("requiredPermission: 'content.review'");
    expect(editableNavigationSource).toContain("id: 'review-approval'");
    expect(reviewPageSource).toContain('ApprovalQueuePanel');
    expect(reviewPageSource).not.toContain('AccessRequest');
  });

  it('يعطل استعلامات الطابور ويعرض تلميح الصلاحية عند غياب حق المراجعة', () => {
    expect(queueSource).toContain("can('content.review')");
    expect(queueSource).toContain('enabled: isActive && canReviewContent');
    expect(queueSource).toContain('<PermissionHint');
  });
});
