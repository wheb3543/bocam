/**
 * يعيد معرّف WhatsApp Media API الآمن للحفظ فور وصوله في Webhook.
 * لا يجري أي طلب شبكة إضافي، حتى لا يؤخر تسجيل الرسالة أو تحديث واجهة الدردشة.
 */
export function resolveIncomingWhatsAppMediaReference(mediaId: unknown): string | null {
  return typeof mediaId === 'string' && /^\d+$/.test(mediaId) ? mediaId : null;
}
