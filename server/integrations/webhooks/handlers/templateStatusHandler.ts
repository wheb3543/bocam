import { createLogger } from '../../../_core/logger';
import { getDb } from '../../../database/db';
import { eq } from 'drizzle-orm';
import { whatsappTemplates } from '../../../../drizzle/schema';

const logger = createLogger('templateStatusHandler');

/**
 * معالجة تحديثات حالة القوالب تلقائياً
 * وفق: https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/components/template-status-updates
 *
 * الأحداث: APPROVED, REJECTED, DISABLED, PENDING_DELETION, FLAGGED, PAUSED, REINSTATED
 *
 * @param update - بيانات تحديث القالب
 */
export async function handleTemplateStatusUpdate(update: {
  message_template_id: string;
  message_template_name: string;
  event: string;
  reason?: string;
}): Promise<void> {
  try {
    const { message_template_id, message_template_name, event, reason } = update;

    logger.info(`📋 Template "${message_template_name}" → ${event}${reason ? ` (${reason})` : ''}`);

    const db = await getDb();
    if (!db) {
      return;
    }

    // تحديث حالة القالب في قاعدة البيانات
    const statusMap: Record<string, string> = {
      APPROVED: 'APPROVED',
      REJECTED: 'REJECTED',
      DISABLED: 'DISABLED',
      PAUSED: 'PAUSED',
      REINSTATED: 'APPROVED',
      FLAGGED: 'FLAGGED',
      PENDING_DELETION: 'PENDING_DELETION',
    };

    const newStatus = statusMap[event] || event;

    await db
      .update(whatsappTemplates)
      .set({
        metaStatus: newStatus,
        updatedAt: new Date(),
      })
      .where(eq(whatsappTemplates.metaTemplateId, String(message_template_id)));

    // 🔔 Publish SSE event to global channel
    try {
      const { publish } = await import('../../../_core/pubsub');
      publish('global:whatsapp', 'template_status_update', {
        templateId: String(message_template_id),
        templateName: message_template_name,
        status: newStatus,
        reason,
        timestamp: new Date().toISOString(),
      });
    } catch {
      logger.error('Error publishing template status SSE');
    }

    // إذا تم رفض القالب أو تعطيله، سجّل السبب
    if (event === 'REJECTED' || event === 'DISABLED') {
      logger.error(
        `⛔ Template "${message_template_name}" ${event}: ${reason || 'No reason provided'}`
      );
    }

    if (event === 'APPROVED') {
      logger.info(`✅ Template "${message_template_name}" APPROVED — ready to use`);
    }
  } catch {
    logger.error('Error handling template status update');
  }
}
