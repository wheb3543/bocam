/**
 * WhatsApp Integration - Appointments
 * دوال إرسال رسائل WhatsApp الخاصة بالمواعيد الطبية
 */

import { eq, and } from 'drizzle-orm';
import { getDb } from '../../database/db';
import { sendTemplateMessage } from '../whatsappTemplates';
import { appointments, doctors, whatsappTemplates } from '../../../drizzle/schema';

/**
 * إرسال تأكيد حجز موعد طبي تلقائياً باستخدام قالب معتمد من Meta
 *
 * تقوم هذه الدالة بإرسال رسالة تأكيد حجز موعد طبي للمريض عبر WhatsApp
 * باستخدام قالب معتمد من Meta، وتقوم بتحديث حالة الموعد إلى "confirmed".
 *
 * @param appointmentId - معرف الموعد الطبي
 * @returns Promise<{ success: boolean; message: string }> - نتيجة عملية الإرسال
 * @throws Error إذا لم يتم العثور على الموعد أو الطبيب أو القالب
 * @example
 * const result = await sendAppointmentConfirmation(123);
 * // Returns: { success: true, message: 'Confirmation sent successfully using approved template' }
 */
export async function sendAppointmentConfirmation(appointmentId: number) {
  try {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    const appointment = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (!appointment || appointment.length === 0) {
      throw new Error('Appointment not found');
    }

    const apt = appointment[0];

    const doctor = await db.select().from(doctors).where(eq(doctors.id, apt.doctorId)).limit(1);

    if (!doctor || doctor.length === 0) {
      throw new Error('Doctor not found');
    }

    const doc = doctor[0];

    const template = await db
      .select()
      .from(whatsappTemplates)
      .where(
        and(
          eq(whatsappTemplates.metaName, 'appointment_confirmation_ar'),
          eq(whatsappTemplates.metaStatus, 'APPROVED')
        )
      )
      .limit(1);

    if (!template || template.length === 0) {
      throw new Error("Template 'appointment_confirmation_ar' not found or not approved");
    }

    const tmpl = template[0];

    const parameters = [
      apt.fullName,
      doc.name,
      doc.specialty || 'عام',
      apt.appointmentDate ? new Date(apt.appointmentDate).toLocaleDateString('ar-YE') : 'قريباً',
      apt.preferredTime || 'حسب الحاجة',
    ];

    const result = await sendTemplateMessage({
      phone: apt.phone,
      templateName: tmpl.metaName || 'appointment_confirmation_ar',
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
      .update(appointments)
      .set({
        status: 'confirmed',
        confirmedAt: new Date(),
      })
      .where(eq(appointments.id, appointmentId));

    return { success: true, message: 'Confirmation sent successfully using approved template' };
  } catch (error) {
    console.error('[WhatsApp Integration] Error sending appointment confirmation:', error);
    throw error;
  }
}

/**
 * إرسال تذكير قبل الموعد الطبي (24 ساعة) باستخدام قالب معتمد من Meta
 *
 * تقوم هذه الدالة بإرسال رسالة تذكير للمريض قبل 24 ساعة من موعده الطبي
 * باستخدام قالب معتمد من Meta.
 *
 * @param appointmentId - معرف الموعد الطبي
 * @returns Promise<{ success: boolean; message: string }> - نتيجة عملية الإرسال
 * @throws Error إذا لم يتم العثور على الموعد أو الطبيب أو القالب أو لم يتم تحديد التاريخ
 * @example
 * const result = await scheduleAppointmentReminder24h(123);
 * // Returns: { success: true, message: '24h reminder scheduled successfully using approved template' }
 */
export async function scheduleAppointmentReminder24h(appointmentId: number) {
  try {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    const appointment = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (!appointment || appointment.length === 0) {
      throw new Error('Appointment not found');
    }

    const apt = appointment[0];

    if (!apt.appointmentDate) {
      throw new Error('Appointment date not set');
    }

    const doctor = await db.select().from(doctors).where(eq(doctors.id, apt.doctorId)).limit(1);

    if (!doctor || doctor.length === 0) {
      throw new Error('Doctor not found');
    }

    const doc = doctor[0];

    const template = await db
      .select()
      .from(whatsappTemplates)
      .where(
        and(
          eq(whatsappTemplates.metaName, 'appointment_reminder_24h_ar'),
          eq(whatsappTemplates.metaStatus, 'APPROVED')
        )
      )
      .limit(1);

    if (!template || template.length === 0) {
      throw new Error("Template 'appointment_reminder_24h_ar' not found or not approved");
    }

    const tmpl = template[0];

    const parameters = [apt.fullName, doc.name, apt.preferredTime || 'حسب الحاجة'];

    const result = await sendTemplateMessage({
      phone: apt.phone,
      templateName: tmpl.metaName || 'appointment_reminder_24h_ar',
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
      message: '24h reminder scheduled successfully using approved template',
    };
  } catch (error) {
    console.error('[WhatsApp Integration] Error scheduling 24h reminder:', error);
    throw error;
  }
}

/**
 * إرسال تذكير قبل الموعد الطبي (1 ساعة) باستخدام قالب معتمد من Meta
 *
 * تقوم هذه الدالة بإرسال رسالة تذكير للمريض قبل ساعة واحدة من موعده الطبي
 * باستخدام قالب معتمد من Meta.
 *
 * @param appointmentId - معرف الموعد الطبي
 * @returns Promise<{ success: boolean; message: string }> - نتيجة عملية الإرسال
 * @throws Error إذا لم يتم العثور على الموعد أو القالب أو لم يتم تحديد التاريخ
 * @example
 * const result = await scheduleAppointmentReminder1h(123);
 * // Returns: { success: true, message: '1h reminder scheduled successfully using approved template' }
 */
export async function scheduleAppointmentReminder1h(appointmentId: number) {
  try {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    const appointment = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (!appointment || appointment.length === 0) {
      throw new Error('Appointment not found');
    }

    const apt = appointment[0];

    if (!apt.appointmentDate) {
      throw new Error('Appointment date not set');
    }

    const template = await db
      .select()
      .from(whatsappTemplates)
      .where(
        and(
          eq(whatsappTemplates.metaName, 'appointment_reminder_1h_ar'),
          eq(whatsappTemplates.metaStatus, 'APPROVED')
        )
      )
      .limit(1);

    if (!template || template.length === 0) {
      throw new Error("Template 'appointment_reminder_1h_ar' not found or not approved");
    }

    const tmpl = template[0];

    const parameters = [apt.fullName, '8000018'];

    const result = await sendTemplateMessage({
      phone: apt.phone,
      templateName: tmpl.metaName || 'appointment_reminder_1h_ar',
      language: 'ar',
      parameters: parameters.map((value) => ({
        type: 'text' as const,
        value,
      })),
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to send template message');
    }

    return { success: true, message: '1h reminder scheduled successfully using approved template' };
  } catch (error) {
    console.error('[WhatsApp Integration] Error scheduling 1h reminder:', error);
    throw error;
  }
}

/**
 * إرسال تحديث حالة الموعد الطبي باستخدام قالب معتمد من Meta
 *
 * تقوم هذه الدالة بإرسال رسالة تحديث حالة الموعد الطبي للمريض عبر WhatsApp
 * باستخدام قالب معتمد من Meta بناءً على الحالة الجديدة.
 *
 * الحالات المدعومة:
 * - confirmed: تأكيد الموعد
 * - cancelled: إلغاء الموعد
 * - rescheduled: إعادة جدولة الموعد
 * - completed: إكمال الموعد
 *
 * @param appointmentId - معرف الموعد الطبي
 * @param newStatus - الحالة الجديدة للموعد (confirmed/cancelled/rescheduled/completed)
 * @param reason - سبب التغيير (اختياري، مطلوب للحالة cancelled)
 * @returns Promise<{ success: boolean; message: string }> - نتيجة عملية الإرسال
 * @throws Error إذا لم يتم العثور على الموعد أو الطبيب أو القالب أو الحالة غير مدعومة
 * @example
 * const result = await sendAppointmentStatusUpdate(123, 'cancelled', 'المريض طلب الإلغاء');
 * // Returns: { success: true, message: 'Status update sent successfully using approved template' }
 */
export async function sendAppointmentStatusUpdate(
  appointmentId: number,
  newStatus: string,
  reason?: string
) {
  try {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    const appointment = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, appointmentId))
      .limit(1);

    if (!appointment || appointment.length === 0) {
      throw new Error('Appointment not found');
    }

    const apt = appointment[0];

    const doctor = await db.select().from(doctors).where(eq(doctors.id, apt.doctorId)).limit(1);

    if (!doctor || doctor.length === 0) {
      throw new Error('Doctor not found');
    }

    const doc = doctor[0];

    let templateName = '';
    let parameters: string[] = [];

    switch (newStatus) {
      case 'confirmed':
        templateName = 'appointment_status_confirmed_ar';
        parameters = [
          apt.fullName,
          apt.appointmentDate
            ? new Date(apt.appointmentDate).toLocaleDateString('ar-YE')
            : 'قريباً',
          apt.preferredTime || 'حسب الحاجة',
          doc.name,
        ];
        break;

      case 'cancelled':
        templateName = 'appointment_status_cancelled_ar';
        parameters = [
          apt.fullName,
          apt.appointmentDate
            ? new Date(apt.appointmentDate).toLocaleDateString('ar-YE')
            : 'قريباً',
          reason || 'لم يتم تحديد السبب',
          '8000018',
        ];
        break;

      case 'rescheduled':
        templateName = 'appointment_status_rescheduled_ar';
        parameters = [
          apt.fullName,
          apt.appointmentDate
            ? new Date(apt.appointmentDate).toLocaleDateString('ar-YE')
            : 'قريباً',
          apt.preferredTime || 'حسب الحاجة',
          doc.name,
        ];
        break;

      case 'completed':
        templateName = 'appointment_status_completed_ar';
        parameters = [apt.fullName, '8000018'];
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
      phone: apt.phone,
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

    return { success: true, message: 'Status update sent successfully using approved template' };
  } catch (error) {
    console.error('[WhatsApp Integration] Error sending status update:', error);
    throw error;
  }
}
