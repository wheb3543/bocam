/**
 * Blog CMS Workflow Tests
 * اختبارات تكامل وحدة المدونة الطبية مع منظومة CMS
 *
 * نتحقق من أن المدونة مربوطة فعلياً بحوكمة CMS المشتركة: بوابة جودة النشر،
 * سجل التدقيق، النسخ المحفوظة، سلة المحذوفات، النشر المؤجل، وإبطال الكاش.
 * تتبع هذه الاختبارات أسلوب اختبارات workflow المعتمد في الوحدة 05.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), 'utf8');

const blogRouterSource = read(
  'server/modules/05-cms-portal/routers/content/blog.ts'
);
const publicBlogSource = read('server/routers/public/blog.ts');
const contentRouterSource = read('server/modules/05-cms-portal/routers/content.ts');
const appRouterSource = read('server/routers/routers.ts');
const qualityGateSource = read(
  'server/modules/05-cms-portal/services/content/publicationQualityGate.ts'
);
const auditLogSource = read(
  'server/modules/05-cms-portal/services/content/auditLogService.ts'
);
const versionsSource = read(
  'server/modules/05-cms-portal/routers/content/contentVersions.ts'
);
const trashSource = read('server/modules/05-cms-portal/routers/content/trash.ts');
const approvalsSource = read('server/modules/05-cms-portal/routers/content/approvals.ts');
const deferredSource = read(
  'server/modules/05-cms-portal/services/content/deferredPublicationService.ts'
);
const cmsIndexSource = read('server/modules/05-cms-portal/routers/content.ts');

describe('تسجيل راوتر المدونة في منظومة CMS', () => {
  it('يركّب راوتر الإدارة تحت content.blog', () => {
    expect(contentRouterSource).toContain("import { blogRouter } from './content/blog'");
    expect(contentRouterSource).toContain('blog: blogRouter');
  });

  it('يسجّل راوتر الواجهة العامة تحت blog', () => {
    expect(appRouterSource).toContain("import { publicBlogRouter } from './public/blog'");
    expect(appRouterSource).toContain('blog: publicBlogRouter');
  });

  it('يصدّر راوتر المدونة من وحدة CMS', () => {
    expect(cmsIndexSource).toContain('blogRouter');
  });
});

describe('حوكمة مقالات المدونة داخل CMS', () => {
  it('يخضع كل إجراء إداري لفحص بوابة جودة النشر عند النشر', () => {
    expect(blogRouterSource).toContain("assertPublicationQuality(db, {\n        entityType: 'blogPost'");
    expect(blogRouterSource).toContain('assertContentCapability(ctx.user,');
  });

  it('يسجّل كل تغيير في سجل التدقيق بنوع blogPost', () => {
    expect(blogRouterSource).toContain("entityType: 'blogPost'");
    expect(blogRouterSource).toContain('auditLogService.logChange');
    expect(auditLogSource).toContain('blogPost');
  });

  it('يحفظ نسخة قابلة للتراجع لكل مقال', () => {
    expect(blogRouterSource).toContain('saveBlogPostVersion');
    expect(blogRouterSource).toContain("entityType: 'blogPost'");
    expect(versionsSource).toContain('blogPost');
  });

  it('يدعم استعادة مقالات المدونة من سجل النسخ', () => {
    expect(versionsSource).toContain("if (entityType === 'blogPost')");
    expect(versionsSource).toContain('المقال المراد استعادته غير موجود');
  });

  it('يدمج مقالات المدونة في سلة محذوفات CMS', () => {
    expect(trashSource).toContain("'blogPost'");
    expect(trashSource).toContain("if (entityType === 'blogPost')");
    expect(trashSource).toContain('invalidateBlogCache');
  });

  it('يدعم مراجعة واعتماد مقالات المدونة قبل النشر', () => {
    expect(approvalsSource).toContain("'blogPost'");
    expect(approvalsSource).toContain("pendingApproval.entityType === 'blogPost'");
    expect(approvalsSource).toContain('مقال المدونة المطلوب لم يعد موجوداً');
  });

  it('ينشر المقالات المجدولة عبر مهمة Heartbeat', () => {
    expect(deferredSource).toContain('dueBlogPosts');
    expect(deferredSource).toContain('blogPosts: number');
    expect(deferredSource).toContain('invalidateBlogCache');
  });
});

describe('بوابة جودة نشر مقالات المدونة', () => {
  it('تتحقق من العنوان والرابط والجسم قبل النشر', () => {
    expect(qualityGateSource).toContain("if (entityType === 'blogPost')");
    expect(qualityGateSource).toContain('blog-title-missing');
    expect(qualityGateSource).toContain('blog-slug-missing');
    expect(qualityGateSource).toContain('blog-content-missing');
  });

  it('تشترط صورة غلاف ونصاً بديلاً للوصولية و SEO', () => {
    expect(qualityGateSource).toContain('blog-cover-missing');
    expect(qualityGateSource).toContain('blog-cover-alt-missing');
  });

  it('تتحقق من طول وصف SEO المخصص', () => {
    expect(qualityGateSource).toContain('blog-description-length');
  });
});

describe('إبطال كاش المدونة', () => {
  it('يفرغ كاش الواجهة العامة وكاش الإدارة معاً', () => {
    expect(blogRouterSource).toContain("deletePattern('blog:*')");
    expect(blogRouterSource).toContain("deletePattern('admin:blog:*')");
  });

  it('يستدعي الإبطال عند إنشاء وتعديل وحذف ونشر المقال', () => {
    const invalidations = blogRouterSource.match(/await invalidateBlogCache\(\)/g) ?? [];
    expect(invalidations.length).toBeGreaterThanOrEqual(5);
  });
});

describe('حماية الواجهة العامة من تسريب المسودات', () => {
  it('يقتصر النتائج على المقالات المنشورة والنشطة وغير المحذوفة', () => {
    expect(publicBlogSource).toContain("eq(blogPosts.status, 'published')");
    expect(publicBlogSource).toContain("eq(blogPosts.isActive, 'yes')");
    expect(publicBlogSource).toContain('isNull(blogPosts.deletedAt)');
  });

  it('يعقّم جسم المقال مرة ثانية قبل الإرسال للعميل', () => {
    expect(publicBlogSource).toContain('content: sanitizeBlogHtml(row.post.content)');
  });

  it('يخفي التصنيفات الفارغة من شريط التصفية', () => {
    expect(publicBlogSource).toContain('filter((row) => row.postsCount > 0)');
  });

  it('يشارك معيار الترتيب الواحد بين الإدارة والواجهة العامة', () => {
    expect(publicBlogSource).toContain('buildBlogOrderBy');
    expect(blogRouterSource).toContain('buildBlogOrderBy');
  });
});
