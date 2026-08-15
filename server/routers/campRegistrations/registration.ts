/**
 * Camp Registration Router
 * Router للتسجيل العام للمخيمات
 */

import { eq } from 'drizzle-orm';
import { publicProcedure, router } from '../../_core/trpc';
import { ensureDatabaseAvailable } from '../../_core/databaseGuard';
import { campRegistrations } from '../../../drizzle/schema';
import { submitCampRegistrationSchema } from '../campRegistrationSchemas';
import {
  assignCampDateAndTime,
  sendTelegramNotification,
  sendCampRegistrationWhatsApp,
  sendCampRegistrationCAPI,
  invalidateCampRegistrationCache,
  createStatusTimestamps,
} from '../campRegistrationHelpers';
import { createLogger } from '../../_core/logger';

const logger = createLogger('campRegistrations.registration');

export const campRegistrationRouter = router({
  // Submit a new camp registration (public)
  submit: publicProcedure.input(submitCampRegistrationSchema).mutation(async ({ input, ctx }) => {
    const { normalizePhoneNumber } = await import('../../database/db');
    const normalizedPhone = normalizePhoneNumber(input.phone);
    const db = await ensureDatabaseAvailable();

    const campStatusTimestamps = createStatusTimestamps(input.status || 'pending');
    const campInitialStatus = input.status || 'pending';

    const { assignedDate, assignedTimeSlot } = await assignCampDateAndTime(
      input.campId,
      input.preferredDate,
      input.preferredTimeSlot
    );

    const [registration] = await db.insert(campRegistrations).values({
      campId: input.campId,
      fullName: input.fullName,
      phone: normalizedPhone,
      email: input.email,
      age: input.age,
      gender: input.gender,
      procedures: input.procedures,
      medicalCondition: input.medicalCondition,
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
      status: campInitialStatus,
      ...campStatusTimestamps,
      preferredDate: assignedDate ? assignedDate.toISOString().split('T')[0] : undefined,
      preferredTimeSlot: assignedTimeSlot,
    });

    const { camps } = await import('../../../drizzle/schema');
    const [camp] = await db.select().from(camps).where(eq(camps.id, input.campId)).limit(1);

    if (camp) {
      await sendTelegramNotification(
        input.fullName,
        input.phone,
        input.email,
        camp.name,
        input.age,
        input.procedures,
        input.patientMessage
      );
    }

    if (camp) {
      const regId = Number(registration.insertId);
      const isManualRegistration =
        input.source === 'admin' || (input.status && input.status !== 'pending');

      if (!isManualRegistration || campInitialStatus === 'pending') {
        const campMorningTime = (camp as { morningTime?: string }).morningTime;
        const campEveningTime = (camp as { eveningTime?: string }).eveningTime;

        sendCampRegistrationWhatsApp(
          input.phone,
          input.fullName,
          camp.name,
          assignedDate,
          assignedTimeSlot,
          camp.startDate?.toISOString(),
          campMorningTime,
          campEveningTime,
          'on_create',
          regId
        )
          .then(async () => {
            const dbInner = await ensureDatabaseAvailable();
            await dbInner
              .update(campRegistrations)
              .set({ status: 'contacted', contactedAt: new Date(), updatedAt: new Date() })
              .where(eq(campRegistrations.id, regId));
            invalidateCampRegistrationCache();
            logger.info(`Auto-updated registration ${regId} to contacted after on_create send`);
          })
          .catch((error: Error) => {
            logger.error('Failed to send camp registration on_create:', error);
          });
      } else {
        const manualTriggerMap: Record<string, string> = {
          confirmed: 'on_confirmed',
          attended: 'on_arrived',
          completed: 'on_completed',
          cancelled: 'on_cancelled',
        };
        const manualTrigger = manualTriggerMap[campInitialStatus];
        if (manualTrigger) {
          const campMorningTime = (camp as { morningTime?: string }).morningTime;
          const campEveningTime = (camp as { eveningTime?: string }).eveningTime;

          sendCampRegistrationWhatsApp(
            input.phone,
            input.fullName,
            camp.name,
            assignedDate,
            assignedTimeSlot,
            camp.startDate?.toISOString(),
            campMorningTime,
            campEveningTime,
            manualTrigger as 'on_confirmed' | 'on_arrived' | 'on_completed' | 'on_cancelled',
            regId
          ).catch((error: Error) => {
            logger.error(`Failed to send camp registration ${manualTrigger}:`, error);
          });
        } else {
          logger.info(
            `Manual registration ${regId} with status "${campInitialStatus}" - no auto message sent`
          );
        }
      }
    }

    sendCampRegistrationCAPI(
      input.fullName,
      input.phone,
      input.email,
      ctx.req.ip || (ctx.req.socket as { remoteAddress?: string })?.remoteAddress,
      ctx.req.headers['user-agent'] as string,
      ctx.req.cookies?.['_fbc'],
      ctx.req.cookies?.['_fbp'],
      input.referrer,
      `camp_${registration?.insertId || Date.now()}`
    );

    invalidateCampRegistrationCache();

    return { success: true, id: registration.insertId };
  }),
});
