import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { updateCheckSchedules } from '../../drizzle/schema';
import { ensureDatabaseAvailable } from '../_core/databaseGuard';
import { sdk } from '../_core/sdk';
import { runScheduledUpdateCheck } from '../_core/updateChecker';

export function createUpdateCheckScheduledRouter() {
  const router = Router();

  router.post('/api/scheduled/update-checks', async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req);
      if (!user.isCron || !user.taskUid) {
        return res.status(403).json({ error: 'cron-only' });
      }

      const db = await ensureDatabaseAvailable();
      const [schedule] = await db
        .select()
        .from(updateCheckSchedules)
        .where(eq(updateCheckSchedules.scheduleCronTaskUid, user.taskUid))
        .limit(1);
      if (!schedule || schedule.enabled !== 'yes') {
        return res.json({ ok: true, skipped: 'orphan_or_disabled' });
      }

      const result = await runScheduledUpdateCheck();
      await db
        .update(updateCheckSchedules)
        .set({ lastRunAt: new Date() })
        .where(eq(updateCheckSchedules.id, schedule.id));
      return res.json({ ok: true, ...result });
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : 'فشل فحص التحديثات',
        timestamp: new Date().toISOString(),
      });
    }
  });

  return router;
}
