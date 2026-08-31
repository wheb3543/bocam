import {
  integrationDeliveryJobs,
  media,
  socialPublishAccounts,
  socialPublishAttempts,
  socialPublishDestinations,
  socialPublishPostMedia,
  socialPublishPosts,
} from '../../../drizzle/schema';
import { and, eq, lte } from 'drizzle-orm';
import { meta } from '../../api/MetaApiService';
import { publishToMeta } from '../../integrations/meta/metaPublishingConnector';
import { publishToExternalPlatform } from '../../integrations/external/externalPublishingConnector';
import { decryptMetaSetting, encryptMetaSetting } from '../../integrations/meta/metaSettingsCrypto';
import { getIntegrationToken } from './integrationConnections';
import { getDb } from './connection';

async function requireDb() {
  const db = await getDb();
  if (!db) {
    throw new Error('قاعدة بيانات تسليم النشر غير متاحة حالياً.');
  }
  return db;
}

function parseObject(value: string | null) {
  if (!value) {
    return null;
  }
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function parseExternalVideoState(value: string | null) {
  if (!value) {
    return null;
  }
  try {
    return parseObject(decryptMetaSetting(value));
  } catch {
    return parseObject(value);
  }
}

function serializeProviderState(
  platform: string,
  providerState: Record<string, unknown> | undefined
) {
  if (!providerState) {
    return null;
  }
  const serialized = JSON.stringify(providerState);
  return ['youtube', 'tiktok'].includes(platform) ? encryptMetaSetting(serialized) : serialized;
}

function videoProgress(providerState: Record<string, unknown> | undefined) {
  const nextByte = typeof providerState?.nextByte === 'number' ? providerState.nextByte : null;
  const totalBytes =
    typeof providerState?.totalBytes === 'number' ? providerState.totalBytes : null;
  if (nextByte === null || !totalBytes || totalBytes <= 0) {
    return null;
  }
  return Math.max(0, Math.min(100, Math.floor((nextByte / totalBytes) * 100)));
}

function delayMinutes(attemptCount: number) {
  return Math.min(30, Math.max(1, 2 ** Math.max(0, attemptCount - 1)));
}

async function writeAttempt(input: {
  destinationId: number;
  operation: 'validate' | 'upload' | 'publish' | 'status' | 'retry' | 'cancel';
  status: 'started' | 'succeeded' | 'failed' | 'skipped';
  correlationId: string;
  responseSummary?: string | null;
  errorMessage?: string | null;
}) {
  const db = await requireDb();
  await db.insert(socialPublishAttempts).values({
    destinationId: input.destinationId,
    operation: input.operation,
    status: input.status,
    correlationId: input.correlationId,
    requestSummary:
      'تمت المعالجة عبر موصل النشر الخادمي؛ لا تحفظ التوكنات أو الأسرار في سجل المحاولة.',
    responseSummary: input.responseSummary?.slice(0, 4000) ?? null,
    errorMessage: input.errorMessage?.slice(0, 4000) ?? null,
  });
}

export async function enqueueSocialPublishDeliveryJobs(postId: number, runAfter = new Date()) {
  const db = await requireDb();
  const rows = await db
    .select({ destination: socialPublishDestinations, account: socialPublishAccounts })
    .from(socialPublishDestinations)
    .leftJoin(
      socialPublishAccounts,
      eq(socialPublishDestinations.accountId, socialPublishAccounts.id)
    )
    .where(eq(socialPublishDestinations.postId, postId));

  let queued = 0;
  for (const { destination, account } of rows) {
    const eligible =
      ['facebook', 'instagram', 'x', 'linkedin', 'youtube', 'tiktok'].includes(
        destination.platform
      ) &&
      account?.connectionStatus === 'connected' &&
      Boolean(account.connectionId) &&
      Boolean(account.isActive);
    if (!eligible) {
      continue;
    }
    const connectionId = account?.connectionId;
    if (!connectionId) {
      continue;
    }
    await db
      .insert(integrationDeliveryJobs)
      .values({
        destinationId: destination.id,
        connectionId,
        status: 'queued',
        runAfter,
        idempotencyKey: destination.idempotencyKey,
      })
      .onDuplicateKeyUpdate({
        set: {
          status: 'queued',
          runAfter,
          leasedUntil: null,
          lastError: null,
        },
      });
    await db
      .update(socialPublishDestinations)
      .set({ publicationStatus: 'queued', lastError: null })
      .where(eq(socialPublishDestinations.id, destination.id));
    queued += 1;
  }
  return queued;
}

async function updatePostAggregateStatus(postId: number) {
  const db = await requireDb();
  const destinations = await db
    .select({ publicationStatus: socialPublishDestinations.publicationStatus })
    .from(socialPublishDestinations)
    .where(eq(socialPublishDestinations.postId, postId));
  const active = destinations.filter((item) => item.publicationStatus !== 'not_ready');
  if (!active.length) {
    return;
  }
  const statuses = active.map((item) => item.publicationStatus);
  const allComplete = statuses.every((status) =>
    ['published', 'skipped', 'cancelled'].includes(status)
  );
  const anyPublished = statuses.includes('published');
  const allFailed = statuses.every((status) => status === 'failed');
  await db
    .update(socialPublishPosts)
    .set({
      status: allComplete
        ? 'published'
        : allFailed
          ? 'failed'
          : anyPublished
            ? 'partial_failed'
            : 'publishing',
      publishedAt: allComplete && anyPublished ? new Date() : null,
    })
    .where(eq(socialPublishPosts.id, postId));
}

async function claimQueuedDeliveryJobs(limit: number) {
  const db = await requireDb();
  const now = new Date();
  const jobs = await db
    .select()
    .from(integrationDeliveryJobs)
    .where(
      and(eq(integrationDeliveryJobs.status, 'queued'), lte(integrationDeliveryJobs.runAfter, now))
    )
    .orderBy(integrationDeliveryJobs.runAfter)
    .limit(limit);
  const claimed = [] as typeof jobs;
  for (const job of jobs) {
    const updated = await db
      .update(integrationDeliveryJobs)
      .set({
        status: 'processing',
        leasedUntil: new Date(Date.now() + 4 * 60 * 1000),
        attemptCount: job.attemptCount + 1,
      })
      .where(
        and(eq(integrationDeliveryJobs.id, job.id), eq(integrationDeliveryJobs.status, 'queued'))
      );
    if (Number(updated[0]?.affectedRows ?? 0) === 1) {
      claimed.push(job);
    }
  }
  return claimed;
}

async function loadDelivery(jobId: number) {
  const db = await requireDb();
  const [row] = await db
    .select({
      job: integrationDeliveryJobs,
      destination: socialPublishDestinations,
      account: socialPublishAccounts,
      post: socialPublishPosts,
    })
    .from(integrationDeliveryJobs)
    .innerJoin(
      socialPublishDestinations,
      eq(integrationDeliveryJobs.destinationId, socialPublishDestinations.id)
    )
    .innerJoin(socialPublishPosts, eq(socialPublishDestinations.postId, socialPublishPosts.id))
    .leftJoin(
      socialPublishAccounts,
      eq(socialPublishDestinations.accountId, socialPublishAccounts.id)
    )
    .where(eq(integrationDeliveryJobs.id, jobId))
    .limit(1);
  if (!row) {
    return null;
  }
  const postMedia = await db
    .select({ media })
    .from(socialPublishPostMedia)
    .innerJoin(media, eq(socialPublishPostMedia.mediaId, media.id))
    .where(eq(socialPublishPostMedia.postId, row.post.id))
    .orderBy(socialPublishPostMedia.sortOrder);
  return { ...row, media: postMedia.map((item) => item.media) };
}

async function failOrRetryDelivery(input: {
  job: typeof integrationDeliveryJobs.$inferSelect;
  destinationId: number;
  postId: number;
  message: string;
  retryable: boolean;
  correlationId: string;
}) {
  const db = await requireDb();
  const exhausted = input.job.attemptCount + 1 >= input.job.maxAttempts;
  const finalFailure = exhausted || !input.retryable;
  const nextRun = new Date(Date.now() + delayMinutes(input.job.attemptCount + 1) * 60 * 1000);
  await db
    .update(integrationDeliveryJobs)
    .set({
      status: finalFailure ? 'failed' : 'queued',
      runAfter: finalFailure ? input.job.runAfter : nextRun,
      leasedUntil: null,
      lastError: input.message.slice(0, 4000),
    })
    .where(eq(integrationDeliveryJobs.id, input.job.id));
  await db
    .update(socialPublishDestinations)
    .set({
      publicationStatus: finalFailure ? 'failed' : 'queued',
      lastError: input.message.slice(0, 4000),
      retryCount: input.job.attemptCount + 1,
      lastAttemptAt: new Date(),
    })
    .where(eq(socialPublishDestinations.id, input.destinationId));
  await writeAttempt({
    destinationId: input.destinationId,
    operation: finalFailure ? 'publish' : 'retry',
    status: 'failed',
    correlationId: input.correlationId,
    errorMessage: input.message,
  });
  await updatePostAggregateStatus(input.postId);
  return finalFailure ? 'failed' : 'retried';
}

async function dispatchDeliveryJob(jobId: number) {
  const delivery = await loadDelivery(jobId);
  if (!delivery || !delivery.account || !delivery.job.connectionId) {
    return 'skipped';
  }
  const correlationId = `delivery-${delivery.job.id}-${crypto.randomUUID()}`;
  const platform = delivery.destination.platform;
  if (delivery.destination.externalPostId) {
    const db = await requireDb();
    await db
      .update(integrationDeliveryJobs)
      .set({ status: 'succeeded', leasedUntil: null })
      .where(eq(integrationDeliveryJobs.id, delivery.job.id));
    return 'skipped';
  }
  const accessToken =
    (await getIntegrationToken(delivery.job.connectionId, 'access')) ??
    (await getIntegrationToken(delivery.job.connectionId, 'system'));
  if (!accessToken) {
    return failOrRetryDelivery({
      job: delivery.job,
      destinationId: delivery.destination.id,
      postId: delivery.post.id,
      message: 'لا يوجد توكن مفوض صالح لهذا الحساب. أعد ربط الاتصال من إعدادات الربط.',
      retryable: false,
      correlationId,
    });
  }

  await writeAttempt({
    destinationId: delivery.destination.id,
    operation: 'publish',
    status: 'started',
    correlationId,
  });
  const publishRequest = {
    targetId: delivery.account.externalAccountId,
    accessToken,
    title: delivery.post.title,
    caption: delivery.destination.captionOverride ?? delivery.post.baseCaption ?? '',
    contentType: delivery.post.contentType,
    media: delivery.media.map((item) => ({
      url: item.url,
      key: item.key,
      size: item.size,
      mimeType: item.mimeType,
      type: item.type,
      altText: item.altAr ?? item.altEn,
    })),
  };
  const result =
    platform === 'facebook' || platform === 'instagram'
      ? await publishToMeta(
          {
            ...publishRequest,
            platform,
            providerState: parseObject(delivery.destination.providerState),
          },
          meta
        )
      : await publishToExternalPlatform({
          ...publishRequest,
          platform,
          providerState: parseExternalVideoState(delivery.destination.providerState),
          providerSettings: parseObject(delivery.destination.settings),
        });

  const db = await requireDb();
  if (result.kind === 'published') {
    await db
      .update(integrationDeliveryJobs)
      .set({
        status: 'succeeded',
        leasedUntil: null,
        providerRequestId: result.externalPostId,
        lastError: null,
      })
      .where(eq(integrationDeliveryJobs.id, delivery.job.id));
    await db
      .update(socialPublishDestinations)
      .set({
        publicationStatus: 'published',
        externalPostId: result.externalPostId,
        externalUrl: result.externalUrl,
        providerState: serializeProviderState(platform, result.providerState),
        lastAttemptAt: new Date(),
        publishedAt: new Date(),
        lastError: null,
      })
      .where(eq(socialPublishDestinations.id, delivery.destination.id));
    await writeAttempt({
      destinationId: delivery.destination.id,
      operation: 'publish',
      status: 'succeeded',
      correlationId,
      responseSummary: `تم النشر بمعرف خارجي ${result.externalPostId}.`,
    });
    await updatePostAggregateStatus(delivery.post.id);
    return 'published';
  }
  if (result.kind === 'processing') {
    const progress = videoProgress(result.providerState);
    const publicationStatus = progress !== null && progress < 100 ? 'uploading' : 'processing';
    const summary =
      progress === null
        ? `بانتظار اكتمال معالجة محتوى ${platform}.`
        : `تقدم نقل فيديو ${platform}: ${progress}٪.`;
    await db
      .update(integrationDeliveryJobs)
      .set({
        status: 'queued',
        runAfter: new Date(Date.now() + result.retryAfterSeconds * 1000),
        leasedUntil: null,
      })
      .where(eq(integrationDeliveryJobs.id, delivery.job.id));
    await db
      .update(socialPublishDestinations)
      .set({
        publicationStatus,
        providerState: serializeProviderState(platform, result.providerState),
        lastAttemptAt: new Date(),
      })
      .where(eq(socialPublishDestinations.id, delivery.destination.id));
    await writeAttempt({
      destinationId: delivery.destination.id,
      operation: progress === null ? 'status' : 'upload',
      status: 'started',
      correlationId,
      responseSummary: summary,
    });
    return 'processing';
  }
  return failOrRetryDelivery({
    job: delivery.job,
    destinationId: delivery.destination.id,
    postId: delivery.post.id,
    message: result.message,
    retryable: result.retryable,
    correlationId,
  });
}

export async function dispatchQueuedSocialPublishDeliveries(limit = 25) {
  const jobs = await claimQueuedDeliveryJobs(limit);
  const results = await Promise.all(jobs.map((job) => dispatchDeliveryJob(job.id)));
  return {
    claimed: jobs.length,
    published: results.filter((result) => result === 'published').length,
    processing: results.filter((result) => result === 'processing').length,
    retried: results.filter((result) => result === 'retried').length,
    failed: results.filter((result) => result === 'failed').length,
    skipped: results.filter((result) => result === 'skipped').length,
  };
}

export async function retrySocialPublishDelivery(destinationId: number) {
  const db = await requireDb();
  const [job] = await db
    .select()
    .from(integrationDeliveryJobs)
    .where(eq(integrationDeliveryJobs.destinationId, destinationId))
    .limit(1);
  if (!job) {
    throw new Error('لا توجد مهمة تسليم لهذه الوجهة بعد.');
  }
  if (job.status === 'succeeded' || job.status === 'cancelled') {
    throw new Error('لا يمكن إعادة محاولة مهمة مكتملة أو ملغاة.');
  }
  await db
    .update(integrationDeliveryJobs)
    .set({ status: 'queued', runAfter: new Date(), leasedUntil: null, lastError: null })
    .where(eq(integrationDeliveryJobs.id, job.id));
  await db
    .update(socialPublishDestinations)
    .set({ publicationStatus: 'queued', lastError: null })
    .where(eq(socialPublishDestinations.id, destinationId));
  return { jobId: job.id };
}
