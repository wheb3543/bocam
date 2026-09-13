type WhatsAppWebhookBody = {
  entry?: Array<{
    id?: string;
    changes?: Array<{
      field?: string;
      value?: { metadata?: { phone_number_id?: string } };
    }>;
  }>;
};

export type WhatsAppWebhookAccountBinding = {
  wabaId: string;
  phoneNumberId: string;
};

export type WhatsAppWebhookBindingResult =
  | { valid: true }
  | { valid: false; reason: 'missing_configuration' | 'waba_mismatch' | 'phone_number_mismatch' };

/**
 * يمنع التطبيق من معالجة حمولة موقعة تخص WABA أو رقماً آخر مرتبطاً بالتطبيق نفسه.
 * قيم المطابقة لا تُسجل في الخطأ لتجنب نشر معرّفات الحسابات في سجلات الخادم.
 */
export function validateWhatsAppWebhookAccountBinding(
  body: WhatsAppWebhookBody,
  binding: WhatsAppWebhookAccountBinding
): WhatsAppWebhookBindingResult {
  if (!binding.wabaId || !binding.phoneNumberId) {
    return { valid: false, reason: 'missing_configuration' };
  }

  for (const entry of body.entry || []) {
    if (entry.id !== binding.wabaId) {
      return { valid: false, reason: 'waba_mismatch' };
    }

    for (const change of entry.changes || []) {
      if (change.field !== 'messages') {
        continue;
      }
      const receivedPhoneNumberId = change.value?.metadata?.phone_number_id;
      if (receivedPhoneNumberId !== binding.phoneNumberId) {
        return { valid: false, reason: 'phone_number_mismatch' };
      }
    }
  }

  return { valid: true };
}
