/**
 * Offer Leads Registration Router
 * Router للتسجيل العام للعروض
 */

import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { publicProcedure, router } from '../../_core/trpc';
import { ensureDatabaseAvailable } from '../../_core/databaseGuard';
import { normalizePhoneNumber } from '../../database/db';
import { offerLeads } from '../../../drizzle/schema';
import { sendNewOfferLeadTelegram } from '../../services/telegram';
import { sendOfferLeadEvent } from '../../api/facebookCAPI';
import { dispatchWhatsAppMessage } from '../../services/whatsappMessageDispatcher';
import { createLogger } from '../../_core/logger';
import { invalidateEntityCache } from '../../services/cacheInvalidator';
import { createStatusTimestamps } from '../../_core/statusTimestamps';

const logger = createLogger('offerLeads.registration');

export const offerRegistrationRouter = router({
  // Submit a new offer lead (public)
  submit: publicProcedure
    .input(
      z.object({
        offerId: z.number(),
        fullName: z.string().min(1),
        phone: z
          .string()
          .min(9)
          .regex(
            /^(\+?967)?7\d{8}$|^07\d{8}$|^7\d{8}$/,
            'رقم الهاتف يجب أن يبدأ بالرقم 7 ويتكون من 9 أرقام'
          ),
        email: z.string().email().optional(),
        age: z.number().int().min(1).max(120).optional(),
        gender: z.enum(['male', 'female']),
        patientMessage: z.string().max(500).optional(),
        notes: z.string().optional(),
        source: z.string().optional(),
        status: z
          .enum([
            'pending',
            'contacted',
            'no_answer',
            'confirmed',
            'attended',
            'completed',
            'cancelled',
          ])
          .optional(), // Manual registration status
        utmSource: z.string().optional(),
        utmMedium: z.string().optional(),
        utmCampaign: z.string().optional(),
        utmTerm: z.string().optional(),
        utmContent: z.string().optional(),
        utmPlacement: z.string().optional(),
        referrer: z.string().optional(),
        fbclid: z.string().optional(),
        gclid: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const normalizedPhone = normalizePhoneNumber(input.phone);
      const db = await ensureDatabaseAvailable();

      // Build timestamp fields based on initial status
      const offerInitialStatus = input.status || 'pending';
      const offerStatusTimestamps = createStatusTimestamps(offerInitialStatus);

      const [lead] = await db.insert(offerLeads).values({
        offerId: input.offerId,
        fullName: input.fullName,
        phone: normalizedPhone,
        email: input.email,
        age: input.age,
        gender: input.gender,
        patientMessage: input.patientMessage,
        notes: input.notes,
        source: input.source || 'website',
        utmSource: input.utmSource,
        utmMedium: input.utmMedium,
        utmCampaign: input.utmCampaign,
        utmTerm: input.utmTerm,
        utmContent: input.utmContent,
        utmPlacement: input.utmPlacement,
        referrer: input.referrer,
        fbclid: input.fbclid,
        gclid: input.gclid,
        status: offerInitialStatus,
        ...offerStatusTimestamps,
      });

      // Get offer details for notification
      const { offers } = await import('../../../drizzle/schema');
      const [offer] = await db.select().from(offers).where(eq(offers.id, input.offerId)).limit(1);

      // Send Telegram notification
      if (offer) {
        await sendNewOfferLeadTelegram({
          fullName: input.fullName,
          phone: input.phone,
          email: input.email,
          offerTitle: offer.title,
          age: input.age,
          patientMessage: input.patientMessage,
        });
      }

      // Send automated offer booking confirmation message (Patient Journey) via dispatcher
      // After successful send → auto-update status to "contacted"
      if (offer) {
        const leadId = Number(lead.insertId);
        dispatchWhatsAppMessage({
          entityType: 'offer_lead',
          triggerEvent: 'on_create',
          phone: input.phone,
          recipientName: input.fullName,
          variables: {
            name: input.fullName,
            service: offer.title,
            date: offer.startDate
              ? new Date(offer.startDate).toLocaleDateString('ar-YE')
              : 'غير محدد',
          },
          entityId: leadId,
        })
          .then(async (res) => {
            if (res?.success) {
              const dbInner = await ensureDatabaseAvailable();
              await dbInner
                .update(offerLeads)
                .set({ status: 'contacted', contactedAt: new Date(), updatedAt: new Date() })
                .where(eq(offerLeads.id, leadId));
              invalidateEntityCache('offerLeads');
              logger.info(`Auto-updated ${leadId} to contacted after on_create send`);
            }
          })
          .catch((error) => {
            logger.error('Failed to send offer lead on_create:', error);
          });
      }

      // Send Facebook Conversions API event (fire-and-forget)
      // لا تُرسَل بيانات طبية حساسة وفق سياسة Meta لمزودي الرعاية الصحية
      sendOfferLeadEvent({
        fullName: input.fullName,
        phone: input.phone,
        email: input.email,
        clientIpAddress:
          ctx.req.ip || (ctx.req.socket as { remoteAddress?: string })?.remoteAddress,
        clientUserAgent: ctx.req.headers['user-agent'] as string,
        fbc: ctx.req.cookies?.['_fbc'],
        fbp: ctx.req.cookies?.['_fbp'],
        eventSourceUrl: input.referrer,
        eventId: `offer_${lead?.insertId || Date.now()}`,
      }).catch((err) => logger.error('Offer lead error:', err));

      // Invalidate offer leads caches after new submission
      invalidateEntityCache('offerLeads');

      return { success: true, id: lead.insertId };
    }),
});
