import { describe, expect, it } from 'vitest';
import {
  buildIncomingWhatsAppMediaCacheKey,
  isSafeIncomingWhatsAppMediaCacheKey,
} from '../../../services/whatsappIncomingMediaCache';

describe('WhatsApp incoming media cache key', () => {
  it('يبني مفتاح تخزين غير قابل للتخمين لوسيط وارد', () => {
    const cacheKey = buildIncomingWhatsAppMediaCacheKey('123456789', 'image/webp');
    expect(cacheKey).toMatch(/^whatsapp-media\/incoming\/123456789-[0-9a-f-]{36}\.webp$/);
    expect(isSafeIncomingWhatsAppMediaCacheKey(cacheKey)).toBe(true);
  });

  it('يرفض أي مفتاح خارج نطاق وسائط واتساب الواردة', () => {
    expect(isSafeIncomingWhatsAppMediaCacheKey('../private-file')).toBe(false);
    expect(isSafeIncomingWhatsAppMediaCacheKey('whatsapp-media/incoming/123.jpg')).toBe(false);
  });
});
