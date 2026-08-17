import { beforeEach, describe, expect, it, vi } from 'vitest';

const dbMocks = vi.hoisted(() => ({
  ensureSocialInboxAccount: vi.fn(),
  ingestMetaSocialInboxEvent: vi.fn(),
  updateSocialInboxAccount: vi.fn(),
}));

vi.mock('../../database/db/socialInbox', () => dbMocks);

import { seedMetaSocialInboxTestData } from './seedMetaSocialInboxTestData';

describe('seedMetaSocialInboxTestData', () => {
  beforeEach(() => {
    dbMocks.ensureSocialInboxAccount.mockReset();
    dbMocks.ingestMetaSocialInboxEvent.mockReset();
    dbMocks.updateSocialInboxAccount.mockReset();
    dbMocks.ensureSocialInboxAccount.mockImplementation(async ({ platform }: { platform: string }) => ({
      messenger: 101,
      instagram: 102,
      facebook: 103,
    })[platform] ?? 0);
    dbMocks.ingestMetaSocialInboxEvent.mockResolvedValue({ status: 'processed', threadId: 1, itemId: 1 });
    dbMocks.updateSocialInboxAccount.mockResolvedValue({ success: true });
  });

  it('passes all supported official-shape fixtures through the production normalizer and ingestion contract', async () => {
    await expect(seedMetaSocialInboxTestData()).resolves.toEqual({
      expected: 7,
      normalized: 7,
      processed: 7,
      duplicate: 0,
      ignored: 0,
      gapFixtures: ['تعديل تعليق Facebook لا يدعمه التطبيع الحالي بعد'],
    });

    expect(dbMocks.ensureSocialInboxAccount).toHaveBeenCalledTimes(3);
    expect(dbMocks.ensureSocialInboxAccount).toHaveBeenCalledWith(
      expect.objectContaining({ platform: 'messenger', externalAccountId: 'sgh-meta-test-page-100' })
    );
    expect(dbMocks.ensureSocialInboxAccount).toHaveBeenCalledWith(
      expect.objectContaining({ platform: 'instagram', externalAccountId: 'sgh-meta-test-instagram-200' })
    );
    expect(dbMocks.ensureSocialInboxAccount).toHaveBeenCalledWith(
      expect.objectContaining({ platform: 'facebook', externalAccountId: 'sgh-meta-test-page-100' })
    );
    expect(dbMocks.ingestMetaSocialInboxEvent).toHaveBeenCalledTimes(7);
  });

  it('reports duplicate results without attempting to invent another normalized event', async () => {
    dbMocks.ingestMetaSocialInboxEvent
      .mockResolvedValueOnce({ status: 'duplicate', reason: 'سبق استلام الحدث' })
      .mockResolvedValue({ status: 'processed', threadId: 1, itemId: 1 });

    const result = await seedMetaSocialInboxTestData();

    expect(result).toMatchObject({ normalized: 7, processed: 6, duplicate: 1 });
    expect(dbMocks.ingestMetaSocialInboxEvent).toHaveBeenCalledTimes(7);
  });
});
