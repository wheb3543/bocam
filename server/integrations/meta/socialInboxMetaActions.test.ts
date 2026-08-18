import { describe, expect, it, vi } from 'vitest';
import {
  enrichMetaCommentContext,
  replyToMetaComment,
  sendMetaCommentPrivateReply,
  setMetaCommentHidden,
  type MetaCommentActionTarget,
} from './socialInboxMetaActions';

const facebookTarget: MetaCommentActionTarget = {
  platform: 'facebook',
  accountExternalId: 'page-1',
  commentExternalId: 'comment-1',
  sourceExternalId: 'post-1',
  occurredAt: new Date('2026-08-18T08:00:00.000Z'),
};

const instagramTarget: MetaCommentActionTarget = {
  platform: 'instagram',
  accountExternalId: 'ig-account-1',
  commentExternalId: 'ig-comment-1',
  sourceExternalId: 'ig-media-1',
  occurredAt: new Date(),
};

type TestMetaClient = {
  postWithAccessToken: ReturnType<typeof vi.fn>;
  getWithAccessToken: ReturnType<typeof vi.fn>;
};

function client(overrides: Partial<TestMetaClient> = {}): TestMetaClient {
  return {
    postWithAccessToken: vi.fn().mockResolvedValue({ ok: true, status: 200, data: { id: 'created-1' } }),
    getWithAccessToken: vi.fn().mockResolvedValue({ ok: true, status: 200, data: {} }),
    ...overrides,
  };
}

describe('Meta social inbox comment actions', () => {
  it('uses the official Facebook and Instagram public-reply endpoints', async () => {
    const facebookClient = client();
    await expect(replyToMetaComment(facebookTarget, 'شكراً لتواصلك', 'token', facebookClient as never)).resolves.toEqual({ externalItemId: 'created-1' });
    expect(facebookClient.postWithAccessToken).toHaveBeenCalledWith('comment-1/comments', 'token', { message: 'شكراً لتواصلك' });

    const instagramClient = client();
    await replyToMetaComment(instagramTarget, 'شكراً لتواصلك', 'token', instagramClient as never);
    expect(instagramClient.postWithAccessToken).toHaveBeenCalledWith('ig-comment-1/replies', 'token', { message: 'شكراً لتواصلك' });
  });

  it('uses the platform-specific fields to hide or unhide comments', async () => {
    const facebookClient = client();
    await setMetaCommentHidden(facebookTarget, true, 'token', facebookClient as never);
    expect(facebookClient.postWithAccessToken).toHaveBeenCalledWith('comment-1', 'token', { is_hidden: true });

    const instagramClient = client();
    await setMetaCommentHidden(instagramTarget, false, 'token', instagramClient as never);
    expect(instagramClient.postWithAccessToken).toHaveBeenCalledWith('ig-comment-1', 'token', { hide: false });
  });

  it('uses the current private-reply payloads and enforces Instagram seven-day window', async () => {
    const facebookClient = client();
    await sendMetaCommentPrivateReply(facebookTarget, 'أرسلنا لك التفاصيل', 'token', facebookClient as never);
    expect(facebookClient.postWithAccessToken).toHaveBeenCalledWith('comment-1/private_replies', 'token', { message: 'أرسلنا لك التفاصيل' });

    const instagramClient = client({
      postWithAccessToken: vi.fn().mockResolvedValue({ ok: true, status: 200, data: { message_id: 'private-1' } }),
    });
    await expect(sendMetaCommentPrivateReply(instagramTarget, 'أرسلنا لك التفاصيل', 'token', instagramClient as never)).resolves.toEqual({ externalMessageId: 'private-1' });
    expect(instagramClient.postWithAccessToken).toHaveBeenCalledWith('ig-account-1/messages', 'token', {
      recipient: { comment_id: 'ig-comment-1' },
      message: { text: 'أرسلنا لك التفاصيل' },
    });

    await expect(
      sendMetaCommentPrivateReply({ ...instagramTarget, occurredAt: new Date('2026-08-01T00:00:00.000Z') }, 'متأخر', 'token', instagramClient as never)
    ).rejects.toThrow('انتهت نافذة السبعة أيام');
  });

  it('enriches Facebook post context and comment capabilities from Graph API fields', async () => {
    const graphClient = client({
      getWithAccessToken: vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          data: { message: 'منشور توعوي', permalink_url: 'https://facebook.example/post', full_picture: 'https://cdn.example/post.avif', type: 'photo' },
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          data: { like_count: 3, comment_count: 2, can_comment: true, can_reply_privately: true, is_hidden: false, is_private: false },
        }),
    });

    await expect(enrichMetaCommentContext(facebookTarget, 'token', graphClient as never)).resolves.toMatchObject({
      context: { sourceType: 'facebook_post', title: 'منشور توعوي', previewUrl: 'https://cdn.example/post.avif' },
      commentMetadata: { likeCount: 3, replyCount: 2, canComment: true, canReplyPrivately: true },
    });
    expect(graphClient.getWithAccessToken).toHaveBeenNthCalledWith(1, 'post-1', 'token', { fields: 'message,permalink_url,full_picture,type' });
  });
});
