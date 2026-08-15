/**
 * WhatsApp Appointments & Registrations Service
 * خدمة إرسال إشعارات WhatsApp للمواعيد والتسجيلات والعروض
 *
 * ✅ يستخدم Cloud API الرسمي
 * ✅ يحفظ سجل الإشعارات في قاعدة البيانات
 * ✅ يدعم المواعيد وتسجيلات المخيمات وحجوزات العروض
 * ✅ يتحقق من الأرقام المحظورة قبل الإرسال
 */

// Re-export all functions from the modularized files
export {
  sendAppointmentConfirmation,
  sendAppointmentReminder,
  sendAppointmentFollowup,
} from './whatsapp/appointments';

export {
  sendCampRegistrationConfirmation,
  sendOfferLeadConfirmation,
} from './whatsapp/camps-offers';

export {
  getEntityNotifications,
  getNotificationStats,
  getNotificationLogs,
  getAppointmentNotificationStatus,
  checkAndSendReminders,
} from './whatsapp/data';

export { isPhoneBlocked } from './whatsapp/helpers';

// Re-export types
export type {
  EntityType,
  NotificationType,
  NotificationStatus,
  SaveNotificationParams,
  SendResult,
  AppointmentConfirmationParams,
  AppointmentReminderParams,
  AppointmentFollowupParams,
  CampRegistrationConfirmationParams,
  OfferLeadConfirmationParams,
  NotificationStats,
} from './whatsapp/types';
