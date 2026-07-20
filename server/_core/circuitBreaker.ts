/**
 * Circuit Breaker Pattern
 * نمط قاطع الدائرة لحماية الخدمات من الفشل المتكرر
 */

import type { Request, Response, NextFunction } from 'express';
import { createLogger } from './logger';

const logger = createLogger('circuit-breaker');

/**
 * حالات قاطع الدائرة
 */
export enum CircuitState {
  CLOSED = 'CLOSED', // الدائرة مغلقة - العملية تعمل بشكل طبيعي
  OPEN = 'OPEN', // الدائرة مفتوحة - العملية معطلة مؤقتاً
  HALF_OPEN = 'HALF_OPEN', // الدائرة نصف مفتوحة - اختبار ما إذا كانت الخدمة قد تعافت
}

/**
 * إعدادات قاطع الدائرة
 */
export interface CircuitBreakerConfig {
  failureThreshold: number; // عدد الفشل المسموح به قبل فتح الدائرة
  successThreshold: number; // عدد النجاح المطلوب لإغلاق الدائرة
  timeout: number; // مدة انتظار قبل محاولة إغلاق الدائرة (ms)
  resetTimeout: number; // مدة انتظار قبل إعادة المحاولة (ms)
}

/**
 * فئة قاطع الدائرة
 */
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailureTime: number = 0;
  private nextAttemptTime: number = 0;

  constructor(
    private name: string,
    private config: CircuitBreakerConfig = {
      failureThreshold: 5,
      successThreshold: 2,
      timeout: 60000, // 1 minute
      resetTimeout: 30000, // 30 seconds
    }
  ) {}

  /**
   * تنفيذ عملية مع حماية قاطع الدائرة
   */
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    // التحقق من حالة الدائرة
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttemptTime) {
        throw new Error(`Circuit breaker '${this.name}' is OPEN`);
      }
      // الانتقال إلى حالة HALF_OPEN
      this.state = CircuitState.HALF_OPEN;
      logger.info(`Circuit breaker '${this.name}' moved to HALF_OPEN`);
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * معالجة النجاح
   */
  private onSuccess() {
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      logger.info(`Circuit breaker '${this.name}' success count: ${this.successCount}`);

      if (this.successCount >= this.config.successThreshold) {
        this.reset();
        logger.info(`Circuit breaker '${this.name}' reset to CLOSED`);
      }
    } else {
      this.failureCount = 0;
    }
  }

  /**
   * معالجة الفشل
   */
  private onFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    logger.warn(`Circuit breaker '${this.name}' failure count: ${this.failureCount}`);

    if (this.failureCount >= this.config.failureThreshold) {
      this.open();
    }
  }

  /**
   * فتح الدائرة
   */
  private open() {
    this.state = CircuitState.OPEN;
    this.nextAttemptTime = Date.now() + this.config.resetTimeout;
    logger.error(`Circuit breaker '${this.name}' opened due to too many failures`);
  }

  /**
   * إعادة تعيين الدائرة
   */
  private reset() {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = 0;
  }

  /**
   * الحصول على الحالة الحالية
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * الحصول على معلومات الحالة
   */
  getStatus() {
    return {
      name: this.name,
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      nextAttemptTime: this.nextAttemptTime,
    };
  }
}

/**
 * إدارة قواطع الدوائر المتعددة
 */
export class CircuitBreakerManager {
  private breakers: Map<string, CircuitBreaker> = new Map();

  /**
   * إنشاء أو الحصول على قاطع دائرة
   */
  getBreaker(name: string, config?: CircuitBreakerConfig): CircuitBreaker {
    if (!this.breakers.has(name)) {
      this.breakers.set(name, new CircuitBreaker(name, config));
    }
    return this.breakers.get(name) as CircuitBreaker;
  }

  /**
   * الحصول على حالة جميع القواطع
   */
  getAllStatuses(): Record<string, CircuitState> {
    const statuses: Record<string, CircuitState> = {};
    this.breakers.forEach((breaker, name) => {
      statuses[name] = breaker.getState();
    });
    return statuses;
  }

  /**
   * إعادة تعيين قاطع دائرة
   */
  resetBreaker(name: string) {
    const breaker = this.breakers.get(name);
    if (breaker) {
      this.breakers.delete(name);
      logger.info(`Circuit breaker '${name}' reset`);
    }
  }

  /**
   * إعادة تعيين جميع القواطع
   */
  resetAll() {
    this.breakers.clear();
    logger.info('All circuit breakers reset');
  }
}

/**
 * مثيل عام لمدير قواطع الدوائر
 */
export const circuitBreakerManager = new CircuitBreakerManager();

/**
 * قواطع دوائر جاهزة للاستخدام
 */
export const circuitBreakers = {
  database: circuitBreakerManager.getBreaker('database', {
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 60000,
    resetTimeout: 30000,
  }),
  redis: circuitBreakerManager.getBreaker('redis', {
    failureThreshold: 3,
    successThreshold: 2,
    timeout: 30000,
    resetTimeout: 15000,
  }),
  externalApi: circuitBreakerManager.getBreaker('external-api', {
    failureThreshold: 10,
    successThreshold: 3,
    timeout: 120000,
    resetTimeout: 60000,
  }),
  whatsapp: circuitBreakerManager.getBreaker('whatsapp', {
    failureThreshold: 5,
    successThreshold: 2,
    timeout: 60000,
    resetTimeout: 30000,
  }),
};

/**
 * Middleware للتحقق من حالة قاطع الدائرة
 */
export function circuitBreakerMiddleware(breaker: CircuitBreaker) {
  return (_req: Request, _res: Response, next: NextFunction) => {
    if (breaker.getState() === CircuitState.OPEN) {
      logger.warn('Circuit breaker is OPEN, blocking request');
      return _res.status(503).json({
        error: 'Service temporarily unavailable',
        message: 'The service is currently experiencing issues. Please try again later.',
      });
    }
    next();
  };
}
