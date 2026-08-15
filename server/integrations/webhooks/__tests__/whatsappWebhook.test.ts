/**
 * اختبارات WhatsApp Webhook Handler
 * WhatsApp Webhook Handler Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { verifyWebhookSignature, verifyWebhookToken } from '../whatsappWebhook';

// Mock crypto module
vi.mock('crypto', () => ({
  default: {
    createHmac: vi.fn(() => ({
      update: vi.fn(() => ({
        digest: vi.fn(() => 'test-signature'),
      })),
    })),
    timingSafeEqual: vi.fn(() => true),
  },
}));

describe('WhatsApp Webhook Handler', () => {
  describe('verifyWebhookSignature', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('يجب أن يرجع true إذا كان التوقيع صحيحاً', () => {
      const mockReq = {
        headers: {
          'x-hub-signature-256': 'sha256=test-signature',
        },
        body: { test: 'data' },
      } as unknown as Parameters<typeof verifyWebhookSignature>[0];

      const result = verifyWebhookSignature(mockReq);
      expect(result).toBe(true);
    });

    it('يجب أن يرجع true في وضع التطوير إذا لم يكن App Secret متاحاً', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';
      delete process.env.WHATSAPP_APP_SECRET;
      delete process.env.META_APP_SECRET;
      delete process.env.JWT_SECRET;

      const mockReq = {
        headers: {},
        body: { test: 'data' },
      } as Parameters<typeof verifyWebhookSignature>[0];

      const result = verifyWebhookSignature(mockReq);
      expect(result).toBe(true);

      process.env.NODE_ENV = originalEnv;
    });

    it('يجب أن يرجع false إذا لم يكن التوقيع موجوداً', () => {
      process.env.WHATSAPP_APP_SECRET = 'test-secret';

      const mockReq = {
        headers: {},
        body: { test: 'data' },
      } as Parameters<typeof verifyWebhookSignature>[0];

      const result = verifyWebhookSignature(mockReq);
      expect(result).toBe(false);
    });

    it('يجب أن يرجع false في الإنتاج إذا لم يكن App Secret متاحاً', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      delete process.env.WHATSAPP_APP_SECRET;
      delete process.env.META_APP_SECRET;
      delete process.env.JWT_SECRET;

      const mockReq = {
        headers: {
          'x-hub-signature-256': 'sha256=test-signature',
        },
        body: { test: 'data' },
      } as unknown as Parameters<typeof verifyWebhookSignature>[0];

      const result = verifyWebhookSignature(mockReq);
      expect(result).toBe(false);

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('verifyWebhookToken', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('يجب أن يرجع true إذا كان التوكين صحيحاً', () => {
      process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN = 'test-token';

      const mockReq = {
        query: {
          'hub.mode': 'subscribe',
          'hub.verify_token': 'test-token',
          'hub.challenge': 'test-challenge',
        },
      } as unknown as Parameters<typeof verifyWebhookToken>[0];

      const mockRes = {
        status: vi.fn(() => mockRes),
        json: vi.fn(() => mockRes),
        send: vi.fn(() => mockRes),
      } as unknown as Parameters<typeof verifyWebhookToken>[1];

      const result = verifyWebhookToken(mockReq, mockRes);
      expect(result).toBe(true);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith('test-challenge');
    });

    it('يجب أن يرجع false إذا كان hub.mode غير صحيح', () => {
      process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN = 'test-token';

      const mockReq = {
        query: {
          'hub.mode': 'invalid',
          'hub.verify_token': 'test-token',
          'hub.challenge': 'test-challenge',
        },
      } as unknown as Parameters<typeof verifyWebhookToken>[0];

      const mockRes = {
        status: vi.fn(() => mockRes),
        json: vi.fn(() => mockRes),
        send: vi.fn(() => mockRes),
      } as unknown as Parameters<typeof verifyWebhookToken>[1];

      const result = verifyWebhookToken(mockReq, mockRes);
      expect(result).toBe(false);
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid hub.mode' });
    });

    it('يجب أن يرجع false إذا كان التوكين غير صحيح', () => {
      process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN = 'test-token';

      const mockReq = {
        query: {
          'hub.mode': 'subscribe',
          'hub.verify_token': 'invalid-token',
          'hub.challenge': 'test-challenge',
        },
      } as unknown as Parameters<typeof verifyWebhookToken>[0];

      const mockRes = {
        status: vi.fn(() => mockRes),
        json: vi.fn(() => mockRes),
        send: vi.fn(() => mockRes),
      } as unknown as Parameters<typeof verifyWebhookToken>[1];

      const result = verifyWebhookToken(mockReq, mockRes);
      expect(result).toBe(false);
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid verify token' });
    });

    it('يجب أن يرجع false إذا لم يكن challenge موجوداً', () => {
      process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN = 'test-token';

      const mockReq = {
        query: {
          'hub.mode': 'subscribe',
          'hub.verify_token': 'test-token',
        },
      } as unknown as Parameters<typeof verifyWebhookToken>[0];

      const mockRes = {
        status: vi.fn(() => mockRes),
        json: vi.fn(() => mockRes),
        send: vi.fn(() => mockRes),
      } as unknown as Parameters<typeof verifyWebhookToken>[1];

      const result = verifyWebhookToken(mockReq, mockRes);
      expect(result).toBe(false);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Missing challenge' });
    });

    it('يجب أن يستخدم WEBHOOK_VERIFY_TOKEN إذا لم يكن WHATSAPP_WEBHOOK_VERIFY_TOKEN متاحاً', () => {
      delete process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;
      process.env.WEBHOOK_VERIFY_TOKEN = 'fallback-token';

      const mockReq = {
        query: {
          'hub.mode': 'subscribe',
          'hub.verify_token': 'fallback-token',
          'hub.challenge': 'test-challenge',
        },
      } as unknown as Parameters<typeof verifyWebhookToken>[0];

      const mockRes = {
        status: vi.fn(() => mockRes),
        json: vi.fn(() => mockRes),
        send: vi.fn(() => mockRes),
      } as unknown as Parameters<typeof verifyWebhookToken>[1];

      const result = verifyWebhookToken(mockReq, mockRes);
      expect(result).toBe(true);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.send).toHaveBeenCalledWith('test-challenge');
    });
  });
});
