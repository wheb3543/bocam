import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = readFileSync(
  resolve(process.cwd(), 'server/routers/content/authorization.ts'),
  'utf8'
);

describe('صلاحيات إدارة المحتوى', () => {
  it('يفصل قدرات القراءة والتحرير والمراجعة والنشر على الخادم', () => {
    expect(source).toContain("export type ContentCapability = 'read' | 'edit' | 'review' | 'publish'");
    expect(source).toContain("read: 'content.view'");
    expect(source).toContain("edit: 'content.manage'");
    expect(source).toContain("publish: 'content.publish'");
    expect(source).toContain('hasRolePermission');
    expect(source).toContain("code: 'FORBIDDEN'");
  });

  it('يفحص النشر بحسب هوية المستخدم لا بحسب اسم الدور الثابت', () => {
    expect(source).toContain('await assertContentCapability(ctx.user, capability)');
    expect(source).toContain('await hasRolePermission');
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

  it('يفصل قراءة الوسائط عن صلاحية إدارتها', () => {
    const mediaSource = readFileSync(
      resolve(process.cwd(), 'server/routers/content/media.ts'),
      'utf8'
    );
    expect(mediaSource).toContain("permissionProcedure('media.manage'");
    expect(mediaSource).toContain('list: contentReadProcedure');
    expect(mediaSource).toContain('create: mediaManagementProcedure');
    expect(mediaSource).toContain('deleteMany: mediaManagementProcedure');
  });
});
