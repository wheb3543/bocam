/**
 * Offer Leads Queries Router
 * Router للاستعلامات عن العروض
 */

import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';
import { protectedProcedure, router } from '../../_core/trpc';
import { getDb } from '../../database/db';
import { offerLeads } from '../../../drizzle/schema';
import { serverCache, CacheKeys, CacheTTL } from '../../services/cache';

export const offerQueriesRouter = router({
  // List all offer leads (protected)
  list: protectedProcedure.query(async () => {
    return serverCache.getOrCompute('list:offerLeads', CacheTTL.LIST, async () => {
      const db = await getDb();
      if (!db) {
        return [];
      }

      const { offers } = await import('../../../drizzle/schema');

      const results = await db
        .select({
          id: offerLeads.id,
          offerId: offerLeads.offerId,
          offerTitle: offers.title,
          fullName: offerLeads.fullName,
          phone: offerLeads.phone,
          email: offerLeads.email,
          notes: offerLeads.notes,
          source: offerLeads.source,
          status: offerLeads.status,
          createdAt: offerLeads.createdAt,
          updatedAt: offerLeads.updatedAt,
        })
        .from(offerLeads)
        .leftJoin(offers, eq(offers.id, offerLeads.offerId))
        .orderBy(desc(offerLeads.createdAt));

      return results;
    });
  }),

  // List offer leads with pagination (protected)
  listPaginated: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100000).default(20),
        searchTerm: z.string().optional(),
        offerIds: z.array(z.number()).optional(),
        sources: z.array(z.string()).optional(),
        statuses: z.array(z.string()).optional(),
        dateFilter: z.enum(['all', 'today', 'week', 'month']).optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const cacheKey = CacheKeys.offerLeadsPaginated(input);
      return serverCache.getOrCompute(cacheKey, CacheTTL.PAGINATED, async () => {
        const { getOfferLeadsPaginated } = await import('../../database/db');
        return getOfferLeadsPaginated(
          input.page,
          input.limit,
          input.searchTerm,
          input.offerIds,
          input.sources,
          input.statuses,
          input.dateFilter,
          input.dateFrom,
          input.dateTo
        );
      });
    }),
});
