import { z } from 'zod';
import { adminProcedure, router } from '../_core/trpc';
import {
  getSocialPlatformIntegrationStatuses,
  saveSocialPlatformIntegrationSettings,
} from '../database/db';

const platformSchema = z.enum(['x', 'linkedin', 'youtube', 'tiktok']);

export const generalIntegrationsRouter = router({
  status: adminProcedure.query(() => getSocialPlatformIntegrationStatuses()),
  save: adminProcedure
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
