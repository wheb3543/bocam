/**
 * WhatsApp Appointments Service
 * خدمة إرسال إشعارات WhatsApp للمواعيد
 */

import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { sendWhatsAppTextMessage, sendWhatsAppTemplateMessage } from '../whatsappCloudAPI';
import { saveNotification, validateAndNormalizePhone } from './helpers';
import type {
  AppointmentConfirmationParams,
  AppointmentReminderParams,
  AppointmentFollowupParams,
  SendResult,
} from './types';
import { handleServiceError } from '../../_core/errorHandler';

// تأكيد الحجز: مواعيد الأطباء
export async function sendAppointmentConfirmation(
  params: AppointmentConfirmationParams
): Promise<SendResult> {
  try {
    const normalizedPhone = await validateAndNormalizePhone(params.phone);
    const appointmentDate = format(params.appointmentTime, 'EEEE d MMMM yyyy', { locale: ar });
    const appointmentTimeStr = format(params.appointmentTime, 'HH:mm');

    // محاولة إرسال قالب Meta الرسمي appointment_confirmation أولاً
    let result = await sendWhatsAppTemplateMessage(normalizedPhone, {
      templateName: 'appointment_confirmation',
      languageCode: 'ar',
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: params.patientName },
            { type: 'text', text: params.doctorName },
            { type: 'text', text: params.department },
            { type: 'text', text: appointmentDate },
            { type: 'text', text: appointmentTimeStr },
          ],
        },
      ],
    });

    let usedTemplate = 'appointment_confirmation';

    // Fallback: إذا فشل إرسال القالب نرسل رسالة نصية عادية
    if (!result.success) {
      console.warn(
        `[WhatsApp Appointments] Template appointment_confirmation failed (${result.error}), falling back to text message`
      );
      const message = `مرحباً ${params.patientName} 👋\n\n✅ تم تأكيد موعدك في المستشفى السعودي الألماني\n\n📋 تفاصيل الموعد:\n👨‍⚕️ الطبيب: ${params.doctorName}\n🏥 القسم: ${params.department}\n📅 التاريخ: ${appointmentDate}\n⏰ الوقت: ${appointmentTimeStr}\n\n⚠️ يرجى الحضور قبل 15 دقيقة من الموعد\n\n📞 للاستفسار: 8000018`;
      result = await sendWhatsAppTextMessage(normalizedPhone, message);
      usedTemplate = 'text_fallback';
    }

    const notificationId = await saveNotification({
      entityType: 'appointment',
      entityId: params.appointmentId,
      notificationType: 'booking_confirmation',
      phone: normalizedPhone,
      recipientName: params.patientName,
      templateName: usedTemplate,
      messageContent: `appointment_confirmation | ${params.doctorName} | ${appointmentDate} ${appointmentTimeStr}`,
      status: result.success ? 'sent' : 'failed',
      metaMessageId: result.messageId,
      errorMessage: result.error,
      sentBy: params.sentBy,
    });

    return {
      success: result.success,
      messageId: result.messageId,
      notificationId: notificationId ?? undefined,
      error: result.error,
    };
  } catch (error) {
    return handleServiceError(error, 'WhatsApp Appointments - Confirmation');
  }
}

// تذكير الموعد
export async function sendAppointmentReminder(
  params: AppointmentReminderParams
): Promise<SendResult> {
  try {
    const normalizedPhone = await validateAndNormalizePhone(params.phone);
    const appointmentTimeStr = format(params.appointmentTime, 'HH:mm');
    const reminderText =
      params.hoursUntil === 24
        ? 'غداً'
        : params.hoursUntil === 1
          ? 'خلال ساعة'
          : `خلال ${params.hoursUntil} ساعات`;
    const notifType = params.hoursUntil >= 24 ? 'reminder_24h' : 'reminder_1h';

    // محاولة إرسال قالب Meta الرسمي appointment_reminder أولاً
    let result = await sendWhatsAppTemplateMessage(normalizedPhone, {
      templateName: 'appointment_reminder',
      languageCode: 'ar',
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: params.patientName },
            { type: 'text', text: params.doctorName },
            { type: 'text', text: reminderText },
            { type: 'text', text: appointmentTimeStr },
          ],
        },
      ],
    });

    let usedTemplate = 'appointment_reminder';

    // Fallback: إذا فشل إرسال القالب نرسل رسالة نصية عادية
    if (!result.success) {
      console.warn(
        `[WhatsApp Appointments] Template appointment_reminder failed (${result.error}), falling back to text message`
      );
      const fallbackMsg = `⏰ تذكير بموعدك\n\n${params.patientName}، موعدك مع د. ${params.doctorName} ${reminderText}\n🕐 الوقت: ${appointmentTimeStr}\n\nيرجى الحضور قبل 15 دقيقة\n📞 للإلغاء أو التعديل: 8000018`;
      result = await sendWhatsAppTextMessage(normalizedPhone, fallbackMsg);
      usedTemplate = 'text_fallback';
    }

    const notificationId = await saveNotification({
      entityType: 'appointment',
      entityId: params.appointmentId,
      notificationType: notifType,
      phone: normalizedPhone,
      recipientName: params.patientName,
      templateName: usedTemplate,
      messageContent: `appointment_reminder | ${params.doctorName} | ${reminderText} | ${appointmentTimeStr}`,
      status: result.success ? 'sent' : 'failed',
      metaMessageId: result.messageId,
      errorMessage: result.error,
      sentBy: params.sentBy,
    });

    return {
      success: result.success,
      messageId: result.messageId,
      notificationId: notificationId ?? undefined,
      error: result.error,
    };
  } catch (error) {
    return handleServiceError(error, 'WhatsApp Appointments - Reminder');
  }
}

// متابعة بعد الزيارة
export async function sendAppointmentFollowup(
  params: AppointmentFollowupParams
): Promise<SendResult> {
  try {
    const normalizedPhone = await validateAndNormalizePhone(params.phone);
    const message = `شكراً لزيارتك ${params.patientName} 🙏

نأمل أن تكون قد استفدت من كشف د. ${params.doctorName} في قسم ${params.department}

نرجو تقييم تجربتك معنا:
⭐ ممتاز | 👍 جيد | 👎 يحتاج تحسين

📞 للحجز مجدداً: 8000018
🌐 www.sgh-sanaa.com`.trim();

    const result = await sendWhatsAppTextMessage(normalizedPhone, message);

    const notificationId = await saveNotification({
      entityType: 'appointment',
      entityId: params.appointmentId,
      notificationType: 'post_visit_followup',
      phone: normalizedPhone,
      recipientName: params.patientName,
      messageContent: message,
      status: result.success ? 'sent' : 'failed',
      metaMessageId: result.messageId,
      errorMessage: result.error,
      sentBy: params.sentBy,
    });

    return {
      success: result.success,
      messageId: result.messageId,
      notificationId: notificationId ?? undefined,
      error: result.error,
    };
  } catch (error) {
    return handleServiceError(error, 'WhatsApp Appointments - Followup');
  }
}
