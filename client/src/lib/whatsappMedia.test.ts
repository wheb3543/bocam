import { describe, expect, it } from 'vitest';
import {
  classifyWhatsAppMedia,
  getWhatsAppMediaId,
  getWhatsAppMediaProxyUrl,
} from './whatsappMedia';

describe('WhatsApp media helpers', () => {
  it('يصنف أنواع الملفات المدعومة للإرسال', () => {
    expect(classifyWhatsAppMedia('image/jpeg')).toBe('image');
    expect(classifyWhatsAppMedia('video/mp4')).toBe('video');
    expect(classifyWhatsAppMedia('audio/ogg')).toBe('audio');
    expect(classifyWhatsAppMedia('application/pdf')).toBe('document');
  });

  it('يبني رابط العرض من معرّف Meta فقط أو من بيانات الرسالة المحفوظة', () => {
    expect(getWhatsAppMediaId({ mediaUrl: '123456' })).toBe('123456');
    expect(getWhatsAppMediaId({ metadata: JSON.stringify({ mediaId: '789' }) })).toBe('789');
    expect(getWhatsAppMediaProxyUrl({ metadata: JSON.stringify({ mediaId: '789' }) })).toBe(
      '/api/whatsapp/media/789'
    );
    expect(
      getWhatsAppMediaProxyUrl(
        { metadata: JSON.stringify({ mediaId: '789' }) },
        { download: true }
      )
    ).toBe('/api/whatsapp/media/789?download=1');
    expect(
      getWhatsAppMediaProxyUrl({
        mediaUrl: '789',
        metadata: JSON.stringify({
          cacheKey:
            'whatsapp-media/incoming/789-123e4567-e89b-12d3-a456-426614174000.jpg',
        }),
      })
    ).toBe(
      '/api/whatsapp/media/789?cacheKey=whatsapp-media%2Fincoming%2F789-123e4567-e89b-12d3-a456-426614174000.jpg'
    );
  });

  it('لا يعرض رابط Meta المؤقت أو رابط بيانات محلياً كمصدر وسيط', () => {
    expect(getWhatsAppMediaId({ mediaUrl: 'https://graph.facebook.com/temporary' })).toBeNull();
    expect(getWhatsAppMediaId({ mediaUrl: 'data:image/png;base64,abc' })).toBeNull();
  });
});
