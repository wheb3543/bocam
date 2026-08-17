import { beforeEach, describe, expect, it, vi } from 'vitest';

const routerDbMocks = vi.hoisted(() => ({
  listSocialInboxAccounts: vi.fn().mockResolvedValue([]),
  createSocialInboxAccount: vi.fn().mockResolvedValue(42),
  updateSocialInboxAccount: vi.fn().mockResolvedValue({ success: true }),
  listSocialInboxThreads: vi.fn().mockResolvedValue([]),
  getSocialInboxStats: vi.fn().mockResolvedValue({ total: 0, unread: 0, messages: 0, comments: 0 }),
  getSocialInboxThreadById: vi.fn().mockResolvedValue(null),
  markSocialInboxThreadRead: vi.fn().mockResolvedValue({ success: true }),
  setSocialInboxThreadStarred: vi.fn().mockResolvedValue({ success: true }),
  assignSocialInboxThread: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('./database/db/connection', () => ({
  getDb: vi.fn().mockResolvedValue(null),
}));

vi.mock('./database/db', () => ({
  ...routerDbMocks,
  getUserById: vi.fn(),
}));

import {
  getSocialInboxStats,
  getSocialInboxThreadById,
  listSocialInboxThreads,
} from './database/db/socialInbox';
import { socialInboxRouter } from './routers/socialInbox';

const caller = socialInboxRouter.createCaller({
  user: { role: 'admin' },
  req: {},
  res: {},
} as unknown as import('./_core/context').TrpcContext);

describe('social inbox database helpers', () => {
  it('returns a safe empty list when the database is unavailable', async () => {
    await expect(listSocialInboxThreads({ platform: 'facebook', channelType: 'comment' })).resolves.toEqual([]);
  });

  it('returns zeroed stats when the database is unavailable', async () => {
    await expect(getSocialInboxStats()).resolves.toEqual({
      total: 0,
      unread: 0,
      messages: 0,
      comments: 0,
    });
  });

  it('returns null for a missing thread when the database is unavailable', async () => {
    await expect(getSocialInboxThreadById(123)).resolves.toBeNull();
  });
});

describe('social inbox tRPC contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exposes account management and conversation actions', () => {
    const procedures = Object.keys((socialInboxRouter as unknown as { _def: { procedures: Record<string, unknown> } })._def.procedures);
    expect(procedures).toEqual(
      expect.arrayContaining([
        'accounts',
        'createAccount',
        'updateAccount',
        'stats',
        'threads',
        'thread',
        'markRead',
        'setStarred',
        'assign',
      ])
    );
  });

  it('validates and persists a Facebook account with metadata', async () => {
    await expect(
      caller.createAccount({
        platform: 'facebook',
        accountType: 'page',
        displayName: 'SGH Facebook',
        externalAccountId: 'page-123',
        status: 'pending',
        metadata: { pageName: 'SGH' },
      })
    ).resolves.toBe(42);

    expect(routerDbMocks.createSocialInboxAccount).toHaveBeenCalledWith({
      platform: 'facebook',
      accountType: 'page',
      displayName: 'SGH Facebook',
      externalAccountId: 'page-123',
      status: 'pending',
      metadata: JSON.stringify({ pageName: 'SGH' }),
    });
  });

  it('rejects unsupported platform values before touching the database', async () => {
    await expect(
      caller.createAccount({
        platform: 'tiktok' as never,
        accountType: 'profile',
        displayName: 'Unsupported',
        externalAccountId: 'tiktok-1',
      })
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });
    expect(routerDbMocks.createSocialInboxAccount).not.toHaveBeenCalled();
  });

  it('updates account synchronization state and serializes metadata', async () => {
    await expect(
      caller.updateAccount({
        id: 42,
        status: 'connected',
        lastSyncedAt: '2026-08-17T10:00:00.000Z',
        metadata: { cursor: 'next-page' },
      })
    ).resolves.toEqual({ success: true });

    expect(routerDbMocks.updateSocialInboxAccount).toHaveBeenCalledWith(
      42,
      expect.objectContaining({
        status: 'connected',
        lastSyncedAt: new Date('2026-08-17T10:00:00.000Z'),
        metadata: JSON.stringify({ cursor: 'next-page' }),
      })
    );
  });

  it('routes read, star, and assignment mutations to their database helpers', async () => {
    await caller.markRead({ id: 7, isRead: true });
    await caller.setStarred({ id: 7, isStarred: true });
    await caller.assign({ id: 7, assignedToUserId: 9 });

    expect(routerDbMocks.markSocialInboxThreadRead).toHaveBeenCalledWith(7, true);
    expect(routerDbMocks.setSocialInboxThreadStarred).toHaveBeenCalledWith(7, true);
    expect(routerDbMocks.assignSocialInboxThread).toHaveBeenCalledWith(7, 9);
  });
});
