export type WhatsAppOutboundMessageType =
  | 'text'
  | 'image'
  | 'document'
  | 'audio'
  | 'video'
  | 'location'
  | 'template'
  | 'interactive'
  | 'contacts'
  | 'unknown';

/**
 * لا تسمح Meta بإرسال رسائل خدمة العملاء الحرة إلا ضمن آخر 24 ساعة من آخر رسالة واردة من العميل.
 * بعد انقضاء 24 ساعة، تفرض Meta استخدام قالب معتمد (Approved Template).
 */
export function assertWhatsAppCustomerServiceWindow(input: {
  messageType: WhatsAppOutboundMessageType;
  latestInboundAt: Date | null;
  now?: Date;
}): void {
  if (input.messageType === 'template') {
    return;
  }

  const hoursSinceLastInbound = input.latestInboundAt
    ? ((input.now ?? new Date()).getTime() - input.latestInboundAt.getTime()) / (1000 * 60 * 60)
    : Infinity;

  if (hoursSinceLastInbound > 24) {
    throw new Error(
      'انتهت نافذة خدمة العملاء (24 ساعة). استخدم قالب واتساب معتمداً لإرسال رسالة جديدة.'
    );
  }
}
