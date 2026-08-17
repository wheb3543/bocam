import { and, asc, desc, eq, inArray, like, or } from 'drizzle-orm';
import {
  InsertSocialInboxAccount,
  InsertSocialInboxItem,
  InsertSocialInboxThread,
  socialInboxAccounts,
  socialInboxItems,
  socialInboxThreads,
  socialInboxWebhookEvents,
  SocialInboxThread,
} from '../../../drizzle/schema';
import { getDb } from './connection';
import type { MetaSocialInboxEvent } from '../../integrations/meta/socialInboxMetaWebhook';

type SocialInboxFilters = {
  platform?: 'messenger' | 'instagram' | 'facebook' | 'x' | 'linkedin' | 'youtube';
  channelType?: 'message' | 'comment';
  search?: string;
  unreadOnly?: boolean;
};

export async function listSocialInboxAccounts() {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return db.select().from(socialInboxAccounts).orderBy(asc(socialInboxAccounts.platform));
}

export async function listSocialInboxThreads(filters: SocialInboxFilters = {}) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  const conditions = [];
  if (filters.platform) {
    conditions.push(eq(socialInboxThreads.platform, filters.platform));
  }
  if (filters.channelType) {
    conditions.push(eq(socialInboxThreads.channelType, filters.channelType));
  }
  if (filters.unreadOnly) {
    conditions.push(eq(socialInboxThreads.isRead, false));
  }
  if (filters.search?.trim()) {
    const search = `%${filters.search.trim()}%`;
    conditions.push(
      or(
        like(socialInboxThreads.title, search),
        like(socialInboxThreads.participantName, search),
        like(socialInboxThreads.preview, search)
      )
    );
  }

  const query = db.select().from(socialInboxThreads);
  return conditions.length
    ? query
        .where(and(...conditions))
        .orderBy(desc(socialInboxThreads.lastActivityAt), desc(socialInboxThreads.createdAt))
        .limit(200)
    : query
        .orderBy(desc(socialInboxThreads.lastActivityAt), desc(socialInboxThreads.createdAt))
        .limit(200);
}

export async function getSocialInboxThreadById(id: number) {
  const db = await getDb();
  if (!db) {
    return null;
  }

  const [thread] = await db
    .select()
    .from(socialInboxThreads)
    .where(eq(socialInboxThreads.id, id))
    .limit(1);
  if (!thread) {
    return null;
  }

  const items = await db
    .select()
    .from(socialInboxItems)
    .where(eq(socialInboxItems.threadId, id))
    .orderBy(asc(socialInboxItems.createdAt));

  return { thread, items };
}

export async function createSocialInboxAccount(account: InsertSocialInboxAccount) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  const result = await db.insert(socialInboxAccounts).values(account);
  return Number(result[0].insertId);
}

export async function updateSocialInboxAccount(
  id: number,
  patch: Partial<InsertSocialInboxAccount>
) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  await db.update(socialInboxAccounts).set(patch).where(eq(socialInboxAccounts.id, id));
  return { success: true };
}

export async function ensureSocialInboxAccount({
  platform,
  externalAccountId,
  displayName,
  accountType = 'page',
}: {
  platform: 'messenger' | 'instagram' | 'facebook';
  externalAccountId: string;
  displayName: string;
  accountType?: 'page' | 'profile' | 'business' | 'channel';
}) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  const [existing] = await db
    .select()
    .from(socialInboxAccounts)
    .where(
      and(
        eq(socialInboxAccounts.platform, platform),
        eq(socialInboxAccounts.externalAccountId, externalAccountId)
      )
    )
    .limit(1);

  if (existing) {
    await db
      .update(socialInboxAccounts)
      .set({ displayName, accountType, status: 'pending', isActive: true, lastError: null })
      .where(eq(socialInboxAccounts.id, existing.id));
    return existing.id;
  }

  return createSocialInboxAccount({
    platform,
    accountType,
    displayName,
    externalAccountId,
    status: 'pending',
    isActive: true,
  });
}

export async function createSocialInboxThread(thread: InsertSocialInboxThread) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  const result = await db.insert(socialInboxThreads).values(thread);
  return Number(result[0].insertId);
}

export async function createSocialInboxItem(item: InsertSocialInboxItem) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  const result = await db.insert(socialInboxItems).values(item);
  return Number(result[0].insertId);
}

type MetaWebhookProcessingResult = {
  status: 'processed' | 'duplicate' | 'ignored';
  threadId?: number;
  itemId?: number;
  reason?: string;
};

function isDuplicateKeyError(error: unknown) {
  return (
    typeof error === 'object' && error !== null && 'code' in error && error.code === 'ER_DUP_ENTRY'
  );
}

async function updateMetaWebhookEventStatus(
  id: number,
  processingStatus: 'processed' | 'ignored' | 'failed',
  processingError?: string
) {
  const db = await getDb();
  if (!db) {
    return;
  }

  await db
    .update(socialInboxWebhookEvents)
    .set({ processingStatus, processingError, processedAt: new Date() })
    .where(eq(socialInboxWebhookEvents.id, id));
}

export async function ingestMetaSocialInboxEvent(
  event: MetaSocialInboxEvent
): Promise<MetaWebhookProcessingResult> {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  let webhookEventId: number;
  try {
    const result = await db.insert(socialInboxWebhookEvents).values({
      provider: 'meta',
      platform: event.platform,
      accountExternalId: event.accountExternalId,
      eventType: event.eventType,
      eventKey: event.eventKey,
      rawPayload: event.rawPayload,
    });
    webhookEventId = Number(result[0].insertId);
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return { status: 'duplicate', reason: 'تم استلام الحدث نفسه سابقاً' };
    }
    throw error;
  }

  try {
    const [account] = await db
      .select()
      .from(socialInboxAccounts)
      .where(
        and(
          eq(socialInboxAccounts.platform, event.platform),
          eq(socialInboxAccounts.externalAccountId, event.accountExternalId)
        )
      )
      .limit(1);

    if (!account) {
      const reason = 'الحساب المرتبط غير مسجل أو غير مفعل في صندوق البريد';
      await updateMetaWebhookEventStatus(webhookEventId, 'ignored', reason);
      return { status: 'ignored', reason };
    }

    const [existingThread] = await db
      .select()
      .from(socialInboxThreads)
      .where(
        and(
          eq(socialInboxThreads.accountId, account.id),
          eq(socialInboxThreads.platform, event.platform),
          eq(socialInboxThreads.channelType, event.channelType),
          eq(socialInboxThreads.externalThreadId, event.externalThreadId)
        )
      )
      .limit(1);

    const threadId = existingThread
      ? existingThread.id
      : Number(
          (
            await db.insert(socialInboxThreads).values({
              accountId: account.id,
              platform: event.platform,
              channelType: event.channelType,
              externalThreadId: event.externalThreadId,
              title: event.channelType === 'comment' ? 'تعليقات منشور' : (event.authorName ?? null),
              participantExternalId: event.authorExternalId ?? null,
              participantName: event.authorName ?? null,
              preview: event.content ?? null,
              postUrl: event.postUrl ?? null,
              lastActivityAt: event.occurredAt,
              unreadCount: event.direction === 'inbound' ? 1 : 0,
              isRead: event.direction !== 'inbound',
            })
          )[0].insertId
        );

    const [existingItem] = await db
      .select({ id: socialInboxItems.id })
      .from(socialInboxItems)
      .where(
        and(
          eq(socialInboxItems.accountId, account.id),
          eq(socialInboxItems.platform, event.platform),
          eq(socialInboxItems.externalItemId, event.externalItemId)
        )
      )
      .limit(1);

    if (existingItem) {
      await updateMetaWebhookEventStatus(webhookEventId, 'processed');
      return {
        status: 'duplicate',
        threadId,
        itemId: existingItem.id,
        reason: 'العنصر موجود مسبقاً',
      };
    }

    const itemResult = await db.insert(socialInboxItems).values({
      threadId,
      accountId: account.id,
      platform: event.platform,
      channelType: event.channelType,
      direction: event.direction,
      externalItemId: event.externalItemId,
      authorExternalId: event.authorExternalId ?? null,
      authorName: event.authorName ?? null,
      content: event.content ?? null,
      mediaUrl: event.mediaUrl ?? null,
      parentExternalId: event.parentExternalId ?? null,
      externalPublishedAt: event.occurredAt,
      isRead: event.direction !== 'inbound',
      status: event.direction === 'outbound' ? 'sent' : 'received',
      rawPayload: event.rawPayload,
    });
    const itemId = Number(itemResult[0].insertId);

    await db
      .update(socialInboxThreads)
      .set({
        preview: event.content ?? existingThread?.preview ?? null,
        participantExternalId:
          event.authorExternalId ?? existingThread?.participantExternalId ?? null,
        participantName: event.authorName ?? existingThread?.participantName ?? null,
        postUrl: event.postUrl ?? existingThread?.postUrl ?? null,
        lastActivityAt: event.occurredAt,
        unreadCount:
          event.direction === 'inbound'
            ? (existingThread?.unreadCount ?? 0) + 1
            : (existingThread?.unreadCount ?? 0),
        isRead: event.direction === 'inbound' ? false : (existingThread?.isRead ?? true),
      })
      .where(eq(socialInboxThreads.id, threadId));

    await db
      .update(socialInboxAccounts)
      .set({ status: 'connected', lastSyncedAt: new Date(), lastError: null })
      .where(eq(socialInboxAccounts.id, account.id));
    await updateMetaWebhookEventStatus(webhookEventId, 'processed');

    return { status: 'processed', threadId, itemId };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'تعذر تطبيع حدث Meta';
    await updateMetaWebhookEventStatus(webhookEventId, 'failed', message);
    throw error;
  }
}

export async function markSocialInboxThreadRead(id: number, isRead: boolean) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  await db
    .update(socialInboxThreads)
    .set({ isRead, unreadCount: isRead ? 0 : 1 })
    .where(eq(socialInboxThreads.id, id));

  if (isRead) {
    await db
      .update(socialInboxItems)
      .set({ isRead: true })
      .where(eq(socialInboxItems.threadId, id));
  }

  return { success: true };
}

export async function setSocialInboxThreadStarred(id: number, isStarred: boolean) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  await db.update(socialInboxThreads).set({ isStarred }).where(eq(socialInboxThreads.id, id));
  return { success: true };
}

export async function assignSocialInboxThread(id: number, assignedToUserId: number | null) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  await db
    .update(socialInboxThreads)
    .set({ assignedToUserId })
    .where(eq(socialInboxThreads.id, id));
  return { success: true };
}

export async function getSocialInboxStats() {
  const db = await getDb();
  if (!db) {
    return { total: 0, unread: 0, messages: 0, comments: 0 };
  }

  const threads = await db.select().from(socialInboxThreads).limit(1000);
  return {
    total: threads.length,
    unread: threads.filter((thread: SocialInboxThread) => !thread.isRead).length,
    messages: threads.filter((thread: SocialInboxThread) => thread.channelType === 'message')
      .length,
    comments: threads.filter((thread: SocialInboxThread) => thread.channelType === 'comment')
      .length,
  };
}

export async function clearMetaSocialInboxTestData() {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  const testAccounts = await db
    .select({ id: socialInboxAccounts.id })
    .from(socialInboxAccounts)
    .where(like(socialInboxAccounts.externalAccountId, 'sgh-meta-test-%'));
  const accountIds = testAccounts.map((account) => account.id);
  const testEvents = await db
    .select({ id: socialInboxWebhookEvents.id })
    .from(socialInboxWebhookEvents)
    .where(like(socialInboxWebhookEvents.accountExternalId, 'sgh-meta-test-%'));

  if (accountIds.length === 0) {
    return { success: true, accounts: 0, events: testEvents.length };
  }

  const testThreads = await db
    .select({ id: socialInboxThreads.id })
    .from(socialInboxThreads)
    .where(inArray(socialInboxThreads.accountId, accountIds));
  const testItems = await db
    .select({ id: socialInboxItems.id })
    .from(socialInboxItems)
    .where(inArray(socialInboxItems.accountId, accountIds));

  await db.delete(socialInboxItems).where(inArray(socialInboxItems.accountId, accountIds));
  await db.delete(socialInboxThreads).where(inArray(socialInboxThreads.accountId, accountIds));
  await db
    .delete(socialInboxWebhookEvents)
    .where(like(socialInboxWebhookEvents.accountExternalId, 'sgh-meta-test-%'));
  await db.delete(socialInboxAccounts).where(inArray(socialInboxAccounts.id, accountIds));

  return {
    success: true,
    accounts: accountIds.length,
    threads: testThreads.length,
    items: testItems.length,
    events: testEvents.length,
  };
}
