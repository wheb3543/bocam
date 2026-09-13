export const WHATSAPP_ALERT_SEVERITIES = ['low', 'medium', 'high', 'critical'] as const;
export type WhatsAppAlertSeverity = (typeof WHATSAPP_ALERT_SEVERITIES)[number];

export function toWhatsAppSeverityInput(value: string | null): {
  severity?: WhatsAppAlertSeverity;
} {
  return WHATSAPP_ALERT_SEVERITIES.includes(value as WhatsAppAlertSeverity)
    ? { severity: value as WhatsAppAlertSeverity }
    : {};
}
