import { MetaWebhookMessagePayload, MessageHandlerContext, MessageHandlerResult } from '../types';
import { createLogger } from '../../../_core/logger';
import { processIncomingMessage } from '../../../services/whatsappAutoReply';
import { updateWhatsAppUserOptIn, createWhatsAppUserOptIn } from '../../../database/db';

const logger = createLogger('textMessageHandler');

/**
 * معالجة الرسائل النصية الواردة
 * يشمل التحقق من Opt-Out والرد التلقائي وتسجيل حالة الاشتراك
 *
 * @param message - payload الرسالة
 * @param context - سياق المعالجة
 * @returns نتيجة المعالجة
 */
export async function handleTextMessage(
  message: MetaWebhookMessagePayload,
  context: MessageHandlerContext
): Promise<MessageHandlerResult | null> {
  const { text } = message;
  const { phoneNumber } = context;

  if (!text?.body) {
    logger.warn('Text message has no body');
    return null;
  }

  const msgLower = text.body.trim().toLowerCase();

  // ── 1. التحقق من Opt-Out (STOP / إلغاء الاشتراك) ──────────────────────────
  const optOutKeywords = ['stop', 'إيقاف', 'إلغاء', 'unsubscribe', 'لا أريد'];
  if (optOutKeywords.some((kw) => msgLower.includes(kw))) {
    logger.info(`🚫 Opt-Out received from ${phoneNumber}`);
    await handleOptOut(phoneNumber);
    return null; // لا تحفظ رسالة Opt-Out
  }

  // ── 2. معالجة الرد التلقائي ────────────────────────────────────────────────
  // Process auto-reply asynchronously to prevent blocking message saving
  processIncomingMessage({ phone: phoneNumber, message: text.body }).catch((err) => {
    logger.error('Auto-reply processing failed:', err);
  });

  // ── 3. تسجيل حالة الاشتراك (Opt-In) ─────────────────────────────────────
  // إذا أرسل المستخدم رسالة، فهذا يعني أنه مشترك (opted_in)
  try {
    await updateWhatsAppUserOptIn(phoneNumber, {
      status: 'opted_in',
      source: 'webhook_message',
      updatedAt: new Date(),
    });
  } catch {
    // إذا لم يكن السجل موجوداً، أنشئه
    try {
      await createWhatsAppUserOptIn({
        phoneNumber,
        optInType: 'general',
        status: 'opted_in',
        source: 'webhook_message',
        details: JSON.stringify({ message: 'User sent a message' }),
      });
    } catch (createError) {
      logger.error('Error creating opt-in record:', createError);
    }
  }

  return {
    content: text.body,
    messageType: 'text',
    metaPayload: null,
  };
}

/**
 * معالجة Opt-Out تلقائياً
 * وفق سياسة Meta: يجب احترام طلبات إلغاء الاشتراك فوراً
 */
async function handleOptOut(phone: string): Promise<void> {
  try {
    const { sendWhatsAppTextMessage } = await import('../../../services/whatsappCloudAPI');

    // إرسال رسالة تأكيد إلغاء الاشتراك
    await sendWhatsAppTextMessage(
      phone,
      'تم إلغاء اشتراكك في رسائل المستشفى السعودي الألماني. لن تتلقى رسائل ترويجية بعد الآن.\n\nللاشتراك مجدداً، أرسل كلمة: مرحبا'
    );

    // تحديث حالة الاشتراك في قاعدة البيانات
    try {
      await updateWhatsAppUserOptIn(phone, {
        status: 'opted_out',
        source: 'webhook_opt_out',
        updatedAt: new Date(),
      });
      logger.info(`✅ Opt-out confirmed for ${phone}`);
    } catch {
      logger.error('Error updating opt-out status');
      // إذا لم يكن السجل موجوداً، أنشئه
      try {
        await createWhatsAppUserOptIn({
          phoneNumber: phone,
          optInType: 'general',
          status: 'opted_out',
          source: 'webhook_opt_out',
          details: JSON.stringify({ message: 'User sent STOP' }),
        });
      } catch {
        logger.error('Error creating opt-out record');
      }
    }
  } catch {
    logger.error('Error handling opt-out');
  }
}
