export type MetaSocialPlatform = 'messenger' | 'instagram' | 'facebook';
export type MetaSocialChannel = 'message' | 'comment';

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

function eventDate(value: unknown, fallback: Date): Date {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }

  return new Date(value < 10_000_000_000 ? value * 1000 : value);
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
    parentExternalId,
    occurredAt: fallbackTime,
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
    postUrl: asString(value.permalink_url),
    parentExternalId: asString(value.parent_id),
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
