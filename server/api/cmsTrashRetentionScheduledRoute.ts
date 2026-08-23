import { Router } from 'express';
import { sdk } from '../_core/sdk';
import { purgeExpiredCmsTrash } from '../services/content/trashRetentionService';

/**
 * معالج Heartbeat للحذف النهائي المؤجل. لا يقبل سياقاً من جسم الطلب، ويطابق
 * معرف المهمة الموثق مع المعرف المخزن في سياسة الاحتفاظ قبل حذف أي بيانات.
 */
export function createCmsTrashRetentionScheduledRouter() {
  const router = Router();

  router.post('/api/scheduled/cms-trash-retention', async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req);
      if (!user.isCron || !user.taskUid) {
        return res.status(403).json({ error: 'cron-only' });
      }

      const retention = await purgeExpiredCmsTrash(user.taskUid);
      return res.json({ ok: true, taskUid: user.taskUid, retention });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return res.status(500).json({
        error: message,
        context: { path: '/api/scheduled/cms-trash-retention' },
        timestamp: new Date().toISOString(),
      });
    }
  });

  return router;
}
