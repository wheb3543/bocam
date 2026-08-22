import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  ensureDatabaseAvailable: vi.fn(),
  evaluatePublicationQuality: vi.fn(),
  invalidateImagesCache: vi.fn(),
  invalidateTextContentCache: vi.fn(),
  invalidateAdminPagesCache: vi.fn(),
  invalidateAdminSectionsCache: vi.fn(),
  invalidateAdminTextContentCache: vi.fn(),
}));

vi.mock('../../_core/databaseGuard', () => ({
  ensureDatabaseAvailable: mocks.ensureDatabaseAvailable,
}));
vi.mock('./publicationQualityGate', () => ({
  evaluatePublicationQuality: mocks.evaluatePublicationQuality,
}));
vi.mock('../../routers/public/content', () => ({
  invalidateImagesCache: mocks.invalidateImagesCache,
  invalidateTextContentCache: mocks.invalidateTextContentCache,
}));
vi.mock('../../routers/content/pages', () => ({
  invalidateAdminPagesCache: mocks.invalidateAdminPagesCache,
}));
vi.mock('../../routers/content/sections', () => ({
  invalidateAdminSectionsCache: mocks.invalidateAdminSectionsCache,
}));
vi.mock('../../routers/content/textContent', () => ({
  invalidateAdminTextContentCache: mocks.invalidateAdminTextContentCache,
}));

import { publishDueCmsContent } from './deferredPublicationService';

function createTransaction(selectResults: unknown[][]) {
  const updates: Array<Record<string, unknown>> = [];
  const audits: Array<Record<string, unknown>> = [];
  const tx = {
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(async () => selectResults.shift() ?? []),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn((values: Record<string, unknown>) => {
        updates.push(values);
        return { where: vi.fn(async () => undefined) };
      }),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(async (values: Record<string, unknown>) => {
        audits.push(values);
      }),
    })),
  };
  return { tx, updates, audits };
}

describe('بوابة جودة النشر المؤجل', () => {
  it('يبقي العنصر المخالف مسودة ويلغي موعده ويسجل سبب المنع مرة واحدة', async () => {
    const scheduledAt = new Date('2026-08-22T10:00:00.000Z');
    const { tx, updates, audits } = createTransaction([
      [{ id: 91, content: '', publishedAt: scheduledAt }],
      [],
      [],
      [],
      [],
      [],
    ]);
    mocks.ensureDatabaseAvailable.mockResolvedValue({
      transaction: async (callback: (transaction: typeof tx) => Promise<unknown>) => callback(tx),
    });
    mocks.evaluatePublicationQuality.mockResolvedValue([
      { code: 'text-content-empty', message: 'لا يمكن نشر محتوى نصي فارغ.' },
    ]);

    const result = await publishDueCmsContent('cms-task-1', new Date('2026-08-22T10:01:00.000Z'));

    expect(mocks.evaluatePublicationQuality).toHaveBeenCalledWith(
      tx,
      'textContent',
      expect.objectContaining({ id: 91 })
    );
    expect(updates).toContainEqual({ publishedAt: null });
    expect(audits).toHaveLength(1);
    expect(audits[0]).toMatchObject({ entityType: 'text', entityId: 91 });
    expect(audits[0]?.reason).toContain('تم منع النشر المؤجل');
    expect(result.published.textContent).toBe(0);
    expect(result.blocked.textContent).toBe(1);
  });
});
