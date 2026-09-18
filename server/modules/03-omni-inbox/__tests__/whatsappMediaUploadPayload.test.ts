import { describe, expect, it } from 'vitest';
import { createWhatsAppMediaUploadForm } from '../services/whatsappMediaUploadPayload';

describe('WhatsApp media upload payload', () => {
  it('يتضمن messaging_product=whatsapp عند رفع أي وسيط', () => {
    const formData = createWhatsAppMediaUploadForm(
      new Uint8Array([137, 80, 78, 71]),
      'image/png'
    );

    expect(formData.get('messaging_product')).toBe('whatsapp');
    expect(formData.get('file')).toBeInstanceOf(Blob);
  });
});
