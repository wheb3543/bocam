/**
 * Departments Router
 * مسارات الأقسام والعيادات الطبية
 */

import { z } from 'zod';
import { eq, asc, and } from 'drizzle-orm';
import { publicProcedure, router } from '../../../_core/trpc';
import { ensureDatabaseAvailable } from '../../../_core/databaseGuard';
import { departments, doctors } from '../../../../drizzle/schema';
import { permissionProcedure } from '../../../routers/permissionProcedures';
import { serverCache, CacheTTL } from '../../../services/cache';

const catalogViewProcedure = permissionProcedure('catalog.view', 'عرض عناصر الكتالوج الطبي');
const catalogCreateProcedure = permissionProcedure('catalog.create', 'إنشاء عناصر الكتالوج الطبي');
const catalogUpdateProcedure = permissionProcedure('catalog.update', 'تعديل عناصر الكتالوج الطبي');
const catalogDeleteProcedure = permissionProcedure('catalog.delete', 'حذف عناصر الكتالوج الطبي');

const DEPARTMENTS_CACHE_KEY = 'departments:active:list';

export const departmentsRouter = router({
  /**
   * قائمة الأقسام النشطة (للمرضى والواجهة العامة)
   */
  list: publicProcedure.query(async () => {
    return serverCache.getOrCompute(DEPARTMENTS_CACHE_KEY, CacheTTL.LIST, async () => {
      const db = await ensureDatabaseAvailable();
      return db
        .select()
        .from(departments)
        .where(eq(departments.isActive, true))
        .orderBy(asc(departments.sortOrder), asc(departments.name));
    });
  }),

  /**
   * قائمة كافة الأقسام للوحة الإدارة
   */
  getAllAdmin: catalogViewProcedure.query(async () => {
    const db = await ensureDatabaseAvailable();
    const deptList = await db
      .select()
      .from(departments)
      .orderBy(asc(departments.sortOrder), asc(departments.name));

    // جلب عدد الأطباء في كل قسم
    const allDoctors = await db.select({ departmentId: doctors.departmentId }).from(doctors);
    const doctorCountMap = new Map<number, number>();
    for (const doc of allDoctors) {
      if (doc.departmentId) {
        doctorCountMap.set(doc.departmentId, (doctorCountMap.get(doc.departmentId) || 0) + 1);
      }
    }

    return deptList.map((d) => ({
      ...d,
      doctorCount: doctorCountMap.get(d.id) || 0,
    }));
  }),

  /**
   * جلب قسم بالرابط slug
   */
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string().min(1) }))
    .query(async ({ input }) => {
      const db = await ensureDatabaseAvailable();
      const [dept] = await db
        .select()
        .from(departments)
        .where(eq(departments.slug, input.slug))
        .limit(1);

      if (!dept) {
        return null;
      }

      // جلب أطباء القسم
      const deptDoctors = await db
        .select()
        .from(doctors)
        .where(and(eq(doctors.departmentId, dept.id), eq(doctors.available, 'yes')));

      return {
        ...dept,
        doctors: deptDoctors,
      };
    }),

  /**
   * إنشاء قسم جديد
   */
  create: catalogCreateProcedure
    .input(
      z.object({
        name: z.string().min(1, 'اسم القسم مطلوب'),
        nameEn: z.string().optional(),
        slug: z.string().min(1, 'الرابط التعريفي مطلوب'),
        description: z.string().optional(),
        icon: z.string().optional(),
        sortOrder: z.number().default(0),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      const db = await ensureDatabaseAvailable();

      const [existing] = await db
        .select({ id: departments.id })
        .from(departments)
        .where(eq(departments.slug, input.slug))
        .limit(1);

      if (existing) {
        throw new Error('الرابط التعريفي للقسم مستخدم مسبقاً');
      }

      const [res] = await db.insert(departments).values({
        name: input.name,
        nameEn: input.nameEn,
        slug: input.slug,
        description: input.description,
        icon: input.icon,
        sortOrder: input.sortOrder,
        isActive: input.isActive,
      });

      serverCache.invalidate(DEPARTMENTS_CACHE_KEY);
      return { success: true, id: Number(res.insertId) };
    }),

  /**
   * تعديل قسم
   */
  update: catalogUpdateProcedure
    .input(
      z.object({
        id: z.number().int().positive(),
        name: z.string().min(1, 'اسم القسم مطلوب'),
        nameEn: z.string().optional(),
        slug: z.string().min(1, 'الرابط التعريفي مطلوب'),
        description: z.string().optional(),
        icon: z.string().optional(),
        sortOrder: z.number().default(0),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      const db = await ensureDatabaseAvailable();
      const { id, ...data } = input;

      // Check slug uniqueness
      const [existingSlug] = await db
        .select({ id: departments.id })
        .from(departments)
        .where(eq(departments.slug, data.slug))
        .limit(1);

      if (existingSlug && existingSlug.id !== id) {
        throw new Error('الرابط التعريفي للقسم مستخدم مسبقاً');
      }

      await db.update(departments).set(data).where(eq(departments.id, id));
      serverCache.invalidate(DEPARTMENTS_CACHE_KEY);
      return { success: true };
    }),

  /**
   * حذف قسم
   */
  delete: catalogDeleteProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const db = await ensureDatabaseAvailable();

      // Check if any doctors belong to this department
      const [assignedDoctor] = await db
        .select({ id: doctors.id })
        .from(doctors)
        .where(eq(doctors.departmentId, input.id))
        .limit(1);

      if (assignedDoctor) {
        throw new Error('لا يمكن حذف القسم لوجود أطباء مرتبطين به. قم بنقل الأطباء أولاً.');
      }

      await db.delete(departments).where(eq(departments.id, input.id));
      serverCache.invalidate(DEPARTMENTS_CACHE_KEY);
      return { success: true };
    }),
});
