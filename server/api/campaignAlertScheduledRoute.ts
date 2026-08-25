import { Router } from 'express';
import { sdk } from '../_core/sdk';
import { dispatchCampaignAlerts } from '../services/campaignNotificationService';

export function createCampaignAlertScheduledRouter() {
  const router = Router();
  router.post('/api/scheduled/campaign-alerts', async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req);
      if (!user.isCron || !user.taskUid) {
        return res.status(403).json({ error: 'cron-only' });
      }
      return res.json({ ok: true, result: await dispatchCampaignAlerts(user.taskUid) });
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : String(error),
        context: { path: '/api/scheduled/campaign-alerts' },
        timestamp: new Date().toISOString(),
      });
    }
  });
  return router;
}
