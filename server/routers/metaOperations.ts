import { z } from 'zod';
import { router } from '../_core/trpc';
import { getMetaOperationsOverview, upsertMetaLeadForm } from '../database/db';
import { permissionProcedure } from './permissionProcedures';

const integrationSettingsProcedure = permissionProcedure('settings.manage', 'إدارة عمليات Meta');

export const metaOperationsRouter = router({
  overview: integrationSettingsProcedure.query(() => getMetaOperationsOverview()),

  saveLeadForm: integrationSettingsProcedure
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
