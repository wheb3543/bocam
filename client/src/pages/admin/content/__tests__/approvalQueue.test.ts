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

describe('طابور موافقات المحتوى', () => {
  it('يعرض الطلبات المعلقة ويربط الاعتماد والرفض بإجراءات الخادم', () => {
    expect(dialogSource).toContain('trpc.content.approvals.getPending.useQuery');
    expect(dialogSource).toContain('approveMutation.mutateAsync');
    expect(dialogSource).toContain('rejectMutation.mutateAsync');
    expect(dialogSource).toContain('أدخل سبب الرفض');
  });

  it('يوفر مدخلاً لطابور الموافقات من صفحة إدارة المحتوى', () => {
    expect(pageSource).toContain('ApprovalQueueDialog');
    expect(pageSource).toContain('الموافقات');
  });
});
