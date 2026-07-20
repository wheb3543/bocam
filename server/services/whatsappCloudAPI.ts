/**
 * WhatsApp Cloud API - Unified Module
 * يتعامل مع جميع عمليات WhatsApp Business Cloud API
 *
 * ⚠️  القاعدة المعمارية: جميع طلبات Meta Graph API تمر عبر MetaApiService.
 *     لا يُسمح باستخدام process.env.META_ACCESS_TOKEN مباشرة هنا.
 *     استخدم: import { meta } from './MetaApiService';
 */

import { meta } from '../api/MetaApiService';
import { createLogger } from '../_core/logger';

const logger = createLogger('whatsappCloudAPI');

// ─── Phone Formatting ──────────────────────────────────────────────────────────

/**
 * Format phone number to international format (967XXXXXXXXX)
 */
export function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/[^\d]/g, '');

  if (cleaned.startsWith('00967')) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith('967')) {
    // Already has country code
  } else if (cleaned.startsWith('0')) {
    cleaned = '967' + cleaned.substring(1);
  } else if (cleaned.length === 9) {
    cleaned = '967' + cleaned;
  }

  return cleaned;
}

// ─── Status Helpers ────────────────────────────────────────────────────────────

/**
 * Check if WhatsApp Cloud API is configured and working
 */
export function getWhatsAppAPIStatus(): {
  isReady: boolean;
  isConnecting: boolean;
  hasQRCode: boolean;
  apiConfigured: boolean;
  phoneNumberId?: string;
  apiVersion: string;
  mode: string;
} {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const configured = !!(phoneNumberId && meta.accessToken);

  return {
    isReady: configured,
    isConnecting: false,
    hasQRCode: false,
    apiConfigured: configured,
    phoneNumberId: phoneNumberId || undefined,
    apiVersion: 'v25.0',
    mode: 'cloud_api',
  };
}

/** Backward-compatible alias */
export function isWhatsAppBusinessAPIConfigured(): boolean {
  return !!(process.env.WHATSAPP_PHONE_NUMBER_ID && meta.accessToken);
}

export function getWhatsAppBusinessAPIStatus(): {
  configured: boolean;
  phoneNumberId?: string;
} {
  return {
    configured: isWhatsAppBusinessAPIConfigured(),
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
  };
}

// ─── Error Handling ────────────────────────────────────────────────────────────

interface WhatsAppError {
  code: number;
  title: string;
  message: string;
  userFriendlyMessage: string;
  shouldRetry: boolean;
  category: 'rate_limit' | 'template' | 'user' | 'system' | 'policy';
}

const WHATSAPP_ERROR_CODES: Record<number, WhatsAppError> = {
  131049: {
    code: 131049,
    title: 'Marketing messages to US users blocked',
    message: 'Cannot send marketing messages to WhatsApp users in the United States',
    userFriendlyMessage: 'لا يمكن إرسال رسائل تسويقية للمستخدمين في الولايات المتحدة',
    shouldRetry: false,
    category: 'policy',
  },
  131026: {
    code: 131026,
    title: 'Template not approved or paused',
    message: 'The template is not approved, paused, or disabled',
    userFriendlyMessage: 'القالب غير معتمد أو متوقف مؤقتاً',
    shouldRetry: false,
    category: 'template',
  },
  131047: {
    code: 131047,
    title: 'Messaging limit reached',
    message: 'You have reached your messaging limit',
    userFriendlyMessage: 'تم الوصول إلى حد الرسائل المسموح به',
    shouldRetry: true,
    category: 'rate_limit',
  },
  131051: {
    code: 131051,
    title: 'Invalid phone number',
    message: 'The phone number is blocked, invalid, or not registered on WhatsApp',
    userFriendlyMessage: 'رقم الهاتف محظور أو غير صحيح أو غير مسجل في واتساب',
    shouldRetry: false,
    category: 'user',
  },
  130472: {
    code: 130472,
    title: 'User number is part of an experiment',
    message: 'The user number is part of an experiment',
    userFriendlyMessage: 'رقم المستخدم جزء من تجربة',
    shouldRetry: false,
    category: 'user',
  },
  133016: {
    code: 133016,
    title: 'Service temporarily unavailable',
    message: 'WhatsApp service is temporarily unavailable',
    userFriendlyMessage: 'خدمة واتساب غير متاحة مؤقتاً',
    shouldRetry: true,
    category: 'system',
  },
};

export function parseWhatsAppError(errorData: Record<string, unknown>): {
  code: number;
  title: string;
  message: string;
  userFriendlyMessage: string;
  shouldRetry: boolean;
  category: string;
} {
  const errorCode =
    (errorData as { error?: { code?: number }; code?: number })?.error?.code ||
    (errorData as { code?: number }).code ||
    0;
  const knownError = WHATSAPP_ERROR_CODES[errorCode];
  if (knownError) {
    return knownError;
  }
  return {
    code: errorCode,
    title: 'Unknown error',
    message:
      (errorData as { error?: { message?: string }; message?: string })?.error?.message ||
      (errorData as { message?: string }).message ||
      'Unknown error occurred',
    userFriendlyMessage: 'حدث خطأ غير معروف',
    shouldRetry: false,
    category: 'system',
  };
}

// ─── Send Messages ─────────────────────────────────────────────────────────────

/**
 * Send a text message via WhatsApp Cloud API
 * يستخدم MetaApiService المركزي — لا يحتاج توكن منفصل
 */
export async function sendWhatsAppTextMessage(
  phone: string,
  message: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!phoneNumberId || !meta.accessToken) {
    return {
      success: false,
      error: 'واتساب Cloud API غير مُعد. يرجى تعيين WHATSAPP_PHONE_NUMBER_ID و META_ACCESS_TOKEN',
    };
  }

  const formattedPhone = formatPhoneNumber(phone);
  logger.info(`Sending text to ${formattedPhone}:`, message.substring(0, 50) + '...');

  const result = await meta.sendWhatsAppText(phoneNumberId, formattedPhone, message);

  if (!result.success) {
    logger.error(`Error:`, result.error);
  } else {
    logger.info(`Message sent. ID: ${result.messageId}`);
  }

  return result;
}

interface TemplateMessage {
  templateName: string;
  languageCode: string;
  components: Array<{
    type: string;
    parameters?: Array<Record<string, unknown>>;
    sub_type?: string;
    index?: number;
  }>;
}

/**
 * Send a template message via WhatsApp Cloud API
 * يستخدم MetaApiService المركزي — لا يحتاج توكن منفصل
 */
export async function sendWhatsAppTemplateMessage(
  phone: string,
  template: TemplateMessage,
  _options?: { category?: 'marketing' | 'utility' | 'authentication' }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!phoneNumberId || !meta.accessToken) {
    return {
      success: false,
      error: 'واتساب Cloud API غير مُعد',
    };
  }

  const formattedPhone = formatPhoneNumber(phone);
  logger.info(`Sending template "${template.templateName}" to ${formattedPhone}`);

  const result = await meta.sendWhatsAppTemplate(
    phoneNumberId,
    formattedPhone,
    template.templateName,
    template.languageCode,
    template.components
  );

  if (!result.success) {
    logger.error(`Template error:`, result.error);
  } else {
    logger.info(`Template sent. ID: ${result.messageId}`);
  }

  return result;
}

/**
 * Send typing indicator via WhatsApp Cloud API
 * يستخدم MetaApiService المركزي — لا يحتاج توكن منفصل
 */
export async function sendWhatsAppTypingIndicator(
  phone: string,
  messageId: string,
  typing: boolean = true
): Promise<{ success: boolean; error?: string }> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!phoneNumberId || !meta.accessToken) {
    return {
      success: false,
      error: 'واتساب Cloud API غير مُعد',
    };
  }

  const formattedPhone = formatPhoneNumber(phone);
  if (!typing) {
    return { success: true };
  }

  logger.info(`Sending typing indicator to ${formattedPhone} for message ${messageId}`);

  const result = await meta.sendWhatsAppTypingIndicator(phoneNumberId, messageId, typing);

  if (!result.success) {
    logger.error(`Typing indicator error:`, result.error);
  } else {
    logger.info(`Typing indicator sent.`);
  }

  return result;
}

/**
 * Validate phone number format
 */
export function validatePhoneNumber(phone: string): {
  valid: boolean;
  formatted: string;
  error?: string;
} {
  const formatted = formatPhoneNumber(phone);

  if (formatted.length < 10 || formatted.length > 15) {
    return { valid: false, formatted, error: 'رقم الهاتف غير صحيح' };
  }

  if (!formatted.startsWith('967')) {
    return { valid: true, formatted, error: undefined };
  }

  if (formatted.length !== 12) {
    return {
      valid: false,
      formatted,
      error: 'رقم الهاتف اليمني يجب أن يكون 9 أرقام بعد كود الدولة',
    };
  }

  return { valid: true, formatted };
}

/**
 * Send an image message via WhatsApp Cloud API
 */
export async function sendWhatsAppImageMessage(
  phone: string,
  imageRef: string,
  caption?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!phoneNumberId || !meta.accessToken) {
    return {
      success: false,
      error: 'واتساب Cloud API غير مُعد. يرجى تعيين WHATSAPP_PHONE_NUMBER_ID و META_ACCESS_TOKEN',
    };
  }

  const formattedPhone = formatPhoneNumber(phone);
  logger.info(`Sending image to ${formattedPhone}:`, imageRef.substring(0, 50) + '...');

  const result = await meta.sendWhatsAppImage(phoneNumberId, formattedPhone, imageRef, caption);

  if (!result.success) {
    logger.error(`Error:`, result.error);
  } else {
    logger.info(`Image sent. ID: ${result.messageId}`);
  }

  return result;
}

/**
 * Send a video message via WhatsApp Cloud API
 */
export async function sendWhatsAppVideoMessage(
  phone: string,
  videoRef: string,
  caption?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!phoneNumberId || !meta.accessToken) {
    return {
      success: false,
      error: 'واتساب Cloud API غير مُعد',
    };
  }

  const formattedPhone = formatPhoneNumber(phone);
  logger.info(`Sending video to ${formattedPhone}:`, videoRef.substring(0, 50) + '...');

  const result = await meta.sendWhatsAppVideo(phoneNumberId, formattedPhone, videoRef, caption);

  if (!result.success) {
    logger.error(`Error:`, result.error);
  } else {
    logger.info(`Video sent. ID: ${result.messageId}`);
  }

  return result;
}

/**
 * Send an audio message via WhatsApp Cloud API
 */
export async function sendWhatsAppAudioMessage(
  phone: string,
  audioRef: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!phoneNumberId || !meta.accessToken) {
    return {
      success: false,
      error: 'واتساب Cloud API غير مُعد',
    };
  }

  const formattedPhone = formatPhoneNumber(phone);
  logger.info(`Sending audio to ${formattedPhone}:`, audioRef.substring(0, 50) + '...');

  const result = await meta.sendWhatsAppAudio(phoneNumberId, formattedPhone, audioRef);

  if (!result.success) {
    logger.error(`Error:`, result.error);
  } else {
    logger.info(`Audio sent. ID: ${result.messageId}`);
  }

  return result;
}

/**
 * Send a document message via WhatsApp Cloud API
 */
export async function sendWhatsAppDocumentMessage(
  phone: string,
  documentRef: string,
  filename?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!phoneNumberId || !meta.accessToken) {
    return {
      success: false,
      error: 'واتساب Cloud API غير مُعد',
    };
  }

  const formattedPhone = formatPhoneNumber(phone);
  logger.info(`Sending document to ${formattedPhone}:`, documentRef.substring(0, 50) + '...');

  const result = await meta.sendWhatsAppDocument(
    phoneNumberId,
    formattedPhone,
    documentRef,
    filename
  );

  if (!result.success) {
    logger.error(`Error:`, result.error);
  } else {
    logger.info(`Document sent. ID: ${result.messageId}`);
  }

  return result;
}

/**
 * Upload media file to WhatsApp Media API
 */
export async function uploadWhatsAppMedia(
  fileBuffer: Buffer,
  mimeType: string
): Promise<{ success: boolean; mediaId?: string; error?: string }> {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!phoneNumberId || !meta.accessToken) {
    return {
      success: false,
      error: 'واتساب Cloud API غير مُعد',
    };
  }

  logger.info(`Uploading media (${mimeType})...`);

  const result = await meta.uploadWhatsAppMedia(phoneNumberId, fileBuffer, mimeType);

  if (!result.success) {
    logger.error(`Upload error:`, result.error);
  } else {
    logger.info(`Media uploaded. ID: ${result.mediaId}`);
  }

  return result;
}
