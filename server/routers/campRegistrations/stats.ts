/**
 * Camp Registrations Stats Router
 * Router للإحصائيات
 */

import { protectedProcedure, router } from '../../_core/trpc';
import { ensureDatabaseAvailable } from '../../_core/databaseGuard';
import { campRegistrations } from '../../../drizzle/schema';
import { serverCache, CacheKeys, CacheTTL } from '../../services/cache';

export const campStatsRouter = router({
  // Get stats for camp registrations (protected)
  stats: protectedProcedure.query(async () => {
    return serverCache.getOrCompute(CacheKeys.campRegistrationStats(), CacheTTL.STATS, async () => {
      const db = await ensureDatabaseAvailable();

      const all = await db.select().from(campRegistrations);

      const confirmedPipeline = all.filter(
        (r) => r.status === 'confirmed' || r.status === 'attended' || r.status === 'completed'
      ).length;
      return {
        total: all.length,
        pending: all.filter((r) => r.status === 'pending').length,
        confirmed: confirmedPipeline,
        attended: all.filter((r) => r.status === 'attended').length,
        cancelled: all.filter((r) => r.status === 'cancelled').length,
      };
    });
  }),
});
