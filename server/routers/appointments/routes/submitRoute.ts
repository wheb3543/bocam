/**
 * Submit Appointment Route
 * مسار إرسال الموعد
 */

import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { getDb } from '../../../database/db';
import { appointments } from '../../../../drizzle/schema';
import {
  getCampaignBySlug,
  getDoctorById,
  createAppointment,
  normalizePhoneNumber,
  createCampaign,
} from '../../../database/db';
import { notifyOwner } from '../../../_core/notification';
import { sendNewAppointmentEmail } from '../../../services/email';
import { sendWelcomeMessage } from '../../../services/whatsapp';
import { sendNewAppointmentTelegram } from '../../../services/telegram';
import { sendAppointmentLeadEvent } from '../../../api/facebookCAPI';
import { createLogger } from '../../../_core/logger';
import { dispatchWhatsAppMessage } from '../../../services/whatsappMessageDispatcher';
import { buildStatusTimestamps, invalidateAppointmentCaches } from '../utils/appointmentHelpers';

const logger = createLogger('appointments');

export async function submitAppointment({
  input,
  ctx,
}: {
  input: Record<string, unknown>;
  ctx: Record<string, unknown>;
}) {
  const normalizedPhone = normalizePhoneNumber(input.phone as string);
  const _db = await getDb();

  // Get or create campaign by slug
  let campaign = await getCampaignBySlug(input.campaignSlug as string);
  if (!campaign) {
    // Auto-create campaign for appointments
    await createCampaign({
      name: `حجز موعد - ${input.campaignSlug as string}`,
      slug: input.campaignSlug as string,
      description: `حجز موعد تلقائي`,
      isActive: true,
      whatsappEnabled: false,
    });
    campaign = await getCampaignBySlug(input.campaignSlug as string);
  }

  if (!campaign) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'فشل في إنشاء أو استرجاع الحملة',
    });
  }

  // Build timestamp fields based on initial status
  const initialStatus = ((input.status as string) || 'pending') as
    'pending' | 'contacted' | 'no_answer' | 'confirmed' | 'attended' | 'completed' | 'cancelled';
  const statusTimestamps = buildStatusTimestamps(initialStatus);

  // Create appointment
  const result = await createAppointment({
    campaignId: campaign.id,
    doctorId: input.doctorId as number,
    fullName: input.fullName as string,
    phone: normalizedPhone,
    email: input.email as string | undefined,
    age: input.age as number | undefined,
    gender: input.gender as 'male' | 'female' | undefined,
    procedure: input.procedure as string | undefined,
    preferredDate: input.preferredDate as string | undefined,
    preferredTime: input.preferredTime as string | undefined,
    additionalNotes: input.additionalNotes as string | undefined,
    patientMessage: input.patientMessage as string | undefined,
    status: initialStatus,
    source: (input.source as string) || 'direct',
    utmSource: input.utmSource as string | undefined,
    utmMedium: input.utmMedium as string | undefined,
    utmCampaign: input.utmCampaign as string | undefined,
    utmTerm: input.utmTerm as string | undefined,
    utmContent: input.utmContent as string | undefined,
    utmPlacement: input.utmPlacement as string | undefined,
    referrer: input.referrer as string | undefined,
    fbclid: input.fbclid as string | undefined,
    gclid: input.gclid as string | undefined,
    ...statusTimestamps,
  });

  // Send email notification
  const doctor = await getDoctorById(input.doctorId as number);
  await sendNewAppointmentEmail({
    appointment: {
      fullName: input.fullName as string,
      phone: input.phone as string,
      email: input.email as string | undefined,
      doctorName: doctor?.name || 'غير محدد',
      doctorSpecialty: doctor?.specialty || '',
      preferredDate: input.preferredDate as string | undefined,
      preferredTime: input.preferredTime as string | undefined,
      notes: input.additionalNotes as string | undefined,
    },
    campaign: campaign.name,
  });

  // Send WhatsApp message if enabled
  if (campaign.whatsappEnabled && campaign.whatsappWelcomeMessage) {
    await sendWelcomeMessage({
      phone: input.phone as string,
      fullName: input.fullName as string,
      campaignName: campaign.name,
      welcomeMessage: campaign.whatsappWelcomeMessage,
    });
  }

  // Notify owner
  const ownerNotifyParts = [
    `تم حجز موعد جديد من ${input.fullName as string} مع ${doctor?.name || 'غير محدد'}`,
    `الهاتف: ${input.phone as string}`,
  ];
  if (input.procedure) {
    ownerNotifyParts.push(`الإجراء: ${input.procedure as string}`);
  }
  if (input.patientMessage) {
    ownerNotifyParts.push(`رسالة المريض: ${input.patientMessage as string}`);
  }
  await notifyOwner({
    title: 'حجز موعد جديد',
    content: ownerNotifyParts.join(' | '),
  });

  // Send Telegram notification
  await sendNewAppointmentTelegram({
    fullName: input.fullName as string,
    phone: input.phone as string,
    email: input.email as string | undefined,
    doctorName: doctor?.name || 'غير محدد',
    preferredDate: input.preferredDate as string | undefined,
    preferredTime: input.preferredTime as string | undefined,
    procedure: input.procedure as string | undefined,
    patientMessage: input.patientMessage as string | undefined,
  });

  // Send automated booking confirmation message (Patient Journey) via dispatcher
  // After successful send → auto-update status to "contacted"
  if (result) {
    const apptId = result.insertId;
    dispatchWhatsAppMessage({
      entityType: 'appointment',
      triggerEvent: 'on_create',
      phone: input.phone as string,
      recipientName: input.fullName as string,
      variables: {
        name: input.fullName as string,
        // دمج date و time في متغير واحد ليتوافق مع القالب المعتمد (4 متغيرات فقط)
        date: (input.preferredDate as string)
          ? `${input.preferredDate as string}${input.preferredTime ? ((' الساعة ' + input.preferredTime) as string) : ''}`.trim()
          : 'غير محدد',
        doctor: doctor?.name || 'غير محدد',
        service: (input.procedure as string) || 'فحص عام',
      },
      entityId: apptId,
    })
      .then(async (res) => {
        if (res?.success) {
          const dbInner = await getDb();
          if (dbInner) {
            await dbInner
              .update(appointments)
              .set({ status: 'contacted', contactedAt: new Date(), updatedAt: new Date() })
              .where(eq(appointments.id, apptId));
            invalidateAppointmentCaches();
            logger.info(`Auto-updated ${apptId} to contacted after on_create send`);
          }
        }
      })
      .catch((error: unknown) => {
        logger.error('Failed to send appointment on_create:', error);
      });
  }

  // Send Facebook Conversions API event (fire-and-forget)
  // لا تُرسَل بيانات طبية حساسة وفق سياسة Meta لمزودي الرعاية الصحية
  const req = ctx.req as {
    ip?: string;
    headers?: Record<string, unknown>;
    cookies?: Record<string, unknown>;
    socket?: { remoteAddress?: string };
  };
  sendAppointmentLeadEvent({
    fullName: input.fullName as string,
    phone: input.phone as string,
    email: input.email as string | undefined,
    clientIpAddress: req.ip || req.socket?.remoteAddress,
    clientUserAgent: (req.headers as Record<string, unknown>)['user-agent'] as string,
    fbc: (req.cookies as Record<string, unknown>)?.['_fbc'] as string | undefined,
    fbp: (req.cookies as Record<string, unknown>)?.['_fbp'] as string | undefined,
    eventSourceUrl: input.referrer as string | undefined,
    eventId: `appt_${result?.insertId || Date.now()}`,
  }).catch((err: unknown) => logger.error('Appointment lead error:', err));

  // Invalidate appointment caches after new submission
  invalidateAppointmentCaches();

  return result;
}
