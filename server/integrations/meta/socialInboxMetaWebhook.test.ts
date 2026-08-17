import { describe, expect, it } from 'vitest';
import { normalizeMetaSocialInboxPayload } from './socialInboxMetaWebhook';

describe('Meta social inbox payload normalization', () => {
  it('normalizes an inbound Messenger text message', () => {
    const events = normalizeMetaSocialInboxPayload({
      object: 'page',
      entry: [{
        id: 'page-1',
        time: 1710000000000,
        messaging: [{
          sender: { id: 'psid-1' },
          recipient: { id: 'page-1' },
          timestamp: 1710000001000,
          message: { mid: 'mid-1', text: 'مرحباً من Messenger' },
        }],
      }],
    });

    expect(events).toEqual([
      expect.objectContaining({
        platform: 'messenger',
        channelType: 'message',
        eventKey: 'messenger:message:page-1:mid-1',
        externalThreadId: 'messenger:page-1:psid-1',
        direction: 'inbound',
        content: 'مرحباً من Messenger',
      }),
    ]);
  });

  it('normalizes an Instagram comment and preserves its parent relationship', () => {
    const events = normalizeMetaSocialInboxPayload({
      object: 'instagram',
      entry: [{
        id: 'ig-business-1',
        time: 1710000000,
        changes: [{
          field: 'comments',
          value: {
            comment_id: 'ig-comment-1',
            parent_id: 'ig-parent-1',
            text: 'تعليق على منشور Instagram',
            from: { id: 'ig-user-1', username: 'visitor' },
            media: { id: 'ig-media-1', media_product_type: 'REELS' },
          },
        }],
      }],
    });

    expect(events[0]).toMatchObject({
      platform: 'instagram',
      channelType: 'comment',
      eventKey: 'instagram:comment:ig-business-1:ig-comment-1',
      externalThreadId: 'instagram:ig-business-1:media:ig-media-1',
      authorName: 'visitor',
      parentExternalId: 'ig-parent-1',
    });
  });

  it('normalizes a Facebook Page feed comment and ignores unrelated feed changes', () => {
    const events = normalizeMetaSocialInboxPayload({
      object: 'page',
      entry: [{
        id: 'page-1',
        time: 1710000000,
        changes: [
          {
            field: 'feed',
            value: {
              item: 'comment',
              verb: 'add',
              comment_id: 'fb-comment-1',
              parent_id: 'page-post-1',
              post_id: 'page-post-1',
              created_time: 1710000000,
              message: 'تعليق Facebook',
              from: { id: 'fb-user-1', name: 'Facebook Visitor' },
            },
          },
          { field: 'feed', value: { item: 'post', verb: 'add', post_id: 'page-post-2' } },
        ],
      }],
    });

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      platform: 'facebook',
      channelType: 'comment',
      eventKey: 'facebook:comment:page-1:fb-comment-1',
      externalThreadId: 'facebook:page-1:post:page-post-1',
      authorName: 'Facebook Visitor',
    });
  });
});
