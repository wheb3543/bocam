/**
 * Offer Leads Stats Router
 * Router للإحصائيات
 */

import { protectedProcedure, router } from '../../_core/trpc';
import { getDb } from '../../database/db';
import { offerLeads } from '../../../drizzle/schema';
import { serverCache, CacheKeys, CacheTTL } from '../../services/cache';

export const offerStatsRouter = router({
  // Get stats for offer leads (protected)
  stats: protectedProcedure.query(async () => {
    return serverCache.getOrCompute(CacheKeys.offerLeadStats(), CacheTTL.STATS, async () => {
      const db = await getDb();
      if (!db) {
        return {
          total: 0,
          pending: 0,
          contacted: 0,
          no_answer: 0,
          confirmed: 0,
          attended: 0,
          completed: 0,
          cancelled: 0,
        };
      }

      const all = await db.select().from(offerLeads);

      return {
        total: all.length,
        pending: all.filter((l) => l.status === 'pending').length,
        contacted: all.filter((l) => l.status === 'contacted').length,
        no_answer: all.filter((l) => l.status === 'no_answer').length,
        confirmed: all.filter((l) => l.status === 'confirmed').length,
        attended: all.filter((l) => l.status === 'attended').length,
        completed: all.filter((l) => l.status === 'completed').length,
        cancelled: all.filter((l) => l.status === 'cancelled').length,
      };
    });
  }),
});
