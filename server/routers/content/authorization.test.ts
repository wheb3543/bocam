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
    expect(source).toContain("staff: ['read', 'edit']");
    expect(source).toContain("viewer: ['read']");
    expect(source).toContain("manager: ['read', 'edit', 'review', 'publish']");
    expect(source).toContain("code: 'FORBIDDEN'");
  });
});
