import { describe, expect, it } from 'vitest';
import { resolveWhatsAppOutboundContent } from '../whatsappMediaValidation';

describe('WhatsApp media send validation', () => {
  it('يمنع محاولة إرسال نص فارغ من دون وسيط', () => {
    expect(() => resolveWhatsAppOutboundContent({ message: '   ' })).toThrow(
      'أدخل رسالة أو أرفق وسيطاً'
    );
  });

  it('يقبل وسيطاً بلا تعليق ويستخدم اسم الملف في السجل المحلي', () => {
    expect(
      resolveWhatsAppOutboundContent({ message: '', mediaId: '123', fileName: 'result.pdf' })
    ).toBe('result.pdf');
  });

  it('يعطي النص الأولوية عندما يرفق المستخدم تعليقاً مع الوسيط', () => {
    expect(
      resolveWhatsAppOutboundContent({
        message: 'صورة الفحص',
        mediaId: '123',
        fileName: 'scan.jpg',
      })
    ).toBe('صورة الفحص');
  });
});
