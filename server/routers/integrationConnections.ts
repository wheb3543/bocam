import { router } from '../_core/trpc';
import { z } from 'zod';
import {
  disconnectIntegrationConnection,
  getIntegrationConnectionsOverview,
  setIntegrationAssetSelected,
} from '../database/db';
import {
  completeWhatsAppEmbeddedSignup,
  startMetaBusinessOAuth,
  startWhatsAppEmbeddedSignup,
} from '../integrations/meta/metaBusinessOAuth';
import { startExternalPlatformOAuth } from '../integrations/external/externalPlatformOAuth';
import { permissionProcedure } from './permissionProcedures';

const integrationsViewProcedure = permissionProcedure('integrations.view', 'عرض اتصالات التكامل');
const integrationsConnectProcedure = permissionProcedure('integrations.connect', 'ربط التكاملات');
const integrationsDisconnectProcedure = permissionProcedure(
  'integrations.disconnect',
  'فصل التكاملات'
);

function callbackUri(req: { protocol?: string; get: (header: string) => string | undefined }) {
  const host = req.get('host');
  if (!host || !/^[a-z0-9.-]+(?::\d+)?$/i.test(host)) {
    throw new Error('تعذر تحديد عنوان callback الآمن للتكامل.');
  }
  const protocol = req.protocol === 'http' ? 'http' : 'https';
  return `${protocol}://${host}/api/integrations/meta/callback`;
}

function externalCallbackUri(
  req: { protocol?: string; get: (header: string) => string | undefined },
  provider: 'x' | 'linkedin' | 'youtube' | 'tiktok'
) {
  const host = req.get('host');
  if (!host || !/^[a-z0-9.-]+(?::\d+)?$/i.test(host)) {
    throw new Error('تعذر تحديد عنوان callback الآمن للتكامل.');
  }
  const protocol = req.protocol === 'http' ? 'http' : 'https';
  return `${protocol}://${host}/api/integrations/external/${provider}/callback`;
}

export const integrationConnectionsRouter = router({
  overview: integrationsViewProcedure.query(() => getIntegrationConnectionsOverview()),

  startMetaBusiness: integrationsConnectProcedure.mutation(async ({ ctx }) => {
    return startMetaBusinessOAuth({
      initiatedByUserId: ctx.user.id,
      redirectUri: callbackUri(ctx.req),
    });
  }),

  startWhatsAppEmbeddedSignup: integrationsConnectProcedure.mutation(async ({ ctx }) => {
    return startWhatsAppEmbeddedSignup({
      initiatedByUserId: ctx.user.id,
      redirectUri: callbackUri(ctx.req),
    });
  }),

  startExternalOAuth: integrationsConnectProcedure
    .input(z.object({ provider: z.enum(['x', 'linkedin', 'youtube', 'tiktok']) }))
    .mutation(({ ctx, input }) =>
      startExternalPlatformOAuth({
        provider: input.provider,
        initiatedByUserId: ctx.user.id,
        redirectUri: externalCallbackUri(ctx.req, input.provider),
      })
    ),

  completeWhatsAppEmbeddedSignup: integrationsConnectProcedure
    .input(
      z.object({
        code: z.string().trim().min(4).max(4096),
        state: z.string().trim().min(16).max(512),
        wabaId: z.string().trim().min(1).max(255),
        phoneNumberId: z.string().trim().min(1).max(255),
      })
    )
    .mutation(({ input }) => completeWhatsAppEmbeddedSignup(input)),

  setAssetSelected: integrationsConnectProcedure
    .input(z.object({ assetId: z.number().int().positive(), isSelected: z.boolean() }))
    .mutation(async ({ input }) => {
      await setIntegrationAssetSelected(input.assetId, input.isSelected);
      return { success: true };
    }),

  disconnect: integrationsDisconnectProcedure
    .input(z.object({ connectionId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      await disconnectIntegrationConnection(input.connectionId, ctx.user.id);
      return { success: true };
    }),
});
