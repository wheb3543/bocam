/**
 * Meta API WhatsApp Helpers - دوال مساعدة لـ WhatsApp Cloud API
 * دوال مساعدة للتعامل مع WhatsApp Cloud API
 */

import { GRAPH_API_BASE } from './meta.helpers';
import {
  WhatsAppMessageResult,
  WhatsAppTemplateResult,
  WhatsAppMediaUploadResult,
  WhatsAppTemplatesResult,
  WabaIdResult,
  WhatsAppPhoneNumberResult,
  WabaSubscribedAppsResult,
  SubscribeAppToWabaOptions,
  SubscribeAppToWabaResult,
  MediaOptions,
} from './meta.types';
import { formatMetaError } from './meta.helpers';
import { createLogger } from '../_core/logger';

const logger = createLogger('MetaApiService');

/**
 * التحقق من أن القيمة هي URL
 */
function isMediaUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

/**
 * بناء payload للوسائط
 */
function buildMediaPayload(
  mediaType: 'image' | 'video' | 'audio' | 'document',
  mediaRef: string,
  options: MediaOptions = {}
): Record<string, unknown> {
  const mediaObject: Record<string, unknown> = isMediaUrl(mediaRef)
    ? { link: mediaRef }
    : { id: mediaRef };

  if (options.caption) {
    mediaObject.caption = options.caption;
  }

  if (options.filename) {
    mediaObject.filename = options.filename;
  }

  return {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    type: mediaType,
    [mediaType]: mediaObject,
  };
}

/**
 * إرسال رسالة نصية عبر WhatsApp Cloud API
 */
export async function sendWhatsAppText(
  phoneNumberId: string,
  to: string,
  text: string,
  postFn: (
    endpoint: string,
    payload: Record<string, unknown>
  ) => Promise<{ ok: boolean; error?: unknown; data?: unknown }>
): Promise<WhatsAppMessageResult> {
  const res = await postFn(`${phoneNumberId}/messages`, {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'text',
    text: { preview_url: false, body: text },
  });
  if (!res.ok) {
    const errMsg = formatMetaError(res.error || { code: 0, message: 'Unknown error' });
    console.error(`[MetaApiService] sendWhatsAppText failed:`, JSON.stringify(res.error));
    return { success: false, error: errMsg };
  }
  return {
    success: true,
    messageId: (res.data as { messages?: Array<{ id: string }> })?.messages?.[0]?.id,
  };
}

/**
 * إرسال رسالة قالب عبر WhatsApp Cloud API
 */
export async function sendWhatsAppTemplate(
  phoneNumberId: string,
  to: string,
  templateName: string,
  languageCode: string,
  components: Record<string, unknown>[] = [],
  postFn: (
    endpoint: string,
    payload: Record<string, unknown>
  ) => Promise<{ ok: boolean; error?: unknown; data?: unknown }>
): Promise<WhatsAppTemplateResult> {
  const payload: Record<string, unknown> = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'template',
    template: { name: templateName, language: { code: languageCode } },
  };
  if (components.length > 0) {
    (payload as { template: { components?: unknown[] } }).template.components = components;
  }

  logger.info(`Sending template "${templateName}" (lang: ${languageCode}) to ${to}`);
  const res = await postFn(`${phoneNumberId}/messages`, payload);
  if (!res.ok) {
    const errMsg = formatMetaError(res.error || { code: 0, message: 'Unknown error' });
    logger.error(`sendWhatsAppTemplate failed:`, JSON.stringify(res.error));
    return { success: false, error: errMsg };
  }
  return {
    success: true,
    messageId: (res.data as { messages?: Array<{ id: string }> })?.messages?.[0]?.id,
  };
}

/**
 * إرسال مؤشر الكتابة (typing indicator) عبر WhatsApp Cloud API
 */
export async function sendWhatsAppTypingIndicator(
  phoneNumberId: string,
  messageId: string,
  typing: boolean = true,
  postFn: (
    endpoint: string,
    payload: Record<string, unknown>
  ) => Promise<{ ok: boolean; error?: unknown }>
): Promise<{ success: boolean; error?: string }> {
  if (!typing) {
    return { success: true };
  }

  const payload = {
    messaging_product: 'whatsapp',
    status: 'read',
    message_id: messageId,
    typing_indicator: {
      type: 'text',
    },
  };

  logger.info(`Sending typing indicator for message ${messageId}`);
  const res = await postFn(`${phoneNumberId}/messages`, payload);
  if (!res.ok) {
    const errMsg = formatMetaError(res.error || { code: 0, message: 'Unknown error' });
    logger.error(`sendWhatsAppTypingIndicator failed:`, JSON.stringify(res.error));
    return { success: false, error: errMsg };
  }
  return { success: true };
}

/**
 * إرسال رسالة صورة عبر WhatsApp Cloud API
 */
export async function sendWhatsAppImage(
  phoneNumberId: string,
  to: string,
  imageRef: string,
  caption: string | undefined,
  postFn: (
    endpoint: string,
    payload: Record<string, unknown>
  ) => Promise<{ ok: boolean; error?: unknown; data?: unknown }>
): Promise<WhatsAppMessageResult> {
  const payload = {
    to,
    ...buildMediaPayload('image', imageRef, { caption }),
  };

  const res = await postFn(`${phoneNumberId}/messages`, payload);
  if (!res.ok) {
    const errMsg = formatMetaError(res.error || { code: 0, message: 'Unknown error' });
    return { success: false, error: errMsg };
  }
  return {
    success: true,
    messageId: (res.data as { messages?: Array<{ id: string }> })?.messages?.[0]?.id,
  };
}

/**
 * إرسال رسالة فيديو عبر WhatsApp Cloud API
 */
export async function sendWhatsAppVideo(
  phoneNumberId: string,
  to: string,
  videoRef: string,
  caption: string | undefined,
  postFn: (
    endpoint: string,
    payload: Record<string, unknown>
  ) => Promise<{ ok: boolean; error?: unknown; data?: unknown }>
): Promise<WhatsAppMessageResult> {
  const payload = {
    to,
    ...buildMediaPayload('video', videoRef, { caption }),
  };

  const res = await postFn(`${phoneNumberId}/messages`, payload);
  if (!res.ok) {
    const errMsg = formatMetaError(res.error || { code: 0, message: 'Unknown error' });
    return { success: false, error: errMsg };
  }
  return {
    success: true,
    messageId: (res.data as { messages?: Array<{ id: string }> })?.messages?.[0]?.id,
  };
}

/**
 * إرسال رسالة صوت عبر WhatsApp Cloud API
 */
export async function sendWhatsAppAudio(
  phoneNumberId: string,
  to: string,
  audioRef: string,
  postFn: (
    endpoint: string,
    payload: Record<string, unknown>
  ) => Promise<{ ok: boolean; error?: unknown; data?: unknown }>
): Promise<WhatsAppMessageResult> {
  const payload = {
    to,
    ...buildMediaPayload('audio', audioRef),
  };

  const res = await postFn(`${phoneNumberId}/messages`, payload);
  if (!res.ok) {
    const errMsg = formatMetaError(res.error || { code: 0, message: 'Unknown error' });
    return { success: false, error: errMsg };
  }
  return {
    success: true,
    messageId: (res.data as { messages?: Array<{ id: string }> })?.messages?.[0]?.id,
  };
}

/**
 * إرسال رسالة مستند عبر WhatsApp Cloud API
 */
export async function sendWhatsAppDocument(
  phoneNumberId: string,
  to: string,
  documentRef: string,
  filename: string | undefined,
  postFn: (
    endpoint: string,
    payload: Record<string, unknown>
  ) => Promise<{ ok: boolean; error?: unknown; data?: unknown }>
): Promise<WhatsAppMessageResult> {
  const payload = {
    to,
    ...buildMediaPayload('document', documentRef, { filename }),
  };

  const res = await postFn(`${phoneNumberId}/messages`, payload);
  if (!res.ok) {
    const errMsg = formatMetaError(res.error || { code: 0, message: 'Unknown error' });
    return { success: false, error: errMsg };
  }
  return {
    success: true,
    messageId: (res.data as { messages?: Array<{ id: string }> })?.messages?.[0]?.id,
  };
}

/**
 * رفع ملف وسائط إلى WhatsApp Media API
 */
export async function uploadWhatsAppMedia(
  phoneNumberId: string,
  fileBuffer: Buffer,
  mimeType: string,
  accessToken: string
): Promise<WhatsAppMediaUploadResult> {
  try {
    const url = `${GRAPH_API_BASE}/${phoneNumberId}/media`;
    const formData = new FormData();
    const uint8Array = new Uint8Array(fileBuffer);
    formData.append('file', new Blob([uint8Array], { type: mimeType }), 'media');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      const error = formatMetaError(data.error);
      return { success: false, error };
    }

    return { success: true, mediaId: data.id };
  } catch (error) {
    logger.error('uploadWhatsAppMedia error:', error);
    return { success: false, error: 'Failed to upload media' };
  }
}

/**
 * جلب قوالب WhatsApp من WABA
 */
export async function getWhatsAppTemplates(
  wabaId: string,
  limit = 250,
  getFn: (
    endpoint: string,
    params: Record<string, string>
  ) => Promise<{ ok: boolean; error?: unknown; data?: unknown }>
): Promise<WhatsAppTemplatesResult> {
  const res = await getFn(`${wabaId}/message_templates`, {
    fields: 'id,name,status,category,language,components,quality_score,rejected_reason',
    limit: String(limit),
  });
  if (!res.ok) {
    const errMsg = formatMetaError(res.error || { code: 0, message: 'Unknown error' });
    logger.error(`getWhatsAppTemplates failed for WABA ${wabaId}:`, JSON.stringify(res.error));
    return { success: false, error: errMsg, rawError: res.error };
  }
  const templates = (res.data as { data?: Record<string, unknown>[] })?.data ?? [];
  logger.info(`Fetched ${templates.length} templates from WABA ${wabaId}`);
  return { success: true, templates };
}

/**
 * الحصول على WABA ID من Phone Number ID
 */
export async function getWabaIdFromPhoneNumberId(
  phoneNumberId: string,
  getFn: (
    endpoint: string,
    params: Record<string, string>
  ) => Promise<{ ok: boolean; error?: unknown; data?: unknown }>
): Promise<WabaIdResult> {
  const res = await getFn(`${phoneNumberId}`, {
    fields: 'whatsapp_business_account',
  });
  if (!res.ok) {
    return {
      success: false,
      error: (res.error as { message?: string })?.message ?? 'خطأ غير معروف',
    };
  }
  const wabaId = (res.data as { whatsapp_business_account?: { id?: string } })
    ?.whatsapp_business_account?.id;
  if (!wabaId) {
    return { success: false, error: 'لم يتم العثور على WABA ID' };
  }
  return { success: true, wabaId };
}

/**
 * جلب بيانات رقم واتساب للأعمال
 */
export async function getWhatsAppPhoneNumber(
  phoneNumberId: string,
  getFn: (
    endpoint: string,
    params: Record<string, string>
  ) => Promise<{ ok: boolean; error?: unknown; data?: unknown }>
): Promise<WhatsAppPhoneNumberResult> {
  const res = await getFn(`${phoneNumberId}`, {
    fields: 'id,verified_name,display_phone_number,quality_rating,status',
  });
  if (!res.ok) {
    return {
      success: false,
      error: formatMetaError(res.error || { code: 0, message: 'Unknown error' }),
    };
  }
  return { success: true, phoneNumber: res.data as Record<string, unknown> };
}

/**
 * تسجيل رقم الهاتف لاستخدامه مع WhatsApp Cloud API
 */
export async function registerWhatsAppPhoneNumber(
  phoneNumberId: string,
  pin: string,
  postFn: (
    endpoint: string,
    payload: Record<string, unknown>
  ) => Promise<{ ok: boolean; error?: unknown; data?: unknown }>
): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }> {
  const res = await postFn(`${phoneNumberId}/register`, {
    messaging_product: 'whatsapp',
    pin,
  });
  if (!res.ok) {
    return {
      success: false,
      error: formatMetaError(res.error || { code: 0, message: 'Unknown error' }),
    };
  }
  return { success: true, data: res.data as Record<string, unknown> };
}

/**
 * جلب التطبيقات المشتركة على WABA
 */
export async function getWabaSubscribedApps(
  wabaId: string,
  getFn: (
    endpoint: string,
    params?: Record<string, string>
  ) => Promise<{ ok: boolean; error?: unknown; data?: unknown }>
): Promise<WabaSubscribedAppsResult> {
  const res = await getFn(`${wabaId}/subscribed_apps`);
  if (!res.ok) {
    return {
      success: false,
      error: formatMetaError(res.error || { code: 0, message: 'Unknown error' }),
    };
  }
  return { success: true, apps: (res.data as { data?: Record<string, unknown>[] })?.data ?? [] };
}

/**
 * اشتراك التطبيق الحالي في Webhooks الخاصة بـ WABA
 */
export async function subscribeAppToWaba(
  wabaId: string,
  postFn: (
    endpoint: string,
    payload: Record<string, unknown>
  ) => Promise<{ ok: boolean; error?: unknown; data?: unknown }>,
  options?: SubscribeAppToWabaOptions
): Promise<SubscribeAppToWabaResult> {
  const payload: Record<string, string> = {};

  if (options?.overrideCallbackUri) {
    payload.override_callback_uri = options.overrideCallbackUri;
  }

  if (options?.verifyToken) {
    payload.verify_token = options.verifyToken;
  }

  const res = await postFn(`${wabaId}/subscribed_apps`, payload);
  if (!res.ok) {
    return {
      success: false,
      error: formatMetaError(res.error || { code: 0, message: 'Unknown error' }),
    };
  }
  return { success: true, data: res.data as Record<string, unknown> };
}
