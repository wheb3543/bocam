import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = readFileSync(
  resolve(process.cwd(), 'server/routers/content/contentVersions.ts'),
  'utf8'
);

describe('استعادة نسخ المحتوى', () => {
  it('ينفذ الاستعادة داخل معاملة ويُنشئ نسخة أمان ويسجل التغيير', () => {
    expect(source).toContain('restore: contentRestoreProcedure');
    expect(source).toContain('await db.transaction');
    expect(source).toContain('نسخة أمان تلقائية قبل الاستعادة');
    expect(source).toContain("reason: 'استعادة نسخة سابقة'");
  });

  it('يعيد إبطال cache الملائم لكل نوع محتوى بعد الاستعادة', () => {
    expect(source).toContain('invalidateTextContentCache()');
    expect(source).toContain('invalidateImagesCache()');
    expect(source).toContain('invalidateColorSchemeCache()');
    expect(source).toContain('invalidateSEOCache()');
  });
});
