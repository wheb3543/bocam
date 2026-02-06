/**
 * WhatsApp API integration
 * Sends WhatsApp messages to customers using WhatsApp Business API
 */

import { WHATSAPP_CONFIG, getWhatsAppEndpoint } from './whatsappConfig';

interface WhatsAppMessage {
  to: string;
  message: string;
}

/**
 * Send WhatsApp message using WhatsApp Business API
 */
export async function sendWhatsAppMessage(params: WhatsAppMessage): Promise<boolean> {
  try {
    // If phone number ID is not configured, log and return
    if (!WHATSAPP_CONFIG.phoneNumberId) {
      console.log('[WhatsApp] Phone Number ID not configured. Would send message:', {
        to: params.to,
        message: params.message.substring(0, 100),
      });
      return true; // Return true for testing purposes
    }

    // Format phone number (remove + and spaces)
    const phoneNumber = params.to.replace(/[^0-9]/g, '');

    // Send message via WhatsApp Business API
    const response = await fetch(
      getWhatsAppEndpoint(`${WHATSAPP_CONFIG.phoneNumberId}/messages`),
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${WHATSAPP_CONFIG.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phoneNumber,
          type: 'text',
          text: {
            body: params.message,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('[WhatsApp] API error:', error);
      return false;
    }

    const result = await response.json();
    console.log('[WhatsApp] Message sent successfully:', result);
    return true;
  } catch (error) {
    console.error('[WhatsApp] Failed to send message:', error);
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

شكراً لتسجيلك في ${lead.campaignName} بالمستشفى السعودي الألماني - صنعاء.

سنتواصل معك قريباً لتحديد موعدك وتقديم الخدمة المطلوبة.

للاستفسارات العاجلة، يمكنك التواصل معنا على الرقم المجاني: 8000018

نرعاكم كأهالينا 💚`;

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

${lead.appointmentDate && lead.appointmentTime ? `
📅 التاريخ: ${lead.appointmentDate}
🕐 الوقت: ${lead.appointmentTime}
` : ''}

📍 الموقع: المستشفى السعودي الألماني - صنعاء
شارع الستين الشمالي (بين جولة عمران وجولة الجمنة)

يرجى الحضور قبل الموعد بـ 15 دقيقة.

للاستفسارات: 8000018

نرعاكم كأهالينا 💚
المستشفى السعودي الألماني`;

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
