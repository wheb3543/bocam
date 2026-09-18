import { z } from 'zod';
import { publicProcedure, router } from '../../../_core/trpc';
import { ensureDatabaseAvailable } from '../../../_core/databaseGuard';
import { permissionProcedure } from '../../../routers/permissionProcedures';
import { doctors } from '../../../../drizzle/schema';
import { eq } from 'drizzle-orm';
import { serverCache, CacheKeys, CacheTTL } from '../../../services/cache';

const catalogCreateProcedure = permissionProcedure('catalog.create', 'إنشاء عناصر الكتالوج الطبي');
const catalogUpdateProcedure = permissionProcedure('catalog.update', 'تعديل عناصر الكتالوج الطبي');
const catalogPublishProcedure = permissionProcedure('catalog.publish', 'نشر عناصر الكتالوج الطبي');
const catalogDeleteProcedure = permissionProcedure('catalog.delete', 'حذف عناصر الكتالوج الطبي');

export const doctorsRouter = router({
  // List all doctors (public) - cached
  list: publicProcedure.query(async () => {
    return serverCache.getOrCompute(CacheKeys.doctorsList(), CacheTTL.LONG, async () => {
      const db = await ensureDatabaseAvailable();

      const results = await db.select().from(doctors);
      return results;
    });
  }),

  // Get doctor by ID (public)
  getById: publicProcedure.input(z.object({ id: z.number() })).query(async ({ input }) => {
    const db = await ensureDatabaseAvailable();

    const result = await db.select().from(doctors).where(eq(doctors.id, input.id)).limit(1);
    return result.length > 0 ? result[0] : null;
  }),

  // Get doctor by slug (public)
  getBySlug: publicProcedure.input(z.object({ slug: z.string() })).query(async ({ input }) => {
    const db = await ensureDatabaseAvailable();

    const result = await db.select().from(doctors).where(eq(doctors.slug, input.slug)).limit(1);
    return result.length > 0 ? result[0] : null;
  }),

  // Create doctor (protected)
  create: catalogCreateProcedure
    .input(
      z.object({
        name: z.string().min(1, 'الاسم مطلوب'),
        slug: z.string().min(1, 'الرابط مطلوب'),
        specialty: z.string().min(1, 'التخصص مطلوب'),
        image: z.string().optional(),
        bio: z.string().optional(),
        experience: z.string().optional(),
        languages: z.string().optional(),
        consultationFee: z.string().optional(),
        procedures: z.string().optional(),
        departmentId: z.number().nullable().optional(),
        isVisiting: z.enum(['yes', 'no']).default('no'),
        visitingStartDate: z.string().nullable().optional(),
        visitingEndDate: z.string().nullable().optional(),
        available: z.enum(['yes', 'no']).default('yes'),
      })
    )
    .mutation(async ({ input }) => {
      const db = await ensureDatabaseAvailable();

      const valuesToInsert = {
        ...input,
        visitingStartDate: input.visitingStartDate ? new Date(input.visitingStartDate) : null,
        visitingEndDate: input.visitingEndDate ? new Date(input.visitingEndDate) : null,
      };

      const doctor = await db.insert(doctors).values(valuesToInsert);

      // Invalidate doctors list cache
      serverCache.invalidate(CacheKeys.doctorsList());

      return { success: true, id: Number(doctor[0].insertId) };
    }),

  // Update doctor (protected)
  update: catalogUpdateProcedure
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1, 'الاسم مطلوب'),
        slug: z.string().min(1, 'الرابط مطلوب'),
        specialty: z.string().min(1, 'التخصص مطلوب'),
        image: z.string().optional(),
        bio: z.string().optional(),
        experience: z.string().optional(),
        languages: z.string().optional(),
        consultationFee: z.string().optional(),
        procedures: z.string().optional(),
        departmentId: z.number().nullable().optional(),
        isVisiting: z.enum(['yes', 'no']),
        visitingStartDate: z.string().nullable().optional(),
        visitingEndDate: z.string().nullable().optional(),
        available: z.enum(['yes', 'no']),
      })
    )
    .mutation(async ({ input }) => {
      const db = await ensureDatabaseAvailable();

      const { id, ...data } = input;
      const valuesToUpdate = {
        ...data,
        visitingStartDate: data.visitingStartDate ? new Date(data.visitingStartDate) : null,
        visitingEndDate: data.visitingEndDate ? new Date(data.visitingEndDate) : null,
      };

      await db.update(doctors).set(valuesToUpdate).where(eq(doctors.id, id));

      // Invalidate doctors list cache
      serverCache.invalidate(CacheKeys.doctorsList());

      return { success: true };
    }),

  // Delete doctor (protected)
  delete: catalogDeleteProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    const db = await ensureDatabaseAvailable();

    await db.delete(doctors).where(eq(doctors.id, input.id));

    // Invalidate doctors list cache
    serverCache.invalidate(CacheKeys.doctorsList());

    return { success: true };
  }),

  // Toggle doctor availability (protected)
  toggleAvailability: catalogPublishProcedure
    .input(
      z.object({
        id: z.number(),
        available: z.enum(['yes', 'no']),
      })
    )
    .mutation(async ({ input }) => {
      const db = await ensureDatabaseAvailable();

      await db.update(doctors).set({ available: input.available }).where(eq(doctors.id, input.id));

      // Invalidate doctors list cache
      serverCache.invalidate(CacheKeys.doctorsList());

      return { success: true };
    }),
});
