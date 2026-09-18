import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const homePagePath = existsSync(resolve(process.cwd(), 'client/src/apps/public/modules/01-home/pages/HomePage.tsx'))
  ? resolve(process.cwd(), 'client/src/apps/public/modules/01-home/pages/HomePage.tsx')
  : resolve(process.cwd(), 'client/src/pages/public/HomePage.tsx');

const dynamicPagePath = existsSync(resolve(process.cwd(), 'client/src/apps/public/modules/05-content-and-legal/pages/DynamicCmsPage.tsx'))
  ? resolve(process.cwd(), 'client/src/apps/public/modules/05-content-and-legal/pages/DynamicCmsPage.tsx')
  : resolve(process.cwd(), 'client/src/pages/public/DynamicPage.tsx');

const homePageSource = readFileSync(homePagePath, 'utf8');
const dynamicPageSource = readFileSync(dynamicPagePath, 'utf8');
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
