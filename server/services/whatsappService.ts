/**
 * WhatsApp Service
 * خدمة مركزية لإرسال الرسائل والتعامل مع WhatsApp Cloud API الرسمي
 *
 * ✅ يستخدم Cloud API الرسمي (sendWhatsAppTextMessage)
 * ✅ متوافق مع وثائق Meta الرسمية v23.0
 */

import { normalizePhoneNumber } from '../database/db';
import { sendWhatsAppTextMessage } from './whatsappCloudAPI';
import { ENV } from '../_core/env';
import { meta } from '../api/MetaApiService';
import { COMPANY_SLOGAN_AR } from '@shared/config';

/**
 * Send a simple text message via Cloud API
 */
export async function sendTextMessage(
  phone: string,
  message: string,
  _options?: { priority?: 'high' | 'normal' | 'low' }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const normalizedPhone = normalizePhoneNumber(phone);
    if (!normalizedPhone || normalizedPhone.length < 9) {
      return {
        success: false,
        error: 'Invalid phone number format',
      };
    }

    const result = await sendWhatsAppTextMessage(normalizedPhone, message);

    return {
      success: result.success,
      messageId: result.messageId,
      error: result.error,
    };
  } catch (error) {
    console.error('[WhatsApp] Failed to send text message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send a welcome message
 */
export async function sendWelcomeMessage(params: {
  phone: string;
  fullName: string;
  campaignName: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const message = `مرحباً ${params.fullName}،

شكراً لتسجيلك في ${params.campaignName} بالمستشفى السعودي الألماني - صنعاء.

سنتواصل معك قريباً لتحديد موعدك.

للاستفسارات: 8000018

${COMPANY_SLOGAN_AR} 💚`;

  return sendTextMessage(params.phone, message, { priority: 'high' });
}

/**
 * Send booking confirmation message
 */
export async function sendBookingConfirmation(params: {
  phone: string;
  fullName: string;
  appointmentDate?: string;
  appointmentTime?: string;
  doctorName?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const message = `عزيزي/عزيزتي ${params.fullName}،

تم تأكيد حجزك بنجاح! ✅

${params.doctorName ? `👨‍⚕️ الطبيب: ${params.doctorName}` : ''}
${params.appointmentDate && params.appointmentTime ? `📅 التاريخ: ${params.appointmentDate}\n🕐 الوقت: ${params.appointmentTime}` : ''}

📍 الموقع: المستشفى السعودي الألماني - صنعاء

يرجى الحضور قبل الموعد بـ 15 دقيقة.

للاستفسارات: 8000018

${COMPANY_SLOGAN_AR} 💚`;

  return sendTextMessage(params.phone, message, { priority: 'high' });
}

/**
 * Send custom message
 */
export async function sendCustomMessage(
  phone: string,
  message: string,
  options?: { priority?: 'high' | 'normal' | 'low' }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  return sendTextMessage(phone, message, options);
}

/**
 * Verify WhatsApp Cloud API Health
 */
export async function verifyWhatsAppHealth(): Promise<{
  botReady: boolean;
  clientReady: boolean;
  queueReady: boolean;
  errors: string[];
  setup: {
    phoneNumberConfigured: boolean;
    wabaConfigured: boolean;
    appIdConfigured: boolean;
    webhookVerifyTokenConfigured: boolean;
    phoneNumberReachable: boolean;
    phoneNumberRegisteredCheck: boolean;
    phoneNumberId?: string;
    displayPhoneNumber?: string;
    verifiedName?: string;
    phoneStatus?: string | null;
    qualityRating?: string | null;
    currentAppSubscribed: boolean | null;
    subscribedAppsCount: number;
  };
}> {
  const errors: string[] = [];

  const cloudApiReady = !!(ENV.whatsappPhoneNumberId && ENV.metaAccessToken);
  if (!cloudApiReady) {
    errors.push(
      'WhatsApp Cloud API not configured (missing WHATSAPP_PHONE_NUMBER_ID or META_ACCESS_TOKEN)'
    );
  }

  const setup = {
    phoneNumberConfigured: !!ENV.whatsappPhoneNumberId,
    wabaConfigured: !!ENV.whatsappBusinessAccountId,
    appIdConfigured: !!ENV.appId,
    webhookVerifyTokenConfigured: !!ENV.webhookVerifyToken,
    phoneNumberReachable: false,
    phoneNumberRegisteredCheck: false,
    phoneNumberId: ENV.whatsappPhoneNumberId || undefined,
    displayPhoneNumber: undefined as string | undefined,
    verifiedName: undefined as string | undefined,
    phoneStatus: null as string | null,
    qualityRating: null as string | null,
    currentAppSubscribed: null as boolean | null,
    subscribedAppsCount: 0,
  };

  if (cloudApiReady && ENV.whatsappPhoneNumberId) {
    const phoneInfo = await meta.getWhatsAppPhoneNumber(ENV.whatsappPhoneNumberId);
    if (phoneInfo.success && phoneInfo.phoneNumber) {
      setup.phoneNumberReachable = true;
      setup.phoneNumberRegisteredCheck = true;
      setup.displayPhoneNumber =
        (phoneInfo.phoneNumber as { display_phone_number?: string }).display_phone_number ||
        undefined;
      setup.verifiedName =
        (phoneInfo.phoneNumber as { verified_name?: string }).verified_name || undefined;
      setup.phoneStatus = (phoneInfo.phoneNumber as { status?: string }).status || null;
      setup.qualityRating =
        (phoneInfo.phoneNumber as { quality_rating?: string }).quality_rating || null;
    } else if (phoneInfo.error) {
      errors.push(`Phone number health check failed: ${phoneInfo.error}`);
    }
  }

  if (cloudApiReady && ENV.whatsappBusinessAccountId) {
    const subscriptions = await meta.getWabaSubscribedApps(ENV.whatsappBusinessAccountId);
    if (subscriptions.success) {
      const apps = subscriptions.apps || [];
      setup.subscribedAppsCount = apps.length;
      setup.currentAppSubscribed = ENV.appId
        ? apps.some((app: { id?: unknown }) => String(app?.id) === String(ENV.appId))
        : null;

      if (ENV.appId && setup.currentAppSubscribed === false) {
        errors.push('Current Meta app is not subscribed to this WABA');
      }
    } else if (subscriptions.error) {
      errors.push(`WABA subscription health check failed: ${subscriptions.error}`);
    }
  }

  return {
    botReady: cloudApiReady,
    clientReady: cloudApiReady,
    queueReady: true, // Cloud API لا يحتاج queue
    errors,
    setup,
  };
}
