import { auditLogService } from './content/auditLogService';
import { notifyEligibleRecipients } from './notificationPolicy';

export type ContentOperationKind = 'media_upload' | 'cms_import' | 'cms_export';
export type ContentOperationStatus = 'succeeded' | 'failed';

type ContentOperationNotificationInput = {
  operation: ContentOperationKind;
  status: ContentOperationStatus;
  attemptedItems: number;
  completedItems?: number;
  actorId?: number;
  details?: Record<string, unknown>;
};

const operationLabels: Record<ContentOperationKind, string> = {
  media_upload: 'رفع وفهرسة الوسائط',
  cms_import: 'استيراد محتوى CMS',
  cms_export: 'تصدير محتوى CMS',
};

/**
 * يسجل نتيجة العملية مرة واحدة ثم يرسل ملخصاً إلى المستلمين المؤهلين. لا تمرر
 * أسماء ملفات أو محتوى المستندات إلى صندوق الإشعارات كي يبقى الملخص تشغيلياً وآمناً.
 */
export async function recordContentOperation(
  db: any,
  input: ContentOperationNotificationInput
): Promise<void> {
  const label = operationLabels[input.operation];
  const completedItems = input.completedItems ?? 0;
  const isSuccess = input.status === 'succeeded';
  const summary = isSuccess
    ? `اكتملت عملية ${label} لـ ${completedItems} من ${input.attemptedItems} عنصر.`
    : `تعذرت عملية ${label} قبل اكتمالها. راجع سجل العملية لمعرفة الحالة.`;
  const data = JSON.stringify({
    operation: input.operation,
    status: input.status,
    attemptedItems: input.attemptedItems,
    completedItems,
    ...input.details,
  });

  try {
    await Promise.all([
      auditLogService.logChange(db, {
        entityType: 'operation',
        entityId: 0,
        action: isSuccess ? 'operation_succeeded' : 'operation_failed',
        userId: input.actorId,
        newValue: data,
        reason: summary,
      }),
      notifyEligibleRecipients(db, {
        source: 'content',
        type: isSuccess ? 'content_updated' : 'job_failed',
        title: isSuccess ? `اكتملت ${label}` : `فشلت ${label}`,
        message: summary,
        entityType: 'content_operation',
        entityId: `${input.operation}:${Date.now()}`,
        actionUrl: '/admin/content/content?audit=operations',
        actionLabel: 'عرض سجل العملية',
        priority: isSuccess ? 'low' : 'high',
        data,
      }),
    ]);
  } catch {
    // السجل والتنبيه تشغيليان ولا يجوز أن يعطلا الرفع أو الاستيراد أو التصدير.
  }
}
