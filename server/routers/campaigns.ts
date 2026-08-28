import { z } from 'zod';
import { router } from '../_core/trpc';
import {
  getCampaigns,
  getCampaignById,
  getCampaignBySlug,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getCampaignStats,
  getCampaignsOverview,
  getCampaignAllLinks,
  linkOffersToCampaign,
  linkCampsToCampaign,
  linkDoctorsToCampaign,
} from '../database/db/campaigns';
import { notifyCampaignLeaderAssigned } from '../services/campaignNotificationService';
import { assertRolePermission, permissionProcedure } from './permissionProcedures';

// Validation schemas
const campaignTypeSchema = z.enum(['digital', 'field', 'awareness', 'mixed']);
const campaignStatusSchema = z.enum(['draft', 'active', 'paused', 'completed', 'cancelled']);

const createCampaignSchema = z.object({
  name: z.string().min(1, 'اسم الحملة مطلوب'),
  slug: z.string().min(1, 'الرابط المختصر مطلوب'),
  description: z.string().optional(),
  type: campaignTypeSchema,
  status: campaignStatusSchema.optional(),
  plannedBudget: z.number().optional(),
  actualBudget: z.number().optional(),
  currency: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  platforms: z.string().optional(), // JSON string
  goals: z.string().optional(), // JSON string
  targetLeads: z.number().optional(),
  targetBookings: z.number().optional(),
  targetROI: z.number().optional(),
  targetRevenue: z.number().optional(),
  kpis: z.string().optional(),
  notes: z.string().optional(),
  teamLeaderId: z.number().optional(),
  teamMembers: z.string().optional(), // JSON string
  metaPixelId: z.string().optional(),
  metaAccessToken: z.string().optional(),
  whatsappEnabled: z.boolean().optional(),
  whatsappWelcomeMessage: z.string().optional(),
});

const updateCampaignSchema = createCampaignSchema.partial().extend({
  id: z.number(),
  targetRevenue: z.number().optional(),
  kpis: z.string().optional(),
  notes: z.string().optional(),
});

const campaignsViewProcedure = permissionProcedure('campaigns.view', 'عرض الحملات');
const campaignsCreateProcedure = permissionProcedure('campaigns.create', 'إنشاء الحملات');
const campaignsUpdateProcedure = permissionProcedure('campaigns.update', 'تعديل الحملات');
const campaignsDeleteProcedure = permissionProcedure('campaigns.delete', 'حذف الحملات');
const campaignsLinksProcedure = permissionProcedure('campaigns.links.manage', 'ربط عناصر الحملة');

async function assertCampaignFieldPermissions(
  user: { id: number; role: string },
  input: Partial<z.infer<typeof createCampaignSchema>>
) {
  if (
    input.plannedBudget !== undefined ||
    input.actualBudget !== undefined ||
    input.currency !== undefined
  ) {
    await assertRolePermission(user, 'campaigns.budget.manage', 'إدارة ميزانية الحملة');
  }

  if (
    input.goals !== undefined ||
    input.targetLeads !== undefined ||
    input.targetBookings !== undefined ||
    input.targetROI !== undefined ||
    input.targetRevenue !== undefined ||
    input.kpis !== undefined
  ) {
    await assertRolePermission(user, 'campaigns.metrics.manage', 'إدارة مقاييس الحملة');
  }

  if (input.metaAccessToken !== undefined) {
    await assertRolePermission(
      user,
      'integrations.credentials.manage',
      'إدارة بيانات اعتماد التكاملات'
    );
  }
}

export const campaignsRouter = router({
  // Get all campaigns with filters
  list: campaignsViewProcedure
    .input(
      z
        .object({
          status: z.string().optional(),
          type: z.string().optional(),
          search: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      return getCampaigns(input);
    }),

  // Get campaign by ID
  getById: campaignsViewProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    return getCampaignById(input.id);
  }),

  // Get campaign by slug
  getBySlug: campaignsViewProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      return getCampaignBySlug(input.slug);
    }),

  // Create campaign
  create: campaignsCreateProcedure.input(createCampaignSchema).mutation(async ({ input, ctx }) => {
    await assertCampaignFieldPermissions(ctx.user, input);
    const created = await createCampaign(
      input as typeof import('../../drizzle/schema').campaigns.$inferInsert
    );
    const campaignId = Number(created[0].insertId);
    if (input.teamLeaderId && input.teamLeaderId !== ctx.user.id) {
      void notifyCampaignLeaderAssigned({
        userId: input.teamLeaderId,
        campaignId,
        campaignName: input.name,
      }).catch(() => undefined);
    }
    return created;
  }),

  // Update campaign
  update: campaignsUpdateProcedure.input(updateCampaignSchema).mutation(async ({ input, ctx }) => {
    const { id, ...data } = input;
    await assertCampaignFieldPermissions(ctx.user, data);
    const existing = await getCampaignById(id);
    const updated = await updateCampaign(id, {
      ...data,
      ...(data.endDate !== undefined && data.endDate?.getTime() !== existing?.endDate?.getTime()
        ? { endDateNotifiedAt: null }
        : {}),
    } as Partial<typeof import('../../drizzle/schema').campaigns.$inferInsert>);
    if (
      data.teamLeaderId !== undefined &&
      data.teamLeaderId !== null &&
      data.teamLeaderId !== ctx.user.id &&
      data.teamLeaderId !== existing?.teamLeaderId
    ) {
      void notifyCampaignLeaderAssigned({
        userId: data.teamLeaderId,
        campaignId: id,
        campaignName: updated?.name ?? existing?.name ?? 'الحملة',
      }).catch(() => undefined);
    }
    return updated;
  }),

  // Delete campaign
  delete: campaignsDeleteProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return deleteCampaign(input.id);
    }),

  // Get campaign statistics
  getStats: campaignsViewProcedure
    .input(z.object({ campaignId: z.number() }))
    .query(async ({ input }) => {
      return getCampaignStats(input.campaignId);
    }),

  // Get campaigns overview
  getOverview: campaignsViewProcedure.query(async () => {
    return getCampaignsOverview();
  }),

  // Get all campaign links (offers, camps, doctors)
  getLinks: campaignsViewProcedure
    .input(z.object({ campaignId: z.number() }))
    .query(async ({ input }) => {
      return getCampaignAllLinks(input.campaignId);
    }),

  // Link offers to campaign
  linkOffers: campaignsLinksProcedure
    .input(
      z.object({
        campaignId: z.number(),
        offerIds: z.array(z.number()),
      })
    )
    .mutation(async ({ input }) => {
      return linkOffersToCampaign(input.campaignId, input.offerIds);
    }),

  // Link camps to campaign
  linkCamps: campaignsLinksProcedure
    .input(
      z.object({
        campaignId: z.number(),
        campIds: z.array(z.number()),
      })
    )
    .mutation(async ({ input }) => {
      return linkCampsToCampaign(input.campaignId, input.campIds);
    }),

  // Link doctors to campaign
  linkDoctors: campaignsLinksProcedure
    .input(
      z.object({
        campaignId: z.number(),
        doctorIds: z.array(z.number()),
      })
    )
    .mutation(async ({ input }) => {
      return linkDoctorsToCampaign(input.campaignId, input.doctorIds);
    }),
});
