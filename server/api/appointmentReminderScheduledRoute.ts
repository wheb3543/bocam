import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { appointmentReminderSchedules } from '../../drizzle/schema';
import { ensureDatabaseAvailable } from '../_core/databaseGuard';
import { sdk } from '../_core/sdk';
import { runAppointmentReminderJobs } from '../tasks/cron/appointmentReminders';

export function createAppointmentReminderScheduledRouter() {
  const router = Router();
  router.post('/api/scheduled/appointment-reminders', async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req);
      if (!user.isCron || !user.taskUid) {
        return res.status(403).json({ error: 'cron-only' });
      }
      const db = await ensureDatabaseAvailable();
      const [schedule] = await db
        .select()
        .from(appointmentReminderSchedules)
        .where(eq(appointmentReminderSchedules.scheduleCronTaskUid, user.taskUid))
        .limit(1);
      if (!schedule || schedule.enabled !== 'yes') {
        return res.json({ ok: true, skipped: 'disabled_or_orphan' });
      }
      const result = await runAppointmentReminderJobs();
      await db
        .update(appointmentReminderSchedules)
        .set({ lastRunAt: new Date(), updatedAt: new Date() })
        .where(eq(appointmentReminderSchedules.id, schedule.id));
      return res.json({ ok: true, result });
    } catch (error) {
      return res.status(500).json({
        error: error instanceof Error ? error.message : String(error),
        context: { path: '/api/scheduled/appointment-reminders' },
        timestamp: new Date().toISOString(),
      });
    }
  });
  return router;
}
