import { Router, type Request, type Response } from 'express';
import { createLogger } from '../_core/logger';
import { completeMetaBusinessOAuth } from '../integrations/meta/metaBusinessOAuth';

const logger = createLogger('meta-business-oauth-callback');
const successPath = '/admin/communications/integration-settings?metaConnection=success';
const cancelledPath = '/admin/communications/integration-settings?metaConnection=cancelled';
const failedPath = '/admin/communications/integration-settings?metaConnection=failed';

function safeBaseUrl(req: Request) {
  const host = req.get('host');
  if (!host || !/^[a-z0-9.-]+(?::\d+)?$/i.test(host)) {
    return null;
  }
  return `${req.protocol === 'http' ? 'http' : 'https'}://${host}`;
}

/**
 * GET /api/integrations/meta/callback
 * يتلقى code وstate فقط من Meta، ولا يعرض أي رمز أو تفاصيل داخلية عند إعادة التوجيه إلى الواجهة.
 */
export function createMetaBusinessOAuthCallbackRouter() {
  const router = Router();
  router.get('/api/integrations/meta/callback', async (req: Request, res: Response) => {
    const baseUrl = safeBaseUrl(req);
    if (!baseUrl) {
      res.status(400).send('Invalid callback host');
      return;
    }
    const state = typeof req.query.state === 'string' ? req.query.state : null;
    const code = typeof req.query.code === 'string' ? req.query.code : null;
    const providerError = typeof req.query.error === 'string' ? req.query.error : null;

    if (providerError || !code || !state) {
      logger.warn('ألغى المستخدم أو رفض Meta تفويض الاتصال.', {
        providerError: providerError ?? null,
      });
      res.redirect(302, `${baseUrl}${cancelledPath}`);
      return;
    }

    try {
      await completeMetaBusinessOAuth({ code, state });
      res.redirect(302, `${baseUrl}${successPath}`);
    } catch (error) {
      logger.error('تعذر إكمال callback لتفويض Meta.', error);
      res.redirect(302, `${baseUrl}${failedPath}`);
    }
  });
  return router;
}
