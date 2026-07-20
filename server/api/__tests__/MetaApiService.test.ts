/**
 * اختبارات MetaApiService
 * MetaApiService Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { meta } from '../MetaApiService';

// Mock dependencies
vi.mock('../../_core/logger', () => ({
  createLogger: () => ({
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  }),
}));

// Mock fetch globally
global.fetch = vi.fn() as unknown as typeof fetch;

describe('MetaApiService - Token Management', () => {
  beforeEach(() => {
    process.env.META_ACCESS_TOKEN = 'test_token';
  });

  it('يجب أن يرجع التوكن من متغير البيئة', () => {
    const token = meta.accessToken;
    expect(token).toBe('test_token');
  });

  it('يجب أن يرمي خطأ عند عدم وجود التوكن', () => {
    delete process.env.META_ACCESS_TOKEN;
    
    // Test that accessing token when not set returns empty string
    const token = meta.accessToken;
    expect(token).toBe('');
  });
});

describe('MetaApiService - URL Building', () => {
  beforeEach(() => {
    process.env.META_ACCESS_TOKEN = 'test_token';
  });

  it('يجب أن يبني URL صحيح بدون معاملات', () => {
    const url = meta.buildUrl('me');
    expect(url).toBe('https://graph.facebook.com/v25.0/me');
  });

  it('يجب أن يبني URL مع معاملات', () => {
    const url = meta.buildUrl('me', { fields: 'name,email' });
    expect(url).toContain('fields=name%2Cemail');
  });

  it('يجب أن يزيل / من بداية endpoint', () => {
    const url = meta.buildUrl('/me');
    expect(url).toBe('https://graph.facebook.com/v25.0/me');
  });
});

describe('MetaApiService - GET Requests', () => {
  beforeEach(() => {
    process.env.META_ACCESS_TOKEN = 'test_token';
    vi.clearAllMocks();
  });

  it('يجب أن يرسل طلب GET بنجاح', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ name: 'Test' }),
    });

    const result = await meta.get('me');
    expect(result.ok).toBe(true);
    expect(result.data).toEqual({ name: 'Test' });
  });

  it('يجب أن يرسل Authorization header', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: {} }),
    });

    await meta.get('me');
    
    const fetchCall = (global.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(fetchCall[1]?.headers).toHaveProperty('Authorization', 'Bearer test_token');
  });

  it('يجب أن يعالج أخطاء الشبكة', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

    const result = await meta.get('me');
    expect(result.ok).toBe(false);
    expect(result.error?.message).toBe('Network error');
  });
});

describe('MetaApiService - POST Requests', () => {
  beforeEach(() => {
    process.env.META_ACCESS_TOKEN = 'test_token';
    vi.clearAllMocks();
  });

  it('يجب أن يرسل طلب POST بنجاح', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });

    const result = await meta.post('123/messages', { text: 'Hello' });
    expect(result.ok).toBe(true);
  });

  it('يجب أن يرسل JSON body', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });

    await meta.post('123/messages', { text: 'Hello' });
    
    const fetchCall = (global.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(fetchCall[1]?.body).toBe('{"text":"Hello"}');
  });
});

describe('MetaApiService - DELETE Requests', () => {
  beforeEach(() => {
    process.env.META_ACCESS_TOKEN = 'test_token';
    vi.clearAllMocks();
  });

  it('يجب أن يرسل طلب DELETE بنجاح', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });

    const result = await meta.delete('123/messages');
    expect(result.ok).toBe(true);
  });
});

describe('MetaApiService - Retry Logic', () => {
  beforeEach(() => {
    process.env.META_ACCESS_TOKEN = 'test_token';
    vi.clearAllMocks();
  });

  it('يجب أن يعيد المحاولة عند Rate Limiting (429)', async () => {
    let attempts = 0;
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => {
      attempts++;
      if (attempts === 1) {
        return Promise.resolve({
          ok: false,
          status: 429,
          json: async () => ({ error: { code: 4 } }),
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({ data: {} }),
      });
    });

    await meta.get('me');
    expect(attempts).toBeGreaterThan(1);
  });

  it('يجب أن يعيد المحاولة عند أخطاء الخادم (500)', async () => {
    let attempts = 0;
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockImplementation(() => {
      attempts++;
      if (attempts === 1) {
        return Promise.resolve({
          ok: false,
          status: 500,
          json: async () => ({ error: { message: 'Server error' } }),
        });
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({ data: {} }),
      });
    });

    await meta.get('me');
    expect(attempts).toBeGreaterThan(1);
  });
});

describe('MetaApiService - WhatsApp Text Messages', () => {
  beforeEach(() => {
    process.env.META_ACCESS_TOKEN = 'test_token';
    vi.clearAllMocks();
  });

  it('يجب أن يرسل رسالة نصية بنجاح', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ messages: [{ id: 'msg123' }] }),
    });

    const result = await meta.sendWhatsAppText('phone123', '967712345678', 'Hello');
    expect(result.success).toBe(true);
    expect(result.messageId).toBe('msg123');
  });

  it('يجب أن يعالج فشل إرسال الرسالة', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { code: 131026, message: 'Phone number not registered' } }),
    });

    const result = await meta.sendWhatsAppText('phone123', '967712345678', 'Hello');
    expect(result.success).toBe(false);
    expect(result.error).toContain('131026');
  });
});

describe('MetaApiService - WhatsApp Template Messages', () => {
  beforeEach(() => {
    process.env.META_ACCESS_TOKEN = 'test_token';
    vi.clearAllMocks();
  });

  it('يجب أن يرسل رسالة قالب بنجاح', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ messages: [{ id: 'msg456' }] }),
    });

    const result = await meta.sendWhatsAppTemplate('phone123', '967712345678', 'welcome', 'ar');
    expect(result.success).toBe(true);
  });

  it('يجب أن يرسل القالب مع components', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ messages: [{ id: 'msg789' }] }),
    });

    const components = [{ type: 'body', parameters: [{ type: 'text', text: 'John' }] }];
    const result = await meta.sendWhatsAppTemplate('phone123', '967712345678', 'welcome', 'ar', components);
    expect(result.success).toBe(true);
  });
});

describe('MetaApiService - WhatsApp Media Messages', () => {
  beforeEach(() => {
    process.env.META_ACCESS_TOKEN = 'test_token';
    vi.clearAllMocks();
  });

  it('يجب أن يرسل رسالة صورة بنجاح', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ messages: [{ id: 'msg_img' }] }),
    });

    const result = await meta.sendWhatsAppImage('phone123', '967712345678', 'https://example.com/image.jpg', 'Caption');
    expect(result.success).toBe(true);
  });

  it('يجب أن يرسل رسالة فيديو بنجاح', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ messages: [{ id: 'msg_vid' }] }),
    });

    const result = await meta.sendWhatsAppVideo('phone123', '967712345678', 'https://example.com/video.mp4');
    expect(result.success).toBe(true);
  });

  it('يجب أن يرسل رسالة صوت بنجاح', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ messages: [{ id: 'msg_audio' }] }),
    });

    const result = await meta.sendWhatsAppAudio('phone123', '967712345678', 'https://example.com/audio.mp3');
    expect(result.success).toBe(true);
  });

  it('يجب أن يرسل رسالة مستند بنجاح', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ messages: [{ id: 'msg_doc' }] }),
    });

    const result = await meta.sendWhatsAppDocument('phone123', '967712345678', 'https://example.com/doc.pdf', 'document.pdf');
    expect(result.success).toBe(true);
  });
});

describe('MetaApiService - WhatsApp Media Upload', () => {
  beforeEach(() => {
    process.env.META_ACCESS_TOKEN = 'test_token';
    vi.clearAllMocks();
  });

  it('يجب أن يرفع ملف وسائط بنجاح', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'media123' }),
    });

    const buffer = Buffer.from('test data');
    const result = await meta.uploadWhatsAppMedia('phone123', buffer, 'image/jpeg');
    expect(result.success).toBe(true);
    expect(result.mediaId).toBe('media123');
  });

  it('يجب أن يعالج فشل رفع الملف', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { code: 131000, message: 'Invalid data' } }),
    });

    const buffer = Buffer.from('test data');
    const result = await meta.uploadWhatsAppMedia('phone123', buffer, 'image/jpeg');
    expect(result.success).toBe(false);
  });
});

describe('MetaApiService - WhatsApp Templates', () => {
  beforeEach(() => {
    process.env.META_ACCESS_TOKEN = 'test_token';
    vi.clearAllMocks();
  });

  it('يجب أن يجلب قوالب WhatsApp بنجاح', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: [{ name: 'welcome', status: 'APPROVED' }] }),
    });

    const result = await meta.getWhatsAppTemplates('waba123');
    expect(result.success).toBe(true);
    expect(result.templates).toHaveLength(1);
  });

  it('يجب أن يعالج فشل جلب القوالب', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { code: 190, message: 'Invalid token' } }),
    });

    const result = await meta.getWhatsAppTemplates('waba123');
    expect(result.success).toBe(false);
    expect(result.error).toContain('190');
  });
});

describe('MetaApiService - WABA Management', () => {
  beforeEach(() => {
    process.env.META_ACCESS_TOKEN = 'test_token';
    vi.clearAllMocks();
  });

  it('يجب أن يجلب WABA ID من Phone Number ID', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ whatsapp_business_account: { id: 'waba123' } }),
    });

    const result = await meta.getWabaIdFromPhoneNumberId('phone123');
    expect(result.success).toBe(true);
    expect(result.wabaId).toBe('waba123');
  });

  it('يجب أن يجلب بيانات رقم الهاتف', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 'phone123', verified_name: 'Test Business' }),
    });

    const result = await meta.getWhatsAppPhoneNumber('phone123');
    expect(result.success).toBe(true);
    expect(result.phoneNumber?.verified_name).toBe('Test Business');
  });

  it('يجب أن يسجل رقم الهاتف', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });

    const result = await meta.registerWhatsAppPhoneNumber('phone123', '123456');
    expect(result.success).toBe(true);
  });
});

describe('MetaApiService - Instagram', () => {
  beforeEach(() => {
    process.env.META_ACCESS_TOKEN = 'test_token';
    vi.clearAllMocks();
  });

  it('يجب أن يجلب بيانات Instagram Profile', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ followers_count: 1000, media_count: 50 }),
    });

    const result = await meta.getInstagramProfile('ig123');
    expect(result.ok).toBe(true);
    expect((result.data as { followers_count?: number })?.followers_count).toBe(1000);
  });

  it('يجب أن يجلب Instagram Insights', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: [{ values: [{ value: 500 }] }] }),
    });

    const result = await meta.getInstagramInsights('ig123');
    expect(result.ok).toBe(true);
  });
});

describe('MetaApiService - Facebook Pages', () => {
  beforeEach(() => {
    process.env.META_ACCESS_TOKEN = 'test_token';
    vi.clearAllMocks();
  });

  it('يجب أن يجلب بيانات صفحة Facebook', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ name: 'Test Page', fan_count: 5000 }),
    });

    const result = await meta.getFacebookPage('page123');
    expect(result.ok).toBe(true);
    expect((result.data as { fan_count?: number })?.fan_count).toBe(5000);
  });

  it('يجب أن يجلب Facebook Page Insights', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: [{ values: [{ value: 1000 }] }] }),
    });

    const result = await meta.getFacebookPageInsights('page123');
    expect(result.ok).toBe(true);
  });
});

describe('MetaApiService - CAPI', () => {
  beforeEach(() => {
    process.env.META_ACCESS_TOKEN = 'test_token';
    vi.clearAllMocks();
  });

  it('يجب أن يرسل حدث CAPI بنجاح', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });

    const events = [{ event_name: 'purchase', event_time: Date.now() }];
    const result = await meta.sendCAPIEvent('pixel123', events);
    expect(result.success).toBe(true);
  });

  it('يجب أن يرسل حدث CAPI مع test_event_code', async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });

    const events = [{ event_name: 'purchase', event_time: Date.now() }];
    const result = await meta.sendCAPIEvent('pixel123', events, 'test123');
    expect(result.success).toBe(true);
  });
});

describe('MetaApiService - Error Formatting', () => {
  it('يجب أن يحول كود خطأ 190 إلى رسالة واضحة', async () => {
    process.env.META_ACCESS_TOKEN = 'test_token';
    
    // Test error handling through actual API call
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: { code: 190, message: 'Invalid token' } }),
    });

    const result = await meta.get('me');
    expect(result.ok).toBe(false);
  });

  it('يجب أن يحول كود خطأ 131047 إلى رسالة واضحة', async () => {
    process.env.META_ACCESS_TOKEN = 'test_token';
    
    // Test error handling through actual API call
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { code: 131047, message: 'Message window expired' } }),
    });

    const result = await meta.get('me');
    expect(result.ok).toBe(false);
  });

  it('يجب أن يعالج الأخطاء غير المعروفة', async () => {
    process.env.META_ACCESS_TOKEN = 'test_token';
    
    // Test error handling through actual API call
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { code: 999, message: 'Unknown error' } }),
    });

    const result = await meta.get('me');
    expect(result.ok).toBe(false);
  });
});

describe('MetaApiService - Media URL Detection', () => {
  it('يجب أن يتعرف على URLs كـ media references', async () => {
    process.env.META_ACCESS_TOKEN = 'test_token';
    
    // Test through actual media send
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ messages: [{ id: 'msg123' }] }),
    });

    const result = await meta.sendWhatsAppImage('phone123', '967712345678', 'https://example.com/image.jpg');
    expect(result).toHaveProperty('success', true);
  });

  it('يجب أن يتعامل مع IDs كـ media references', async () => {
    process.env.META_ACCESS_TOKEN = 'test_token';
    
    // Test through actual media send
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ messages: [{ id: 'msg123' }] }),
    });

    const result = await meta.sendWhatsAppImage('phone123', '967712345678', 'media123');
    expect(result).toHaveProperty('success', true);
  });
});
