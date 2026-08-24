import { Router } from 'express';
import { sdk } from '../_core/sdk';
import { dispatchDailyUnreadNotificationDigests } from '../services/notificationDigestService';

export function createNotificationDigestScheduledRouter() {
  const router = Router();
  router.post('/api/scheduled/notification-digest', async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req);
      if (!user.isCron || !user.taskUid) {
        return res.status(403).json({ error: 'cron-only' });
      }
      const digest = await dispatchDailyUnreadNotificationDigests(user.taskUid);
      return res.json({ ok: true, taskUid: user.taskUid, digest });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return res
        .status(500)
        .json({
          error: message,
          context: { path: '/api/scheduled/notification-digest' },
          timestamp: new Date().toISOString(),
        });
    }
  });
  return router;
}
