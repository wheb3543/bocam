import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  processMetaSocialWebhookPayload,
  validateMetaWebhookChallenge,
  verifyMetaWebhookSignature,
} from './metaSocialWebhookRoute';

describe('Meta social webhook verification', () => {
  it('accepts only the configured verification token and subscribe mode', () => {
    expect(
      validateMetaWebhookChallenge(
        { 'hub.mode': 'subscribe', 'hub.verify_token': 'verify-me', 'hub.challenge': 'challenge-1' },
        'verify-me'
      )
    ).toBe('challenge-1');
    expect(
      validateMetaWebhookChallenge(
        { 'hub.mode': 'subscribe', 'hub.verify_token': 'incorrect', 'hub.challenge': 'challenge-1' },
        'verify-me'
      )
    ).toBeNull();
  });

  it('verifies the Meta SHA-256 signature against the raw body', () => {
    const secret = 'meta-app-secret';
    const rawBody = Buffer.from('{"object":"page"}', 'utf8');
    const signature = `sha256=${createHmac('sha256', secret).update(rawBody).digest('hex')}`;

    expect(verifyMetaWebhookSignature(rawBody, signature, secret)).toBe(true);
    expect(verifyMetaWebhookSignature(rawBody, 'sha256=incorrect', secret)).toBe(false);
  });

  it('processes deliveries without throwing when one normalized event fails', async () => {
    const result = await processMetaSocialWebhookPayload(
      {
        object: 'page',
        entry: [
          {
            id: 'page-1',
            messaging: [
              {
                sender: { id: 'sender-1' },
                recipient: { id: 'page-1' },
                timestamp: 1710000001000,
                message: { mid: 'mid-1', text: 'message' },
              },
            ],
          },
        ],
      },
      async () => {
        throw new Error('database unavailable');
      }
    );

    expect(result).toEqual({ received: 1, failed: 1 });
  });
});
