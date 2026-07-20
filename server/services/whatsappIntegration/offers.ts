/**
 * WhatsApp Integration - Offers
 * دوال إرسال رسائل WhatsApp الخاصة بطلبات العروض
 */

import { eq, and } from 'drizzle-orm';
import { getDb } from '../../database/db';
import { sendTemplateMessage } from '../whatsappTemplates';
import { offerLeads, offers, whatsappTemplates } from '../../../drizzle/schema';

/**
 * إرسال تأكيد حجز عرض تلقائياً باستخدام قالب معتمد من Meta
 */
export async function sendOfferLeadConfirmation(offerLeadId: number) {
  try {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    const offerLead = await db
      .select()
      .from(offerLeads)
      .where(eq(offerLeads.id, offerLeadId))
      .limit(1);

    if (!offerLead || offerLead.length === 0) {
      throw new Error('Offer lead not found');
    }

    const lead = offerLead[0];

    const offer = await db.select().from(offers).where(eq(offers.id, lead.offerId)).limit(1);

    if (!offer || offer.length === 0) {
      throw new Error('Offer not found');
    }

    const offerData = offer[0];

    const template = await db
      .select()
      .from(whatsappTemplates)
      .where(
        and(
          eq(whatsappTemplates.metaName, 'offer_booking_confirmation_ar'),
          eq(whatsappTemplates.metaStatus, 'APPROVED')
        )
      )
      .limit(1);

    if (!template || template.length === 0) {
      throw new Error("Template 'offer_booking_confirmation_ar' not found or not approved");
    }

    const tmpl = template[0];

    const parameters = [
      lead.fullName,
      offerData.title || 'عرض خاص',
      offerData.description || 'تفاصيل العرض',
      offerData.endDate ? new Date(offerData.endDate).toLocaleDateString('ar-YE') : 'قريباً',
    ];

    const result = await sendTemplateMessage({
      phone: lead.phone,
      templateName: tmpl.metaName || 'offer_booking_confirmation_ar',
      language: 'ar',
      parameters: parameters.map((value) => ({
        type: 'text' as const,
        value,
      })),
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to send template message');
    }

    await db
      .update(offerLeads)
      .set({
        status: 'confirmed',
        confirmedAt: new Date(),
      })
      .where(eq(offerLeads.id, offerLeadId));

    return {
      success: true,
      message: 'Offer confirmation sent successfully using approved template',
    };
  } catch (error) {
    console.error('[WhatsApp Integration] Error sending offer confirmation:', error);
    throw error;
  }
}

/**
 * إرسال تحديث حالة طلب العرض باستخدام قالب معتمد من Meta
 */
export async function sendOfferLeadStatusUpdate(
  offerLeadId: number,
  newStatus: string,
  _reason?: string
) {
  try {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    const offerLead = await db
      .select()
      .from(offerLeads)
      .where(eq(offerLeads.id, offerLeadId))
      .limit(1);

    if (!offerLead || offerLead.length === 0) {
      throw new Error('Offer lead not found');
    }

    const lead = offerLead[0];

    const offer = await db.select().from(offers).where(eq(offers.id, lead.offerId)).limit(1);

    if (!offer || offer.length === 0) {
      throw new Error('Offer not found');
    }

    const offerData = offer[0];

    let templateName = '';
    let parameters: string[] = [];

    switch (newStatus) {
      case 'confirmed':
        templateName = 'offer_booking_confirmed_ar';
        parameters = [lead.fullName, offerData.title || 'عرض خاص', 'تم تأكيد حجزك'];
        break;

      case 'cancelled':
        templateName = 'offer_cancellation_ar';
        parameters = [
          lead.fullName,
          offerData.title || 'عرض خاص',
          offerData.endDate ? new Date(offerData.endDate).toLocaleDateString('ar-YE') : 'قريباً',
          '8000018',
        ];
        break;

      default:
        throw new Error(`Unsupported status: ${newStatus}`);
    }

    const template = await db
      .select()
      .from(whatsappTemplates)
      .where(
        and(
          eq(whatsappTemplates.metaName, templateName),
          eq(whatsappTemplates.metaStatus, 'APPROVED')
        )
      )
      .limit(1);

    if (!template || template.length === 0) {
      throw new Error(`Template '${templateName}' not found or not approved`);
    }

    const tmpl = template[0];

    const result = await sendTemplateMessage({
      phone: lead.phone,
      templateName: tmpl.metaName || templateName,
      language: 'ar',
      parameters: parameters.map((value) => ({
        type: 'text' as const,
        value,
      })),
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to send template message');
    }

    return {
      success: true,
      message: 'Offer status update sent successfully using approved template',
    };
  } catch (error) {
    console.error('[WhatsApp Integration] Error sending offer status update:', error);
    throw error;
  }
}
