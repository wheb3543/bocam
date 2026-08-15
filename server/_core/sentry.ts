/**
 * Sentry Error Tracking Configuration
 * إعداد تتبع الأخطاء باستخدام Sentry
 */

import * as Sentry from '@sentry/node';

/**
 * تهيئة Sentry لتتبع الأخطاء
 *
 * تقوم هذه الدالة بتهيئة Sentry لتتبع الأخطاء والأداء في التطبيق
 * يتم تفعيلها فقط إذا تم تعيين SENTRY_DSN في environment variables
 *
 * @returns void
 */
export function initSentry(): void {
  const dsn = process.env.SENTRY_DSN;

  if (!dsn) {
    console.warn('Sentry DSN not found, skipping Sentry initialization');
    return;
  }

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV || 'development',
    release: process.env.SENTRY_RELEASE || process.env.npm_package_version || '1.0.0',

    // تفعيل تتبع الأداء
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    // إعدادات beforeSend لتصفية الأخطاء غير المهمة وإضافة context
    beforeSend(event, hint) {
      // تصفية أخطاء الـ development
      if (process.env.NODE_ENV === 'development') {
        console.error('Sentry Error:', hint.originalException);
        return null;
      }

      // إضافة context إضافي
      event.contexts = {
        ...event.contexts,
        app: {
          name: 'bocam-crm',
          environment: process.env.NODE_ENV || 'development',
        },
      };

      return event;
    },

    // إعدادات integrations
    integrations: [
      // إضافة HTTP requests tracking
      Sentry.httpIntegration(),
      // إضافة Express integration إذا لزم الأمر
      // new Sentry.Integrations.Express(),
    ],
  });

  console.warn('Sentry initialized successfully');
}

/**
 * إضافة user context لـ Sentry
 *
 * تقوم هذه الدالة بإضافة معلومات المستخدم الحالي إلى سياق Sentry
 * لمساعدة في تتبع الأخطاء الخاصة بالمستخدمين
 *
 * @param user - كائن يحتوي على معلومات المستخدم
 * @param user.id - معرف المستخدم
 * @param user.email - البريد الإلكتروني للمستخدم (اختياري)
 * @param user.username - اسم المستخدم (اختياري)
 * @returns void
 */
export function setUserContext(user: {
  id: string | number;
  email?: string;
  username?: string;
}): void {
  Sentry.setUser(user);
}

/**
 * مسح user context من Sentry
 *
 * تقوم هذه الدالة بمسح معلومات المستخدم من سياق Sentry
 * عند تسجيل الخروج أو تغيير المستخدم
 *
 * @returns void
 */
export function clearUserContext(): void {
  Sentry.setUser(null);
}

/**
 * إضافة breadcrumb لـ Sentry
 *
 * تقوم هذه الدالة بإضافة breadcrumb لتتبع تسلسل الأحداث قبل حدوث الخطأ
 *
 * @param category - فئة الحدث
 * @param message - رسالة الحدث
 * @param level - مستوى الحدث (info/warning/error)
 * @param data - بيانات إضافية (اختياري)
 * @returns void
 */
export function addBreadcrumb(
  category: string,
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  data?: Record<string, unknown>
): void {
  Sentry.addBreadcrumb({
    category,
    message,
    level,
    data,
  });
}

/**
 * إرسال خطأ يدوياً إلى Sentry
 *
 * تقوم هذه الدالة بإرسال خطأ محدد إلى Sentry
 * للاستخدام في حالات الأخطاء المعروفة التي نريد تتبعها
 *
 * @param error - كائن الخطأ
 * @param context - سياق إضافي (اختياري)
 * @returns void
 */
export function captureException(error: Error, context?: Record<string, unknown>): void {
  if (context) {
    Sentry.withScope((scope) => {
      scope.setContext('additional_context', context);
      Sentry.captureException(error);
    });
  } else {
    Sentry.captureException(error);
  }
}

/**
 * إرسال رسالة خطأ يدوياً إلى Sentry
 *
 * تقوم هذه الدالة بإرسال رسالة خطأ محددة إلى Sentry
 * للاستخدام في حالات الأخطاء التي لا تحتوي على كائن Error
 *
 * @param message - رسالة الخطأ
 * @param level - مستوى الخطأ (info/warning/error)
 * @param context - سياق إضافي (اختياري)
 * @returns void
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'error',
  context?: Record<string, unknown>
): void {
  if (context) {
    Sentry.withScope((scope) => {
      scope.setContext('additional_context', context);
      Sentry.captureMessage(message, level);
    });
  } else {
    Sentry.captureMessage(message, level);
  }
}

/**
 * إضافة transaction لتتبع الأداء
 *
 * تقوم هذه الدالة بإنشاء transaction لتتبع أداء عملية معينة
 *
 * @param name - اسم العملية
 * @param op - نوع العملية
 * @returns Transaction object
 */
export function startTransaction(name: string, op: string) {
  return Sentry.startSpan({ name, op }, () => {
    // Transaction logic here
  });
}
