import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const readRouter = (file: string) =>
  readFileSync(resolve(process.cwd(), `server/routers/content/${file}`), 'utf8');

describe('الإنفاذ التفصيلي لدورة المحتوى', () => {
  it('يفصل إنشاء وتعديل ونشر الصفحات والأقسام والنصوص والصور وSEO وأزرار الأقسام', () => {
    for (const file of ['pages.ts', 'sections.ts', 'sectionButtons.ts', 'seo.ts', 'textContent.ts']) {
      const source = readRouter(file);
      expect(source).toContain('contentCreateProcedure');
      expect(source).toContain('contentUpdateProcedure');
      expect(source).toContain('contentPublishProcedure');
      expect(source).toContain('create: contentCreateProcedure');
      expect(source).toContain('update: contentUpdateProcedure');
      expect(source).toContain('publish: contentPublishProcedure');
    }

    const imagesSource = readRouter('images.ts');
    expect(imagesSource).toContain('create: contentCreateProcedure');
    expect(imagesSource).toContain('update: contentUpdateProcedure');
    expect(imagesSource).toContain("assertContentCapability(ctx.user, 'publish')");
  });

  it('يحصر اعتماد ورفض طلبات المحتوى في صلاحية المراجعة', () => {
    const source = readRouter('approvals.ts');
    expect(source).toContain('create: contentUpdateProcedure');
    expect(source).toContain('approve: contentReviewProcedure');
    expect(source).toContain('reject: contentReviewProcedure');
  });

  it('يحمي الحذف والاستعادة بحارسين منفصلين مع بقاء سياسة الاحتفاظ إدارية', () => {
    for (const file of ['pages.ts', 'sections.ts', 'sectionButtons.ts', 'seo.ts', 'textContent.ts']) {
      const source = readRouter(file);
      expect(source).toContain('delete: contentDeleteProcedure');
      expect(source).toContain('restore: contentRestoreProcedure');
    }
    expect(readRouter('images.ts')).toContain('delete: contentDeleteProcedure');
    expect(readRouter('trash.ts')).toContain('restoreMany: contentRestoreProcedure');
    expect(readRouter('trash.ts')).toContain('getRetentionPolicy: adminProcedure');
    expect(readRouter('contentVersions.ts')).toContain('restore: contentRestoreProcedure');
  });
});
