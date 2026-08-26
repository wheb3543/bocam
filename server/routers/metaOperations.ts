import { z } from 'zod';
import { router } from '../_core/trpc';
import { getMetaOperationsOverview, upsertMetaLeadForm } from '../database/db';
import { permissionProcedure } from './permissionProcedures';

const integrationsViewProcedure = permissionProcedure('integrations.view', 'عرض عمليات Meta');
const integrationsConnectProcedure = permissionProcedure(
  'integrations.connect',
  'إدارة ربط أصول Meta'
);

export const metaOperationsRouter = router({
  overview: integrationsViewProcedure.query(() => getMetaOperationsOverview()),

  saveLeadForm: integrationsConnectProcedure
    .input(
      z.object({
        connectionId: z.number().int().positive(),
        pageAssetId: z.number().int().positive().nullable().optional(),
        externalFormId: z.string().trim().min(1).max(255),
        externalPageId: z.string().trim().min(1).max(255),
        displayName: z.string().trim().max(255).nullable().optional(),
        campaignId: z.number().int().positive().nullable().optional(),
        fieldMapping: z.record(z.string(), z.string()).optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await upsertMetaLeadForm(input);
      return getMetaOperationsOverview();
    }),
});
