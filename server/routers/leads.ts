import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { publicProcedure, protectedProcedure, router } from '../_core/trpc';
import { createAuditLog } from './auditLogs';
import {
  createLead,
  getCampaignBySlug,
  getAllLeads,
  getLeadById,
  updateLead,
  createLeadStatusHistory,
  getLeadStatusHistory,
  getLeadsStats,
  searchLeads,
  getLeadsByCampaign,
  createCampaign,
  normalizePhoneNumber,
} from '../database/db';
import { notifyOwner } from '../_core/notification';
import { ensureDatabaseAvailable } from '../_core/databaseGuard';
import { leads as leadsTable } from '../../drizzle/schema';
import { notifyEligibleRecipients } from '../services/notificationPolicy';
import { sendNewLeadNotification } from '../services/email';
import { sendNewLeadTelegram } from '../services/telegram';
import {
  sendWelcomeMessage,
  sendBookingConfirmation,
  sendCustomMessage,
} from '../services/whatsapp';
import { permissionProcedure } from './permissionProcedures';
import {
  assertAssignableUser,
  listAssignableUsers,
  notifyWorkAssignment,
} from '../services/workAssignmentService';

const leadsViewProcedure = permissionProcedure('leads.view', 'عرض العملاء المحتملين');
const leadsUpdateProcedure = permissionProcedure('leads.update', 'تعديل العملاء المحتملين');
const leadsAssignProcedure = permissionProcedure('leads.assign', 'إسناد العملاء المحتملين');
const communicationsReplyProcedure = permissionProcedure(
  'communications.reply',
  'إرسال رسائل متابعة العملاء المحتملين'
);

export const leadsRouter = router({
  // Public endpoint for lead submission from landing page
  submit: publicProcedure
    .input(
      z.object({
        campaignSlug: z.string(),
        fullName: z.string().min(1),
        phone: z
          .string()
          .min(1)
          .regex(/^7[0-9]{8}$/, 'رقم الهاتف اليمني يجب أن يبدأ بالرقم 7 ويتكون من 9 أرقام'),
        email: z.string().email().optional(),
        notes: z.string().optional(),
        status: z
          .enum([
            'new',
            'contacted',
            'booked',
            'not_interested',
            'no_answer',
            'pending',
            'confirmed',
            'completed',
            'cancelled',
          ])
          .optional(),
        source: z.string().optional(),
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
    .mutation(async ({ input }) => {
      // Get or create campaign by slug
      let campaign = await getCampaignBySlug(input.campaignSlug);
      if (!campaign) {
        // Auto-create campaign for appointments
        await createCampaign({
          name: `حجز موعد - ${input.campaignSlug}`,
          slug: input.campaignSlug,
          description: `حجز موعد تلقائي`,
          isActive: true,
          whatsappEnabled: false,
        });
        campaign = await getCampaignBySlug(input.campaignSlug);
      }

      if (!campaign) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'فشل في إنشاء أو استرجاع الحملة',
        });
      }

      // Create lead
      const createdLead = await createLead({
        campaignId: campaign.id,
        fullName: input.fullName,
        phone: normalizePhoneNumber(input.phone),
        email: input.email,
        notes: input.notes,
        status: input.status || 'new',
        source: input.source || 'direct',
        utmSource: input.utmSource,
        utmMedium: input.utmMedium,
        utmCampaign: input.utmCampaign,
        utmContent: input.utmContent,
        emailSent: false,
        whatsappSent: false,
        bookingConfirmationSent: false,
      });
      const leadId = Number(createdLead[0].insertId);

      void ensureDatabaseAvailable()
        .then((db) =>
          notifyEligibleRecipients(db, {
            source: 'leads',
            type: 'lead_created',
            title: 'عميل محتمل جديد يحتاج متابعة',
            message: `تم تسجيل عميل محتمل جديد من حملة ${campaign.name}.`,
            entityType: 'lead',
            entityId: leadId,
            actionUrl: '/admin/bookings/leads',
            actionLabel: 'فتح العملاء المحتملين',
            priority: 'medium',
            data: JSON.stringify({ campaignId: campaign.id, source: input.source || 'direct' }),
          })
        )
        .catch(() => undefined);

      // Send notification to owner
      await notifyOwner({
        title: 'تسجيل جديد في المخيم الطبي الخيري',
        content: `تم تسجيل عميل جديد:
الاسم: ${input.fullName}
الهاتف: ${input.phone}
البريد: ${input.email || 'غير متوفر'}`,
      });

      // Send Telegram notification
      await sendNewLeadTelegram({
        fullName: input.fullName,
        phone: input.phone,
        email: input.email,
        source: input.utmSource || 'direct',
      });

      // Send email notification
      await sendNewLeadNotification({
        fullName: input.fullName,
        phone: input.phone,
        email: input.email,
        campaignName: campaign.name,
        utmSource: input.utmSource,
        utmMedium: input.utmMedium,
        createdAt: new Date(),
      });

      // Send WhatsApp welcome message if enabled
      if (campaign.whatsappEnabled) {
        await sendWelcomeMessage({
          phone: input.phone,
          fullName: input.fullName,
          campaignName: campaign.name,
          welcomeMessage: campaign.whatsappWelcomeMessage || undefined,
        });
      }

      return { success: true };
    }),

  // Admin endpoints
  list: leadsViewProcedure.query(async () => {
    return getAllLeads();
  }),

  // Unified list from all sources
  unifiedList: leadsViewProcedure.query(async () => {
    const { getAllUnifiedLeads } = await import('../database/db');
    return getAllUnifiedLeads();
  }),

  getById: leadsViewProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    return getLeadById(input.id);
  }),

  search: leadsViewProcedure
    .input(z.object({ searchTerm: z.string() }))
    .query(async ({ input }) => {
      return searchLeads(input.searchTerm);
    }),

  getByCampaign: leadsViewProcedure
    .input(z.object({ campaignId: z.number() }))
    .query(async ({ input }) => {
      return getLeadsByCampaign(input.campaignId);
    }),

  updateStatus: leadsUpdateProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(['new', 'contacted', 'booked', 'not_interested', 'no_answer']),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const lead = await getLeadById(input.id);
      if (!lead) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'العميل غير موجود' });
      }

      // Update lead status
      await updateLead(input.id, { status: input.status });

      // Create status history
      await createLeadStatusHistory({
        leadId: input.id,
        userId: ctx.user.id,
        oldStatus: lead.status,
        newStatus: input.status,
        notes: input.notes,
      });

      // Create audit log
      await createAuditLog({
        entityType: 'lead',
        entityId: input.id,
        action: 'status_change',
        oldValue: lead.status,
        newValue: input.status,
        userId: ctx.user?.id,
        userName: ctx.user?.name,
        notes: input.notes,
      });

      if (lead.status !== input.status) {
        void ensureDatabaseAvailable()
          .then((db) =>
            notifyEligibleRecipients(db, {
              source: 'leads',
              type: 'lead_status_changed',
              title: 'تم تحديث مرحلة عميل محتمل',
              message: 'تم تحديث مرحلة عميل محتمل وتحتاج إلى المراجعة عند الحاجة.',
              entityType: 'lead',
              entityId: input.id,
              actionUrl: '/admin/bookings/leads',
              actionLabel: 'فتح العملاء المحتملين',
              priority: input.status === 'booked' ? 'high' : 'medium',
              data: JSON.stringify({ previousStatus: lead.status, status: input.status }),
            })
          )
          .catch(() => undefined);
      }

      return { success: true };
    }),

  getStatusHistory: leadsViewProcedure
    .input(z.object({ leadId: z.number() }))
    .query(async ({ input }) => {
      return getLeadStatusHistory(input.leadId);
    }),

  stats: leadsViewProcedure.query(async () => {
    return getLeadsStats();
  }),

  assignableUsers: leadsAssignProcedure.query(async () => {
    const db = await ensureDatabaseAvailable();
    return listAssignableUsers(db, 'leads.update');
  }),

  assign: leadsAssignProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        assignedToUserId: z.number().int().positive().nullable(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDatabaseAvailable();
      const [lead] = await db
        .select({ assignedToUserId: leadsTable.assignedToUserId })
        .from(leadsTable)
        .where(eq(leadsTable.id, input.id))
        .limit(1);
      if (!lead) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'العميل المحتمل غير موجود' });
      }
      await assertAssignableUser(db, input.assignedToUserId, 'leads.update');
      await db
        .update(leadsTable)
        .set({ assignedToUserId: input.assignedToUserId })
        .where(eq(leadsTable.id, input.id));
      await createAuditLog({
        entityType: 'lead',
        entityId: input.id,
        action: 'assignment_change',
        oldValue: lead.assignedToUserId ? String(lead.assignedToUserId) : null,
        newValue: input.assignedToUserId ? String(input.assignedToUserId) : null,
        userId: ctx.user.id,
        userName: ctx.user.name,
      });
      if (input.assignedToUserId && input.assignedToUserId !== lead.assignedToUserId) {
        void notifyWorkAssignment(db, {
          kind: 'lead',
          entityId: input.id,
          assignedUserId: input.assignedToUserId,
          actorUserId: ctx.user.id,
        }).catch(() => undefined);
      }
      return { success: true };
    }),

  sendWhatsApp: communicationsReplyProcedure
    .input(
      z.object({
        leadId: z.number(),
        message: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const lead = await getLeadById(input.leadId);
      if (!lead) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'العميل غير موجود' });
      }

      const success = await sendCustomMessage(lead.phone, input.message);

      if (success) {
        await updateLead(input.leadId, {
          whatsappSent: true,
        });
      }

      return { success };
    }),

  sendBookingConfirmation: communicationsReplyProcedure
    .input(
      z.object({
        leadId: z.number(),
        appointmentDate: z.string().optional(),
        appointmentTime: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const lead = await getLeadById(input.leadId);
      if (!lead) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'العميل غير موجود' });
      }

      const success = await sendBookingConfirmation({
        phone: lead.phone,
        fullName: lead.fullName,
        appointmentDate: input.appointmentDate,
        appointmentTime: input.appointmentTime,
      });

      if (success) {
        await updateLead(input.leadId, {
          bookingConfirmationSent: true,
        });
      }

      return { success };
    }),
});
