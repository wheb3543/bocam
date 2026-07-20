import { z } from 'zod';
import { systemRouter } from '../_core/systemRouter';
import { protectedProcedure, router } from '../_core/trpc';
import {
  getAllAccessRequests,
  getPendingAccessRequests,
  approveAccessRequest,
  rejectAccessRequest,
} from '../database/db';
import { notifyOwner } from '../_core/notification';
import { offersRouter } from './offers';
import { campsRouter } from './camps';
import { offerLeadsRouter } from './offerLeads';
import { campRegistrationsRouter } from './campRegistrations';
import { doctorsRouter } from './doctors';
import { usersRouter } from './users';
import { reportsRouter } from './reports';
import { campaignsRouter } from './campaigns';
import { tasksRouter } from './tasks';
import { whatsappRouter } from './whatsapp';
import { whatsappTemplateTestRouter } from './whatsappTemplateTest';
import { messageSettingsRouter } from './messageSettings';
import { webhooksRouter } from './webhooks';
import { commentsRouter } from './comments';
import { followUpTasksRouter } from './followUpTasks';
import { appointmentsRouter } from './appointments';
import { leadsRouter } from './leads';

import { getCombinedSocialMediaStats } from '../api/metaGraphAPI';
import { runDeactivationJobs } from '../tasks/cron/deactivateExpired';
import { queueRouter } from './queue';
import { customersRouter } from './customers';
import { auditLogsRouter } from './auditLogs';
import { savedFiltersRouter } from './savedFilters';
import { chartsRouter } from './charts';
import { trackingRouter } from './tracking';
import { patientPortalRouter } from './patientPortal';
import { patientResultsRouter } from './patientResults';
import { pwaRouter } from './pwa';
import { metaSyncRouter } from './metaSync';
import { authRouter } from './auth';
import { generatePDF } from '../services/pdfService';
import { licenseRouter } from './license';
import { createLogger } from '../_core/logger';

const logger = createLogger('routers');

export const appRouter = router({
  campaigns: campaignsRouter,
  tasks: tasksRouter,
  system: systemRouter,
  charts: chartsRouter,
  tracking: trackingRouter,
  patientPortal: patientPortalRouter,
  patientResults: patientResultsRouter,
  pwa: pwaRouter,
  whatsapp: whatsappRouter,
  whatsappTemplateTest: whatsappTemplateTestRouter,
  metaSync: metaSyncRouter,
  messageSettings: messageSettingsRouter,
  webhooks: webhooksRouter,
  queue: queueRouter,

  // User Preferences
  preferences: router({
    get: protectedProcedure.input(z.object({ key: z.string() })).query(async ({ ctx, input }) => {
      const { getUserPreference } = await import('../database/db');
      const pref = await getUserPreference(ctx.user.id, input.key);
      return pref ? JSON.parse(pref.preferenceValue) : null;
    }),

    set: protectedProcedure
      .input(
        z.object({
          key: z.string(),
          value: z.unknown(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const { setUserPreference } = await import('../database/db');
        await setUserPreference(ctx.user.id, input.key, JSON.stringify(input.value));
        return { success: true };
      }),

    getAll: protectedProcedure.query(async ({ ctx }) => {
      const { getAllUserPreferences } = await import('../database/db');
      const prefs = await getAllUserPreferences(ctx.user.id);
      return prefs.reduce(
        (acc, pref) => {
          acc[pref.preferenceKey] = JSON.parse(pref.preferenceValue);
          return acc;
        },
        {} as Record<string, unknown>
      );
    }),
  }),

  // Shared Column Templates (admin-managed, visible to all)
  sharedTemplates: router({
    list: protectedProcedure.input(z.object({ tableKey: z.string() })).query(async ({ input }) => {
      const { getSharedTemplates } = await import('../database/db');
      const templates = await getSharedTemplates(input.tableKey);
      return templates.map((t) => ({
        ...t,
        columns: JSON.parse(t.columns),
      }));
    }),

    listAll: protectedProcedure.query(async () => {
      const { getAllSharedTemplates } = await import('../database/db');
      const templates = await getAllSharedTemplates();
      return templates.map((t) => ({
        ...t,
        columns: JSON.parse(t.columns),
      }));
    }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1),
          tableKey: z.string(),
          columns: z.record(z.string(), z.boolean()),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Only admin can create shared templates
        if (ctx.user.role !== 'admin') {
          throw new Error('غير مصرح لك بإنشاء قوالب مشتركة');
        }
        const { createSharedTemplate } = await import('../database/db');
        await createSharedTemplate({
          name: input.name,
          tableKey: input.tableKey,
          columns: JSON.stringify(input.columns),
          createdBy: ctx.user.id,
          createdByName: ctx.user.name || null,
        });
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        // Only admin can delete shared templates
        if (ctx.user.role !== 'admin') {
          throw new Error('غير مصرح لك بحذف قوالب مشتركة');
        }
        const { deleteSharedTemplate } = await import('../database/db');
        await deleteSharedTemplate(input.id);
        return { success: true };
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          columns: z.record(z.string(), z.boolean()).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Only admin can update shared templates
        if (ctx.user.role !== 'admin') {
          throw new Error('غير مصرح لك بتعديل قوالب مشتركة');
        }
        const { updateSharedTemplate } = await import('../database/db');
        await updateSharedTemplate(input.id, {
          name: input.name,
          columns: input.columns ? JSON.stringify(input.columns) : undefined,
        });
        return { success: true };
      }),
  }),

  auth: authRouter,

  // License management
  license: licenseRouter,

  // Leads management
  leads: leadsRouter,

  // Doctors router
  doctors: doctorsRouter,

  // Appointments router
  appointments: appointmentsRouter,

  // Offers management
  offers: offersRouter,

  // Camps management
  camps: campsRouter,

  // Offer leads management
  offerLeads: offerLeadsRouter,

  // Camp registrations management
  campRegistrations: campRegistrationsRouter,

  // Customer profiles (unified)
  customers: customersRouter,

  // Audit logs
  auditLogs: auditLogsRouter,

  // Saved filters
  savedFilters: savedFiltersRouter,

  // Social Media Insights
  socialMedia: router({
    getStats: protectedProcedure.query(async () => {
      const stats = await getCombinedSocialMediaStats();
      return stats;
    }),
  }),

  accessRequests: router({
    list: protectedProcedure.query(async () => {
      return getAllAccessRequests();
    }),

    pending: protectedProcedure.query(async () => {
      return getPendingAccessRequests();
    }),

    approve: protectedProcedure
      .input(z.object({ requestId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await approveAccessRequest(input.requestId, ctx.user.id);

        // Notify owner
        await notifyOwner({
          title: 'تم الموافقة على طلب تصريح',
          content: `تمت الموافقة على طلب التصريح رقم ${input.requestId}`,
        });

        return { success: true };
      }),

    reject: protectedProcedure
      .input(z.object({ requestId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await rejectAccessRequest(input.requestId, ctx.user.id);
        return { success: true };
      }),
  }),

  // Users management (admin only)
  users: usersRouter,

  // Reports (admin only)
  reports: reportsRouter,

  // Cron jobs (admin only)
  cron: router({
    // Run deactivation jobs manually
    runDeactivation: protectedProcedure.mutation(async () => {
      const result = await runDeactivationJobs();
      return result;
    }),
  }),

  // Comments system
  comments: commentsRouter,
  followUpTasks: followUpTasksRouter,

  // Sidebar badges - aggregated counts for sidebar icons
  sidebarBadges: protectedProcedure.query(async () => {
    try {
      const { getLeadsStats } = await import('../database/db');
      const { getTasksStats } = await import('../database/db/tasks');
      const { getUnreadWhatsAppConversationsCount } = await import('../database/db');
      const { getPendingAccessRequests } = await import('../database/db');

      // Fetch all stats in parallel
      const [leadsStats, tasksStats, whatsappUnread, pendingAccess] = await Promise.allSettled([
        getLeadsStats(),
        getTasksStats(),
        getUnreadWhatsAppConversationsCount(),
        getPendingAccessRequests(),
      ]);

      const newLeads =
        leadsStats.status === 'fulfilled' && leadsStats.value
          ? Number(leadsStats.value.new) || 0
          : 0;
      const pendingTasks =
        tasksStats.status === 'fulfilled' && tasksStats.value
          ? (Number(tasksStats.value.todo) || 0) + (Number(tasksStats.value.overdue) || 0)
          : 0;
      const unreadMessages =
        whatsappUnread.status === 'fulfilled' ? Number(whatsappUnread.value) || 0 : 0;
      const pendingAccessCount =
        pendingAccess.status === 'fulfilled' ? pendingAccess.value.length : 0;

      return {
        leads: newLeads,
        tasks: pendingTasks,
        whatsapp: unreadMessages,
        management: pendingAccessCount,
      };
    } catch (error) {
      logger.error('Error fetching badge counts:', error);
      return { leads: 0, tasks: 0, whatsapp: 0, management: 0 };
    }
  }),

  // Export to PDF
  export: router({
    generatePDF: protectedProcedure
      .input(
        z.object({
          metadata: z.object({
            tableName: z.string(),
            dateRange: z.string().optional(),
            filters: z.record(z.string(), z.unknown()).optional(),
            totalRecords: z.number(),
            exportedRecords: z.number(),
            exportDate: z.string(),
            exportedBy: z.string(),
          }),
          columns: z.array(
            z.object({
              key: z.string(),
              label: z.string(),
            })
          ),
          data: z.array(z.record(z.string(), z.unknown())),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const pdfBuffer = await generatePDF({
            metadata: input.metadata,
            columns: input.columns,
            data: input.data,
          });

          // تحويل Buffer إلى base64 للإرسال عبر tRPC
          const base64 = pdfBuffer.toString('base64');
          return { success: true, pdf: base64 };
        } catch (error) {
          logger.error('PDF generation error:', error);
          throw new Error('فشل إنشاء ملف PDF', { cause: error });
        }
      }),
  }),
});
export type AppRouter = typeof appRouter;
