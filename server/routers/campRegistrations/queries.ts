/**
 * Camp Registrations Queries Router
 * Router للاستعلامات عن التسجيلات
 */

import { eq, desc } from 'drizzle-orm';
import { router } from '../../_core/trpc';
import { getDb } from '../../database/db';
import { permissionProcedure } from '../permissionProcedures';
import { campRegistrations } from '../../../drizzle/schema';
import { serverCache, CacheKeys, CacheTTL } from '../../services/cache';
import { listPaginatedCampRegistrationsSchema } from '../campRegistrationSchemas';

const registrationsViewProcedure = permissionProcedure(
  'registrations.view',
  'عرض تسجيلات المخيمات'
);

export const campQueriesRouter = router({
  // List all camp registrations (protected)
  list: registrationsViewProcedure.query(async () => {
    return serverCache.getOrCompute('list:campRegistrations', CacheTTL.LIST, async () => {
      const db = await getDb();
      if (!db) {
        return [];
      }

      const { camps } = await import('../../../drizzle/schema');

      const results = await db
        .select({
          id: campRegistrations.id,
          campId: campRegistrations.campId,
          campName: camps.name,
          campSlug: camps.slug,
          fullName: campRegistrations.fullName,
          phone: campRegistrations.phone,
          email: campRegistrations.email,
          age: campRegistrations.age,
          procedures: campRegistrations.procedures,
          medicalCondition: campRegistrations.medicalCondition,
          notes: campRegistrations.notes,
          patientMessage: campRegistrations.patientMessage,
          source: campRegistrations.source,
          status: campRegistrations.status,
          preferredDate: campRegistrations.preferredDate,
          preferredTimeSlot: campRegistrations.preferredTimeSlot,
          createdAt: campRegistrations.createdAt,
          updatedAt: campRegistrations.updatedAt,
        })
        .from(campRegistrations)
        .leftJoin(camps, eq(camps.id, campRegistrations.campId))
        .orderBy(desc(campRegistrations.createdAt));

      return results;
    });
  }),

  // List camp registrations with pagination (protected)
  listPaginated: registrationsViewProcedure
    .input(listPaginatedCampRegistrationsSchema)
    .query(async ({ input }) => {
      const cacheKey = CacheKeys.campRegistrationsPaginated(input);
      return serverCache.getOrCompute(cacheKey, CacheTTL.PAGINATED, async () => {
        const { getCampRegistrationsPaginated } = await import('../../database/db');
        return getCampRegistrationsPaginated(
          input.page,
          input.limit,
          input.searchTerm,
          input.campIds,
          input.sources,
          input.statuses,
          input.dateFilter,
          input.dateFrom,
          input.dateTo
        );
      });
    }),
});
