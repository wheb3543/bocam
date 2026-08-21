import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const homePageSource = readFileSync(resolve(process.cwd(), 'client/src/pages/public/HomePage.tsx'), 'utf8');
const dynamicPageSource = readFileSync(resolve(process.cwd(), 'client/src/pages/public/DynamicPage.tsx'), 'utf8');
const seoComponentSource = readFileSync(resolve(process.cwd(), 'client/src/components/SEO.tsx'), 'utf8');

describe('SEO المنشور من CMS', () => {
  it('يستهلك سجلات SEO المنشورة في الصفحة الرئيسية والصفحات ذات الرابط', () => {
    expect(homePageSource).toContain("usePublicSEOSettings({ slug: 'home', language })");
    expect(dynamicPageSource).toContain("usePublicSEOSettings({ slug: slug || '', language })");
  });

  it('ينشئ canonical وبيانات Open Graph وJSON-LD من الحقول الإدارية عند توفرها', () => {
    expect(seoComponentSource).toContain("link[rel=\"canonical\"]");
    expect(seoComponentSource).toContain('cms-structured-data');
    expect(seoComponentSource).toContain('ogTitle || title');
  });
});
