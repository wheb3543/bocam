import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  authenticateRequest: vi.fn(),
  purgeExpiredCmsTrash: vi.fn(),
}));

vi.mock('../_core/sdk', () => ({ sdk: { authenticateRequest: mocks.authenticateRequest } }));
vi.mock('../services/content/trashRetentionService', () => ({
  purgeExpiredCmsTrash: mocks.purgeExpiredCmsTrash,
}));

import { createCmsTrashRetentionScheduledRouter } from './cmsTrashRetentionScheduledRoute';

const serviceSource = readFileSync(
  resolve(process.cwd(), 'server/services/content/trashRetentionService.ts'),
  'utf8'
);

function responseMock() {
  const response = {
    status: vi.fn(),
    json: vi.fn(),
  };
  response.status.mockReturnValue(response);
  return response;
}

function scheduledHandler() {
  const router = createCmsTrashRetentionScheduledRouter();
  const layer = router.stack.find(
    (entry: { route?: { path?: string; stack?: Array<{ handle: unknown }> } }) =>
      entry.route?.path === '/api/scheduled/cms-trash-retention'
  );
  return layer?.route?.stack[0]?.handle as (req: unknown, res: unknown) => Promise<void>;
}

describe('الحذف النهائي المؤجل لسلة CMS', () => {
  it('ينفذ فقط عبر هوية مهمة Heartbeat الموثقة', async () => {
    mocks.authenticateRequest.mockResolvedValue({ isCron: true, taskUid: 'task_retention_001' });
    mocks.purgeExpiredCmsTrash.mockResolvedValue({ skipped: null, purged: { page: 1 } });
    const response = responseMock();

    await scheduledHandler()({}, response);

    expect(mocks.purgeExpiredCmsTrash).toHaveBeenCalledWith('task_retention_001');
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({ ok: true, taskUid: 'task_retention_001' })
    );
  });

  it('يرفض الاستدعاء غير المجدول ولا يطلق تنظيفاً مدمراً', async () => {
    mocks.authenticateRequest.mockResolvedValue({ isCron: false });
    const response = responseMock();

    await scheduledHandler()({}, response);

    expect(response.status).toHaveBeenCalledWith(403);
    expect(response.json).toHaveBeenCalledWith({ error: 'cron-only' });
    expect(mocks.purgeExpiredCmsTrash).not.toHaveBeenCalled();
  });

  it('يطابق معرف المهمة المخزن ويتحقق من مدة الاحتفاظ قبل الحذف النهائي الذري', () => {
    expect(serviceSource).toContain('policy.scheduleCronTaskUid !== taskUid');
    expect(serviceSource).toContain("skipped: 'unrecognized-task'");
    expect(serviceSource).toContain('policy.retentionDays * 24 * 60 * 60 * 1000');
    expect(serviceSource).toContain('await db.transaction');
    expect(serviceSource).toContain('lte(options.table.deletedAt, options.cutoff)');
    expect(serviceSource).toContain("action: 'delete'");
  });
});
