export const NOTIFICATION_TYPES = [
  'approval_requested',
  'approval_approved',
  'approval_rejected',
  'content_updated',
  'content_deleted',
  'content_published',
  'booking_pending',
  'booking_confirmed',
  'booking_status_changed',
  'message_received',
  'comment_received',
  'conversation_assigned',
  'comment_assigned',
  'task_assigned',
  'task_due',
  'task_overdue',
  'lead_created',
  'lead_status_changed',
  'connection_error',
  'authorization_expiring',
  'campaign_assigned',
  'campaign_ending',
  'campaign_budget_threshold',
  'campaign_review',
  'integration_status',
  'privacy_update',
  'security',
  'system',
] as const;

export const NOTIFICATION_SOURCES = [
  'content',
  'bookings',
  'camps',
  'offers',
  'whatsapp',
  'social_inbox',
  'tasks',
  'leads',
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

export const NOTIFICATION_PREFERENCE_KEY = 'notifications.inbox.preferences';
export const NOTIFICATION_SYSTEM_SETTINGS_KEY = 'notifications.system.settings';

export const NOTIFICATION_RECIPIENT_ROLES = [
  'admin',
  'manager',
  'staff',
  'team_leader',
  'viewer',
  'user',
] as const;

export type NotificationRecipientRole = (typeof NOTIFICATION_RECIPIENT_ROLES)[number];

export type NotificationPreferences = {
  enabled: boolean;
  highPriorityOnly: boolean;
  dailyDigestEnabled: boolean;
  visualAlertEnabled: boolean;
  soundAlertEnabled: boolean;
  enabledSources: Record<NotificationSource, boolean>;
};

export type NotificationSystemSettings = {
  enabled: boolean;
  sourceEnabled: Record<NotificationSource, boolean>;
  recipientRoles: Record<NotificationSource, NotificationRecipientRole[]>;
};

export type NotificationDigestScheduleSettings = {
  enabled: boolean;
  deliveryHour: number;
  timezone: string;
  scheduleCronTaskUid?: string | null;
  lastDigestDate?: string | null;
};
