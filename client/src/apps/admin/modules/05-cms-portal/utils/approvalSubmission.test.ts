import { buildApprovalRequestInput } from './approvalSubmission';
import { describe, expect, it } from 'vitest';

describe('بناء طلب مراجعة المحتوى من المحرر', () => {
  it('يحذف سبب تجاوز الجودة الداخلي ويغلف التغييرات في العقد المقبول من الخادم', () => {
    const input = buildApprovalRequestInput(
      'page',
      42,
      {
        titleAr: 'صفحة محدثة',
        status: 'draft',
        qualityOverrideReason: 'لا يجب إرسال هذا الحقل ضمن التعديل',
      },
      'unassigned'
    );

    expect(input).toMatchObject({
      entityType: 'page',
      entityId: 42,
      assignedReviewerId: undefined,
    });
    expect(JSON.parse(input.changes)).toEqual({
      changes: { titleAr: 'صفحة محدثة', status: 'draft' },
    });
  });

  it('يمرر المراجع المحدد ويغطي أنواع الكيانات التي تدعمها المحررات', () => {
    const entityTypes = ['textContent', 'image', 'page', 'section', 'sectionButton'] as const;

    for (const entityType of entityTypes) {
      const input = buildApprovalRequestInput(entityType, 7, { status: 'draft' }, '15');
      expect(input.assignedReviewerId).toBe(15);
      expect(JSON.parse(input.changes)).toEqual({ changes: { status: 'draft' } });
    }
  });
});
