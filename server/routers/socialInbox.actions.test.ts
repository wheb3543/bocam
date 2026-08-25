import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { TrpcContext } from '../_core/context';

const mocks = vi.hoisted(() => ({
  updateWorkflow: vi.fn(),
  getThread: vi.fn(),
  getTarget: vi.fn(),
  updateMetadata: vi.fn(),
  updateEnrichment: vi.fn(),
  getCredentials: vi.fn(),
  reply: vi.fn(),
  hide: vi.fn(),
  privateReply: vi.fn(),
  enrich: vi.fn(),
}));

vi.mock('../database/db', () => ({
  getDb: vi.fn().mockResolvedValue({}),
  assignSocialInboxThread: vi.fn(),
  createSocialInboxAccount: vi.fn(),
  getSocialInboxCommentActionTarget: mocks.getTarget,
  getSocialInboxStats: vi.fn(),
  listSocialInboxCommentContexts: vi.fn(),
  getSocialInboxThreadById: mocks.getThread,
  listSocialInboxAccounts: vi.fn(),
  listSocialInboxThreads: vi.fn(),
  markSocialInboxThreadRead: vi.fn(),
  setSocialInboxThreadStarred: vi.fn(),
  updateSocialInboxAccount: vi.fn(),
  updateSocialInboxCommentEnrichment: mocks.updateEnrichment,
  updateSocialInboxCommentMetadata: mocks.updateMetadata,
  updateSocialInboxCommentWorkflow: mocks.updateWorkflow,
}));

vi.mock('../services/rolePermissionService', () => ({
  hasRolePermission: vi.fn().mockResolvedValue(true),
}));

vi.mock('../database/db/metaIntegrationSettings', () => ({ getMetaWebhookCredentials: mocks.getCredentials }));
vi.mock('../database/db/socialInbox', () => ({ clearMetaSocialInboxTestData: vi.fn() }));
vi.mock('../integrations/meta/seedMetaSocialInboxTestData', () => ({ seedMetaSocialInboxTestData: vi.fn() }));
vi.mock('../integrations/meta/socialInboxMetaActions', () => ({
  replyToMetaComment: mocks.reply,
  setMetaCommentHidden: mocks.hide,
  sendMetaCommentPrivateReply: mocks.privateReply,
  enrichMetaCommentContext: mocks.enrich,
}));

import { socialInboxRouter } from './socialInbox';

const actionTarget = {
  thread: { id: 45, platform: 'facebook', externalThreadId: 'post-1' },
  item: { id: 99, externalItemId: 'comment-1', externalPublishedAt: new Date('2026-08-18T08:00:00.000Z') },
  account: { externalAccountId: 'page-1' },
  commentContext: { sourceExternalId: 'post-1' },
  commentMetadata: { canReplyPrivately: true, isHidden: false },
};

function caller(role: 'admin' | 'manager' | 'viewer' = 'admin') {
  const ctx = {
    user: { id: 1, role },
    req: {},
    res: {},
  } as unknown as TrpcContext;
  return socialInboxRouter.createCaller(ctx);
}

describe('socialInbox Meta comment action procedures', () => {
  beforeEach(() => {
    mocks.updateWorkflow.mockReset().mockResolvedValue({ success: true });
    mocks.getThread.mockReset().mockResolvedValue({ thread: { id: 45, assignedToUserId: null } });
    mocks.getTarget.mockReset().mockResolvedValue(actionTarget);
    mocks.updateMetadata.mockReset().mockResolvedValue({ success: true });
    mocks.updateEnrichment.mockReset().mockResolvedValue({ success: true });
    mocks.getCredentials.mockReset().mockResolvedValue({ pageAccessToken: 'encrypted-token' });
    mocks.reply.mockReset().mockResolvedValue({ externalItemId: 'reply-1' });
    mocks.hide.mockReset().mockResolvedValue({ success: true });
    mocks.privateReply.mockReset().mockResolvedValue({ externalMessageId: 'private-1' });
    mocks.enrich.mockReset().mockResolvedValue({
      context: { sourceExternalId: 'post-1', sourceUrl: 'https://facebook.example/post' },
      commentMetadata: { canComment: true, canReplyPrivately: true },
    });
  });

  it('updates follow-up and assignee using the comment-only workflow procedure', async () => {
    await expect(caller().updateCommentWorkflow({ id: 45, isFollowUpRequired: true, assignedToUserId: 7 })).resolves.toEqual({ success: true });
    expect(mocks.updateWorkflow).toHaveBeenCalledWith(45, { isFollowUpRequired: true, assignedToUserId: 7 });
  });

  it('rejects a live public reply when the Page Access Token is unavailable', async () => {
    mocks.getCredentials.mockResolvedValue(null);
    await expect(caller().replyToComment({ threadId: 45, itemId: 99, message: 'مرحباً' })).rejects.toMatchObject({ code: 'PRECONDITION_FAILED' });
    expect(mocks.reply).not.toHaveBeenCalled();
  });

  it('maps an authorised public reply to the official action target without exposing the token', async () => {
    await caller().replyToComment({ threadId: 45, itemId: 99, message: 'مرحباً' });
    expect(mocks.reply).toHaveBeenCalledWith(
      expect.objectContaining({ platform: 'facebook', commentExternalId: 'comment-1', sourceExternalId: 'post-1' }),
      'مرحباً',
      'encrypted-token'
    );
  });

  it('blocks a private reply when Meta marks the comment as ineligible', async () => {
    mocks.getTarget.mockResolvedValue({ ...actionTarget, commentMetadata: { canReplyPrivately: false } });
    await expect(caller().sendCommentPrivateReply({ threadId: 45, itemId: 99, message: 'تفاصيل خاصة' })).rejects.toMatchObject({ code: 'PRECONDITION_FAILED' });
    expect(mocks.privateReply).not.toHaveBeenCalled();
  });

  it('persists the hide state only after the Meta action succeeds', async () => {
    await caller().setCommentHidden({ threadId: 45, itemId: 99, isHidden: true });
    expect(mocks.hide).toHaveBeenCalledWith(expect.objectContaining({ commentExternalId: 'comment-1' }), true, 'encrypted-token');
    expect(mocks.updateMetadata).toHaveBeenCalledWith(99, { canReplyPrivately: true, isHidden: true });
  });

  it('stores enriched source context and comment capabilities after Graph API enrichment', async () => {
    await caller().enrichCommentContext({ threadId: 45, itemId: 99 });
    expect(mocks.enrich).toHaveBeenCalledWith(expect.objectContaining({ sourceExternalId: 'post-1' }), 'encrypted-token');
    expect(mocks.updateEnrichment).toHaveBeenCalledWith(45, {
      postUrl: 'https://facebook.example/post',
      commentContext: { sourceExternalId: 'post-1', sourceUrl: 'https://facebook.example/post' },
    });
  });
});
