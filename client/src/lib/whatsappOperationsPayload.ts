export function getWhatsAppOperationDetails(details: unknown): string {
  if (typeof details !== 'string' || !details.trim()) {
    return '';
  }
  try {
    const parsed = JSON.parse(details) as { message?: unknown };
    return typeof parsed?.message === 'string'
      ? parsed.message
      : 'تفاصيل إضافية محفوظة في السجل الفني.';
  } catch {
    return details;
  }
}
