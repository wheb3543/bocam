import { eq } from 'drizzle-orm';
import { operationalAlertStates } from '../../drizzle/schema';
import { notifyEligibleRecipients } from './notificationPolicy';

export type OperationalAlertKey =
  | 'backup_execution'
  | 'backup_restore'
  | 'license_validation'
  | 'meta_template_sync'
  | 'update_check';

type OperationalResultInput = {
  key: OperationalAlertKey;
  succeeded: boolean;
  title: string;
  failureMessage: string;
  recoveryMessage: string;
  actionUrl: string;
  actionLabel: string;
};

/**
 * يرسل فشل أول محاولة فقط، ثم يرسل إشعار تعافٍ واحداً عند نجاح العملية لاحقاً.
 * لا نخزن سبباً تفصيلياً أو بيانات حساسة؛ السجل مخصص لحالة التشغيل فقط.
 */
export async function recordOperationalResult(db: any, input: OperationalResultInput) {
  try {
    const [existing] = await db
      .select()
      .from(operationalAlertStates)
      .where(eq(operationalAlertStates.operationKey, input.key))
      .limit(1);
    const now = new Date();

    if (!existing) {
      await db.insert(operationalAlertStates).values({
        operationKey: input.key,
        status: input.succeeded ? 'healthy' : 'degraded',
        lastFailureAt: input.succeeded ? null : now,
        lastRecoveryAt: null,
      });
      if (!input.succeeded) {
        await notifyOperationalTransition(db, input, 'failure');
      }
      return;
    }

    if (!input.succeeded) {
      if (existing.status !== 'degraded') {
        await notifyOperationalTransition(db, input, 'failure');
      }
      await db
        .update(operationalAlertStates)
        .set({ status: 'degraded', lastFailureAt: now })
        .where(eq(operationalAlertStates.id, existing.id));
      return;
    }

    if (existing.status === 'degraded') {
      await notifyOperationalTransition(db, input, 'recovery');
    }
    await db
      .update(operationalAlertStates)
      .set({ status: 'healthy', lastRecoveryAt: now })
      .where(eq(operationalAlertStates.id, existing.id));
  } catch {
    // تنبيهات العمليات لا تعطل مسار العمل الأصلي.
  }
}

async function notifyOperationalTransition(
  db: any,
  input: OperationalResultInput,
  transition: 'failure' | 'recovery'
) {
  const isFailure = transition === 'failure';
  await notifyEligibleRecipients(db, {
    source: 'operations',
    type: isFailure ? 'job_failed' : 'system',
    title: isFailure ? `فشل تشغيلي: ${input.title}` : `تعافٍ تشغيلي: ${input.title}`,
    message: isFailure ? input.failureMessage : input.recoveryMessage,
    entityType: 'operational_alert',
    entityId: input.key,
    actionUrl: input.actionUrl,
    actionLabel: input.actionLabel,
    priority: isFailure ? 'high' : 'medium',
    data: JSON.stringify({ operation: input.key, transition }),
  });
}
