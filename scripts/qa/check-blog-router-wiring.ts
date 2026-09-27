/**
 * Blog Router Wiring Check
 * فحص تركيب راوترات المدونة في وقت التشغيل
 *
 * الهدف كشف الاستيراد الدائري (circular imports) الذي قد ينشأ عند ربط راوتر
 * المدونة بسلة المحذوفات وسجل النسخ والنشر المؤجل، لأنه لا يظهر في فحص الأنواع.
 * يُشغَّل عبر: npx tsx scripts/qa/check-blog-router-wiring.ts
 */

/* eslint-disable no-console */

/** إجراءات إدارة المدونة المطلوبة داخل content.blog */
const expectedAdminProcedures = [
  'list',
  'getById',
  'getOverview',
  'purgeCache',
  'create',
  'update',
  'delete',
  'restore',
  'duplicate',
  'publish',
  'categories.list',
  'categories.create',
  'categories.update',
  'categories.delete',
];

/** إجراءات الواجهة العامة المطلوبة داخل blog */
const expectedPublicProcedures = ['list', 'getBySlug', 'categories', 'featured', 'related'];

async function main() {
  const adminModule = await import('../../server/modules/05-cms-portal/routers/content/blog.js');
  const contentModule = await import('../../server/modules/05-cms-portal/routers/content.js');
  const publicModule = await import('../../server/routers/public/blog.js');
  const appRouters = await import('../../server/routers/routers.js');

  // tRPC v11 يسطّح المفاتيح المتداخلة بنقاط (blog.list) داخلProcedures.
  const flatten = (router: { _def: { procedures: Record<string, unknown> } }) =>
    Object.keys(router._def.procedures);

  const adminKeys = flatten(adminModule.blogRouter);
  const publicKeys = flatten(publicModule.publicBlogRouter);
  const contentKeys = flatten(contentModule.contentRouter);
  const appKeys = flatten(appRouters.appRouter);

  const failures: string[] = [];

  for (const name of expectedAdminProcedures) {
    if (!adminKeys.includes(name)) {
      failures.push(`content.blog.${name} مفقود`);
    }
    if (!contentKeys.includes(`blog.${name}`)) {
      failures.push(`contentRouter لا يعرّض blog.${name}`);
    }
  }
  for (const name of expectedPublicProcedures) {
    if (!publicKeys.includes(name)) {
      failures.push(`blog.${name} مفقود`);
    }
    if (!appKeys.includes(`blog.${name}`)) {
      failures.push(`appRouter لا يعرّض blog.${name}`);
    }
  }

  if (failures.length > 0) {
    console.error('❌ فشل الفحص:');
    failures.forEach((failure) => console.error(`   - ${failure}`));
    process.exit(1);
  }

  console.log(`✅ content.blog (${adminKeys.length} إجراء):`, adminKeys.join(', '));
  console.log(`✅ blog عام (${publicKeys.length} إجراء):`, publicKeys.join(', '));
  console.log('✅ لا يوجد استيراد دائري، والتركيب سليم داخل appRouter.');
}

main().catch((error: unknown) => {
  console.error('❌ فشل تحميل الراوترات:', error instanceof Error ? error.message : error);
  process.exit(1);
});
