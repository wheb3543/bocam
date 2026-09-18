export function resolveWhatsAppOutboundContent(input: {
  message: string;
  mediaId?: string;
  mediaUrl?: string;
  fileName?: string;
}) {
  const message = input.message.trim();
  const fileName = input.fileName?.trim();
  if (!message && !input.mediaId && !input.mediaUrl) {
    throw new Error('أدخل رسالة أو أرفق وسيطاً قبل الإرسال');
  }
  return message || fileName || 'وسيط';
}
