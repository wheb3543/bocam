import { eq } from 'drizzle-orm';
import { users, accessRequests, InsertAccessRequest } from '../../../drizzle/schema';
import { createLogger } from '../../_core/logger';
import { getDb } from './connection';
import crypto from 'crypto';

const logger = createLogger('database:users');

// User management for OAuth
export async function upsertUser(user: {
  openId?: string;
  name?: string;
  email?: string;
  loginMethod?: string;
  lastSignedIn?: Date;
}): Promise<void> {
  const db = await getDb();
  if (!db) {
    logger.warn('Cannot upsert user: database not available');
    return;
  }

  if (!user.openId) {
    logger.warn('Cannot upsert user: openId is required');
    return;
  }

  try {
    const existing = await getUserByOpenId(user.openId);

    if (existing) {
      await db
        .update(users)
        .set({
          name: user.name ?? existing.name,
          email: user.email ?? existing.email,
          loginMethod: user.loginMethod ?? existing.loginMethod,
          lastSignedIn: user.lastSignedIn ?? new Date(),
        })
        .where(eq(users.openId, user.openId));
      logger.info('User updated:', user.email);
    } else {
      logger.warn('User not found, cannot create via upsertUser:', user.email);
    }
  } catch (error) {
    logger.error('Failed to upsert user:', error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByUsername(username: string) {
  const db = await getDb();
  if (!db) {
    logger.warn('Cannot get user: database not available');
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) {
    logger.warn('Cannot get user: database not available');
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function isUserAllowed(email: string): Promise<boolean> {
  const user = await getUserByEmail(email);
  return user !== undefined && user.isActive === 'yes';
}

// Access request queries
export async function createAccessRequest(request: InsertAccessRequest) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  const existing = await db
    .select()
    .from(accessRequests)
    .where(eq(accessRequests.email, request.email ?? ''))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const result = await db.insert(accessRequests).values(request);
  return { id: Number(result[0].insertId), ...request };
}

export async function getAllAccessRequests() {
  const db = await getDb();
  if (!db) {
    return [];
  }
  const { desc } = await import('drizzle-orm');
  return db.select().from(accessRequests).orderBy(desc(accessRequests.requestedAt));
}

export async function getPendingAccessRequests() {
  const db = await getDb();
  if (!db) {
    return [];
  }
  const { desc } = await import('drizzle-orm');
  return db
    .select()
    .from(accessRequests)
    .where(eq(accessRequests.status, 'pending'))
    .orderBy(desc(accessRequests.requestedAt));
}

export async function approveAccessRequest(requestId: number, reviewerId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  const request = await db
    .select()
    .from(accessRequests)
    .where(eq(accessRequests.id, requestId))
    .limit(1);

  if (request.length === 0) {
    throw new Error('Request not found');
  }

  if (!request[0].openId) {
    throw new Error('Request missing openId');
  }

  const randomPassword = crypto.randomBytes(32).toString('hex');
  await db.insert(users).values({
    openId: request[0].openId,
    username: request[0].email.split('@')[0],
    password: randomPassword,
    name: request[0].name,
    email: request[0].email,
    role: 'user',
    isActive: 'yes',
  });

  await db
    .update(accessRequests)
    .set({
      status: 'approved',
      reviewedAt: new Date(),
      reviewedBy: reviewerId,
    })
    .where(eq(accessRequests.id, requestId));
}

export async function rejectAccessRequest(requestId: number, reviewerId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  await db
    .update(accessRequests)
    .set({
      status: 'rejected',
      reviewedAt: new Date(),
      reviewedBy: reviewerId,
    })
    .where(eq(accessRequests.id, requestId));
}
