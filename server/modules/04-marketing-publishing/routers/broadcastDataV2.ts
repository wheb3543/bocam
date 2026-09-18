/**
 * Broadcast Data Router V2
 * جلب البيانات الفعلية من قاعدة البيانات
 */

import { router, publicProcedure } from '../../../_core/trpc';
import { getDb, normalizePhoneNumber } from '../../../database/db';
import {
  whatsappTemplates,
  doctors,
  camps,
  offers,
  appointments,
  campRegistrations,
  offerLeads,
  leads,
} from '../../../../drizzle/schema';
import { eq, inArray } from 'drizzle-orm';
import { z } from 'zod';

export const broadcastDataV2Router = router({
  /**
   * جلب القوالب المعتمدة من Meta
   */
  getTemplates: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    try {
      const templates = await db
        .select()
        .from(whatsappTemplates)
        .where(eq(whatsappTemplates.metaStatus, 'APPROVED'))
        .limit(50);

      return {
        templates: templates.map((t) => ({
          id: t.id,
          name: t.name,
          metaName: t.metaName,
          category: t.metaCategory,
          content: t.content,
          variables: t.variables ? JSON.parse(t.variables) : [],
          headerText: t.headerText,
          footerText: t.footerText,
          buttons: t.buttons ? JSON.parse(t.buttons) : [],
          metaStatus: t.metaStatus,
        })),
        total: templates.length,
      };
    } catch (error) {
      console.error('[broadcastDataV2] Error fetching templates:', error);
      throw error;
    }
  }),

  /**
   * جلب الأطباء مع عدد المسجلين
   */
  getDoctors: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    try {
      const doctorsList = await db
        .select({
          id: doctors.id,
          name: doctors.name,
          slug: doctors.slug,
          image: doctors.image,
          specialty: doctors.specialty,
          bio: doctors.bio,
          available: doctors.available,
        })
        .from(doctors)
        .where(eq(doctors.available, 'yes'))
        .limit(100);

      const doctorsWithCount = await Promise.all(
        doctorsList.map(async (doctor) => {
          const appointmentsCount = await db
            .select()
            .from(appointments)
            .where(eq(appointments.doctorId, doctor.id));

          return {
            ...doctor,
            registrationsCount: appointmentsCount.length,
          };
        })
      );

      return {
        doctors: doctorsWithCount,
        total: doctorsWithCount.length,
      };
    } catch (error) {
      console.error('[broadcastDataV2] Error fetching doctors:', error);
      throw error;
    }
  }),

  /**
   * جلب المخيمات مع عدد المسجلين
   */
  getCamps: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    try {
      const campsList = await db
        .select({
          id: camps.id,
          name: camps.name,
          slug: camps.slug,
          description: camps.description,
          imageUrl: camps.imageUrl,
          isActive: camps.isActive,
        })
        .from(camps)
        .where(eq(camps.isActive, true))
        .limit(100);

      const campsWithCount = await Promise.all(
        campsList.map(async (camp) => {
          const registrationsCount = await db
            .select()
            .from(campRegistrations)
            .where(eq(campRegistrations.campId, camp.id));

          return {
            ...camp,
            registrationsCount: registrationsCount.length,
          };
        })
      );

      return {
        camps: campsWithCount,
        total: campsWithCount.length,
      };
    } catch (error) {
      console.error('[broadcastDataV2] Error fetching camps:', error);
      throw error;
    }
  }),

  /**
   * جلب العروض مع عدد الطالبين
   */
  getOffers: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    try {
      const offersList = await db
        .select({
          id: offers.id,
          title: offers.title,
          slug: offers.slug,
          description: offers.description,
          imageUrl: offers.imageUrl,
          isActive: offers.isActive,
        })
        .from(offers)
        .where(eq(offers.isActive, true))
        .limit(100);

      const offersWithCount = await Promise.all(
        offersList.map(async (offer) => {
          const leadsCount = await db
            .select()
            .from(offerLeads)
            .where(eq(offerLeads.offerId, offer.id));

          return {
            ...offer,
            leadsCount: leadsCount.length,
          };
        })
      );

      return {
        offers: offersWithCount,
        total: offersWithCount.length,
      };
    } catch (error) {
      console.error('[broadcastDataV2] Error fetching offers:', error);
      throw error;
    }
  }),

  /**
   * جلب المستقبلين مع دمج الأرقام المكررة
   */
  getRecipients: publicProcedure
    .input(
      z.object({
        doctorIds: z.array(z.number()).optional(),
        campIds: z.array(z.number()).optional(),
        offerIds: z.array(z.number()).optional(),
        includeAllLeads: z.boolean().optional().default(false),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error('Database not available');
      }

      try {
        const recipients: Map<
          string,
          { phone: string; fullName: string; source: string; sourceId: number }
        > = new Map();
        let duplicatesRemoved = 0;

        // جلب المسجلين من الأطباء
        if (input.doctorIds && input.doctorIds.length > 0) {
          const appointmentsList = await db
            .select({
              phone: appointments.phone,
              fullName: appointments.fullName,
              doctorId: appointments.doctorId,
            })
            .from(appointments)
            .where(inArray(appointments.doctorId, input.doctorIds));

          appointmentsList.forEach((apt) => {
            const normalizedPhone = normalizePhoneNumber(apt.phone);
            if (!normalizedPhone) {
              return;
            }
            const key = normalizedPhone;
            if (recipients.has(key)) {
              duplicatesRemoved++;
            } else {
              recipients.set(key, {
                phone: normalizedPhone,
                fullName: apt.fullName,
                source: 'appointments',
                sourceId: apt.doctorId,
              });
            }
          });
        }

        // جلب المسجلين من المخيمات
        if (input.campIds && input.campIds.length > 0) {
          const registrationsList = await db
            .select({
              phone: campRegistrations.phone,
              fullName: campRegistrations.fullName,
              campId: campRegistrations.campId,
            })
            .from(campRegistrations)
            .where(inArray(campRegistrations.campId, input.campIds));

          registrationsList.forEach((reg) => {
            const normalizedPhone = normalizePhoneNumber(reg.phone);
            if (!normalizedPhone) {
              return;
            }
            const key = normalizedPhone;
            if (recipients.has(key)) {
              duplicatesRemoved++;
            } else {
              recipients.set(key, {
                phone: normalizedPhone,
                fullName: reg.fullName,
                source: 'camp_registrations',
                sourceId: reg.campId,
              });
            }
          });
        }

        // جلب الطالبين من العروض
        if (input.offerIds && input.offerIds.length > 0) {
          const leadsList = await db
            .select({
              phone: offerLeads.phone,
              fullName: offerLeads.fullName,
              offerId: offerLeads.offerId,
            })
            .from(offerLeads)
            .where(inArray(offerLeads.offerId, input.offerIds));

          leadsList.forEach((lead) => {
            const normalizedPhone = normalizePhoneNumber(lead.phone);
            if (!normalizedPhone) {
              return;
            }
            const key = normalizedPhone;
            if (recipients.has(key)) {
              duplicatesRemoved++;
            } else {
              recipients.set(key, {
                phone: normalizedPhone,
                fullName: lead.fullName,
                source: 'offer_leads',
                sourceId: lead.offerId,
              });
            }
          });
        }

        // جلب جميع العملاء المحتملين
        if (input.includeAllLeads) {
          const allLeads = await db
            .select({
              phone: leads.phone,
              fullName: leads.fullName,
              id: leads.id,
            })
            .from(leads);

          allLeads.forEach((lead) => {
            const normalizedPhone = normalizePhoneNumber(lead.phone);
            if (!normalizedPhone) {
              return;
            }
            const key = normalizedPhone;
            if (recipients.has(key)) {
              duplicatesRemoved++;
            } else {
              recipients.set(key, {
                phone: normalizedPhone,
                fullName: lead.fullName,
                source: 'leads',
                sourceId: lead.id,
              });
            }
          });
        }

        const recipientsList = Array.from(recipients.values());

        return {
          recipients: recipientsList,
          totalCount: recipientsList.length,
          duplicatesRemoved,
        };
      } catch (error) {
        console.error('[broadcastDataV2] Error fetching recipients:', error);
        throw error;
      }
    }),

  /**
   * جلب إحصائيات المصادر
   */
  getSourcesStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    try {
      const doctorsCount = await db.select().from(doctors);
      const campsCount = await db.select().from(camps);
      const offersCount = await db.select().from(offers);
      const leadsCount = await db.select().from(leads);

      return {
        doctors: doctorsCount.length,
        camps: campsCount.length,
        offers: offersCount.length,
        leads: leadsCount.length,
      };
    } catch (error) {
      console.error('[broadcastDataV2] Error fetching stats:', error);
      throw error;
    }
  }),
});
