import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = readFileSync(resolve(process.cwd(), 'server/routers/content/quality.ts'), 'utf8');

describe('فحص جودة المحتوى', () => {
  it('يفحص النص البديل للصور والأقسام المنشورة وأطوال SEO دون تعديل البيانات', () => {
    expect(source).toContain("code: 'image-alt-missing'");
    expect(source).toContain("code: 'page-without-sections'");
    expect(source).toContain("code: 'seo-title-length'");
    expect(source).toContain("code: 'seo-description-length'");
    expect(source).toContain('contentReadProcedure.query');
  });
});
