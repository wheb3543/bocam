import { Router } from 'express';
import { sdk } from '../_core/sdk';
import { dispatchIntegrationExpiryAlerts } from '../services/integrationNotificationService';

export function createIntegrationAlertScheduledRouter() {
  const router = Router();
  router.post('/api/scheduled/integration-alerts', async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req);
      if (!user.isCron || !user.taskUid) {
        return res.status(403).json({ error: 'cron-only' });
      }
      const result = await dispatchIntegrationExpiryAlerts(user.taskUid);
      return res.json({ ok: true, taskUid: user.taskUid, result });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return res.status(500).json({
        error: message,
        context: { path: '/api/scheduled/integration-alerts' },
        timestamp: new Date().toISOString(),
      });
    }
  });
  return router;
}
