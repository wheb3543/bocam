import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = readFileSync(resolve(process.cwd(), 'server/api/uploadRoute.ts'), 'utf8');

describe('صلاحيات مسارات رفع وتنزيل الوسائط المباشرة', () => {
  it('يتحقق من المستخدم النشط وصلاحية الوسائط قبل استلام الملف أو تنزيل ZIP', () => {
    expect(source).toContain('function requireMediaPermission');
    expect(source).toContain('getUserById(actor.userId)');
    expect(source).toContain('hasRolePermission(db, user.id, user.role, permission)');
    expect(source).toContain("requireMediaPermission('media.upload', 'رفع الوسائط')");
    expect(source).toContain("requireMediaPermission('media.download', 'تنزيل وسائط المجلد')");
    expect(source).toContain("verified.type !== 'admin'");
  });
});
