import crypto from 'crypto';
import { Request, Response } from 'express';
import { createLogger } from '../../../_core/logger';

const logger = createLogger('signatureVerifier');

/**
 * التحقق من صحة توقيع Webhook وفق وثائق Meta الرسمية
 * https://developers.facebook.com/documentation/business-messaging/whatsapp/webhooks/overview/#validating-payloads
 *
 * يستخدم HMAC-SHA256 مع App Secret لضمان أن الطلب قادم من Meta فعلاً
 *
 * @param req - طلب Express
 * @returns true إذا كان التوقيع صحيحاً، false خلاف ذلك
 */
export function verifyWebhookSignature(req: Request): boolean {
  const appSecret =
    process.env.WHATSAPP_APP_SECRET || process.env.META_APP_SECRET || process.env.JWT_SECRET;

  if (!appSecret) {
    // في بيئة التطوير: تخطي التحقق إذا لم يكن App Secret متاحاً
    if (process.env.NODE_ENV !== 'production') {
      logger.warn('⚠️  META_APP_SECRET not set — skipping signature verification (dev mode)');
      return true;
    }
    logger.error('❌ META_APP_SECRET not set in production!');
    return false;
  }

  const signature = req.headers['x-hub-signature-256'] as string;
  if (!signature) {
    logger.warn('❌ Missing X-Hub-Signature-256 header');
    return false;
  }

  // الحصول على raw body للتحقق من التوقيع
  const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;
  if (!rawBody) {
    logger.warn('⚠️  rawBody not available — ensure express.raw() middleware is applied');
    // Fallback: استخدام JSON.stringify
    const bodyStr = JSON.stringify(req.body);
    const expectedSig =
      'sha256=' + crypto.createHmac('sha256', appSecret).update(bodyStr, 'utf8').digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig));
  }

  const expectedSig =
    'sha256=' + crypto.createHmac('sha256', appSecret).update(rawBody).digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(signature, 'utf8'), Buffer.from(expectedSig, 'utf8'));
  } catch {
    return false;
  }
}

/**
 * التحقق من Webhook Token عند تسجيل Webhook في Meta
 * وفق: GET /webhook?hub.mode=subscribe&hub.verify_token=...&hub.challenge=...
 *
 * @param req - طلب Express
 * @param res - استجابة Express
 * @returns true إذا كان التحقق ناجحاً، false خلاف ذلك
 */
export function verifyWebhookToken(req: Request, res: Response): boolean {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode !== 'subscribe') {
    logger.warn('Invalid hub.mode:', mode);
    res.status(403).json({ error: 'Invalid hub.mode' });
    return false;
  }

  const VERIFY_TOKEN =
    process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || process.env.WEBHOOK_VERIFY_TOKEN;

  if (token !== VERIFY_TOKEN) {
    logger.warn('❌ Invalid verify token');
    res.status(403).json({ error: 'Invalid verify token' });
    return false;
  }

  if (!challenge) {
    logger.warn('Missing hub.challenge');
    res.status(400).json({ error: 'Missing challenge' });
    return false;
  }

  logger.info('✅ Webhook verified successfully');
  res.status(200).send(String(challenge));
  return true;
}
