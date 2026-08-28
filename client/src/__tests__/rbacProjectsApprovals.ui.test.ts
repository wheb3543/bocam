import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const sidebarSource = readFileSync(
  resolve(process.cwd(), 'client/src/components/layout/sidebarData.ts'),
  'utf8'
);
const editableNavigationSource = readFileSync(
  resolve(process.cwd(), 'client/src/config/sidebarNavigation.ts'),
  'utf8'
);
const reviewPageSource = readFileSync(
  resolve(process.cwd(), 'client/src/pages/admin/campaigns/ReviewApprovalPage.tsx'),
  'utf8'
);
const queueSource = readFileSync(
  resolve(process.cwd(), 'client/src/pages/admin/content/components/dialogs/ApprovalQueueDialog.tsx'),
  'utf8'
);

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
