/**
 * WhatsApp API integration
 * Sends WhatsApp messages to customers using WhatsApp Business Cloud API
 *
 * This file provides backward-compatible functions used by other modules
 * (appointments, leads, etc.) while using the new Cloud API module internally.
 */

import { sendWhatsAppTextMessage, formatPhoneNumber } from './whatsappCloudAPI';
import { COMPANY_ARABIC_NAME, COMPANY_PHONE, COMPANY_SLOGAN_AR } from '@shared/config';
import { createLogger } from '../_core/logger';

const companyName = COMPANY_ARABIC_NAME || 'BOCAM';
const companyPhone = COMPANY_PHONE || '8000018';
const companySlogan = COMPANY_SLOGAN_AR || 'نظام إدارة متكامل';

const logger = createLogger('whatsapp');

interface WhatsAppMessage {
  to: string;
  message: string;
}

/**
 * Send WhatsApp message using WhatsApp Business Cloud API
 */
export async function sendWhatsAppMessage(params: WhatsAppMessage): Promise<boolean> {
  try {
    const formattedPhone = formatPhoneNumber(params.to);
    const result = await sendWhatsAppTextMessage(formattedPhone, params.message);

    if (result.success) {
      logger.info(`Message sent successfully to ${formattedPhone}. ID: ${result.messageId}`);
      return true;
    } else {
      logger.error(`Failed to send to ${formattedPhone}: ${result.error}`);
      return false;
    }
  } catch (error) {
    logger.error('Failed to send message:', error);
    return false;
  }
}

/**
 * Send welcome message to new lead
 */
export async function sendWelcomeMessage(lead: {
  phone: string;
  fullName: string;
  campaignName: string;
  welcomeMessage?: string;
}): Promise<boolean> {
  const defaultMessage = `مرحباً ${lead.fullName}،

شكراً لتسجيلك في ${lead.campaignName} بـ ${companyName}.

سنتواصل معك قريباً لتحديد موعدك وتقديم الخدمة المطلوبة.

للاستفسارات العاجلة، يمكنك التواصل معنا على الرقم المجاني: ${companyPhone}

${companySlogan} 💚`;

  const message = lead.welcomeMessage || defaultMessage;

  return sendWhatsAppMessage({
    to: lead.phone,
    message,
  });
}

/**
 * Send booking confirmation message
 */
export async function sendBookingConfirmation(lead: {
  phone: string;
  fullName: string;
  appointmentDate?: string;
  appointmentTime?: string;
}): Promise<boolean> {
  const message = `عزيزي/عزيزتي ${lead.fullName}،

تم تأكيد حجزك بنجاح! ✅

${
  lead.appointmentDate && lead.appointmentTime
    ? `
📅 التاريخ: ${lead.appointmentDate}
🕐 الوقت: ${lead.appointmentTime}
`
    : ''
}

📍 الموقع: ${companyName}

يرجى الحضور قبل الموعد بـ 15 دقيقة.

للاستفسارات: ${companyPhone}

${companySlogan} 💚
${companyName}`;

  return sendWhatsAppMessage({
    to: lead.phone,
    message,
  });
}

/**
 * Send custom message
 */
export async function sendCustomMessage(phone: string, message: string): Promise<boolean> {
  return sendWhatsAppMessage({
    to: phone,
    message,
  });
}
