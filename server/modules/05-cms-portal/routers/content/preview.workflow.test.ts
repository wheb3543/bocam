import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const previewRouterSource = readFileSync(
  resolve(process.cwd(), 'server/routers/content/preview.ts'),
  'utf8'
);
const publicContentSource = readFileSync(
  resolve(process.cwd(), 'server/routers/public/content.ts'),
  'utf8'
);
const schemaSource = readFileSync(resolve(process.cwd(), 'drizzle/schema.ts'), 'utf8');
const previewPageSource = readFileSync(
  resolve(process.cwd(), 'client/src/pages/public/DraftPreviewPage.tsx'),
  'utf8'
);

describe('سير معاينة مسودات CMS الآمنة', () => {
  it('يصدر رمزاً عشوائياً ويحفظ بصمته فقط مع انتهاء صلاحية قصير', () => {
    expect(previewRouterSource).toContain("randomBytes(32).toString('base64url')");
    expect(previewRouterSource).toContain('hashPreviewToken(token)');
    expect(previewRouterSource).toContain('PREVIEW_TTL_MINUTES = 15');
    expect(schemaSource).toContain("'cmsPreviewTokens'");
    expect(schemaSource).toContain("varchar('tokenHash', { length: 64 }).notNull().unique()");
  });

  it('لا يعيد بيانات المسودة إلا برمز صالح وغير منتهي وغير ملغى ومن دون cache عام', () => {
    expect(publicContentSource).toContain('getDraftPreview');
    expect(publicContentSource).toContain('eq(cmsPreviewTokens.tokenHash, tokenHash)');
    expect(publicContentSource).toContain('gt(cmsPreviewTokens.expiresAt, now)');
    expect(publicContentSource).toContain('isNull(cmsPreviewTokens.revokedAt)');
    expect(publicContentSource).toContain("ne(textContent.status, 'archived')");
    expect(publicContentSource).not.toContain("getCacheKey('draftPreview'");
  });

  it('يعرض المعاينة بوصفها خاصة ويمنع الفهرسة وتسريب المرجع للصور', () => {
    expect(previewPageSource).toContain('noindex,nofollow,noarchive');
    expect(previewPageSource).toContain('referrerPolicy="no-referrer"');
    expect(previewPageSource).toContain('معاينة خاصة لمسودة غير منشورة');
  });
});
