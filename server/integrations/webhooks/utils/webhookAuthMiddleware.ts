import { Request, Response, NextFunction } from 'express';
import { verifyWebhookSignature, verifyWebhookToken } from './signatureVerifier';
import { createLogger } from '../../../_core/logger';

const logger = createLogger('webhookAuthMiddleware');

/**
 * Middleware للتحقق من صحة توقيع Webhook
 * يمنع الطلبات غير الموقعة من المرور
 *
 * @param req - طلب Express
 * @param res - استجابة Express
 * @param next - دالة NextFunction
 */
export function webhookAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  const isValid = verifyWebhookSignature(req);

  if (!isValid) {
    logger.warn('❌ Invalid webhook signature - request rejected');
    res.status(403).json({ error: 'Invalid signature' });
    return;
  }

  logger.info('✅ Webhook signature verified');
  next();
}

/**
 * Middleware للتحقق من Webhook Token (للـ GET requests فقط)
 * يستخدم عند تسجيل Webhook في Meta
 *
 * @param req - طلب Express
 * @param res - استجابة Express
 * @param next - دالة NextFunction
 */
export function webhookTokenMiddleware(req: Request, res: Response, next: NextFunction): void {
  // فقط للـ GET requests
  if (req.method !== 'GET') {
    next();
    return;
  }

  const mode = req.query['hub.mode'];
  if (!mode) {
    // ليس طلب تحقق، تابع
    next();
    return;
  }

  // طلب تحقق من Meta
  const isValid = verifyWebhookToken(req, res);

  if (!isValid) {
    // تم إرسال الاستجابة بالفعل في verifyWebhookToken
    return;
  }

  // تم التحقق بنجاح، لا تابع (تم إرسال الـ challenge)
}
