import { Router } from 'express';
import { sdk } from '../_core/sdk';
import { publishDueCmsContent } from '../services/content/deferredPublicationService';

/**
 * معالج Heartbeat المشروع للنشر المؤجل. لا يقرأ أي معرفات من جسم الطلب؛
 * هوية المهمة الموثوقة هي المصدر الوحيد لسياق التنفيذ والتدقيق.
 */
export function createCmsPublishingScheduledRouter() {
  const router = Router();

  router.post('/api/scheduled/cms-publish', async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req);
      if (!user.isCron || !user.taskUid) {
        return res.status(403).json({ error: 'cron-only' });
      }

      const publishing = await publishDueCmsContent(user.taskUid);
      return res.json({ ok: true, taskUid: user.taskUid, publishing });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return res.status(500).json({
        error: message,
        context: { path: '/api/scheduled/cms-publish' },
        timestamp: new Date().toISOString(),
      });
    }
  });

  return router;
}
