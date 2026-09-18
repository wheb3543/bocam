import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { publish } from '../../_core/pubsub';
import {
  handleWebhookVerification,
  handleWebhookPost,
  verifyWebhookSignature,
} from '../../integrations/webhooks/whatsappWebhook';
import { ENV } from '../../_core/env';
import multer from 'multer';
import { createLogger } from '../../_core/logger';
import { asMulterMiddleware } from '../../_core/expressCompatibility';

const logger = createLogger('webhook');

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  const cookies: Record<string, string> = {};
  cookieHeader.split(';').forEach((c) => {
    const [n, v] = c.trim().split('=');
    if (n && v) {
      cookies[n] = decodeURIComponent(v);
    }
  });
  const token = cookies['admin_session'];
  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    res.status(500).json({ error: 'Server misconfiguration' });
    return;
  }
  try {
    jwt.verify(token, secret);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired session' });
  }
}

/**
 * WhatsApp Webhook Express Routes
 * Meta requires standard HTTP GET/POST endpoints (not tRPC)
 * GET  /api/webhooks/whatsapp → Verification
 * POST /api/webhooks/whatsapp → Receive messages & statuses
 */

const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
if (!VERIFY_TOKEN) {
  logger.warn(
    'WHATSAPP_WEBHOOK_VERIFY_TOKEN not set — webhook verification will reject all requests'
  );
}

// Global channel for all users to receive new message notifications
const GLOBAL_CHANNEL = 'global:whatsapp';

// Configure multer for file uploads (in-memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export function createWebhookRouter(): Router {
  const router = Router();

  /**
   * GET /api/webhooks/whatsapp
   * Meta verification endpoint - returns hub.challenge on success
   */
  router.get('/api/webhooks/whatsapp', async (req: Request, res: Response) => {
    await handleWebhookVerification(req, res);
  });

  /**
   * GET /api/whatsapp/media/:mediaId
   * Proxy endpoint to download media from WhatsApp Media API
   */
  router.get('/api/whatsapp/media/:mediaId', requireAuth, async (req: Request, res: Response) => {
    try {
      const rawMediaId = req.params.mediaId;
      const mediaId = Array.isArray(rawMediaId) ? rawMediaId[0] : rawMediaId;
      if (!mediaId || !/^\d+$/.test(mediaId)) {
        res.status(400).json({ error: 'Invalid media ID' });
        return;
      }

      const isDownloadRequest = req.query.download === '1';
      const cacheKey = typeof req.query.cacheKey === 'string' ? req.query.cacheKey : null;

      if (cacheKey) {
        const { readCachedIncomingWhatsAppMedia } =
          await import('../../services/whatsappIncomingMediaCache');
        const cachedMedia = await readCachedIncomingWhatsAppMedia(cacheKey);
        if (cachedMedia) {
          res.setHeader('Content-Type', cachedMedia.mimeType);
          res.setHeader('Cache-Control', 'private, no-store');
          res.setHeader(
            'Content-Disposition',
            isDownloadRequest ? `attachment; filename="whatsapp-media-${mediaId}"` : 'inline'
          );
          res.send(Buffer.from(cachedMedia.bytes));
          return;
        }
      }

      const accessToken = ENV.metaAccessToken;
      if (!accessToken) {
        res.status(500).json({ error: 'metaAccessToken not configured' });
        return;
      }

      const mediaInfoUrl = new URL(`https://graph.facebook.com/v25.0/${mediaId}`);
      if (process.env.WHATSAPP_PHONE_NUMBER_ID) {
        mediaInfoUrl.searchParams.set('phone_number_id', process.env.WHATSAPP_PHONE_NUMBER_ID);
      }

      const mediaResponse = await fetch(mediaInfoUrl.toString(), {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!mediaResponse.ok) {
        res.status(404).json({ error: 'Media not found' });
        return;
      }

      const mediaData = (await mediaResponse.json()) as { url?: string; filename?: string };
      const mediaUrl = mediaData.url;

      if (!mediaUrl) {
        res.status(404).json({ error: 'Media URL not found' });
        return;
      }

      // Download the actual media file
      const fileResponse = await fetch(mediaUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'User-Agent': 'curl/7.64.1',
        },
      });

      if (!fileResponse.ok) {
        res.status(404).json({ error: 'Failed to download media' });
        return;
      }

      // Set appropriate headers
      const contentType = fileResponse.headers.get('content-type') || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'private, no-store');
      const safeFilename = String(mediaData.filename || `whatsapp-media-${mediaId}`)
        .replace(/[^\w.\-\u0600-\u06FF]/g, '_')
        .slice(0, 120);
      res.setHeader(
        'Content-Disposition',
        isDownloadRequest ? `attachment; filename="${safeFilename}"` : 'inline'
      );

      // Stream the file
      const buffer = await fileResponse.arrayBuffer();
      res.send(Buffer.from(buffer));
    } catch (error) {
      logger.error('[WhatsApp Media Proxy] Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  /**
   * POST /api/whatsapp/upload
   * Upload media file and return base64 data URL
   */
  router.post(
    '/api/whatsapp/upload',
    requireAuth,
    asMulterMiddleware(upload.single('file')),
    async (req: Request, res: Response) => {
      try {
        if (!req.file) {
          res.status(400).json({ error: 'No file uploaded' });
          return;
        }

        const file = req.file;
        const mimeType = file.mimetype;
        const base64 = file.buffer.toString('base64');
        const dataUrl = `data:${mimeType};base64,${base64}`;

        res.json({
          success: true,
          dataUrl,
          mimeType,
          filename: file.originalname,
          size: file.size,
        });
      } catch (error) {
        logger.error('[WhatsApp Upload] Error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  );

  /**
   * POST /api/webhooks/whatsapp
   * Receives incoming messages, button responses, and message statuses
   */
  router.post('/api/webhooks/whatsapp', async (req: Request, res: Response) => {
    try {
      // 1. ✅ التحقق من التوقيع قبل معالجة أي حدث
      if (!verifyWebhookSignature(req)) {
        logger.error('❌ Invalid signature — request rejected');
        res.status(403).json({ error: 'Invalid signature' });
        return;
      }

      const body = req.body;
      if (!body) {
        logger.error('Empty payload received');
        res.status(200).json({ success: true });
        return;
      }

      if (body.object !== 'whatsapp_business_account') {
        logger.info('Ignoring non-WhatsApp webhook');
        res.status(200).json({ success: true });
        return;
      }

      logger.info('Received webhook event for object:', body.object);

      // 2. ✅ التحقق من ربط الحساب (WABA & Phone Number ID Binding)
      const wabaId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || process.env.META_WABA_ID || '';
      const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
      if (wabaId && phoneNumberId) {
        const { validateWhatsAppWebhookAccountBinding } =
          await import('../../integrations/webhooks/whatsappWebhookAccountBinding');
        const bindingResult = validateWhatsAppWebhookAccountBinding(body, {
          wabaId,
          phoneNumberId,
        });
        if (!bindingResult.valid) {
          logger.warn(`[WhatsApp Webhook] Account binding rejected: ${bindingResult.reason}`);
          res.status(200).json({ success: false, reason: bindingResult.reason });
          return;
        }
      }

      // 3. ✅ منع التكرار والتعارض عبر حجز وتصفية الرسائل (Deduplication lease)
      const {
        filterDuplicateWhatsAppDeliveries,
        markWhatsAppWebhookDeliveriesProcessed,
        markWhatsAppWebhookDeliveriesFailed,
      } = await import('../../integrations/webhooks/whatsappWebhookDedup');

      const { body: dedupedBody, stats } = await filterDuplicateWhatsAppDeliveries(body);
      if (stats.skippedMessages > 0 || stats.skippedStatuses > 0) {
        logger.info(
          `[WhatsApp Webhook] Deduplication skipped: ${stats.skippedMessages} msgs, ${stats.skippedStatuses} statuses`
        );
      }

      // الرد بـ 200 فوراً لـ Meta لتجنب الـ timeout وإعادة الإرسال غير الضرورية
      res.status(200).json({ success: true });

      // إذا كانت جميع الرسائل والحالات مكررة ومحجوزة مسبقاً، ننهي المعالجة دون تكرار الآثار الجانبية
      if (
        stats.acceptedMessages === 0 &&
        stats.acceptedStatuses === 0 &&
        (stats.skippedMessages > 0 || stats.skippedStatuses > 0)
      ) {
        return;
      }

      // معالجة الحدث غير المتزامنة مع ضمان تحديث حالة التسليم (Processed / Failed)
      (async () => {
        try {
          const { createWhatsAppWebhookEvent } = await import('../../database/db');
          const { entry } = dedupedBody;
          if (entry && Array.isArray(entry)) {
            for (const item of entry) {
              const { changes } = item;
              if (changes && Array.isArray(changes)) {
                for (const change of changes) {
                  const { field, value } = change;
                  if (value) {
                    let phoneNumber = null;
                    if (field === 'messages' && value.messages && value.messages.length > 0) {
                      phoneNumber = value.messages[0].from || null;
                    }

                    const eventType = field || 'unknown';
                    logger.info(`Logging event: ${eventType}, phone: ${phoneNumber}`);
                    await createWhatsAppWebhookEvent({
                      eventType,
                      subType: value.statuses ? 'status' : value.messages ? 'message' : undefined,
                      phoneNumber,
                      rawPayload: JSON.stringify(value),
                    });

                    // 🔔 Publish SSE event to global channel for webhook events
                    try {
                      publish(GLOBAL_CHANNEL, 'webhook_event', {
                        eventType,
                        subType: value.statuses ? 'status' : value.messages ? 'message' : undefined,
                        phoneNumber,
                        rawPayload: JSON.stringify(value),
                        handlerExists: true,
                        processed: true,
                        timestamp: new Date().toISOString(),
                      });
                    } catch (publishError) {
                      logger.error('Error publishing webhook event SSE:', publishError);
                    }
                  }
                }
              }
            }
          }

          // معالجة الرسائل والقوالب وحفظها
          await handleWebhookPost({ ...req, body: dedupedBody } as Request, res);

          // إتمام حجز الرسائل بنجاح
          await markWhatsAppWebhookDeliveriesProcessed(stats.acceptedDeliveryKeys);
        } catch (error) {
          logger.error('Async webhook processing failed:', error);
          await markWhatsAppWebhookDeliveriesFailed(stats.acceptedDeliveryKeys, error);
        }
      })();
    } catch (error) {
      logger.error('Error processing webhook:', error);
      if (!res.headersSent) {
        res.status(200).json({ success: false });
      }
    }
  });

  return router;
}
