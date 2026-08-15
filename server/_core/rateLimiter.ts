/**
 * Advanced Rate Limiting Middleware
 * Middleware محسن لتحديد معدل الطلبات
 */

import rateLimit from 'express-rate-limit';
import type { Request, Response } from 'express';
import { createLogger } from './logger';

/**
 * Interface للمستخدم في الطلب
 */
interface UserRequest extends Request {
  user?: {
    id: string | number;
  };
}

const logger = createLogger('rate-limiter');

/**
 * إعدادات Rate Limiting المختلفة
 */
export const rateLimitConfigs = {
  // Rate limiting صارم للمصادقة
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: {
      error: 'Too many authentication attempts, please try again later',
    },
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    standardHeaders: true,
    legacyHeaders: false,
  },

  // Rate limiting للمستخدمين المسجلين
  user: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: {
      error: 'Too many requests, please try again later',
    },
    skipSuccessfulRequests: true,
    skipFailedRequests: false,
    standardHeaders: true,
    legacyHeaders: false,
  },

  // Rate limiting للعمليات الحساسة
  sensitive: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 requests per window
    message: {
      error: 'Too many sensitive operations, please try again later',
    },
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
    standardHeaders: true,
    legacyHeaders: false,
  },

  // Rate limiting للعمليات العادية
  normal: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // 200 requests per window
    message: {
      error: 'Too many requests, please try again later',
    },
    skipSuccessfulRequests: true,
    skipFailedRequests: false,
    standardHeaders: true,
    legacyHeaders: false,
  },

  // Rate limiting للعمليات الخفيفة
  light: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // 500 requests per window
    message: {
      error: 'Too many requests, please try again later',
    },
    skipSuccessfulRequests: true,
    skipFailedRequests: false,
    standardHeaders: true,
    legacyHeaders: false,
  },
};

/**
 * إنشاء rate limiter مخصص
 */
export function createRateLimiter(config: typeof rateLimitConfigs.auth) {
  return rateLimit({
    ...config,
    handler: (_req: Request, res: Response) => {
      logger.warn('Rate limit exceeded', {
        ip: _req.ip,
        path: _req.path,
        method: _req.method,
      });
      res.status(429).json(config.message);
    },
  });
}

/**
 * Rate limiters جاهزة للاستخدام
 */
export const rateLimiters = {
  auth: createRateLimiter(rateLimitConfigs.auth),
  user: createRateLimiter(rateLimitConfigs.user),
  sensitive: createRateLimiter(rateLimitConfigs.sensitive),
  normal: createRateLimiter(rateLimitConfigs.normal),
  light: createRateLimiter(rateLimitConfigs.light),
};

/**
 * Rate limiter يعتمد على IP و User ID
 * للمستخدمين المسجلين
 */
export const createUserRateLimiter = () => {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    keyGenerator: (req: UserRequest) => {
      // استخدام user ID إذا كان متاحاً، وإلا IP
      return String(req.user?.id || req.ip);
    },
    handler: (_req: UserRequest, res: Response) => {
      logger.warn('User rate limit exceeded', {
        userId: _req.user?.id,
        ip: _req.ip,
      });
      res.status(429).json({
        error: 'Too many requests for this user, please try again later',
      });
    },
  });
};

/**
 * Rate limiter للعمليات الثقيلة (مثل تصدير البيانات)
 */
export const createHeavyOperationLimiter = () => {
  return rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 operations per hour
    message: {
      error: 'Too many heavy operations, please try again later',
    },
    skipSuccessfulRequests: false,
  });
};

/**
 * Rate limiter للـ API endpoints العامة
 */
export const createPublicApiLimiter = () => {
  return rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // 30 requests per minute
    message: {
      error: 'Too many requests from this IP, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};
