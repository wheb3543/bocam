export const NOTIFICATION_TYPES = [
  'approval_requested',
  'approval_approved',
  'approval_rejected',
  'content_updated',
  'content_deleted',
  'content_published',
  'booking_pending',
  'booking_confirmed',
  'campaign_review',
  'integration_status',
  'privacy_update',
  'security',
  'system',
] as const;

export const NOTIFICATION_SOURCES = [
  'content',
  'bookings',
  'campaigns',
  'integrations',
  'privacy',
  'security',
  'system',
  'manual',
] as const;

export const NOTIFICATION_PRIORITIES = ['low', 'medium', 'high'] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];
export type NotificationSource = (typeof NOTIFICATION_SOURCES)[number];
export type NotificationPriority = (typeof NOTIFICATION_PRIORITIES)[number];
