import { z } from 'zod';
import { router } from '../_core/trpc';
import {
  getSocialPlatformIntegrationStatuses,
  saveSocialPlatformIntegrationSettings,
} from '../database/db';
import { permissionProcedure } from './permissionProcedures';

const platformSchema = z.enum(['x', 'linkedin', 'youtube', 'tiktok']);
const integrationSettingsProcedure = permissionProcedure(
  'settings.manage',
  'إدارة إعدادات التكاملات'
);

export const generalIntegrationsRouter = router({
  status: integrationSettingsProcedure.query(() => getSocialPlatformIntegrationStatuses()),
  save: integrationSettingsProcedure
    .input(
      z.object({
        platform: platformSchema,
        clientId: z.string().trim().max(255).optional(),
        clientSecret: z.string().trim().max(10000).optional(),
        requestedScopes: z.string().trim().max(2000).optional(),
        isEnabled: z.boolean().optional(),
      })
    )
    .mutation(({ ctx, input }) => saveSocialPlatformIntegrationSettings(input, ctx.user.id)),
});
