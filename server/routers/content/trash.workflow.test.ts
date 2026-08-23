import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { toTrashItem } from './trash';

const routerSource = readFileSync(resolve(process.cwd(), 'server/routers/content/trash.ts'), 'utf8');
const componentSource = readFileSync(
  resolve(process.cwd(), 'client/src/pages/admin/content/components/ContentTrashList.tsx'),
  'utf8'
);

describe('سلة محذوفات CMS الموحدة', () => {
  it('يطبع الصفوف المحذوفة إلى نموذج موحد قابل للبحث والعرض', () => {
    const deletedAt = new Date('2026-08-22T10:00:00.000Z');

    expect(
      toTrashItem('page', {
        id: 9,
        name: 'about',
        titleAr: 'من نحن',
        slug: 'about',
        status: 'published',
        deletedAt,
      })
    ).toEqual({
      entityType: 'page',
      id: 9,
      title: 'about',
      description: 'من نحن · /about',
      status: 'published',
      deletedAt,
    });
  });

  it('يفرض صلاحية المدير والاستعادة الذرية كمسودة مع نسخة أمان وسجل تدقيق', () => {
    expect(routerSource).toContain('list: adminProcedure');
    expect(routerSource).toContain('restoreMany: adminProcedure');
    expect(routerSource).toContain('isNotNull(restoreConfig.table.deletedAt)');
    expect(routerSource).toContain('await db.transaction');
    expect(routerSource).toContain('contentVersionsService.createVersion');
    expect(routerSource).toContain('auditLogService.logChange');
    expect(routerSource).toContain("set({ deletedAt: null, status: 'draft', publishedAt: null })");
  });

  it('يوفر البحث والتصفية والتحديد والتأكيد قبل الاستعادة من واجهة CMS', () => {
    expect(componentSource).toContain('placeholder="ابحث بالاسم أو الوصف أو الرابط…"');
    expect(componentSource).toContain('select-all-trash');
    expect(componentSource).toContain('AlertDialog');
    expect(componentSource).toContain('restoreMany.useMutation');
    expect(componentSource).toContain('استعادة كمسودات');
  });

  it('يوفر معاينة تفصيلية للعنصر وإعداد سياسة احتفاظ قبل الاستعادة', () => {
    expect(routerSource).toContain('preview: adminProcedure');
    expect(routerSource).toContain('getRetentionPolicy: adminProcedure');
    expect(routerSource).toContain('updateRetentionPolicy: adminProcedure');
    expect(componentSource).toContain('معاينة العنصر المحذوف');
    expect(componentSource).toContain('متابعة الاستعادة');
    expect(componentSource).toContain('سياسة الحذف النهائي المؤجل');
    expect(componentSource).toContain('حفظ السياسة');
  });
});
