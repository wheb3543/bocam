/**
 * حمولات اختبار مستوحاة مباشرة من بنى Webhooks المنشورة من Meta.
 * جميع المعرفات والأسماء والمحتوى اصطناعية وموسومة صراحةً للاختبار.
 */
export type MetaPayloadFixture = {
  id: string;
  label: string;
  expectedEventCount: number;
  payload: Record<string, unknown>;
};

export const META_TEST_ACCOUNT_PREFIX = 'sgh-meta-test-';
export const META_TEST_DATA_LABEL = 'بيانات اختبار Meta — قابلة للحذف';

export const metaPayloadFixtures: MetaPayloadFixture[] = [
  {
    id: 'messenger-text',
    label: 'رسالة Messenger نصية واردة',
    expectedEventCount: 1,
    payload: {
      object: 'page',
      entry: [
        {
          id: 'sgh-meta-test-page-100',
          time: 1_785_081_600_000,
          messaging: [
            {
              sender: { id: 'sgh-meta-test-psid-001' },
              recipient: { id: 'sgh-meta-test-page-100' },
              timestamp: 1_785_081_600_100,
              message: {
                mid: 'm_sgh_test_text_001',
                text: 'رسالة اختبار Messenger مطابقة لبنية Meta الرسمية.',
              },
            },
          ],
        },
      ],
    },
  },
  {
    id: 'messenger-multiple-attachments',
    label: 'رسالة Messenger بمرفقات متعددة',
    expectedEventCount: 1,
    payload: {
      object: 'page',
      entry: [
        {
          id: 'sgh-meta-test-page-100',
          time: 1_785_081_601_000,
          messaging: [
            {
              sender: { id: 'sgh-meta-test-psid-002' },
              recipient: { id: 'sgh-meta-test-page-100' },
              timestamp: 1_785_081_601_100,
              message: {
                mid: 'm_sgh_test_media_001',
                attachments: [
                  {
                    type: 'image',
                    payload: { url: 'https://example.invalid/meta-test/image.avif' },
                  },
                  {
                    type: 'video',
                    payload: { url: 'https://example.invalid/meta-test/video.mp4' },
                  },
                  {
                    type: 'file',
                    payload: { url: 'https://example.invalid/meta-test/document.pdf' },
                  },
                ],
              },
            },
          ],
        },
      ],
    },
  },
  {
    id: 'instagram-direct-reply',
    label: 'رسالة Instagram Direct مع مرجع رد',
    expectedEventCount: 1,
    payload: {
      object: 'instagram',
      entry: [
        {
          id: 'sgh-meta-test-instagram-200',
          time: 1_785_081_602_000,
          messaging: [
            {
              sender: { id: 'sgh-meta-test-ig-user-001' },
              recipient: { id: 'sgh-meta-test-instagram-200' },
              timestamp: 1_785_081_602_100,
              message: {
                mid: 'ig_sgh_test_reply_001',
                text: 'هذا رد اختبار على رسالة سابقة في Instagram.',
                reply_to: { mid: 'ig_sgh_test_parent_001' },
              },
            },
          ],
        },
      ],
    },
  },
  {
    id: 'instagram-comment-reply',
    label: 'تعليق Instagram متداخل مع parent_id وmedia',
    expectedEventCount: 1,
    payload: {
      object: 'instagram',
      entry: [
        {
          id: 'sgh-meta-test-instagram-200',
          time: 1_785_081_603_000,
          changes: [
            {
              field: 'comments',
              value: {
                id: '17890000000010001',
                comment_id: '17890000000010001',
                text: 'رد اختبار Instagram على تعليق سابق.',
                from: { id: 'sgh-meta-test-ig-user-002', username: 'meta_test_ig_user' },
                parent_id: '17890000000000001',
                media: {
                  id: '17900000000010001',
                  media_product_type: 'FEED',
                },
              },
            },
          ],
        },
      ],
    },
  },
  {
    id: 'facebook-comment-add',
    label: 'تعليق Facebook جديد مع رابط المنشور',
    expectedEventCount: 1,
    payload: {
      object: 'page',
      entry: [
        {
          id: 'sgh-meta-test-page-100',
          time: 1_785_081_604_000,
          changes: [
            {
              field: 'feed',
              value: {
                item: 'comment',
                verb: 'add',
                comment_id: 'sgh-meta-test-fb-comment-001',
                post_id: 'sgh-meta-test-page-100_sgh-meta-test-post-001',
                parent_id: 'sgh-meta-test-page-100_sgh-meta-test-post-001',
                message: 'تعليق اختبار Facebook وارد إلى صندوق البريد.',
                created_time: 1_785_081_604,
                permalink_url: 'https://www.facebook.com/sgh-meta-test/posts/001',
                from: { id: 'sgh-meta-test-fb-user-001', name: 'مستخدم اختبار Facebook' },
              },
            },
          ],
        },
      ],
    },
  },
  {
    id: 'facebook-comment-edit-gap',
    label: 'تعديل تعليق Facebook لا يدعمه التطبيع الحالي بعد',
    expectedEventCount: 0,
    payload: {
      object: 'page',
      entry: [
        {
          id: 'sgh-meta-test-page-100',
          time: 1_785_081_605_000,
          changes: [
            {
              field: 'feed',
              value: {
                item: 'comment',
                verb: 'edit',
                comment_id: 'sgh-meta-test-fb-comment-001',
                post_id: 'sgh-meta-test-page-100_sgh-meta-test-post-001',
                message: 'نص معدّل لا يُطبّع حالياً، وهو سيناريو فجوة مقصود.',
                created_time: 1_785_081_605,
                from: { id: 'sgh-meta-test-fb-user-001', name: 'مستخدم اختبار Facebook' },
              },
            },
          ],
        },
      ],
    },
  },
  {
    id: 'messenger-batch',
    label: 'دفعة Messenger متعددة الأحداث',
    expectedEventCount: 2,
    payload: {
      object: 'page',
      entry: [
        {
          id: 'sgh-meta-test-page-100',
          time: 1_785_081_606_000,
          messaging: [
            {
              sender: { id: 'sgh-meta-test-psid-003' },
              recipient: { id: 'sgh-meta-test-page-100' },
              timestamp: 1_785_081_606_100,
              message: { mid: 'm_sgh_test_batch_001', text: 'العنصر الأول في دفعة الاختبار.' },
            },
            {
              sender: { id: 'sgh-meta-test-psid-004' },
              recipient: { id: 'sgh-meta-test-page-100' },
              timestamp: 1_785_081_606_200,
              message: { mid: 'm_sgh_test_batch_002', text: 'العنصر الثاني في دفعة الاختبار.' },
            },
          ],
        },
      ],
    },
  },
];
