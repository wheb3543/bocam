/**
 * WhatsApp Service Types
 * أنواع خدمة WhatsApp
 */

export type EntityType = 'appointment' | 'camp_registration' | 'offer_lead';

export type NotificationType =
  | 'booking_confirmation'
  | 'reminder_24h'
  | 'reminder_1h'
  | 'post_visit_followup'
  | 'cancellation'
  | 'status_update'
  | 'custom';

export type NotificationStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface SaveNotificationParams {
  entityType: EntityType;
  entityId: number;
  notificationType: NotificationType;
  phone: string;
  recipientName?: string;
  templateName?: string;
  messageContent?: string;
  status: NotificationStatus;
  metaMessageId?: string;
  errorMessage?: string;
  sentBy?: number;
  isAutomatic?: boolean;
}

export interface SendResult {
  success: boolean;
  messageId?: string;
  notificationId?: number;
  error?: string;
}

export interface AppointmentConfirmationParams {
  appointmentId: number;
  phone: string;
  patientName: string;
  doctorName: string;
  appointmentTime: Date;
  department: string;
  sentBy?: number;
}

export interface AppointmentReminderParams {
  appointmentId: number;
  phone: string;
  patientName: string;
  doctorName: string;
  appointmentTime: Date;
  hoursUntil: number;
  sentBy?: number;
}

export interface AppointmentFollowupParams {
  appointmentId: number;
  phone: string;
  patientName: string;
  doctorName: string;
  department: string;
  sentBy?: number;
}

export interface CampRegistrationConfirmationParams {
  registrationId: number;
  phone: string;
  patientName: string;
  campName: string;
  campDate?: Date;
  campLocation?: string;
  sentBy?: number;
}

export interface OfferLeadConfirmationParams {
  offerLeadId: number;
  phone: string;
  patientName: string;
  offerName: string;
  offerPrice?: number;
  offerDiscount?: number;
  sentBy?: number;
}

export interface NotificationStats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  byType: Record<string, number>;
  byEntity: Record<string, number>;
}
