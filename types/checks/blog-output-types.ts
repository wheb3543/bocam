/**
 * Blog Output Type Guard
 * حارس أنواع استنتاج مخرجات راوتر المدونة عبر AppRouter
 *
 * هذا الملف لا يُنفَّذ، بل دوره أن **يفشل البناء** إن انكسر استنتاج
 * أنواع tRPC. الخطأ الذي يحذّر منه: حين يُرجع الإجراء `unknown`
 * (مثل readCache<unknown>) يصبح الاستنتاع `{}`، فتختفي كل خصائص
 * البيانات من أنواع tRPC ويظهر الخطأ في الواجهة لا في هذا الملف.
 *
 * الأثر: pnpm check يكسر فوراً عند أي انحدار في أنواع المدونة.
 */

import type { inferRouterOutputs } from '@trpc/server';
import type { publicBlogRouter } from '../../server/routers/public/blog';
import type { AppRouter } from '../../server/routers/routers';

type DirectOutputs = inferRouterOutputs<typeof publicBlogRouter>;
type AppOutputs = inferRouterOutputs<AppRouter>;

/** يُقبل فقط إذا كان الشرط صحيحاً، وإلا فشل البناء. */
type Assert<T extends true> = T;

/** blog.list يجب أن يوفّر الترقيم، وإلا فشلت الترقيم في الواجهة بصمت. */
export type BlogListHasData = Assert<'data' extends keyof DirectOutputs['list'] ? true : false>;
export type BlogListHasPagination = Assert<
  'pagination' extends keyof DirectOutputs['list'] ? true : false
>;

/** blog.getBySlug يُرجع المقال مباشرة مع related، لا داخل غلاف. */
export type BlogPostHasSlug = Assert<
  'slug' extends keyof NonNullable<DirectOutputs['getBySlug']> ? true : false
>;
export type BlogPostHasContent = Assert<
  'content' extends keyof NonNullable<DirectOutputs['getBySlug']> ? true : false
>;

/** blog.getBySlug يسمح بقيمة null عند عدم وجود المقال. */
export type BlogPostIsNullable = Assert<null extends DirectOutputs['getBySlug'] ? true : false>;
export type BlogPostHasRelated = Assert<
  'related' extends keyof NonNullable<DirectOutputs['getBySlug']> ? true : false
>;

/** blog.featured يجب أن يعيد مصفوفة لا كائناً مفرداً. */
export type BlogFeaturedIsArray = Assert<
  DirectOutputs['featured'] extends readonly unknown[] ? true : false
>;

/** التحقق من التركيب داخل appRouter (يكشف فقدان التسجيل). */
export type AppRouterHasBlog = Assert<'blog' extends keyof AppOutputs ? true : false>;
export type AppBlogListHasData = Assert<
  'data' extends keyof AppOutputs['blog']['list'] ? true : false
>;
export type AppBlogListHasPagination = Assert<
  'pagination' extends keyof AppOutputs['blog']['list'] ? true : false
>;

/** blog.categories يجب أن يوفّر عناصر التصنيفات وعدّاد المقالات. */
export type BlogCategoriesIsArray = Assert<
  DirectOutputs['categories'] extends readonly unknown[] ? true : false
>;
