/**
 * WhatsApp Business API Configuration
 */

export const WHATSAPP_CONFIG = {
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN || 'EAAS0ZBbtHNpIBPwk3J7dpwNxpMfXMgR60m4PAqfZCtvNZAVDYjQ9Gr3hEvsYTqAEqGZBTbHL6yl4sZBxxnXYpN813HrgEHyMomebkwZC0n7eqlOxmfL3XnRMdwyTU33jcbNMilBZAobCyoRqEZAQx4EOFq8wc46qrXS3iEGNop1JYj2PlG4DJMWAzFthMdK5EyBBZCKhdzM6jl95qYVFV61ChCQMMNbpiyEh8SfXkyfqSYZByc5kNMhUcsywHeypNnaZARsE4GBVpt9W1OTam7IBQw1gOLzdHiZBkjMN6rcZD',
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
  apiVersion: 'v18.0',
  apiUrl: 'https://graph.facebook.com',
};

/**
 * Get WhatsApp API endpoint
 */
export function getWhatsAppEndpoint(path: string): string {
  return `${WHATSAPP_CONFIG.apiUrl}/${WHATSAPP_CONFIG.apiVersion}/${path}`;
}
