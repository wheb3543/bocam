import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const routerSource = readFileSync(
  resolve(process.cwd(), 'server/routers/content/approvals.ts'),
  'utf8'
);
const notificationHelperSource = readFileSync(
  resolve(process.cwd(), 'server/_core/notificationHelper.ts'),
  'utf8'
);
const dialogSource = readFileSync(
  resolve(
    process.cwd(),
    'client/src/pages/admin/content/components/dialogs/ApprovalQueueDialog.tsx'
  ),
  'utf8'
);
const mediaPickerSource = readFileSync(
  resolve(process.cwd(), 'client/src/components/form/MediaPicker.tsx'),
  'utf8'
);
const submissionPanelSource = readFileSync(
  resolve(process.cwd(), 'client/src/pages/admin/content/components/ApprovalSubmissionPanel.tsx'),
  'utf8'
);

describe('تدفق موافقات المحتوى', () => {
  it('يطبق التغيير المعتمد داخل معاملة مع نسخة أمان وسجل تدقيق', () => {
    expect(routerSource).toContain('await db.transaction');
    expect(routerSource).toContain('parseApprovalChanges');
    expect(routerSource).toContain('await tx.insert(contentVersions)');
    expect(routerSource).toContain('await tx.insert(contentAuditLog)');
    expect(routerSource).toContain("eq(contentApprovals.status, 'pending')");
    expect(routerSource).toContain("status: z.enum(['rejected'])");
  });

  it('يتحقق من المراجع المعيّن ويتيح التعيين فقط للمستخدمين ذوي صلاحية المراجعة', () => {
    expect(routerSource).toContain('assignedReviewerId');
    expect(routerSource).toContain('getEligibleReviewers');
    expect(routerSource).toContain('assignReviewer');
    expect(routerSource).toContain('getEligibleContentReviewers');
    expect(routerSource).toContain("hasRolePermission(db, reviewer.id, reviewer.role, 'content.review')");
    expect(routerSource).not.toContain('const reviewerRoles =');
    expect(routerSource).toContain('هذا الطلب معيّن لمراجع آخر');
  });

  it('يرسل إشعاراً مباشراً للمراجع عند إسناد أو إعادة إسناد طلب معلق', () => {
    expect(routerSource).toContain('createApprovalReviewerAssignedNotification');
    expect(notificationHelperSource).toContain("event: 'reviewer_assigned'");
    expect(routerSource).toContain('input.assignedReviewerId !== approval.assignedReviewerId');
  });

  it('يوفر للمراجع اختياراً واضحاً في طابور الموافقات دون إدخال حر', () => {
    expect(dialogSource).toContain('getEligibleReviewers.useQuery');
    expect(dialogSource).toContain('assignReviewerMutation');
    expect(dialogSource).toContain('المراجع المعيّن');
    expect(dialogSource).toContain('SelectItem value="unassigned"');
  });

  it('يعرض محدد الصور محتوى مكتبة الوسائط الموحدة مع إبقاء فلتر الصور', () => {
    expect(mediaPickerSource).toContain('trpc.content.media.list.useQuery');
    expect(mediaPickerSource).toContain("type: 'image'");
    expect(mediaPickerSource).not.toContain('trpc.content.images.list.useQuery');
  });

  it('يعيد آخر طلب للمحرر ويعرض حالته ومراجعه لإتاحة إعادة الإرسال بعد الرفض', () => {
    expect(routerSource).toContain('getLatestForCurrentUser: contentUpdateProcedure');
    expect(routerSource).toContain('eq(contentApprovals.requestedBy, ctx.user.id)');
    expect(routerSource).toContain('orderBy(desc(contentApprovals.requestedAt))');
    expect(submissionPanelSource).toContain('getLatestForCurrentUser.useQuery');
    expect(submissionPanelSource).toContain('إعادة الإرسال للمراجعة');
    expect(submissionPanelSource).toContain('المراجع المعيّن');
  });
});
