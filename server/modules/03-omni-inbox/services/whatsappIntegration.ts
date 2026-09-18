/**
 * WhatsApp Integration Service
 * ربط التسجيلات والحجوزات مع WhatsApp Cloud API باستخدام القوالب المعتمدة من Meta
 */

export {
  sendAppointmentConfirmation,
  scheduleAppointmentReminder24h,
  scheduleAppointmentReminder1h,
  sendAppointmentStatusUpdate,
} from './whatsappIntegration/appointments';

export {
  sendCampRegistrationConfirmation,
  sendCampRegistrationStatusUpdate,
} from './whatsappIntegration/camps';

export { sendOfferLeadConfirmation, sendOfferLeadStatusUpdate } from './whatsappIntegration/offers';
