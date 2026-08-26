import { z } from 'zod';
import { router } from '../_core/trpc';
import { getMetaIntegrationSettingsStatus, saveMetaIntegrationSettings } from '../database/db';
import { permissionProcedure } from './permissionProcedures';

const optionalText = z.string().trim().max(10000).optional();
const integrationsViewProcedure = permissionProcedure('integrations.view', 'عرض إعدادات Meta');
const integrationCredentialsProcedure = permissionProcedure(
  'integrations.credentials.manage',
  'إدارة بيانات اعتماد Meta'
);

export const metaIntegrationRouter = router({
  status: integrationsViewProcedure.query(() => getMetaIntegrationSettingsStatus()),

  save: integrationCredentialsProcedure
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
