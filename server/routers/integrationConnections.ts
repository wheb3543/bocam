import { adminProcedure, router } from '../_core/trpc';
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

function callbackUri(req: { protocol?: string; get: (header: string) => string | undefined }) {
  const host = req.get('host');
  if (!host || !/^[a-z0-9.-]+(?::\d+)?$/i.test(host)) {
    throw new Error('تعذر تحديد عنوان callback الآمن للتكامل.');
  }
  const protocol = req.protocol === 'http' ? 'http' : 'https';
  return `${protocol}://${host}/api/integrations/meta/callback`;
}

export const integrationConnectionsRouter = router({
  overview: adminProcedure.query(() => getIntegrationConnectionsOverview()),

  startMetaBusiness: adminProcedure.mutation(async ({ ctx }) => {
    return startMetaBusinessOAuth({
      initiatedByUserId: ctx.user.id,
      redirectUri: callbackUri(ctx.req),
    });
  }),

  startWhatsAppEmbeddedSignup: adminProcedure.mutation(async ({ ctx }) => {
    return startWhatsAppEmbeddedSignup({
      initiatedByUserId: ctx.user.id,
      redirectUri: callbackUri(ctx.req),
    });
  }),

  completeWhatsAppEmbeddedSignup: adminProcedure
    .input(
      z.object({
        code: z.string().trim().min(4).max(4096),
        state: z.string().trim().min(16).max(512),
        wabaId: z.string().trim().min(1).max(255),
        phoneNumberId: z.string().trim().min(1).max(255),
      })
    )
    .mutation(({ input }) => completeWhatsAppEmbeddedSignup(input)),

  setAssetSelected: adminProcedure
    .input(z.object({ assetId: z.number().int().positive(), isSelected: z.boolean() }))
    .mutation(async ({ input }) => {
      await setIntegrationAssetSelected(input.assetId, input.isSelected);
      return { success: true };
    }),

  disconnect: adminProcedure
    .input(z.object({ connectionId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      await disconnectIntegrationConnection(input.connectionId, ctx.user.id);
      return { success: true };
    }),
});
