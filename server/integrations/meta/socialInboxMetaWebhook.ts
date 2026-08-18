export type MetaSocialPlatform = 'messenger' | 'instagram' | 'facebook';
export type MetaSocialChannel = 'message' | 'comment';

export type MetaCommentContext = {
  sourceType: 'facebook_post' | 'instagram_media';
  sourceExternalId: string;
  title?: string;
  sourceUrl?: string;
  previewUrl?: string;
  previewType?: string;
};

export type MetaCommentMetadata = {
  likeCount?: number;
  replyCount?: number;
  canComment?: boolean;
  canReplyPrivately?: boolean;
  isHidden?: boolean;
  isPrivate?: boolean;
  mediaProductType?: string;
  adId?: string;
  adTitle?: string;
  originalMediaId?: string;
};

export type MetaSocialInboxEvent = {
  platform: MetaSocialPlatform;
  channelType: MetaSocialChannel;
  accountExternalId: string;
  eventType: string;
  eventKey: string;
  externalItemId: string;
  externalThreadId: string;
  direction: 'inbound' | 'outbound';
  authorExternalId?: string;
  authorName?: string;
  content?: string;
  mediaUrl?: string;
  postUrl?: string;
  parentExternalId?: string;
  commentContext?: MetaCommentContext;
  commentMetadata?: MetaCommentMetadata;
  occurredAt: Date;
  rawPayload: string;
};

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as UnknownRecord)
    : null;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function eventDate(value: unknown, fallback: Date): Date {
  if (typeof value === 'string') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? fallback : parsed;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return new Date(value < 10_000_000_000 ? value * 1000 : value);
  }

  return fallback;
}

function attachmentDetails(message: UnknownRecord) {
  const attachments = asArray(message.attachments)
    .map(asRecord)
    .filter((attachment): attachment is UnknownRecord => attachment !== null);
  const firstAttachment = attachments[0];
  const payload = firstAttachment ? asRecord(firstAttachment.payload) : null;
  const mediaUrl = payload ? asString(payload.url) : undefined;
  const attachmentType = firstAttachment ? asString(firstAttachment.type) : undefined;
  const content = attachmentType ? `مرفق: ${attachmentType}` : undefined;

  return { mediaUrl, content };
}

function normalizeMessagingEvent(
  platform: 'messenger' | 'instagram',
  accountExternalId: string,
  event: UnknownRecord,
  rawPayload: string,
  fallbackTime: Date
): MetaSocialInboxEvent | null {
  const message = asRecord(event.message);
  if (!message || message.is_deleted === true) {
    return null;
  }

  const externalItemId = asString(message.mid);
  const sender = asRecord(event.sender);
  const recipient = asRecord(event.recipient);
  const senderId = sender ? asString(sender.id) : undefined;
  const recipientId = recipient ? asString(recipient.id) : undefined;
  if (!externalItemId || !senderId || !recipientId) {
    return null;
  }

  const isOutbound = message.is_echo === true || senderId === accountExternalId;
  const participantExternalId = isOutbound ? recipientId : senderId;
  const replyTo = asRecord(message.reply_to);
  const details = attachmentDetails(message);
  const text = asString(message.text);

  return {
    platform,
    channelType: 'message',
    accountExternalId,
    eventType: 'message',
    eventKey: `${platform}:message:${accountExternalId}:${externalItemId}`,
    externalItemId,
    externalThreadId: `${platform}:${accountExternalId}:${participantExternalId}`,
    direction: isOutbound ? 'outbound' : 'inbound',
    authorExternalId: senderId,
    content: text ?? details.content,
    mediaUrl: details.mediaUrl,
    parentExternalId: replyTo ? asString(replyTo.mid) : undefined,
    occurredAt: eventDate(event.timestamp, fallbackTime),
    rawPayload,
  };
}

function normalizeInstagramComment(
  accountExternalId: string,
  value: UnknownRecord,
  rawPayload: string,
  fallbackTime: Date
): MetaSocialInboxEvent | null {
  const author = asRecord(value.from);
  const media = asRecord(value.media);
  const externalItemId = asString(value.comment_id) ?? asString(value.id);
  const authorExternalId = author ? asString(author.id) : undefined;
  const mediaId = media ? asString(media.id) : undefined;
  if (!externalItemId || !mediaId) {
    return null;
  }

  const parentExternalId = asString(value.parent_id);
  const sourceUrl = asString(media?.permalink) ?? asString(value.permalink);
  const previewUrl =
    asString(media?.thumbnail_url) ?? asString(media?.media_url) ?? asString(value.media_url);
  const previewType = asString(media?.media_type) ?? asString(media?.media_product_type);
  return {
    platform: 'instagram',
    channelType: 'comment',
    accountExternalId,
    eventType: 'comment',
    eventKey: `instagram:comment:${accountExternalId}:${externalItemId}`,
    externalItemId,
    externalThreadId: `instagram:${accountExternalId}:media:${mediaId}`,
    direction: 'inbound',
    authorExternalId,
    authorName: author ? asString(author.username) : undefined,
    content: asString(value.text),
    mediaUrl: previewUrl,
    postUrl: sourceUrl,
    parentExternalId,
    commentContext: {
      sourceType: 'instagram_media',
      sourceExternalId: mediaId,
      title: asString(media?.caption) ?? asString(value.media_caption),
      sourceUrl,
      previewUrl,
      previewType,
    },
    commentMetadata: {
      likeCount: asNumber(value.like_count),
      replyCount: asNumber(value.reply_count),
      isHidden: asBoolean(value.hidden),
      mediaProductType: asString(media?.media_product_type),
      adId: asString(media?.ad_id),
      adTitle: asString(media?.ad_title),
      originalMediaId: asString(media?.original_media_id),
    },
    occurredAt: eventDate(value.timestamp, fallbackTime),
    rawPayload,
  };
}

function normalizeFacebookComment(
  accountExternalId: string,
  value: UnknownRecord,
  rawPayload: string,
  fallbackTime: Date
): MetaSocialInboxEvent | null {
  if (value.item !== 'comment' || value.verb !== 'add') {
    return null;
  }

  const author = asRecord(value.from);
  const externalItemId = asString(value.comment_id);
  const postId = asString(value.post_id) ?? asString(value.parent_id);
  if (!externalItemId || !postId) {
    return null;
  }

  const post = asRecord(value.post);
  const sourceUrl = asString(value.permalink_url) ?? asString(post?.permalink_url);
  const previewUrl = asString(post?.full_picture) ?? asString(value.full_picture);
  return {
    platform: 'facebook',
    channelType: 'comment',
    accountExternalId,
    eventType: 'comment',
    eventKey: `facebook:comment:${accountExternalId}:${externalItemId}`,
    externalItemId,
    externalThreadId: `facebook:${accountExternalId}:post:${postId}`,
    direction: 'inbound',
    authorExternalId: author ? asString(author.id) : undefined,
    authorName: author ? asString(author.name) : undefined,
    content: asString(value.message),
    postUrl: sourceUrl,
    parentExternalId: asString(value.parent_id),
    commentContext: {
      sourceType: 'facebook_post',
      sourceExternalId: postId,
      title: asString(post?.message) ?? asString(value.post_message),
      sourceUrl,
      previewUrl,
      previewType: asString(post?.type) ?? asString(value.post_type),
    },
    commentMetadata: {
      likeCount: asNumber(value.like_count),
      replyCount: asNumber(value.comment_count),
      canComment: asBoolean(value.can_comment),
      canReplyPrivately: asBoolean(value.can_reply_privately),
      isHidden: asBoolean(value.is_hidden),
      isPrivate: asBoolean(value.is_private),
    },
    occurredAt: eventDate(value.created_time, fallbackTime),
    rawPayload,
  };
}

export function normalizeMetaSocialInboxPayload(payload: unknown): MetaSocialInboxEvent[] {
  const body = asRecord(payload);
  const object = body ? asString(body.object) : undefined;
  const rawPayload = JSON.stringify(payload);
  const results: MetaSocialInboxEvent[] = [];

  for (const entryValue of asArray(body?.entry)) {
    const entry = asRecord(entryValue);
    const accountExternalId = entry ? asString(entry.id) : undefined;
    if (!entry || !accountExternalId) {
      continue;
    }

    const fallbackTime = eventDate(entry.time, new Date());
    const messagingPlatform =
      object === 'instagram' ? 'instagram' : object === 'page' ? 'messenger' : null;
    if (messagingPlatform) {
      for (const messagingValue of asArray(entry.messaging)) {
        const normalized = normalizeMessagingEvent(
          messagingPlatform,
          accountExternalId,
          asRecord(messagingValue) ?? {},
          rawPayload,
          fallbackTime
        );
        if (normalized) {
          results.push(normalized);
        }
      }
    }

    if (object === 'instagram') {
      const directComment = entry.field === 'comments' ? asRecord(entry.value) : null;
      const normalizedComment = directComment
        ? normalizeInstagramComment(accountExternalId, directComment, rawPayload, fallbackTime)
        : null;
      if (normalizedComment) {
        results.push(normalizedComment);
      }

      for (const changeValue of asArray(entry.changes)) {
        const change = asRecord(changeValue);
        if (change?.field !== 'comments') {
          continue;
        }
        const normalized = normalizeInstagramComment(
          accountExternalId,
          asRecord(change.value) ?? {},
          rawPayload,
          fallbackTime
        );
        if (normalized) {
          results.push(normalized);
        }
      }
    }

    if (object === 'page') {
      for (const changeValue of asArray(entry.changes)) {
        const change = asRecord(changeValue);
        if (change?.field !== 'feed') {
          continue;
        }
        const normalized = normalizeFacebookComment(
          accountExternalId,
          asRecord(change.value) ?? {},
          rawPayload,
          fallbackTime
        );
        if (normalized) {
          results.push(normalized);
        }
      }
    }
  }

  return results;
}
