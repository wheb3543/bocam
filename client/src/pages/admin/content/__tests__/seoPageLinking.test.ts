import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const hookSource = readFileSync(
  resolve(process.cwd(), 'client/src/pages/admin/content/hooks/useSEO.ts'),
  'utf8'
);
const dialogSource = readFileSync(
  resolve(process.cwd(), 'client/src/pages/admin/content/components/dialogs/SEODialog.tsx'),
  'utf8'
);
const settingsSource = readFileSync(
  resolve(process.cwd(), 'client/src/pages/admin/content/components/dialogs/PageSettingsDialog.tsx'),
  'utf8'
);
const routerSource = readFileSync(
  resolve(process.cwd(), 'server/routers/content/seo.ts'),
  'utf8'
);

describe('ربط SEO بالصفحات', () => {
  it('يحفظ pageId وslug مع إعدادات SEO ويعرض اختيار الصفحة في المحرر', () => {
    expect(hookSource).toContain('pageId: formData.pageId');
    expect(hookSource).toContain('slug: formData.slug || undefined');
    expect(dialogSource).toContain('الصفحة المرتبطة');
    expect(dialogSource).toContain('رابط الصفحة (slug)');
  });

  it('يعرض إعداد SEO الفعلي من إعدادات الصفحة ويبطل cache عند تغييره', () => {
    expect(settingsSource).toContain('const pageSEO = seo.seoSettings?.find');
    expect(settingsSource).toContain("onNavigateToTab?.('seo')");
    expect(routerSource).toContain('await invalidateSEOCache()');
  });
});
