import { Router } from 'express';
import { dispatchDueSocialPublishPosts } from '../database/db/socialPublishing';
import { sdk } from '../_core/sdk';

/**
 * معالج Heartbeat للنشر المجدول. يعتمد هوية المهمة الصادرة من المنصة ولا يثق
 * بأي معرف منشور قادم في جسم الطلب، ما يمنع تشغيل منشور لا يخص المهمة المجدولة.
 */
export function createSocialPublishingScheduledRouter() {
  const router = Router();

  router.post('/api/scheduled/social-publish', async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req);
      if (!user.isCron || !user.taskUid) {
        return res.status(403).json({ error: 'cron-only' });
      }
      const result = await dispatchDueSocialPublishPosts(user.taskUid);
      return res.json({ ok: true, taskUid: user.taskUid, ...result });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return res.status(500).json({
        error: message,
        context: { path: '/api/scheduled/social-publish' },
        timestamp: new Date().toISOString(),
      });
    }
  });

  return router;
}
