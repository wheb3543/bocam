import { describe, expect, it } from 'vitest';
import { metaPayloadFixtures } from './metaPayloadFixtures';
import { normalizeMetaSocialInboxPayload } from './socialInboxMetaWebhook';

function eventFor(fixtureId: string) {
  const fixture = metaPayloadFixtures.find((candidate) => candidate.id === fixtureId);
  if (!fixture) {
    throw new Error(`Missing fixture: ${fixtureId}`);
  }
  return normalizeMetaSocialInboxPayload(fixture.payload);
}

describe('Meta payload fixtures', () => {
  it('matches the declared official-shape fixture coverage', () => {
    for (const fixture of metaPayloadFixtures) {
      expect(normalizeMetaSocialInboxPayload(fixture.payload)).toHaveLength(fixture.expectedEventCount);
    }
  });

  it('normalizes an inbound Messenger text message with sender, recipient and timestamp', () => {
    expect(eventFor('messenger-text')[0]).toMatchObject({
      platform: 'messenger',
      channelType: 'message',
      direction: 'inbound',
      accountExternalId: 'sgh-meta-test-page-100',
      externalItemId: 'm_sgh_test_text_001',
      authorExternalId: 'sgh-meta-test-psid-001',
      content: 'رسالة اختبار Messenger مطابقة لبنية Meta الرسمية.',
    });
  });

  it('keeps the first attachment URL while exposing the documented multiple-attachments gap', () => {
    const [event] = eventFor('messenger-multiple-attachments');
    expect(event).toMatchObject({
      content: 'مرفق: image',
      mediaUrl: 'https://example.invalid/meta-test/image.avif',
    });
    const raw = JSON.parse(event!.rawPayload);
    expect(raw.entry[0].messaging[0].message.attachments).toHaveLength(3);
  });

  it('normalizes Instagram Direct reply context and nested Instagram comment context', () => {
    expect(eventFor('instagram-direct-reply')[0]).toMatchObject({
      platform: 'instagram',
      channelType: 'message',
      parentExternalId: 'ig_sgh_test_parent_001',
    });
    expect(eventFor('instagram-comment-reply')[0]).toMatchObject({
      platform: 'instagram',
      channelType: 'comment',
      authorName: 'meta_test_ig_user',
      parentExternalId: '17890000000000001',
      externalThreadId: 'instagram:sgh-meta-test-instagram-200:media:17900000000010001',
      postUrl: 'https://www.instagram.com/p/SGHMetaTest/',
      commentContext: {
        sourceType: 'instagram_media',
        sourceExternalId: '17900000000010001',
        title: 'فيديو اختبار لاختبار سياق وسيط Instagram.',
        previewType: 'VIDEO',
      },
      commentMetadata: { likeCount: 12, replyCount: 2, isHidden: false },
    });
  });

  it('normalizes Facebook comment add events and retains the original post URL', () => {
    expect(eventFor('facebook-comment-add')[0]).toMatchObject({
      platform: 'facebook',
      channelType: 'comment',
      eventType: 'comment',
      authorName: 'مستخدم اختبار Facebook',
      postUrl: 'https://www.facebook.com/sgh-meta-test/posts/001',
      commentContext: {
        sourceType: 'facebook_post',
        sourceExternalId: 'sgh-meta-test-page-100_sgh-meta-test-post-001',
        title: 'منشور Facebook تجريبي لعرض سياق التعليقات.',
        previewType: 'photo',
      },
      commentMetadata: {
        likeCount: 4,
        replyCount: 2,
        canComment: true,
        canReplyPrivately: true,
        isHidden: false,
      },
    });
  });

  it('records the current edit-event coverage gap and accepts Messenger batches', () => {
    expect(eventFor('facebook-comment-edit-gap')).toEqual([]);
    expect(eventFor('messenger-batch')).toMatchObject([
      { externalItemId: 'm_sgh_test_batch_001' },
      { externalItemId: 'm_sgh_test_batch_002' },
    ]);
  });
});
