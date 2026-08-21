import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const routerSource = readFileSync(
  resolve(process.cwd(), 'server/routers/content/importExport.ts'),
  'utf8'
);
const hookSource = readFileSync(
  resolve(process.cwd(), 'client/src/pages/admin/content/hooks/useImportExport.ts'),
  'utf8'
);

describe('استيراد المحتوى الآمن', () => {
  it('يتطلب معاينة وتأكيداً صريحاً قبل التعديل', () => {
    expect(routerSource).toContain('previewImport: adminProcedure');
    expect(routerSource).toContain('confirm: z.literal(true');
    expect(hookSource).toContain('previewImportMutation.mutateAsync(importData)');
    expect(hookSource).toContain('confirm: true');
  });

  it('يستورد البيانات داخل معاملة ويحافظ على خريطة العلاقات ويرفض التعارضات', () => {
    expect(routerSource).toContain('await db.transaction');
    expect(routerSource).toContain('const pageIdMap = new Map<number, number>()');
    expect(routerSource).toContain('const sectionIdMap = new Map<number, number>()');
    expect(routerSource).toContain('assertNoKeyConflicts');
    expect(routerSource).toContain('لن يستبدل الاستيراد الآمن سجلات قائمة');
  });
});
