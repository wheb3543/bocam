import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = readFileSync(resolve(process.cwd(), 'server/routers/public/content.ts'), 'utf8');

describe('عقد إظهار المحتوى العام', () => {
  it('لا يعيد النصوص أو الصور أو الصفحات أو الأقسام إلا عندما تكون منشورة وغير محذوفة', () => {
    expect(source).toContain("eq(textContent.status, 'published')");
    expect(source).toContain('isNull(textContent.deletedAt)');
    expect(source).toContain("eq(images.status, 'published')");
    expect(source).toContain('isNull(images.deletedAt)');
    expect(source).toContain("eq(pages.status, 'published')");
    expect(source).toContain('isNull(pages.deletedAt)');
    expect(source).toContain("eq(sections.status, 'published')");
    expect(source).toContain('isNull(sections.deletedAt)');
  });

  it('يحصر أزرار الأقسام ضمن أقسام الصفحة المنشورة فقط', () => {
    expect(source).toContain('inArray(sectionButtons.sectionId, sectionIds)');
    expect(source).toContain('isNull(sectionButtons.deletedAt)');
  });
});
