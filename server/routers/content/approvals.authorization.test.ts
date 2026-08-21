import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = readFileSync(resolve(process.cwd(), 'server/routers/content/approvals.ts'), 'utf8');

describe('حماية تدفق موافقات المحتوى', () => {
  it('يحصر الإنشاء بالمحررين والموافقة أو الرفض بالمراجعين', () => {
    expect(source).toContain('create: contentEditProcedure');
    expect(source).toContain('approve: contentReviewProcedure');
    expect(source).toContain('reject: contentReviewProcedure');
    expect(source).toContain('updateStatus: contentReviewProcedure');
  });

  it('يبلغ المستخدمين المؤهلين للمراجعة عند إنشاء طلب جديد', () => {
    expect(source).toContain("inArray(users.role, ['admin', 'manager', 'team_leader'])");
    expect(source).toContain('createApprovalRequestedNotification');
  });
});
