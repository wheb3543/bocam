import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const dialogSource = readFileSync(
  resolve(process.cwd(), 'client/src/pages/admin/content/components/dialogs/ApprovalQueueDialog.tsx'),
  'utf8'
);
const pageSource = readFileSync(
  resolve(process.cwd(), 'client/src/pages/admin/content/ContentManagementPage.tsx'),
  'utf8'
);
const submissionPanelSource = readFileSync(
  resolve(process.cwd(), 'client/src/pages/admin/content/components/ApprovalSubmissionPanel.tsx'),
  'utf8'
);
const submissionHelperSource = readFileSync(
  resolve(process.cwd(), 'client/src/pages/admin/content/utils/approvalSubmission.ts'),
  'utf8'
);

describe('طابور موافقات المحتوى', () => {
  it('يعرض الطلبات المعلقة ويربط الاعتماد والرفض بإجراءات الخادم', () => {
    expect(dialogSource).toContain('trpc.content.approvals.getPending.useQuery');
    expect(dialogSource).toContain("can('content.review')");
    expect(dialogSource).toContain('enabled: isActive && canReviewContent');
    expect(dialogSource).toContain('طابور المراجعة مقيّد');
    expect(dialogSource).toContain('approveMutation.mutateAsync');
    expect(dialogSource).toContain('rejectMutation.mutateAsync');
    expect(dialogSource).toContain('أدخل سبب الرفض');
  });

  it('يوفر مدخلاً لطابور الموافقات من صفحة إدارة المحتوى', () => {
    expect(pageSource).toContain('ApprovalQueueDialog');
    expect(pageSource).toContain('الموافقات');
    expect(pageSource).toContain('canReviewContent ?');
    expect(pageSource).toContain('صلاحية مراجعة المحتوى');
  });

  it('يربط محررات CMS بحالة آخر طلب واختيار مراجع وإعادة إرسال الطلب المرفوض', () => {
    expect(submissionPanelSource).toContain('getLatestForCurrentUser.useQuery');
    expect(submissionPanelSource).toContain('getEligibleReviewers.useQuery');
    expect(submissionPanelSource).toContain('إعادة الإرسال للمراجعة');
    expect(submissionHelperSource).toContain('assignedReviewerId');
    expect(pageSource).toContain('approvalEntityId={pages.selectedPage?.id}');
    expect(pageSource).toContain('approvalEntityId={sections.selectedSection?.id}');
  });
});
