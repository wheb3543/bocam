import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { assertContentCapability } from './authorization';

const source = readFileSync(
  resolve(process.cwd(), 'server/routers/content/authorization.ts'),
  'utf8'
);

describe('صلاحيات إدارة المحتوى', () => {
  it('يفصل قدرات القراءة والتحرير والمراجعة والنشر على الخادم', () => {
    expect(source).toContain("export type ContentCapability = 'read' | 'edit' | 'review' | 'publish'");
    expect(source).toContain("staff: ['read', 'edit']");
    expect(source).toContain("viewer: ['read']");
    expect(source).toContain("manager: ['read', 'edit', 'review', 'publish']");
    expect(source).toContain("code: 'FORBIDDEN'");
  });

  it('لا يسمح للمحرر بالنشر بينما يسمح به للمدير', () => {
    expect(() => assertContentCapability('staff', 'publish')).toThrow();
    expect(() => assertContentCapability('manager', 'publish')).not.toThrow();
  });

  it('يوزع إجراءات CMS على طبقة الصلاحيات المشتركة', () => {
    const routerFiles = ['textContent.ts', 'images.ts', 'pages.ts', 'sections.ts', 'colorScheme.ts', 'seo.ts', 'sectionButtons.ts'];

    for (const file of routerFiles) {
      const routerSource = readFileSync(
        resolve(process.cwd(), `server/routers/content/${file}`),
        'utf8'
      );
      expect(routerSource).toContain("from './authorization'");
      expect(routerSource).toContain('contentReadProcedure');
      expect(routerSource).toContain('contentEditProcedure');
    }
  });
});
