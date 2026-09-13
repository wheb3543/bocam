/**
 * ينشئ نموذج رفع وسائط WhatsApp Cloud API وفق عقد Meta الرسمي.
 * تتطلب نقطة /media الحقل messaging_product حتى عند استخدام multipart/form-data.
 */
export function createWhatsAppMediaUploadForm(fileBuffer: Uint8Array, mimeType: string) {
  const formData = new FormData();
  formData.append('messaging_product', 'whatsapp');
  const bytes = new Uint8Array(fileBuffer.length);
  bytes.set(fileBuffer);
  formData.append('file', new Blob([bytes.buffer], { type: mimeType }), 'media');
  return formData;
}
