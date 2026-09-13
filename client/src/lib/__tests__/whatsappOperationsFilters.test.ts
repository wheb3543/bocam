import { describe, expect, it } from 'vitest';
import { toWhatsAppSeverityInput } from '../whatsappOperationsFilters';

describe('WhatsApp operations tRPC filters', () => {
  it('لا يرسل null أو قيمة غير مدعومة في severity إلى tRPC', () => {
    expect(toWhatsAppSeverityInput(null)).toEqual({});
    expect(toWhatsAppSeverityInput('all')).toEqual({});
    expect(toWhatsAppSeverityInput('critical')).toEqual({ severity: 'critical' });
  });
});
