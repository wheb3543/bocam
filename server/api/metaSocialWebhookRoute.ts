import { createHmac, timingSafeEqual } from 'node:crypto';
import { Router, type Request, type Response } from 'express';
import { getMetaWebhookCredentials, ingestMetaSocialInboxEvent } from '../database/db';
import { createLogger } from '../_core/logger';
import { normalizeMetaSocialInboxPayload } from '../integrations/meta/socialInboxMetaWebhook';
import { enrichStoredMetaCommentContext } from '../integrations/meta/socialInboxMetaActions';

const logger = createLogger('meta-social-webhook');

type RawBodyRequest = Request & { rawBody?: Buffer };

export function verifyMetaWebhookSignature(
  rawBody: Buffer,
  signature: string | undefined,
  appSecret: string
) {
  if (!signature?.startsWith('sha256=')) {
    return false;
  }

  const receivedHash = signature.slice('sha256='.length);
  const expectedHash = createHmac('sha256', appSecret).update(rawBody).digest('hex');
  const receivedBuffer = Buffer.from(receivedHash, 'hex');
  const expectedBuffer = Buffer.from(expectedHash, 'hex');
  return (
    receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer)
  );
}

export function validateMetaWebhookChallenge(
  query: Request['query'],
  verifyToken: string
): string | null {
  const mode = typeof query['hub.mode'] === 'string' ? query['hub.mode'] : null;
  const token = typeof query['hub.verify_token'] === 'string' ? query['hub.verify_token'] : null;
  const challenge = typeof query['hub.challenge'] === 'string' ? query['hub.challenge'] : null;
  return mode === 'subscribe' && token === verifyToken && challenge ? challenge : null;
}

type MetaWebhookDependencies = {
  getCredentials?: typeof getMetaWebhookCredentials;
  ingest?: typeof ingestMetaSocialInboxEvent;
  enrichCommentContext?: typeof enrichStoredMetaCommentContext;
};

export async function processMetaSocialWebhookPayload(
  payload: unknown,
  ingest: typeof ingestMetaSocialInboxEvent,
  enrichCommentContext: typeof enrichStoredMetaCommentContext = enrichStoredMetaCommentContext
) {
  const events = normalizeMetaSocialInboxPayload(payload);
  const results = await Promise.allSettled(
    events.map(async (event) => {
      const result = await ingest(event);
      if (
        event.channelType === 'comment' &&
        result.status === 'processed' &&
        result.threadId &&
        result.itemId
      ) {
        void enrichCommentContext(result.threadId, result.itemId).catch((error) => {
          logger.warn('تعذر إثراء سياق تعليق Meta بعد التخزين:', error);
        });
      }
      return result;
    })
  );
  const failures = results.filter((result) => result.status === 'rejected');

  for (const failure of failures) {
    logger.error('تعذر تخزين حدث Meta بعد الإقرار:', failure.reason);
  }

  return { received: events.length, failed: failures.length };
}

/**
 * Meta requires direct HTTP endpoints for GET verification and POST event delivery.
 * POST /api/webhooks/meta-social-inbox receives Messenger, Instagram, and Facebook Page events.
 */
export function createMetaSocialWebhookRouter(dependencies: MetaWebhookDependencies = {}) {
  const router = Router();
  const getCredentials = dependencies.getCredentials ?? getMetaWebhookCredentials;
  const ingest = dependencies.ingest ?? ingestMetaSocialInboxEvent;
  const enrichCommentContext = dependencies.enrichCommentContext ?? enrichStoredMetaCommentContext;

  router.get('/api/webhooks/meta-social-inbox', async (req: Request, res: Response) => {
    try {
      const credentials = await getCredentials();
      if (!credentials) {
        res.sendStatus(503);
        return;
      }

      const challenge = validateMetaWebhookChallenge(req.query, credentials.verifyToken);
      if (!challenge) {
        res.sendStatus(403);
        return;
      }

      res.status(200).send(challenge);
    } catch (error) {
      logger.error('تعذر التحقق من Meta Webhook:', error);
      res.sendStatus(500);
    }
  });

  router.post('/api/webhooks/meta-social-inbox', async (req: RawBodyRequest, res: Response) => {
    try {
      const credentials = await getCredentials();
      if (!credentials) {
        res.status(503).json({ error: 'Meta integration is not configured' });
        return;
      }

      const rawBody = req.rawBody ?? Buffer.from(JSON.stringify(req.body ?? {}));
      const signature = req.header('X-Hub-Signature-256');
      if (!verifyMetaWebhookSignature(rawBody, signature, credentials.appSecret)) {
        logger.warn('تم رفض Meta Webhook بتوقيع غير صالح');
        res.status(403).json({ error: 'Invalid signature' });
        return;
      }

      res.status(200).send('EVENT_RECEIVED');

      // Meta retries non-200 responses. Acknowledge the verified delivery first,
      // then normalize and persist it without blocking the callback request.
      void Promise.resolve()
        .then(() => processMetaSocialWebhookPayload(req.body, ingest, enrichCommentContext))
        .catch((error) => {
          logger.error('تعذر بدء معالجة Meta Webhook بعد الإقرار:', error);
        });
    } catch (error) {
      logger.error('تعذر معالجة Meta Webhook:', error);
      res.sendStatus(500);
    }
  });

  return router;
}
