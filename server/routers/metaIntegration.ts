import { z } from 'zod';
import { adminProcedure, router } from '../_core/trpc';
import { getMetaIntegrationSettingsStatus, saveMetaIntegrationSettings } from '../database/db';

const optionalText = z.string().trim().max(10000).optional();

export const metaIntegrationRouter = router({
  status: adminProcedure.query(() => getMetaIntegrationSettingsStatus()),

  save: adminProcedure
    .input(
      z.object({
        appId: z.string().trim().max(255).optional(),
        facebookLoginConfigId: z.string().trim().max(255).optional(),
        whatsappEmbeddedSignupConfigId: z.string().trim().max(255).optional(),
        facebookPageId: z.string().trim().max(255).optional(),
        instagramAccountId: z.string().trim().max(255).optional(),
        appSecret: optionalText,
        verifyToken: optionalText,
        pageAccessToken: optionalText,
        isEnabled: z.boolean().optional(),
      })
    )
    .mutation(({ ctx, input }) => saveMetaIntegrationSettings(input, ctx.user.id)),
});
