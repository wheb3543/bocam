/**
 * Meta API Helpers - دوال مساعدة لخدمة Meta
 * دوال مساعدة عامة للتعامل مع Retry Logic و URL building و error formatting
 */

import { createLogger } from '../_core/logger';
import { RetryConfig, MetaApiResponse } from './meta.types';

const logger = createLogger('MetaApiService');

/** نسخة Graph API الافتراضية لجميع الخدمات */
export const GRAPH_API_VERSION = 'v25.0';
export const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

/** إعدادات Retry Logic لمعالجة Rate Limiting وانقطاع الاتصال */
export const RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  retryOnCodes: [429, 500, 502, 503, 504],
};

/**
 * تأخير مع Exponential Backoff لمعالجة Rate Limiting
 */
export async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * تحويل خطأ Meta API إلى رسالة واضحة للمستخدم
 * وفق وثائق Meta الرسمية: https://developers.facebook.com/docs/whatsapp/cloud-api/support/error-codes
 */
export function formatMetaError(error: { code?: number; message?: string }): string {
  if (!error) {
    return 'خطأ غير معروف';
  }
  const code = error.code || 0;
  const metaErrors: Record<number, string> = {
    // Auth
    190: 'انتهت صلاحية توكن الوصول أو تم إلغاؤه',
    // WhatsApp Business
    131000: 'خطأ في المعاملات — تحقق من صحة البيانات المُرسَلة',
    131005: 'ليس لديك صلاحية إرسال هذا النوع من الرسائل',
    131008: 'معامل مطلوب مفقود في الطلب',
    131009: 'قيمة معامل غير صحيحة',
    131016: 'الخدمة غير متاحة مؤقتاً، حاول مرة أخرى',
    131021: 'لا يمكن إرسال رسالة لنفس الرقم',
    131026: 'لا يمكن تسليم الرسالة — الرقم غير مسجل في واتساب أو محظور',
    131042: 'مشكلة في طريقة الدفع لحساب واتساب للأعمال',
    131047: 'انتهت نافذة 24 ساعة — يجب إرسال قالب معتمد من Meta',
    131051: 'نوع الرسالة غير مدعوم',
    132000: 'عدد متغيرات القالب لا يتطابق مع ما هو معرّف في Meta',
    132001: 'القالب غير موجود أو غير معتمد من Meta — تحقق من الاسم واللغة',
    132005: 'نص القالب بعد تعبئة المتغيرات طويل جداً',
    132007: 'محتوى القالب يخالف سياسة Meta',
    132012: 'تنسيق متغيرات القالب غير صحيح',
    132015: 'القالب متوقف مؤقتاً بسبب جودة منخفضة',
    132016: 'القالب معطّل نهائياً بسبب جودة منخفضة',
  };
  if (metaErrors[code]) {
    return `${metaErrors[code]} (كود الخطأ: ${code})`;
  }
  return error.message || `خطأ من Meta API (كود: ${code})`;
}

/**
 * بناء URL كامل بدون access_token (يُرسَل عبر Authorization header)
 */
export function buildUrl(endpoint: string, params: Record<string, string> = {}): string {
  const url = new URL(`${GRAPH_API_BASE}/${endpoint.replace(/^\//, '')}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

/**
 * التحقق من وجود التوكن قبل أي طلب
 */
export function assertToken(accessToken: string): void {
  if (!accessToken) {
    throw new Error(
      '[MetaApiService] META_ACCESS_TOKEN غير مُعيَّن في متغيرات البيئة. ' +
        'أضف التوكن في ملف .env أو إعدادات المنصة.'
    );
  }
}

/**
 * تنفيذ طلب مع Retry Logic تلقائي
 */
export async function fetchWithRetry(
  url: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: string | FormData;
    signal?: unknown;
  },
  endpoint: string,
  retryConfig: RetryConfig = RETRY_CONFIG
): Promise<{ res: Response; body: unknown }> {
  let lastError: unknown;
  let currentDelay = retryConfig.initialDelayMs;

  for (let attempt = 0; attempt <= retryConfig.maxRetries; attempt++) {
    try {
      // eslint-disable-next-line no-undef
      const res = await fetch(url, {
        ...options,
        signal: (AbortSignal as unknown as AbortSignalWithTimeout).timeout(30000),
      });
      const body = await res.json();

      // معالجة Rate Limiting (429) - انتظر وأعد المحاولة
      if (res.status === 429 || body.error?.code === 4 || body.error?.code === 80007) {
        const retryAfter = res.headers.get('Retry-After');
        const waitMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : currentDelay;
        logger.warn(
          `Rate limited on ${endpoint}. Waiting ${waitMs}ms (attempt ${attempt + 1}/${retryConfig.maxRetries})`
        );
        if (attempt < retryConfig.maxRetries) {
          await delay(Math.min(waitMs, retryConfig.maxDelayMs));
          currentDelay = Math.min(
            currentDelay * retryConfig.backoffMultiplier,
            retryConfig.maxDelayMs
          );
          continue;
        }
      }

      // إعادة المحاولة على أخطاء الخادم
      if (
        retryConfig.retryOnCodes.includes(res.status) &&
        res.status !== 429 &&
        attempt < retryConfig.maxRetries
      ) {
        logger.warn(
          `Server error ${res.status} on ${endpoint}. Retrying in ${currentDelay}ms (attempt ${attempt + 1}/${retryConfig.maxRetries})`
        );
        await delay(currentDelay);
        currentDelay = Math.min(
          currentDelay * retryConfig.backoffMultiplier,
          retryConfig.maxDelayMs
        );
        continue;
      }

      return { res, body };
    } catch (err) {
      lastError = err;
      if (attempt < retryConfig.maxRetries) {
        logger.warn(
          `Network error on ${endpoint}. Retrying in ${currentDelay}ms (attempt ${attempt + 1}/${retryConfig.maxRetries}):`,
          err
        );
        await delay(currentDelay);
        currentDelay = Math.min(
          currentDelay * retryConfig.backoffMultiplier,
          retryConfig.maxDelayMs
        );
      }
    }
  }
  throw lastError || new Error(`فشل الطلب بعد ${retryConfig.maxRetries} محاولات`);
}

/**
 * معالجة استجابة Meta API
 */
export function handleMetaResponse<T>(res: Response, body: unknown): MetaApiResponse<T> {
  return {
    data: body as T,
    error: (
      body as { error?: { message: string; type: string; code: number; fbtrace_id?: string } }
    ).error,
    status: res.status,
    ok: res.ok && !(body as { error?: unknown }).error,
  };
}

/**
 * معالجة خطأ في طلب Meta API
 */
export function handleMetaError(
  err: unknown,
  endpoint: string,
  method: string
): MetaApiResponse<never> {
  const msg = err instanceof Error ? err.message : String(err);
  logger.error(`${method} ${endpoint} failed after retries:`, msg);
  return { error: { message: msg, type: 'NetworkError', code: 0 }, status: 0, ok: false };
}
