import { and, asc, desc, eq, like, or } from 'drizzle-orm';
import {
  InsertSocialInboxAccount,
  InsertSocialInboxItem,
  InsertSocialInboxThread,
  socialInboxAccounts,
  socialInboxItems,
  socialInboxThreads,
  SocialInboxThread,
} from '../../../drizzle/schema';
import { getDb } from './connection';

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
