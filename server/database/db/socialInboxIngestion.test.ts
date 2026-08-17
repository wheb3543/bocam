import { describe, expect, it, vi } from 'vitest';

const getDbMock = vi.hoisted(() => vi.fn());

vi.mock('./connection', () => ({ getDb: getDbMock }));

import { ingestMetaSocialInboxEvent } from './socialInbox';

describe('Meta event ingestion idempotency', () => {
  it('does not create a second thread or item when a webhook event key already exists', async () => {
    const duplicateError = Object.assign(new Error('Duplicate event'), { code: 'ER_DUP_ENTRY' });
    const values = vi.fn().mockRejectedValue(duplicateError);
    const db = {
      insert: vi.fn(() => ({ values })),
      select: vi.fn(),
      update: vi.fn(),
    };
    getDbMock.mockResolvedValue(db);

    await expect(
      ingestMetaSocialInboxEvent({
        platform: 'messenger',
        channelType: 'message',
        accountExternalId: 'page-1',
        eventType: 'message',
        eventKey: 'messenger:message:page-1:mid-1',
        externalItemId: 'mid-1',
        externalThreadId: 'messenger:page-1:psid-1',
        direction: 'inbound',
        content: 'hello',
        occurredAt: new Date('2026-08-17T00:00:00.000Z'),
        rawPayload: '{"object":"page"}',
      })
    ).resolves.toEqual({ status: 'duplicate', reason: 'تم استلام الحدث نفسه سابقاً' });

    expect(db.select).not.toHaveBeenCalled();
    expect(db.update).not.toHaveBeenCalled();
  });
});
