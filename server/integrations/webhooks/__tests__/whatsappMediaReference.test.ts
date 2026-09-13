import { describe, expect, it } from 'vitest';
import { resolveIncomingWhatsAppMediaReference } from '../whatsappMediaReference';

describe('الحفظ الفوري لمرجع وسيط واتساب', () => {
  it('يحفظ معرّف Meta الرقمي الوارد دون انتظار طلب خارجي', () => {
    expect(resolveIncomingWhatsAppMediaReference('123456789012')).toBe('123456789012');
  });

  it('يرفض المراجع غير الآمنة أو غير الصالحة', () => {
    expect(resolveIncomingWhatsAppMediaReference('https://example.test/media')).toBeNull();
    expect(resolveIncomingWhatsAppMediaReference(undefined)).toBeNull();
  });
});
