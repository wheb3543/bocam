import { and, desc, eq, inArray, lte } from 'drizzle-orm';
import {
  media,
  integrationDeliveryJobs,
  socialPublishAccounts,
  socialPublishAttempts,
  socialPublishDestinations,
  socialPublishPostMedia,
  socialPublishPosts,
  settings,
  users,
} from '../../../drizzle/schema';
import { getDb } from './connection';
import {
  dispatchQueuedSocialPublishDeliveries,
  enqueueSocialPublishDeliveryJobs,
  retrySocialPublishDelivery,
} from './socialPublishingDelivery';

export type SocialPublishPlatform =
  'facebook' | 'instagram' | 'x' | 'linkedin' | 'youtube' | 'tiktok';
export type SocialPublishContentType = 'post' | 'image' | 'video' | 'reel' | 'story' | 'short';

export type CreateSocialPublishDraftInput = {
  title: string;
  baseCaption?: string | null;
  contentType: SocialPublishContentType;
  platforms: SocialPublishPlatform[];
  mediaIds: number[];
  campaignId?: number | null;
  timezone?: string;
  createdByUserId: number;
};

function idempotencyKey(postId: number, platform: SocialPublishPlatform) {
  return `sp-${postId}-${platform}-${crypto.randomUUID()}`.slice(0, 128);
}

async function ensureDb() {
  const db = await getDb();
  if (!db) {
    throw new Error('قاعدة البيانات غير متاحة حالياً');
  }
  return db;
}

export async function listSocialPublishAccounts() {
  const db = await ensureDb();
  return db
    .select()
    .from(socialPublishAccounts)
    .orderBy(socialPublishAccounts.platform, socialPublishAccounts.displayName);
}

export async function getSocialPublishPost(postId: number) {
  const db = await ensureDb();
  const [post] = await db
    .select({
      post: socialPublishPosts,
      creatorName: users.name,
    })
    .from(socialPublishPosts)
    .leftJoin(users, eq(socialPublishPosts.createdByUserId, users.id))
    .where(eq(socialPublishPosts.id, postId))
    .limit(1);

  if (!post) {
    return null;
  }

  const [destinations, linkedMedia, attempts, deliveryJobs] = await Promise.all([
    db
      .select({
        destination: socialPublishDestinations,
        account: socialPublishAccounts,
      })
      .from(socialPublishDestinations)
      .leftJoin(
        socialPublishAccounts,
        eq(socialPublishDestinations.accountId, socialPublishAccounts.id)
      )
      .where(eq(socialPublishDestinations.postId, postId))
      .orderBy(socialPublishDestinations.platform),
    db
      .select({
        link: socialPublishPostMedia,
        media,
      })
      .from(socialPublishPostMedia)
      .innerJoin(media, eq(socialPublishPostMedia.mediaId, media.id))
      .where(eq(socialPublishPostMedia.postId, postId))
      .orderBy(socialPublishPostMedia.sortOrder),
    db
      .select()
      .from(socialPublishAttempts)
      .innerJoin(
        socialPublishDestinations,
        eq(socialPublishAttempts.destinationId, socialPublishDestinations.id)
      )
      .where(eq(socialPublishDestinations.postId, postId))
      .orderBy(desc(socialPublishAttempts.createdAt))
      .limit(30),
    db
      .select()
      .from(integrationDeliveryJobs)
      .innerJoin(
        socialPublishDestinations,
        eq(integrationDeliveryJobs.destinationId, socialPublishDestinations.id)
      )
      .where(eq(socialPublishDestinations.postId, postId))
      .orderBy(desc(integrationDeliveryJobs.updatedAt)),
  ]);

  return { ...post, destinations, media: linkedMedia, attempts, deliveryJobs };
}

export async function listSocialPublishPosts(limit = 40) {
  const db = await ensureDb();
  const posts = await db
    .select({ id: socialPublishPosts.id })
    .from(socialPublishPosts)
    .orderBy(desc(socialPublishPosts.updatedAt))
    .limit(limit);
  const details = await Promise.all(posts.map(({ id }) => getSocialPublishPost(id)));
  return details.filter((post): post is NonNullable<typeof post> => post !== null);
}

export async function getSocialPublishingOverview() {
  const [accounts, posts] = await Promise.all([
    listSocialPublishAccounts(),
    listSocialPublishPosts(12),
  ]);
  const connectedAccounts = accounts.filter(
    (account) => account.connectionStatus === 'connected'
  ).length;
  return {
    accounts,
    posts,
    totals: {
      connectedAccounts,
      draft: posts.filter((entry) => entry.post.status === 'draft').length,
      awaitingReview: posts.filter((entry) => entry.post.status === 'in_review').length,
      scheduled: posts.filter((entry) => entry.post.status === 'scheduled').length,
    },
  };
}

export async function createSocialPublishDraft(input: CreateSocialPublishDraftInput) {
  const db = await ensureDb();
  const uniquePlatforms = Array.from(new Set(input.platforms)) as SocialPublishPlatform[];
  const uniqueMediaIds = Array.from(new Set(input.mediaIds)) as number[];

  if (uniqueMediaIds.length) {
    const availableMedia = await db
      .select({ id: media.id })
      .from(media)
      .where(inArray(media.id, uniqueMediaIds));
    if (availableMedia.length !== uniqueMediaIds.length) {
      throw new Error('تتضمن المسودة وسائط غير موجودة أو محذوفة');
    }
  }

  const [inserted] = await db
    .insert(socialPublishPosts)
    .values({
      title: input.title,
      baseCaption: input.baseCaption ?? null,
      contentType: input.contentType,
      campaignId: input.campaignId ?? null,
      timezone: input.timezone ?? 'Asia/Aden',
      createdByUserId: input.createdByUserId,
      status: 'draft',
    })
    .$returningId();
  const postId = Number(inserted.id);

  if (uniqueMediaIds.length) {
    await db.insert(socialPublishPostMedia).values(
      uniqueMediaIds.map((mediaId, sortOrder) => ({
        postId,
        mediaId,
        role: sortOrder === 0 ? ('primary' as const) : ('supplementary' as const),
        sortOrder,
      }))
    );
  }

  const connectedAccounts = await db
    .select()
    .from(socialPublishAccounts)
    .where(
      and(
        inArray(socialPublishAccounts.platform, uniquePlatforms),
        eq(socialPublishAccounts.connectionStatus, 'connected')
      )
    );

  await db.insert(socialPublishDestinations).values(
    uniquePlatforms.map((platform) => {
      const account = connectedAccounts.find((item) => item.platform === platform);
      return {
        postId,
        platform,
        accountId: account?.id ?? null,
        captionOverride: null,
        publicationStatus: account ? ('pending' as const) : ('not_ready' as const),
        idempotencyKey: idempotencyKey(postId, platform),
      };
    })
  );

  return getSocialPublishPost(postId);
}

export async function updateSocialPublishDraft(
  postId: number,
  actorUserId: number,
  patch: Pick<CreateSocialPublishDraftInput, 'title' | 'baseCaption' | 'contentType' | 'campaignId'>
) {
  const db = await ensureDb();
  const [post] = await db
    .select()
    .from(socialPublishPosts)
    .where(eq(socialPublishPosts.id, postId))
    .limit(1);
  if (!post) {
    throw new Error('مسودة النشر غير موجودة');
  }
  if (post.createdByUserId !== actorUserId || !['draft', 'cancelled'].includes(post.status)) {
    throw new Error('لا يمكن تعديل هذه المسودة في حالتها الحالية');
  }
  await db
    .update(socialPublishPosts)
    .set({
      title: patch.title,
      baseCaption: patch.baseCaption ?? null,
      contentType: patch.contentType,
      campaignId: patch.campaignId ?? null,
      status: 'draft',
    })
    .where(eq(socialPublishPosts.id, postId));
  return getSocialPublishPost(postId);
}

export async function submitSocialPublishPostForReview(postId: number, actorUserId: number) {
  const db = await ensureDb();
  const [post] = await db
    .select()
    .from(socialPublishPosts)
    .where(eq(socialPublishPosts.id, postId))
    .limit(1);
  if (!post || post.createdByUserId !== actorUserId) {
    throw new Error('لا تملك صلاحية إرسال هذه المسودة');
  }
  if (!['draft', 'cancelled'].includes(post.status)) {
    throw new Error('المسودة ليست قابلة للإرسال للموافقة');
  }
  await db
    .update(socialPublishPosts)
    .set({ status: 'in_review', approvalNotes: null })
    .where(eq(socialPublishPosts.id, postId));
  return getSocialPublishPost(postId);
}

export async function reviewSocialPublishPost(
  postId: number,
  reviewerUserId: number,
  decision: 'approved' | 'rejected',
  notes?: string | null
) {
  const db = await ensureDb();
  const [post] = await db
    .select()
    .from(socialPublishPosts)
    .where(eq(socialPublishPosts.id, postId))
    .limit(1);
  if (!post || post.status !== 'in_review') {
    throw new Error('لا توجد موافقة معلقة لهذه المسودة');
  }

  const now = new Date();
  await db
    .update(socialPublishPosts)
    .set(
      decision === 'approved'
        ? {
            status: 'approved',
            approvedByUserId: reviewerUserId,
            approvedAt: now,
            approvalNotes: notes ?? null,
          }
        : {
            status: 'draft',
            rejectedByUserId: reviewerUserId,
            rejectedAt: now,
            approvalNotes: notes ?? null,
          }
    )
    .where(eq(socialPublishPosts.id, postId));
  return getSocialPublishPost(postId);
}

export async function scheduleSocialPublishPost(
  postId: number,
  scheduledAt: Date,
  timezone: string
) {
  const db = await ensureDb();
  const [post] = await db
    .select()
    .from(socialPublishPosts)
    .where(eq(socialPublishPosts.id, postId))
    .limit(1);
  if (!post || post.status !== 'approved') {
    throw new Error('تتطلب الجدولة موافقة على المسودة أولاً');
  }
  if (scheduledAt.getTime() <= Date.now()) {
    throw new Error('يجب أن يكون موعد النشر في المستقبل');
  }
  const [schedulerSetting] = await db
    .select({ value: settings.value })
    .from(settings)
    .where(eq(settings.key, 'social_publish_dispatch_task_uid'))
    .limit(1);
  await db
    .update(socialPublishPosts)
    .set({
      status: 'scheduled',
      scheduledAt,
      timezone,
      scheduleCronTaskUid: schedulerSetting?.value ?? null,
    })
    .where(eq(socialPublishPosts.id, postId));
  await db
    .update(socialPublishDestinations)
    .set({ publicationStatus: 'queued' })
    .where(eq(socialPublishDestinations.postId, postId));
  await enqueueSocialPublishDeliveryJobs(postId, scheduledAt);
  return getSocialPublishPost(postId);
}

export async function dispatchDueSocialPublishPosts(taskUid: string) {
  const db = await ensureDb();
  const now = new Date();
  const duePosts = await db
    .select()
    .from(socialPublishPosts)
    .where(
      and(
        eq(socialPublishPosts.status, 'scheduled'),
        eq(socialPublishPosts.scheduleCronTaskUid, taskUid),
        lte(socialPublishPosts.scheduledAt, now)
      )
    )
    .limit(25);

  const result = { inspected: duePosts.length, locked: 0, queued: 0, skipped: 0 };
  for (const post of duePosts) {
    const updateResult = await db
      .update(socialPublishPosts)
      .set({ status: 'publishing' })
      .where(and(eq(socialPublishPosts.id, post.id), eq(socialPublishPosts.status, 'scheduled')));
    if (Number(updateResult[0]?.affectedRows ?? 0) !== 1) {
      continue;
    }
    result.locked += 1;
    const queued = await enqueueSocialPublishDeliveryJobs(post.id, now);
    result.queued += queued;
    await db
      .update(socialPublishPosts)
      .set({ status: queued > 0 ? 'publishing' : 'scheduled' })
      .where(eq(socialPublishPosts.id, post.id));
    if (queued === 0) {
      result.skipped += 1;
    }
  }
  const deliveries = await dispatchQueuedSocialPublishDeliveries(25);
  return { ...result, ...deliveries };
}

export async function cancelSocialPublishSchedule(postId: number) {
  const db = await ensureDb();
  await db
    .update(socialPublishPosts)
    .set({ status: 'approved', scheduledAt: null, scheduleCronTaskUid: null })
    .where(and(eq(socialPublishPosts.id, postId), eq(socialPublishPosts.status, 'scheduled')));
  await db
    .update(socialPublishDestinations)
    .set({ publicationStatus: 'pending' })
    .where(
      and(
        eq(socialPublishDestinations.postId, postId),
        eq(socialPublishDestinations.publicationStatus, 'queued')
      )
    );
  return getSocialPublishPost(postId);
}

export { retrySocialPublishDelivery };
