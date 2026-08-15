/**
 * WhatsApp Integration - Camps
 * دوال إرسال رسائل WhatsApp الخاصة بتسجيلات المخيمات
 */

import { eq, and } from 'drizzle-orm';
import { getDb } from '../../database/db';
import { sendTemplateMessage } from '../whatsappTemplates';
import { campRegistrations, camps, whatsappTemplates } from '../../../drizzle/schema';

/**
 * إرسال تأكيد تسجيل مخيم تلقائياً باستخدام قالب معتمد من Meta
 */
export async function sendCampRegistrationConfirmation(campRegistrationId: number) {
  try {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    const registration = await db
      .select()
      .from(campRegistrations)
      .where(eq(campRegistrations.id, campRegistrationId))
      .limit(1);

    if (!registration || registration.length === 0) {
      throw new Error('Camp registration not found');
    }

    const reg = registration[0];

    const camp = await db.select().from(camps).where(eq(camps.id, reg.campId)).limit(1);

    if (!camp || camp.length === 0) {
      throw new Error('Camp not found');
    }

    const campData = camp[0];

    const template = await db
      .select()
      .from(whatsappTemplates)
      .where(
        and(
          eq(whatsappTemplates.metaName, 'camp_registration_confirmation_ar'),
          eq(whatsappTemplates.metaStatus, 'APPROVED')
        )
      )
      .limit(1);

    if (!template || template.length === 0) {
      throw new Error("Template 'camp_registration_confirmation_ar' not found or not approved");
    }

    const tmpl = template[0];

    const parameters = [
      reg.fullName,
      campData.name,
      campData.startDate ? new Date(campData.startDate).toLocaleDateString('ar-YE') : 'قريباً',
      campData.endDate ? new Date(campData.endDate).toLocaleDateString('ar-YE') : 'قريباً',
      'شارع الستين الشمالي - صنعاء',
      'عام',
    ];

    const result = await sendTemplateMessage({
      phone: reg.phone,
      templateName: tmpl.metaName || 'camp_registration_confirmation_ar',
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
      .update(campRegistrations)
      .set({
        status: 'confirmed',
        confirmedAt: new Date(),
      })
      .where(eq(campRegistrations.id, campRegistrationId));

    return {
      success: true,
      message: 'Camp confirmation sent successfully using approved template',
    };
  } catch (error) {
    console.error('[WhatsApp Integration] Error sending camp confirmation:', error);
    throw error;
  }
}

/**
 * إرسال تحديث حالة تسجيل المخيم باستخدام قالب معتمد من Meta
 */
export async function sendCampRegistrationStatusUpdate(
  campRegistrationId: number,
  newStatus: string,
  reason?: string
) {
  try {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    const registration = await db
      .select()
      .from(campRegistrations)
      .where(eq(campRegistrations.id, campRegistrationId))
      .limit(1);

    if (!registration || registration.length === 0) {
      throw new Error('Camp registration not found');
    }

    const reg = registration[0];

    const camp = await db.select().from(camps).where(eq(camps.id, reg.campId)).limit(1);

    if (!camp || camp.length === 0) {
      throw new Error('Camp not found');
    }

    const campData = camp[0];

    let templateName = '';
    let parameters: string[] = [];

    switch (newStatus) {
      case 'confirmed':
        templateName = 'camp_registration_confirmed_ar';
        parameters = [
          reg.fullName,
          campData.name,
          campData.startDate ? new Date(campData.startDate).toLocaleDateString('ar-YE') : 'قريباً',
        ];
        break;

      case 'cancelled':
        templateName = 'camp_cancellation_ar';
        parameters = [reg.fullName, campData.name, reason || 'لم يتم تحديد السبب', '8000018'];
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
      phone: reg.phone,
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
      message: 'Camp status update sent successfully using approved template',
    };
  } catch (error) {
    console.error('[WhatsApp Integration] Error sending camp status update:', error);
    throw error;
  }
}
