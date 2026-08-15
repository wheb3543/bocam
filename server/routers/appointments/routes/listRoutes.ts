/**
 * List Appointments Routes
 * مسارات قوائم المواعيد
 */

import { serverCache, CacheKeys, CacheTTL } from '../../../services/cache';
import { getAllAppointments } from '../../../database/db';

export const listRoutes = {
  list: async () => {
    return serverCache.getOrCompute('list:appointments', CacheTTL.LIST, () => getAllAppointments());
  },

  listPaginated: async ({ input }: { input: Record<string, unknown> }) => {
    const cacheKey = CacheKeys.appointmentsPaginated(input);
    return serverCache.getOrCompute(cacheKey, CacheTTL.PAGINATED, async () => {
      const { getAppointmentsPaginated } = await import('../../../database/db');
      return getAppointmentsPaginated(
        input.page as number,
        input.limit as number,
        input.searchTerm as string | undefined,
        input.doctorIds as number[] | undefined,
        input.sources as string[] | undefined,
        input.statuses as string[] | undefined,
        input.dateFilter as 'all' | 'today' | 'week' | 'month' | undefined,
        input.dateFrom as string | undefined,
        input.dateTo as string | undefined
      );
    });
  },
};
