import { z } from 'zod';
import { protectedProcedure, router } from '../_core/trpc';
import {
  getAllAccessRequests,
  getPendingAccessRequests,
  approveAccessRequest,
  rejectAccessRequest,
} from '../database/db';
import { notifyOwner } from '../services/notification';
import { ensureDatabaseAvailable } from '../_core/databaseGuard';
import { createNotification } from '../services/notificationHelper';

// Module 01: Booking & Smart Scheduling
import {
  appointmentsRouter,
  campsRouter,
  campRegistrationsRouter,
  doctorsRouter,
  departmentsRouter,
  offersRouter,
  offerLeadsRouter,
  queueRouter,
  leadsRouter,
} from '../modules/01-booking-scheduling';

// Module 02: CRM & Patient Portal
import {
  customersRouter,
  patientPortalRouter,
  patientResultsRouter,
} from '../modules/02-crm-patients';

// Module 03: Omni-channel Inbox
import {
  socialInboxRouter,
  whatsappRouter,
  whatsappTemplateTestRouter,
  messageSettingsRouter,
  commentsRouter,
} from '../modules/03-omni-inbox';

// Module 04: Marketing & Publishing
import {
  broadcastRouter,
  broadcastDataV2Router,
  broadcastExecuteRouter,
  broadcastSchedulingRouter,
  campaignsRouter,
  metaIntegrationRouter,
  metaOperationsRouter,
  metaSyncRouter,
} from '../modules/04-marketing-publishing';

// Module 05: Automated CMS & Portal
import { contentRouter, pwaRouter } from '../modules/05-cms-portal';

// Module 06: Tasks & Team Collaboration
import { tasksRouter, followUpTasksRouter } from '../modules/06-tasks-projects';

// Module 07: Users, Roles & RBAC
import { usersRouter, authRouter, permissionProcedure } from '../modules/07-users-rbac';

// Module 10: System Settings & Governance
import {
  auditLogsRouter,
  reportsRouter,
  chartsRouter,
  trackingRouter,
  savedFiltersRouter,
  integrationConnectionsRouter,
  generalIntegrationsRouter,
  googleSyncRouter,
  licenseRouter,
} from '../modules/10-system-settings';

// Cross-cutting & Auxiliary Routers
import { systemRouter } from './system';
import { notificationsRouter } from './notifications';
import { webhooksRouter } from './webhooks';
import { publicContentRouter } from './public/content';

import { getCombinedSocialMediaStats } from '../api/metaGraphAPI';
import { runDeactivationJobs } from '../tasks/cron/deactivateExpired';
import { generatePDF } from '../services/pdfService';
import { createLogger } from '../_core/logger';
import { hasRolePermission } from '../services/rolePermissionService';

const logger = createLogger('routers');

export const appRouter = router({
  broadcast: broadcastRouter,
  broadcastData: broadcastDataV2Router,
  broadcastExecute: broadcastExecuteRouter,
  broadcastScheduling: broadcastSchedulingRouter,
  googleSync: googleSyncRouter,
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
  socialInbox: socialInboxRouter,
  metaIntegration: metaIntegrationRouter,
  generalIntegrations: generalIntegrationsRouter,
  integrationConnections: integrationConnectionsRouter,
  metaOperations: metaOperationsRouter,
  webhooks: webhooksRouter,
  queue: queueRouter,
  content: contentRouter,
  publicContent: publicContentRouter,
  notifications: notificationsRouter,

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

  // Departments router
  departments: departmentsRouter,

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
    getStats: permissionProcedure('reports.view', 'عرض تحليلات القنوات').query(async () => {
      const stats = await getCombinedSocialMediaStats();
      return stats;
    }),
  }),

  accessRequests: router({
    list: permissionProcedure('users.access_requests.view', 'عرض طلبات الوصول').query(async () => {
      return getAllAccessRequests();
    }),

    pending: permissionProcedure('users.access_requests.view', 'عرض طلبات الوصول المعلقة').query(
      async () => {
        return getPendingAccessRequests();
      }
    ),

    approve: permissionProcedure('users.access_requests.decide', 'اتخاذ قرار في طلبات الوصول')
      .input(z.object({ requestId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const approved = await approveAccessRequest(input.requestId, ctx.user.id);
        const db = await ensureDatabaseAvailable();
        void createNotification(db, {
          userId: approved.approvedUserId,
          source: 'security',
          type: 'approval_approved',
          title: 'تمت الموافقة على طلب الوصول',
          message: 'تمت الموافقة على طلب وصولك. يمكنك الآن تسجيل الدخول إلى لوحة التحكم.',
          entityType: 'access_request',
          entityId: input.requestId,
          actionUrl: '/admin',
          actionLabel: 'فتح لوحة التحكم',
          priority: 'high',
          data: JSON.stringify({ event: 'access_request_approved', requestId: input.requestId }),
        }).catch(() => undefined);

        void notifyOwner({
          title: 'تم الموافقة على طلب تصريح',
          content: `تمت الموافقة على طلب التصريح رقم ${input.requestId}`,
        }).catch(() => undefined);

        return { success: true };
      }),

    reject: permissionProcedure('users.access_requests.decide', 'اتخاذ قرار في طلبات الوصول')
      .input(z.object({ requestId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await rejectAccessRequest(input.requestId, ctx.user.id);
        void notifyOwner({
          title: 'تم رفض طلب تصريح',
          content: `تمت معالجة طلب التصريح رقم ${input.requestId} بالرفض.`,
        }).catch(() => undefined);
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
  sidebarBadges: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await ensureDatabaseAvailable();
      const [canViewLeads, canViewTasks, canViewCommunications, canManageUsers] = await Promise.all(
        [
          hasRolePermission(db, ctx.user.id, ctx.user.role, 'leads.view'),
          hasRolePermission(db, ctx.user.id, ctx.user.role, 'tasks.view'),
          hasRolePermission(db, ctx.user.id, ctx.user.role, 'communications.view'),
          hasRolePermission(db, ctx.user.id, ctx.user.role, 'users.manage'),
        ]
      );
      const { getLeadsStats } = await import('../database/db');
      const { getTasksStats } = await import('../database/db/tasks');
      const { getUnreadWhatsAppConversationsCount } = await import('../database/db');
      const { getPendingAccessRequests } = await import('../database/db');

      const [leadsStats, tasksStats, whatsappUnread, pendingAccess] = await Promise.allSettled([
        canViewLeads ? getLeadsStats() : Promise.resolve(undefined),
        canViewTasks ? getTasksStats() : Promise.resolve(undefined),
        canViewCommunications ? getUnreadWhatsAppConversationsCount() : Promise.resolve(undefined),
        canManageUsers ? getPendingAccessRequests() : Promise.resolve(undefined),
      ]);

      const badges: Partial<Record<'leads' | 'tasks' | 'whatsapp' | 'management', number>> = {};
      if (canViewLeads && leadsStats.status === 'fulfilled' && leadsStats.value) {
        badges.leads = Number(leadsStats.value.new) || 0;
      }
      if (canViewTasks && tasksStats.status === 'fulfilled' && tasksStats.value) {
        badges.tasks =
          (Number(tasksStats.value.todo) || 0) + (Number(tasksStats.value.overdue) || 0);
      }
      if (canViewCommunications && whatsappUnread.status === 'fulfilled') {
        badges.whatsapp = Number(whatsappUnread.value) || 0;
      }
      if (canManageUsers && pendingAccess.status === 'fulfilled' && pendingAccess.value) {
        badges.management = pendingAccess.value.length;
      }
      return badges;
    } catch (error) {
      logger.error('Error fetching badge counts:', error);
      return {};
    }
  }),

  // Export to PDF
  export: router({
    generatePDF: permissionProcedure('reports.export', 'تصدير التقارير')
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
