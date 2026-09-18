import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

const seoRouterSource = source('server/routers/content/seo.ts');
const qualitySource = source('server/services/content/publicationQualityGate.ts');
const approvalsSource = source('server/routers/content/approvals.ts');
const versionsSource = source('server/routers/content/contentVersions.ts');
const trashSource = source('server/routers/content/trash.ts');
const retentionSource = source('server/services/content/trashRetentionService.ts');
const deferredSource = source('server/services/content/deferredPublicationService.ts');
const publicContentSource = source('server/routers/public/content.ts');
const migrationSource = source('drizzle/0091_silly_doctor_doom.sql');
const dialogSource = source('client/src/pages/admin/content/components/dialogs/SEODialog.tsx');
const listSource = source('client/src/pages/admin/content/components/SEOList.tsx');
const hookSource = source('client/src/pages/admin/content/hooks/useSEO.ts');

describe('دورة CMS لإعدادات SEO', () => {
  it('يحتوي ترحيل SEO على إضافة واحدة للحالة وترقية آمنة للسجلات القديمة', () => {
    expect(migrationSource.match(/ADD `status`/g)).toHaveLength(1);
    expect(migrationSource).toContain("SET `status` = CASE WHEN `isActive` = 'yes' THEN 'published'");
    expect(migrationSource).toContain('CREATE INDEX `seoSettings_status_idx`');
    expect(migrationSource).toContain('CREATE INDEX `seoSettings_deletedAt_idx`');
  });

  it('تدعم المسودة والنشر والأرشفة والحذف الناعم والاستعادة مع السجل والنسخ', () => {
    expect(seoRouterSource).toContain("const seoStatusSchema = z.enum(['draft', 'published', 'archived'])");
    expect(seoRouterSource).toContain('includeDeleted: z.boolean().optional().default(false)');
    expect(seoRouterSource).toContain('publish: contentPublishProcedure');
    expect(seoRouterSource).toContain('archive: contentPublishProcedure');
    expect(seoRouterSource).toContain('restore: contentRestoreProcedure');
    expect(seoRouterSource).toContain("set({ deletedAt: new Date() })");
    expect(seoRouterSource).toContain("set({ deletedAt: null, status: 'draft', publishedAt: null })");
    expect(seoRouterSource).toContain('saveSeoVersion');
    expect(seoRouterSource).toContain("entityType: 'seo'");
    expect(seoRouterSource).toContain('invalidateSEOCache');
    expect(seoRouterSource).toContain('archived,');
    expect(seoRouterSource).toContain('deleted: allSeo.length - total');
    expect(seoRouterSource).toContain('pendingApprovals: pendingApprovals.length');
    expect(seoRouterSource).toContain('getReport: contentReadProcedure');
    expect(seoRouterSource).toContain('qualityScore: getPublicationQualityScore(qualityIssues)');
  });

  it('يفرض بوابة الجودة ويعرض للعامة SEO منشوراً ونشطاً وغير محذوف فقط', () => {
    expect(qualitySource).toContain("'seo'");
    expect(seoRouterSource).toContain('assertPublicationQuality');
    expect(publicContentSource).toContain("eq(seoSettings.status, 'published')");
    expect(publicContentSource).toContain('isNull(seoSettings.deletedAt)');
  });

  it('يسمح بطلب مراجعة SEO ويعيد فحص الجودة ويحدّث التخزين المؤقت عند الاعتماد', () => {
    expect(approvalsSource).toContain("'seo'");
    expect(approvalsSource).toContain('seoChangeSchema');
    expect(approvalsSource).toContain('assertPublicationQuality(tx');
    expect(approvalsSource).toContain('invalidateSEOCache');
  });

  it('يحافظ على الحالة وموعد النشر عند استعادة إصدار ويشمل SEO في سلة الحذف والاحتفاظ', () => {
    expect(versionsSource).toContain("status: z.enum(['draft', 'published', 'archived']).default('draft')");
    expect(versionsSource).toContain('publishedAt: z.coerce.date().nullable().optional()');
    expect(versionsSource).toContain('await tx.update(seoSettings).set(parsed)');
    expect(trashSource).toContain("'seo'");
    expect(trashSource).toContain('seoSettings');
    expect(retentionSource).toContain('seoSettings');
  });

  it('يعيد فحص SEO المؤجل عند التنفيذ ويوقفه كمسودة عند الفشل مع إبطال الذاكرة المؤقتة', () => {
    expect(deferredSource).toContain('eq(seoSettings.status, \'draft\')');
    expect(deferredSource).toContain('entityType: \'seo\'');
    expect(deferredSource).toContain('blocked.seo += 1');
    expect(deferredSource).toContain('published.seo += 1');
    expect(deferredSource).toContain('invalidateSEOCache');
  });

  it('يوفر واجهة حالة وجدولة وجودة ومراجعة وسجل نسخ مع تنظيف أخطاء الجودة عند الإغلاق', () => {
    expect(dialogSource).toContain('حالة النشر');
    expect(dialogSource).toContain('موعد النشر (اختياري)');
    expect(dialogSource).toContain('PublicationQualityFeedback');
    expect(dialogSource).toContain('ApprovalSubmissionPanel');
    expect(listSource).toContain('selectedSEOSettings?.id');
    expect(listSource).toContain('clearQualityIssues?.()');
    expect(listSource).toContain('عرض المحذوفات فقط');
    expect(listSource).toContain('handleRestoreSEOSettings');
    expect(listSource).toContain('إحصاءات حالات SEO');
    expect(listSource).toContain('overview?.drafts ?? 0');
    expect(listSource).toContain('overview?.deleted ?? 0');
    expect(listSource).toContain('ينتظر الموافقة');
    expect(listSource).toContain('تصدير CSV');
    expect(listSource).toContain('qualityScore={seoInsightsById.get(seoSetting.id)?.qualityScore}');
    expect(hookSource).toContain('qualityOverrideReason');
    expect(hookSource).toContain('handlePublishSEOSettings');
    expect(hookSource).toContain('handleArchiveSEOSettings');
    expect(hookSource).toContain('status: statusFilter');
    expect(hookSource).toContain('includeDeleted: showDeleted');
    expect(hookSource).toContain('handleRestoreSEOSettings');
    expect(hookSource).toContain('seoOverview');
    expect(hookSource).toContain('seoReport');
    expect(hookSource).toContain('exportSEOReportCsv');
  });
});
