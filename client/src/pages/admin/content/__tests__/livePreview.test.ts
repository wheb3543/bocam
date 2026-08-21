import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const previewSource = readFileSync(
  resolve(process.cwd(), 'client/src/pages/admin/content/components/preview/ContentPreviewPanel.tsx'),
  'utf8'
);
const pageSource = readFileSync(
  resolve(process.cwd(), 'client/src/pages/admin/content/ContentManagementPage.tsx'),
  'utf8'
);

describe('المعاينة الحقيقية للمحتوى', () => {
  it('يعرض الصفحة العامة الفعلية داخل iframe قابل لمحاكاة الهاتف واللوحي', () => {
    expect(previewSource).toContain("type PreviewMode = 'content' | 'site'");
    expect(previewSource).toContain('src={`/page/${selectedPage.slug}`}');
    expect(previewSource).toContain("mobile: '375px'");
    expect(previewSource).toContain('max-h-[calc(100dvh-1rem)]');
  });

  it('يوفر فحص الجودة من صفحة إدارة المحتوى', () => {
    expect(pageSource).toContain('ContentQualityDialog');
    expect(pageSource).toContain('فحص الجودة');
  });
});
