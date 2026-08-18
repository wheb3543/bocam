import { beforeEach, describe, expect, it, vi } from 'vitest';

const getDbMock = vi.hoisted(() => vi.fn());

vi.mock('./connection', () => ({ getDb: getDbMock }));

import { clearMetaSocialInboxTestData, ingestMetaSocialInboxEvent } from './socialInbox';

describe('Meta event ingestion idempotency', () => {
  beforeEach(() => {
    getDbMock.mockReset();
  });

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

  it('stores a normalized event in an existing test account with item details and post context', async () => {
    const account = { id: 77, platform: 'facebook', externalAccountId: 'sgh-meta-test-page-100' };
    const selectResult = (result: unknown) => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({ limit: vi.fn().mockResolvedValue(result) })),
      })),
    });
    const select = vi
      .fn()
      .mockReturnValueOnce(selectResult([account]))
      .mockReturnValueOnce(selectResult([]))
      .mockReturnValueOnce(selectResult([]));
    const values = vi
      .fn()
      .mockResolvedValueOnce([{ insertId: 1001 }])
      .mockResolvedValueOnce([{ insertId: 1002 }])
      .mockResolvedValueOnce([{ insertId: 1003 }]);
    const where = vi.fn().mockResolvedValue(undefined);
    const db = {
      insert: vi.fn(() => ({ values })),
      select,
      update: vi.fn(() => ({ set: vi.fn(() => ({ where })) })),
    };
    getDbMock.mockResolvedValue(db);

    await expect(
      ingestMetaSocialInboxEvent({
        platform: 'facebook',
        channelType: 'comment',
        accountExternalId: 'sgh-meta-test-page-100',
        eventType: 'comment',
        eventKey: 'facebook:comment:sgh-meta-test-page-100:sgh-meta-test-fb-comment-001',
        externalItemId: 'sgh-meta-test-fb-comment-001',
        externalThreadId: 'facebook:sgh-meta-test-page-100:post:sgh-meta-test-post-001',
        direction: 'inbound',
        authorExternalId: 'sgh-meta-test-fb-user-001',
        authorName: 'مستخدم اختبار Facebook',
        content: 'تعليق اختبار Facebook وارد إلى صندوق البريد.',
        postUrl: 'https://www.facebook.com/sgh-meta-test/posts/001',
        parentExternalId: 'sgh-meta-test-page-100_sgh-meta-test-post-001',
        commentContext: {
          sourceType: 'facebook_post',
          sourceExternalId: 'sgh-meta-test-page-100_sgh-meta-test-post-001',
          title: 'منشور اختبار',
        },
        commentMetadata: { likeCount: 4, canReplyPrivately: true },
        occurredAt: new Date('2026-08-18T08:00:00.000Z'),
        rawPayload: '{"object":"page"}',
      })
    ).resolves.toEqual({ status: 'processed', threadId: 1002, itemId: 1003 });

    expect(values.mock.calls[1]?.[0]).toMatchObject({
      accountId: 77,
      postUrl: 'https://www.facebook.com/sgh-meta-test/posts/001',
      commentContext: JSON.stringify({
        sourceType: 'facebook_post',
        sourceExternalId: 'sgh-meta-test-page-100_sgh-meta-test-post-001',
        title: 'منشور اختبار',
      }),
    });
    expect(values.mock.calls[2]?.[0]).toMatchObject({
      mediaUrl: null,
      parentExternalId: 'sgh-meta-test-page-100_sgh-meta-test-post-001',
      commentMetadata: JSON.stringify({ likeCount: 4, canReplyPrivately: true }),
    });
  });

  it('cleans only records with the reserved Meta test account prefix', async () => {
    const selectResult = (result: unknown) => ({
      from: vi.fn(() => ({ where: vi.fn().mockResolvedValue(result) })),
    });
    const deleteWhere = vi.fn().mockResolvedValue(undefined);
    const db = {
      select: vi
        .fn()
        .mockReturnValueOnce(selectResult([{ id: 10 }, { id: 11 }]))
        .mockReturnValueOnce(selectResult([{ id: 201 }, { id: 202 }, { id: 203 }]))
        .mockReturnValueOnce(selectResult([{ id: 21 }, { id: 22 }]))
        .mockReturnValueOnce(selectResult([{ id: 31 }, { id: 32 }, { id: 33 }])),
      delete: vi.fn(() => ({ where: deleteWhere })),
    };
    getDbMock.mockResolvedValue(db);

    await expect(clearMetaSocialInboxTestData()).resolves.toEqual({
      success: true,
      accounts: 2,
      threads: 2,
      items: 3,
      events: 3,
    });

    expect(db.delete).toHaveBeenCalledTimes(4);
    expect(deleteWhere).toHaveBeenCalledTimes(4);
  });
});
