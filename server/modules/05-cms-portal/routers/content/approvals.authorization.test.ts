import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = readFileSync(resolve(process.cwd(), 'server/routers/content/approvals.ts'), 'utf8');

describe('حماية تدفق موافقات المحتوى', () => {
  it('يحصر الإنشاء بالمحررين والموافقة أو الرفض بالمراجعين', () => {
    expect(source).toContain('create: contentUpdateProcedure');
    expect(source).toContain('approve: contentReviewProcedure');
    expect(source).toContain('reject: contentReviewProcedure');
    expect(source).toContain('updateStatus: contentReviewProcedure');
  });

  it('يحدد المراجعين حسب صلاحية المحتوى ويقيد قائمة طابور الاعتماد وعملياتها بالمراجعة', () => {
    expect(source).toContain('getEligibleContentReviewers');
    expect(source).toContain("hasRolePermission(db, reviewer.id, reviewer.role, 'content.review')");
    expect(source).toContain('list: contentReviewProcedure');
    expect(source).toContain('getById: contentReviewProcedure');
    expect(source).toContain('delete: contentReviewProcedure');
    expect(source).toContain('getEligibleReviewers: contentUpdateProcedure');
    expect(source).toContain('getMyApprovals: contentUpdateProcedure');
    expect(source).not.toContain('const reviewerRoles =');
    expect(source).toContain('createApprovalRequestedNotification');
  });
});
