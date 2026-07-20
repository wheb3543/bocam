/**
 * CORS Configuration
 * إعداد CORS محسن للتحكم في الوصول عبر النطاقات
 */

import cors from 'cors';
import { createLogger } from './logger';

const logger = createLogger('cors');

/**
 * إعدادات CORS المختلفة
 */
export const corsConfigs = {
  // CORS صارم للإنتاج
  production: {
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) => {
      const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
        'https://bocam.com',
        'https://www.bocam.com',
      ];

      if (!origin) {
        // السماح بالطلبات بدون origin (مثل mobile apps)
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn('CORS blocked', { origin, allowedOrigins });
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 86400, // 24 hours
  },

  // CORS للتطوير
  development: {
    origin: true, // السماح بجميع الأصول في التطوير
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  },

  // CORS للـ Webhooks (يحتاج إلى السماح بجميع الأصول)
  webhooks: {
    origin: true,
    credentials: false,
    methods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-Hub-Signature-256'],
  },

  // CORS للـ Public API
  public: {
    origin: '*',
    credentials: false,
    methods: ['GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  },
};

/**
 * إنشاء CORS middleware مخصص
 */
export function createCorsMiddleware(config: cors.CorsOptions) {
  return cors(config);
}

/**
 * CORS middleware جاهز للاستخدام
 */
export const corsMiddlewares = {
  production: createCorsMiddleware(corsConfigs.production),
  development: createCorsMiddleware(corsConfigs.development),
  webhooks: createCorsMiddleware(corsConfigs.webhooks),
  public: createCorsMiddleware(corsConfigs.public),
};

/**
 * CORS middleware يعتمد على البيئة
 */
export const corsMiddleware =
  process.env.NODE_ENV === 'production' ? corsMiddlewares.production : corsMiddlewares.development;

/**
 * CORS middleware للـ Webhooks (مثل WhatsApp)
 */
export const webhookCorsMiddleware = corsMiddlewares.webhooks;

/**
 * CORS middleware للـ Public API
 */
export const publicApiCorsMiddleware = corsMiddlewares.public;
