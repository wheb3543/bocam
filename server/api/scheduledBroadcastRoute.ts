import { Router } from 'express';
import { sdk } from '../_core/sdk';
import { broadcastSchedulerService } from '../services/broadcastSchedulerService';

export function createScheduledBroadcastRouter(): Router {
  const router = Router();
  router.post('/api/scheduled/broadcast', async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req);
      if (!user.isCron || !user.taskUid) {
        return res.status(403).json({ error: 'cron-only' });
      }
      const result = await broadcastSchedulerService.executeScheduledBroadcastByTaskUid(
        user.taskUid
      );
      return res.json(result);
    } catch (error) {
      const detail =
        error instanceof Error
          ? { message: error.message, stack: error.stack }
          : { message: String(error) };
      console.error('[ScheduledBroadcast] Failed', detail);
      return res.status(500).json({ error: detail, timestamp: new Date().toISOString() });
    }
  });
  return router;
}
