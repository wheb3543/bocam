/**
 * WhatsApp Message Dispatcher
 * الخدمة المركزية لإرسال الرسائل التلقائية بناءً على إعدادات message_settings في DB
 *
 * كيفية الاستخدام:
 *   await dispatchWhatsAppMessage({
 *     entityType: "appointment",
 *     triggerEvent: "on_create",
 *     phone: "967XXXXXXXXX",
 *     variables: { name: "أحمد", date: "2026-05-01", time: "10:00", doctor: "د. محمد", service: "عيادة عامة" },
 *     entityId: 123,
 *   });
 */

import { eq, and } from 'drizzle-orm';
import {
  getDb,
  getWhatsAppConversationByPhone,
  createWhatsAppConversation,
  createWhatsAppMessage,
  updateWhatsAppConversation,
  normalizePhoneNumber,
} from '../database/db';
import { messageSettings, whatsappTemplates, whatsappNotifications } from '../../drizzle/schema';
import { sendWhatsAppTextMessage, sendWhatsAppTemplateMessage } from './whatsappCloudAPI';
import { createLogger } from '../_core/logger';

const logger = createLogger('whatsappMessageDispatcher');

export type EntityType = 'appointment' | 'camp_registration' | 'offer_lead';
export type TriggerEvent =
  | 'on_create'
  | 'on_confirmed'
  | 'on_arrived'
  | 'on_completed'
  | 'on_cancelled'
  | 'on_reminder_24h'
  | 'on_reminder_1h';

export interface DispatchOptions {
  entityType: EntityType;
  triggerEvent: TriggerEvent;
  phone: string;
  variables: Record<string, string>;
  entityId: number;
  recipientName?: string;
  sentBy?: number;
}

/** حفظ سجل الإشعار في قاعدة البيانات */
async function saveDispatchLog(params: {
  entityType: EntityType;
  entityId: number;
  phone: string;
  recipientName?: string;
  messageType: string;
  templateName?: string;
  status: 'sent' | 'failed';
  messageId?: string;
  errorMessage?: string;
  sentBy?: number;
}): Promise<void> {
  try {
    const db = await getDb();
    if (!db) {
      return;
    }
    await db.insert(whatsappNotifications).values({
      entityType: params.entityType,
      entityId: params.entityId,
      notificationType: 'status_update',
      phone: params.phone,
      recipientName: params.recipientName,
      templateName: params.templateName || params.messageType,
      messageContent: params.messageType,
      status: params.status,
      metaMessageId: params.messageId,
      errorMessage: params.errorMessage,
      sentBy: params.sentBy,
      isAutomatic: true,
      sentAt: params.status === 'sent' ? new Date() : undefined,
    });
  } catch (err) {
    logger.error('Failed to save log:', err);
  }
}

/**
 * استبدال المتغيرات في نص الرسالة
 * {name} → "أحمد"، {date} → "2026-05-01"، إلخ
 */
function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`);
}

/**
 * التحقق من صحة المتغيرات المطلوبة في القالب
 * يُرجع قائمة المتغيرات المفقودة
 */
function validateVariables(template: string, vars: Record<string, string>): string[] {
  const missing: string[] = [];
  template.replace(/\{(\w+)\}/g, (_, key) => {
    if (!vars[key] || vars[key] === '') {
      missing.push(key);
    }
    return '';
  });
  return missing;
}

/**
 * بناء محتوى الرسالة للعرض في المحادثة بناءً على اسم القالب والمتغيرات
 * يُظهر نص القالب مع القيم الفعلية بدلاً من [قالب: X]
 */
function buildTemplateDisplayContent(
  templateName: string,
  variables: Record<string, string>,
  fallbackContent: string
): string {
  // خريطة القوالب المعروفة مع نصوصها الفعلية
  const templateTexts: Record<string, string> = {
    appointment_confirmation:
      'مرحباً {name}، تم استلام طلب حجزك في المستشفى السعودي الألماني - صنعاء.\n\nتفاصيل الحجز:\n📅 التاريخ والوقت: {date}\n👨‍⚕️ الطبيب: {doctor}\n🏥 الخدمة: {service}\n\nسيتم التواصل معك قريباً لتأكيد الموعد.',
    camp_reg_verification:
      'مرحباً {name}، تم استلام طلب تسجيلك في {camp_name}.\n\nتفاصيل التسجيل:\n📅 التاريخ: {date}\n⏰ الوقت: {time}\n📍 الموقع: {location}\n\nيرجى تأكيد حضورك بالضغط على الزر أدناه.',
    camp_reg_confirmed:
      'مرحباً {name}، تم تأكيد تسجيلك في {camp_name}.\n\n📅 التاريخ: {date}\n⏰ الوقت: {time}\n📍 الموقع: {location}\n\nنتطلع لرؤيتك!',
    camp_reg_cancelled:
      'مرحباً {name}، تم إلغاء تسجيلك في {camp_name}. إذا كنت ترغب في إعادة التسجيل، يرجى التواصل معنا.',
    camp_patient_arrival: 'مرحباً {name}، نُرحب بك في {camp_name}. يرجى التوجه إلى مكتب الاستقبال.',
    camp_journey_completed:
      'شكراً لك {name} على مشاركتك في {camp_name}. نتمنى لك دوام الصحة والعافية.',
  };

  const templateKey = templateName.replace(/ /g, '_').toLowerCase();
  const textTemplate = templateTexts[templateKey] || templateTexts[templateName] || fallbackContent;
  return interpolate(textTemplate, variables);
}

/**
 * الدالة الرئيسية: ترسل الرسالة المناسبة بناءً على entityType + triggerEvent
 */
export async function dispatchWhatsAppMessage(opts: DispatchOptions): Promise<{
  success: boolean;
  messageType?: string;
  channel?: string;
  error?: string;
}> {
  const { entityType, triggerEvent, phone, variables, entityId } = opts;

  try {
    const db = await getDb();
    if (!db) {
      return { success: false, error: 'Database not available' };
    }

    // 1. جلب إعداد الرسالة المناسب من DB
    const [setting] = await db
      .select()
      .from(messageSettings)
      .where(
        and(
          eq(
            messageSettings.entityType,
            entityType as 'appointment' | 'camp_registration' | 'offer_lead'
          ),
          eq(
            messageSettings.triggerEvent,
            triggerEvent as
              | 'manual'
              | 'on_create'
              | 'on_confirmed'
              | 'on_arrived'
              | 'on_completed'
              | 'on_cancelled'
              | 'on_reminder_24h'
              | 'on_reminder_1h'
          ),
          eq(messageSettings.isEnabled, 1)
        )
      )
      .limit(1);

    if (!setting) {
      logger.info(`No active setting found for ${entityType}:${triggerEvent}`);
      return {
        success: false,
        error: `No active message setting for ${entityType}:${triggerEvent}`,
      };
    }

    const channel = setting.deliveryChannel;
    const messageType = setting.messageType;

    // التحقق من صحة المتغيرات المطلوبة في القالب
    const missingVars = validateVariables(setting.messageContent, variables);
    if (missingVars.length > 0) {
      logger.error(
        `Missing required variables for ${entityType}:${triggerEvent}: ${missingVars.join(', ')}`
      );
      // Log the failure but still send with placeholders (as fallback behavior)
      // Alternatively, could return { success: false, error: `Missing variables: ${missingVars.join(', ')}` };
    }

    // 2. إرسال الرسالة بناءً على القناة المختارة
    let result: { success: boolean; messageId?: string; error?: string };

    // محاولة إرسال قالب Meta أولاً إذا كان موجوداً (بغض النظر عن channel)
    if (setting.whatsappTemplateId) {
      // إرسال عبر قالب Meta
      const [template] = await db
        .select()
        .from(whatsappTemplates)
        .where(eq(whatsappTemplates.id, setting.whatsappTemplateId))
        .limit(1);

      if (!template) {
        logger.error(`Template with ID ${setting.whatsappTemplateId} not found in database`);
      } else {
        // نُرسل القالب بغض النظر عن metaStatus (APPROVED أو PENDING) لأن Meta قد تقبله
        // بناء مكونات القالب مع دعم نوعين:
        // 1. متغيرات رقمية {{1}}, {{2}} → parameters بدون parameter_name
        // 2. متغيرات مسماة {{name}}, {{camp_name}} → parameters مع parameter_name (Named Parameters API)
        const bodyParams: { type: 'text'; text: string; parameter_name?: string }[] = [];
        try {
          const parsedVars = JSON.parse(template.variables || '[]') as string[];
          const isNumeric = parsedVars.every((v) => /^\d+$/.test(v));
          if (isNumeric) {
            // متغيرات رقمية: نُرسل القيم بالترتيب بدون parameter_name
            const vals = Object.values(variables);
            for (const v of vals) {
              bodyParams.push({ type: 'text', text: String(v) });
            }
          } else {
            // متغيرات مسماة: يجب إرسال parameter_name مع كل قيمة (Meta Named Parameters)
            for (const varName of parsedVars) {
              bodyParams.push({
                type: 'text',
                text: String(variables[varName] ?? ''),
                parameter_name: varName,
              });
            }
          }
        } catch {
          const vals = Object.values(variables);
          for (const v of vals) {
            bodyParams.push({ type: 'text', text: String(v) });
          }
        }

        const templateNameToSend = template.metaName || template.name;
        logger.info(
          `Sending template "${templateNameToSend}" (metaName: ${template.metaName}) to ${phone}`
        );

        // بناء مكونات الأزرار (quick_reply) مع الـ payload الصحيح
        // Format: CONFIRM_{TYPE}_{ID} أو CANCEL_{TYPE}_{ID}
        const buttonComponents: Array<{
          type: 'button';
          sub_type: 'quick_reply';
          index: number;
          parameters: Array<{ type: 'payload'; payload: string }>;
        }> = [];
        if (triggerEvent === 'on_create' && entityId) {
          const typeMap: Record<EntityType, string> = {
            appointment: 'APPOINTMENT',
            camp_registration: 'CAMP',
            offer_lead: 'OFFER',
          };
          const bookingType = typeMap[entityType];
          try {
            const parsedButtons = JSON.parse(template.buttons || '[]') as Array<{
              type: string;
              text: string;
            }>;
            // تحديد index الأزرار بناءً على نص الزر
            parsedButtons.forEach((btn, idx) => {
              const text = btn.text || '';
              const isConfirm = text.includes('تأكيد') || text.toLowerCase().includes('confirm');
              const isCancel =
                text.includes('إلغاء') ||
                text.includes('الغاء') ||
                text.toLowerCase().includes('cancel');
              if (isConfirm) {
                buttonComponents.push({
                  type: 'button',
                  sub_type: 'quick_reply',
                  index: idx,
                  parameters: [{ type: 'payload', payload: `CONFIRM_${bookingType}_${entityId}` }],
                });
              } else if (isCancel) {
                buttonComponents.push({
                  type: 'button',
                  sub_type: 'quick_reply',
                  index: idx,
                  parameters: [{ type: 'payload', payload: `CANCEL_${bookingType}_${entityId}` }],
                });
              }
            });
          } catch (e) {
            logger.warn(`Failed to parse buttons for template ${template.name}:`, e);
          }
        }

        const allComponents: Array<{
          type: 'body' | 'header' | 'footer' | 'button';
          parameters?: Array<{
            type: 'text' | 'image' | 'payload';
            text?: string;
            payload?: string;
          }>;
          sub_type?: 'quick_reply';
          index?: number;
        }> = [];
        if (bodyParams.length > 0) {
          allComponents.push({ type: 'body', parameters: bodyParams });
        }
        allComponents.push(...buttonComponents);

        result = await sendWhatsAppTemplateMessage(phone, {
          templateName: templateNameToSend,
          languageCode: template.languageCode ?? 'ar',
          components: allComponents,
        });

        if (result.success) {
          await saveDispatchLog({
            entityType,
            entityId,
            phone,
            recipientName: opts.recipientName,
            messageType,
            templateName: template.name,
            status: 'sent',
            messageId: result.messageId,
            sentBy: opts.sentBy,
          });
          // حفظ المحادثة والرسالة في قاعدة البيانات
          // بناء محتوى الرسالة من متغيرات القالب الفعلية لعرضها في المحادثة
          const templateDisplayContent = buildTemplateDisplayContent(
            template.name,
            variables,
            setting.messageContent
          );
          await ensureConversationAndSaveMessage({
            phone,
            customerName: opts.recipientName,
            messageContent: templateDisplayContent,
            messageId: result.messageId,
            entityType,
            entityId,
          });
          return { success: true, messageType, channel: 'whatsapp_api' };
        }
        // Fallback إلى نص عادي إذا فشل القالب
        logger.error(`Template send failed for "${templateNameToSend}"`);
        logger.error(`- Template ID: ${template.id}`);
        logger.error(`- Template status: ${template.metaStatus}`);
        logger.error(`- Template metaName: ${template.metaName}`);
        logger.error(`- Language code: ${template.languageCode}`);
        logger.error(`- Variables provided: ${JSON.stringify(variables)}`);
        logger.error(`- Error details: ${result.error}`);
        logger.error(`- Falling back to text message`);
      }
    }

    // إرسال كنص عادي (whatsapp_integration أو fallback بعد فشل القالب)
    if (channel === 'whatsapp_integration' || channel === 'both') {
      const content = interpolate(setting.messageContent, variables);
      result = await sendWhatsAppTextMessage(phone, content);

      const status = result.success ? 'sent' : 'failed';
      await saveDispatchLog({
        entityType,
        entityId,
        phone,
        recipientName: opts.recipientName,
        messageType,
        templateName: messageType,
        status,
        messageId: result.messageId,
        errorMessage: result.error,
        sentBy: opts.sentBy,
      });

      // حفظ المحادثة والرسالة في قاعدة البيانات عند النجاح
      if (result.success) {
        const content = interpolate(setting.messageContent, variables);
        await ensureConversationAndSaveMessage({
          phone,
          customerName: opts.recipientName,
          messageContent: content,
          messageId: result.messageId,
          entityType,
          entityId,
        });
      }

      return {
        success: result.success,
        messageType,
        channel,
        error: result.error,
      };
    }

    return { success: false, error: 'No valid channel configured' };
  } catch (error) {
    logger.error(`Error dispatching ${entityType}:${triggerEvent}:`, error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * إنشاء أو تحديث المحادثة في قاعدة البيانات بعد إرسال رسالة تلقائية
 * يضمن ظهور الرسائل التلقائية في صفحة إدارة المحادثات
 */
export async function ensureConversationAndSaveMessage(params: {
  phone: string;
  customerName?: string;
  messageContent: string;
  messageId?: string;
  entityType?: string;
  entityId?: number;
  labOrderId?: number; // جديد
  mediaUrl?: string; // جديد
}): Promise<void> {
  try {
    const normalizedPhone = normalizePhoneNumber(params.phone);
    if (!normalizedPhone) {
      return;
    }

    // 1. البحث عن محادثة موجودة أو إنشاء محادثة جديدة
    let conversation = await getWhatsAppConversationByPhone(normalizedPhone);
    const now = new Date();

    // ربط المحادثة بالكيان المناسب بناءً على entityType
    const entityLinks: Record<string, unknown> = {};
    if (params.entityType && params.entityId) {
      switch (params.entityType) {
        case 'appointment':
          entityLinks.appointmentId = params.entityId;
          break;
        case 'camp_registration':
          entityLinks.campRegistrationId = params.entityId;
          break;
        case 'offer_lead':
          entityLinks.offerLeadId = params.entityId;
          break;
      }
    }
    // إضافة labOrderId إذا كان موجوداً
    if (params.labOrderId) {
      entityLinks.labOrderId = params.labOrderId;
    }

    if (!conversation) {
      // إنشاء محادثة جديدة
      await createWhatsAppConversation({
        phoneNumber: normalizedPhone,
        customerName: params.customerName || null,
        lastMessage: params.messageContent.substring(0, 200),
        lastMessageAt: now,
        unreadCount: 0,
        isImportant: 0,
        isArchived: 0,
        ...entityLinks,
      });
      // جلب المحادثة المُنشأة
      conversation = await getWhatsAppConversationByPhone(normalizedPhone);
    } else {
      // تحديث المحادثة الموجودة
      await updateWhatsAppConversation(conversation.id as number, {
        lastMessage: params.messageContent.substring(0, 200),
        lastMessageAt: now,
        customerName: params.customerName || conversation.customerName || null,
        ...entityLinks,
      });
    }

    if (!conversation) {
      return;
    }

    // 2. حفظ الرسالة في جدول whatsapp_messages
    await createWhatsAppMessage({
      conversationId: conversation.id,
      direction: 'outbound',
      content: params.messageContent,
      messageType: params.mediaUrl ? 'document' : 'text', // استخدام document إذا كان هناك mediaUrl
      status: 'sent',
      whatsappMessageId: params.messageId || null,
      sentAt: new Date(),
      isAutomated: 1,
      mediaUrl: params.mediaUrl || null, // حفظ رابط الملف إذا كان موجوداً
    });
  } catch (err) {
    logger.error('Failed to ensure conversation/message:', err);
  }
}
