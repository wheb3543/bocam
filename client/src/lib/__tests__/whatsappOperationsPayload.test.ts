import { describe, expect, it } from 'vitest';
import { getWhatsAppOperationDetails } from '../whatsappOperationsPayload';

describe('عرض تفاصيل عمليات واتساب', () => {
  it('يعرض رسالة JSON الآمنة ولا يرمي استثناء عند سجل غير صالح', () => {
    expect(getWhatsAppOperationDetails('{"message":"تنبيه موثق"}')).toBe('تنبيه موثق');
    expect(getWhatsAppOperationDetails('سجل غير JSON')).toBe('سجل غير JSON');
    expect(getWhatsAppOperationDetails('{"raw":"sensitive"}')).toBe(
      'تفاصيل إضافية محفوظة في السجل الفني.'
    );
  });
});
