import { Router, type Request, type Response } from 'express';
import { createLogger } from '../_core/logger';
import { completeExternalPlatformOAuth } from '../integrations/external/externalPlatformOAuth';

const logger = createLogger('external-platform-oauth-callback');
const providers = new Set(['x', 'linkedin', 'youtube', 'tiktok']);

function safeBaseUrl(req: Request) {
  const host = req.get('host');
  if (!host || !/^[a-z0-9.-]+(?::\d+)?$/i.test(host)) {
    return null;
  }
  return `${req.protocol === 'http' ? 'http' : 'https'}://${host}`;
}

export function createExternalPlatformOAuthCallbackRouter() {
  const router = Router();
  router.get(
    '/api/integrations/external/:provider/callback',
    async (req: Request, res: Response) => {
      const baseUrl = safeBaseUrl(req);
      const provider = String(req.params.provider);
      if (!baseUrl || !providers.has(provider)) {
        res.status(400).send('Invalid OAuth callback');
        return;
      }
      const state = typeof req.query.state === 'string' ? req.query.state : null;
      const code = typeof req.query.code === 'string' ? req.query.code : null;
      const rejected = typeof req.query.error === 'string' ? req.query.error : null;
      const redirect = new URL('/admin/communications/integration-settings', baseUrl);
      redirect.searchParams.set('externalProvider', provider);
      if (rejected || !state || !code) {
        redirect.searchParams.set('externalConnection', 'cancelled');
        res.redirect(302, redirect.toString());
        return;
      }
      try {
        await completeExternalPlatformOAuth({
          provider: provider as 'x' | 'linkedin' | 'youtube' | 'tiktok',
          code,
          state,
        });
        redirect.searchParams.set('externalConnection', 'success');
      } catch (error) {
        logger.error(`تعذر إكمال callback لمنصة ${provider}.`, error);
        redirect.searchParams.set('externalConnection', 'failed');
      }
      res.redirect(302, redirect.toString());
    }
  );
  return router;
}
