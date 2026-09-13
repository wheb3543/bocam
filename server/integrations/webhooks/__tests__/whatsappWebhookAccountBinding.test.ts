import { describe, expect, it } from 'vitest';
import { validateWhatsAppWebhookAccountBinding } from '../whatsappWebhookAccountBinding';

const binding = { wabaId: 'waba-hospital', phoneNumberId: 'phone-sgh' };

describe('WhatsApp webhook account binding', () => {
  it('accepts a Meta messages payload belonging to the configured hospital WABA and phone number', () => {
    expect(
      validateWhatsAppWebhookAccountBinding(
        {
          entry: [
            {
              id: 'waba-hospital',
              changes: [
                { field: 'messages', value: { metadata: { phone_number_id: 'phone-sgh' } } },
              ],
            },
          ],
        },
        binding
      )
    ).toEqual({ valid: true });
  });

  it('rejects a signed payload for another WABA or business phone number', () => {
    expect(
      validateWhatsAppWebhookAccountBinding({ entry: [{ id: 'other-waba' }] }, binding)
    ).toEqual({ valid: false, reason: 'waba_mismatch' });
    expect(
      validateWhatsAppWebhookAccountBinding(
        {
          entry: [
            {
              id: 'waba-hospital',
              changes: [
                { field: 'messages', value: { metadata: { phone_number_id: 'other-phone' } } },
              ],
            },
          ],
        },
        binding
      )
    ).toEqual({ valid: false, reason: 'phone_number_mismatch' });
  });

  it('يبلغ عن غياب التهيئة بدلاً من قبول ربط حساب غير محدد', () => {
    expect(
      validateWhatsAppWebhookAccountBinding({ entry: [] }, { wabaId: '', phoneNumberId: '' })
    ).toEqual({ valid: false, reason: 'missing_configuration' });
  });
});
