/**
 * WhatsApp Camps & Offers Service
 * خدمة إرسال إشعارات WhatsApp للمخيمات والعروض
 */

import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { COMPANY_PHONE } from '@shared/config';
import { sendWhatsAppTextMessage } from '../whatsappCloudAPI';
import { saveNotification, validateAndNormalizePhone } from './helpers';
import type {
  CampRegistrationConfirmationParams,
  OfferLeadConfirmationParams,
  SendResult,
} from './types';
import { handleServiceError } from '../../_core/errorHandler';

const companyPhone = COMPANY_PHONE || 'رقم الاتصال غير متوفر';
const publicWebsite = process.env.PUBLIC_APP_URL || 'https://example.com';

// تأكيد تسجيل المخيم
export async function sendCampRegistrationConfirmation(
  params: CampRegistrationConfirmationParams
): Promise<SendResult> {
  try {
    const normalizedPhone = await validateAndNormalizePhone(params.phone);
    const dateStr = params.campDate
      ? format(params.campDate, 'EEEE d MMMM yyyy', { locale: ar })
      : 'سيتم الإعلان عنه لاحقاً';

    const message = `مرحباً ${params.patientName} 👋

✅ تم تسجيلك في المخيم الطبي بنجاح!

🏕️ *تفاصيل المخيم:*
📌 المخيم: ${params.campName}
📅 التاريخ: ${dateStr}
${params.campLocation ? `📍 الموقع: ${params.campLocation}` : ''}

سيتم التواصل معك قريباً لتأكيد التفاصيل.

📞 للاستفسار: ${companyPhone}`.trim();

    const result = await sendWhatsAppTextMessage(normalizedPhone, message);

    const notificationId = await saveNotification({
      entityType: 'camp_registration',
      entityId: params.registrationId,
      notificationType: 'booking_confirmation',
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
    console.error('[WhatsApp Appointments] Failed to send camp confirmation:', error);
    return { success: false, error: error instanceof Error ? error.message : 'خطأ غير معروف' };
  }
}

// تأكيد حجز العرض
export async function sendOfferLeadConfirmation(
  params: OfferLeadConfirmationParams
): Promise<SendResult> {
  try {
    const normalizedPhone = await validateAndNormalizePhone(params.phone);
    const priceInfo = params.offerPrice
      ? `💰 السعر: ${params.offerPrice.toLocaleString()} ريال${params.offerDiscount ? ` (خصم ${params.offerDiscount}%)` : ''}`
      : '';

    const message = `مرحباً ${params.patientName} 👋

✅ تم استلام طلب حجزك للعرض بنجاح!

🎯 *تفاصيل العرض:*
📋 العرض: ${params.offerName}
${priceInfo}

سيتم التواصل معك قريباً لتأكيد الحجز وترتيب الموعد.

📞 للاستفسار: ${companyPhone}
🌐 ${publicWebsite}`.trim();

    const result = await sendWhatsAppTextMessage(normalizedPhone, message);

    const notificationId = await saveNotification({
      entityType: 'offer_lead',
      entityId: params.offerLeadId,
      notificationType: 'booking_confirmation',
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
    return handleServiceError(error, 'WhatsApp Camps & Offers - Offer Lead');
  }
}
