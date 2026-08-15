/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                         MetaApiService — خدمة Meta المركزية                ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║  القاعدة المعمارية الأساسية:                                                ║
 * ║  جميع طلبات Meta Graph API (WhatsApp, Instagram, Facebook Pages,            ║
 * ║  Messenger, Ads Management, CAPI, ...) تمر عبر هذه الخدمة حصراً.           ║
 * ║                                                                              ║
 * ║  التوكن المُستخدم: META_ACCESS_TOKEN (من .env)                              ║
 * ║  لا يُسمح بإنشاء متغيرات توكن إضافية (IG_TOKEN, FB_TOKEN, ...).            ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * الاستخدام:
 *   import { meta } from './MetaApiService';
 *
 *   // GET
 *   const data = await meta.get('me', { fields: 'name,email' });
 *
 *   // POST
 *   const result = await meta.post(`${phoneId}/messages`, payload);
 *
 *   // وصول مباشر للتوكن (للحالات الاستثنائية فقط)
 *   const token = meta.accessToken;
 */

import {
  GRAPH_API_BASE,
  RETRY_CONFIG,
  assertToken,
  buildUrl,
  fetchWithRetry,
  handleMetaResponse,
  handleMetaError,
} from './meta.helpers';
import { MetaApiResponse } from './meta.types';
import {
  sendWhatsAppText,
  sendWhatsAppTemplate,
  sendWhatsAppTypingIndicator,
  sendWhatsAppImage,
  sendWhatsAppVideo,
  sendWhatsAppAudio,
  sendWhatsAppDocument,
  uploadWhatsAppMedia,
  getWhatsAppTemplates,
  getWabaIdFromPhoneNumberId,
  getWhatsAppPhoneNumber,
  registerWhatsAppPhoneNumber,
  getWabaSubscribedApps,
  subscribeAppToWaba,
} from './meta.whatsapp';
import {
  getInstagramProfile,
  getInstagramInsights,
  getFacebookPage,
  getFacebookPageInsights,
  sendCAPIEvent,
} from './meta.other';

class MetaApiService {
  /**
   * التوكن الموحد — يُقرأ من process.env.META_ACCESS_TOKEN في كل استدعاء
   * لضمان التقاط أي تحديث للمتغير دون إعادة تشغيل الخادم.
   */
  get accessToken(): string {
    return process.env.META_ACCESS_TOKEN ?? '';
  }

  /**
   * بناء URL كامل بدون access_token (يُرسَل عبر Authorization header)
   * متاح للاستخدام في الاختبارات
   */
  buildUrl(endpoint: string, params: Record<string, string> = {}): string {
    return buildUrl(endpoint, params);
  }

  /**
   * طلب GET عام — يستخدم Authorization: Bearer header حصراً
   * @param endpoint  مسار نقطة النهاية (مثل: "me", "123456/messages")
   * @param params    معاملات query string إضافية
   */
  async get<T = unknown>(
    endpoint: string,
    params: Record<string, string> = {}
  ): Promise<MetaApiResponse<T>> {
    assertToken(this.accessToken);
    const url = buildUrl(endpoint, params);
    try {
      const { res, body } = await fetchWithRetry(
        url,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.accessToken}`,
          },
        },
        endpoint,
        RETRY_CONFIG
      );
      return handleMetaResponse<T>(res, body);
    } catch (err) {
      return handleMetaError(err, endpoint, 'GET');
    }
  }

  /**
   * طلب POST عام (JSON body)
   * @param endpoint  مسار نقطة النهاية
   * @param payload   البيانات المُرسَلة في body
   */
  async post<T = unknown>(
    endpoint: string,
    payload: Record<string, unknown> = {}
  ): Promise<MetaApiResponse<T>> {
    assertToken(this.accessToken);
    const url = `${GRAPH_API_BASE}/${endpoint.replace(/^\//, '')}`;
    try {
      const { res, body } = await fetchWithRetry(
        url,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.accessToken}`,
          },
          body: JSON.stringify(payload),
        },
        endpoint,
        RETRY_CONFIG
      );
      return handleMetaResponse<T>(res, body);
    } catch (err) {
      return handleMetaError(err, endpoint, 'POST');
    }
  }

  /**
   * طلب DELETE عام
   */
  async delete<T = unknown>(endpoint: string): Promise<MetaApiResponse<T>> {
    assertToken(this.accessToken);
    const url = buildUrl(endpoint);
    try {
      const { res, body } = await fetchWithRetry(
        url,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${this.accessToken}` },
        },
        endpoint,
        RETRY_CONFIG
      );
      return handleMetaResponse<T>(res, body);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[MetaApiService] DELETE ${endpoint} failed after retries:`, msg);
      return { error: { message: msg, type: 'NetworkError', code: 0 }, status: 0, ok: false };
    }
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // ── WhatsApp Cloud API helpers ────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════════════════

  /** إرسال رسالة نصية عبر WhatsApp Cloud API */
  async sendWhatsAppText(phoneNumberId: string, to: string, text: string) {
    return sendWhatsAppText(phoneNumberId, to, text, this.post.bind(this));
  }

  /** إرسال رسالة قالب عبر WhatsApp Cloud API */
  async sendWhatsAppTemplate(
    phoneNumberId: string,
    to: string,
    templateName: string,
    languageCode: string,
    components: Record<string, unknown>[] = []
  ) {
    return sendWhatsAppTemplate(
      phoneNumberId,
      to,
      templateName,
      languageCode,
      components,
      this.post.bind(this)
    );
  }

  /** إرسال مؤشر الكتابة (typing indicator) عبر WhatsApp Cloud API */
  async sendWhatsAppTypingIndicator(
    phoneNumberId: string,
    messageId: string,
    typing: boolean = true
  ) {
    return sendWhatsAppTypingIndicator(phoneNumberId, messageId, typing, this.post.bind(this));
  }

  /** إرسال رسالة صورة عبر WhatsApp Cloud API */
  async sendWhatsAppImage(phoneNumberId: string, to: string, imageRef: string, caption?: string) {
    return sendWhatsAppImage(phoneNumberId, to, imageRef, caption, this.post.bind(this));
  }

  /** إرسال رسالة فيديو عبر WhatsApp Cloud API */
  async sendWhatsAppVideo(phoneNumberId: string, to: string, videoRef: string, caption?: string) {
    return sendWhatsAppVideo(phoneNumberId, to, videoRef, caption, this.post.bind(this));
  }

  /** إرسال رسالة صوت عبر WhatsApp Cloud API */
  async sendWhatsAppAudio(phoneNumberId: string, to: string, audioRef: string) {
    return sendWhatsAppAudio(phoneNumberId, to, audioRef, this.post.bind(this));
  }

  /** إرسال رسالة مستند عبر WhatsApp Cloud API */
  async sendWhatsAppDocument(
    phoneNumberId: string,
    to: string,
    documentRef: string,
    filename?: string
  ) {
    return sendWhatsAppDocument(phoneNumberId, to, documentRef, filename, this.post.bind(this));
  }

  /** رفع ملف وسائط إلى WhatsApp Media API */
  async uploadWhatsAppMedia(phoneNumberId: string, fileBuffer: Buffer, mimeType: string) {
    return uploadWhatsAppMedia(phoneNumberId, fileBuffer, mimeType, this.accessToken);
  }

  /** جلب قوالب WhatsApp من WABA */
  async getWhatsAppTemplates(wabaId: string, limit = 250) {
    return getWhatsAppTemplates(wabaId, limit, this.get.bind(this));
  }

  /** الحصول على WABA ID من Phone Number ID */
  async getWabaIdFromPhoneNumberId(phoneNumberId: string) {
    return getWabaIdFromPhoneNumberId(phoneNumberId, this.get.bind(this));
  }

  /** جلب بيانات رقم واتساب للأعمال */
  async getWhatsAppPhoneNumber(phoneNumberId: string) {
    return getWhatsAppPhoneNumber(phoneNumberId, this.get.bind(this));
  }

  /** تسجيل رقم الهاتف لاستخدامه مع WhatsApp Cloud API */
  async registerWhatsAppPhoneNumber(phoneNumberId: string, pin: string) {
    return registerWhatsAppPhoneNumber(phoneNumberId, pin, this.post.bind(this));
  }

  /** جلب التطبيقات المشتركة على WABA */
  async getWabaSubscribedApps(wabaId: string) {
    return getWabaSubscribedApps(wabaId, this.get.bind(this));
  }

  /** اشتراك التطبيق الحالي في Webhooks الخاصة بـ WABA */
  async subscribeAppToWaba(
    wabaId: string,
    options?: { overrideCallbackUri?: string; verifyToken?: string }
  ) {
    return subscribeAppToWaba(wabaId, this.post.bind(this), options);
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // ── Instagram Graph API helpers ───────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════════════════

  /** جلب إحصائيات حساب Instagram Business */
  async getInstagramProfile(accountId: string) {
    return getInstagramProfile(accountId, this.get.bind(this));
  }

  async getInstagramInsights(accountId: string, period = 'days_28') {
    return getInstagramInsights(accountId, period, this.get.bind(this));
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // ── Facebook Pages helpers ────────────────────────────────────────────────────
  // ══════════════════════════════════════════════════════════════════════════════

  /** جلب بيانات صفحة Facebook */
  async getFacebookPage(pageId: string) {
    return getFacebookPage(pageId, this.get.bind(this));
  }

  async getFacebookPageInsights(pageId: string, period = 'days_28') {
    return getFacebookPageInsights(pageId, period, this.get.bind(this));
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // ── Facebook Conversions API (CAPI) helpers ───────────────────────────────────
  // ══════════════════════════════════════════════════════════════════════════════

  /** إرسال حدث تحويل إلى Meta CAPI */
  async sendCAPIEvent(pixelId: string, events: Record<string, unknown>[], testEventCode?: string) {
    return sendCAPIEvent(pixelId, events, this.post.bind(this), testEventCode);
  }
}

/**
 * Instance وحيد (Singleton) يُستخدم في جميع أنحاء التطبيق.
 *
 * الاستيراد:
 *   import { meta } from '../MetaApiService';
 */
export const meta = new MetaApiService();
export default meta;
