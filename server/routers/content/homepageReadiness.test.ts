import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const textRouterSource = readFileSync(
  resolve(process.cwd(), 'server/routers/content/textContent.ts'),
  'utf8'
);
const homePageSource = readFileSync(
  resolve(process.cwd(), 'client/src/pages/public/HomePage.tsx'),
  'utf8'
);

describe('تهيئة محتوى الصفحة الرئيسية', () => {
  it('تدقق جاهزية مفاتيح الصفحة الرئيسية المنشورة داخل إدارة المحتوى', () => {
    expect(textRouterSource).toContain('getHomepageReadiness: protectedProcedure');
    expect(textRouterSource).toContain("'hero.button.ar'");
    expect(textRouterSource).toContain("record.status === 'published'");
    expect(textRouterSource).toContain("record.isActive === 'yes'");
  });

  it('يهيئ المحتوى الجديد منشوراً ويقرأ زر البطل من المفتاح نفسه', () => {
    expect(textRouterSource).toContain("status: 'published'");
    expect(textRouterSource).toContain('publishedAt: new Date()');
    expect(homePageSource).toContain('key: `hero.button.${language}`');
    expect(homePageSource).not.toContain('hero.button.text.${language}');
  });
});
