import { meta } from '../../api/MetaApiService';
import { getMetaWebhookCredentials } from '../../database/db/metaIntegrationSettings';
import {
  getSocialInboxCommentActionTarget,
  updateSocialInboxCommentEnrichment,
  updateSocialInboxCommentMetadata,
} from '../../database/db/socialInbox';

type MetaPlatform = 'facebook' | 'instagram';

export type MetaCommentActionTarget = {
  platform: MetaPlatform;
  accountExternalId: string;
  commentExternalId: string;
  sourceExternalId: string;
  occurredAt: Date | null;
};

type MetaClient = Pick<typeof meta, 'getWithAccessToken' | 'postWithAccessToken'>;

type MetaGraphError = { message?: string };

function errorMessage(error: unknown, fallback: string) {
  return typeof error === 'object' && error !== null && 'message' in error
    ? String((error as MetaGraphError).message ?? fallback)
    : fallback;
}

function assertMetaSuccess(response: { ok: boolean; error?: unknown }, fallback: string) {
  if (!response.ok) {
    throw new Error(errorMessage(response.error, fallback));
  }
}

export async function replyToMetaComment(
  target: MetaCommentActionTarget,
  message: string,
  accessToken: string,
  client: MetaClient = meta
) {
  const response =
    target.platform === 'facebook'
      ? await client.postWithAccessToken<{ id?: string }>(
          `${target.commentExternalId}/comments`,
          accessToken,
          { message }
        )
      : await client.postWithAccessToken<{ id?: string }>(
          `${target.commentExternalId}/replies`,
          accessToken,
          { message }
        );
  assertMetaSuccess(response, 'تعذر إرسال الرد إلى Meta');
  return { externalItemId: response.data?.id ?? null };
}

export async function setMetaCommentHidden(
  target: MetaCommentActionTarget,
  isHidden: boolean,
  accessToken: string,
  client: MetaClient = meta
) {
  const payload = target.platform === 'facebook' ? { is_hidden: isHidden } : { hide: isHidden };
  const response = await client.postWithAccessToken<{ success?: boolean }>(
    target.commentExternalId,
    accessToken,
    payload
  );
  assertMetaSuccess(response, 'تعذر تحديث حالة إخفاء التعليق في Meta');
  return { success: true };
}

export async function sendMetaCommentPrivateReply(
  target: MetaCommentActionTarget,
  message: string,
  accessToken: string,
  client: MetaClient = meta
) {
  if (target.platform === 'instagram' && target.occurredAt) {
    const ageMs = Date.now() - target.occurredAt.getTime();
    if (ageMs > 7 * 24 * 60 * 60 * 1000) {
      throw new Error('انتهت نافذة السبعة أيام المسموحة للرد الخاص على تعليق Instagram');
    }
  }

  const response =
    target.platform === 'facebook'
      ? await client.postWithAccessToken<{ id?: string }>(
          `${target.commentExternalId}/private_replies`,
          accessToken,
          { message }
        )
      : await client.postWithAccessToken<{ message_id?: string }>(
          `${target.accountExternalId}/messages`,
          accessToken,
          { recipient: { comment_id: target.commentExternalId }, message: { text: message } }
        );
  assertMetaSuccess(response, 'تعذر إرسال الرد الخاص إلى Meta');
  return {
    externalMessageId:
      response.data && 'message_id' in response.data
        ? (response.data.message_id ?? null)
        : response.data && 'id' in response.data
          ? (response.data.id ?? null)
          : null,
  };
}

export async function enrichMetaCommentContext(
  target: MetaCommentActionTarget,
  accessToken: string,
  client: MetaClient = meta
) {
  const sourceFields =
    target.platform === 'facebook'
      ? 'message,permalink_url,full_picture,type'
      : 'caption,media_type,media_product_type,media_url,thumbnail_url,permalink';
  const commentFields =
    target.platform === 'facebook'
      ? 'like_count,comment_count,can_comment,can_reply_privately,is_hidden,is_private,parent'
      : 'text,timestamp,like_count,hidden,parent_id';

  const [sourceResponse, commentResponse] = await Promise.all([
    client.getWithAccessToken<Record<string, unknown>>(target.sourceExternalId, accessToken, {
      fields: sourceFields,
    }),
    client.getWithAccessToken<Record<string, unknown>>(target.commentExternalId, accessToken, {
      fields: commentFields,
    }),
  ]);
  assertMetaSuccess(sourceResponse, 'تعذر إثراء المنشور أو الوسيط من Meta');
  assertMetaSuccess(commentResponse, 'تعذر إثراء التعليق من Meta');

  const source = sourceResponse.data ?? {};
  const comment = commentResponse.data ?? {};
  const context =
    target.platform === 'facebook'
      ? {
          sourceType: 'facebook_post',
          sourceExternalId: target.sourceExternalId,
          title: typeof source.message === 'string' ? source.message : undefined,
          sourceUrl: typeof source.permalink_url === 'string' ? source.permalink_url : undefined,
          previewUrl: typeof source.full_picture === 'string' ? source.full_picture : undefined,
          previewType: typeof source.type === 'string' ? source.type : undefined,
        }
      : {
          sourceType: 'instagram_media',
          sourceExternalId: target.sourceExternalId,
          title: typeof source.caption === 'string' ? source.caption : undefined,
          sourceUrl: typeof source.permalink === 'string' ? source.permalink : undefined,
          previewUrl:
            typeof source.thumbnail_url === 'string'
              ? source.thumbnail_url
              : typeof source.media_url === 'string'
                ? source.media_url
                : undefined,
          previewType:
            typeof source.media_type === 'string'
              ? source.media_type
              : typeof source.media_product_type === 'string'
                ? source.media_product_type
                : undefined,
        };

  return {
    context,
    commentMetadata:
      target.platform === 'facebook'
        ? {
            likeCount: typeof comment.like_count === 'number' ? comment.like_count : undefined,
            replyCount:
              typeof comment.comment_count === 'number' ? comment.comment_count : undefined,
            canComment: typeof comment.can_comment === 'boolean' ? comment.can_comment : undefined,
            canReplyPrivately:
              typeof comment.can_reply_privately === 'boolean'
                ? comment.can_reply_privately
                : undefined,
            isHidden: typeof comment.is_hidden === 'boolean' ? comment.is_hidden : undefined,
            isPrivate: typeof comment.is_private === 'boolean' ? comment.is_private : undefined,
          }
        : {
            likeCount: typeof comment.like_count === 'number' ? comment.like_count : undefined,
            isHidden: typeof comment.hidden === 'boolean' ? comment.hidden : undefined,
          },
  };
}

/**
 * إثراء محفوظ وآمن يستدعى بعد إقرار Webhook؛ يتجاوز الحسابات التجريبية والإعدادات الناقصة.
 */
export async function enrichStoredMetaCommentContext(threadId: number, itemId: number) {
  try {
    const target = await getSocialInboxCommentActionTarget(threadId, itemId);
    if (target.thread.platform !== 'facebook' && target.thread.platform !== 'instagram') {
      return { enriched: false, reason: 'المنصة لا تدعم إثراء التعليقات عبر Meta' };
    }
    const context = target.commentContext as { title?: string; previewUrl?: string } | null;
    if (context?.title && context.previewUrl) {
      return { enriched: false, reason: 'سياق المنشور أو الوسيط مكتمل بالفعل' };
    }

    const credentials = await getMetaWebhookCredentials();
    if (!credentials?.pageAccessToken) {
      return { enriched: false, reason: 'Page Access Token غير مهيأ' };
    }

    const result = await enrichMetaCommentContext(
      {
        platform: target.thread.platform,
        accountExternalId: target.account.externalAccountId,
        commentExternalId: target.item.externalItemId,
        sourceExternalId:
          (target.commentContext as { sourceExternalId?: string } | null)?.sourceExternalId ??
          target.thread.externalThreadId,
        occurredAt: target.item.externalPublishedAt,
      },
      credentials.pageAccessToken
    );
    await Promise.all([
      updateSocialInboxCommentEnrichment(threadId, {
        postUrl: result.context.sourceUrl,
        commentContext: result.context,
      }),
      updateSocialInboxCommentMetadata(itemId, result.commentMetadata),
    ]);
    return { enriched: true };
  } catch (error) {
    return { enriched: false, reason: errorMessage(error, 'تعذر إثراء سياق التعليق') };
  }
}
