/**
 * اختبارات WhatsApp SSE
 * WhatsApp SSE Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { createWhatsAppSseRouter } from '../whatsappSse';

// Mock pubsub module
vi.mock('../_core/pubsub', () => ({
  subscribe: vi.fn(() => vi.fn()),
  channelForConversation: vi.fn((id) => `conversation:${id}`),
  channelForUser: vi.fn((id) => `user:${id}`),
}));

// Mock logger module
vi.mock('../_core/logger', () => ({
  createLogger: vi.fn(() => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  })),
}));

describe('WhatsApp SSE', () => {
  describe('createWhatsAppSseRouter', () => {
    it('يجب أن ينشئ router بنجاح', () => {
      const router = createWhatsAppSseRouter();
      expect(router).toBeDefined();
      expect(typeof router.get).toBe('function');
    });
  });
});
