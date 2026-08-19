import {
  integrationExternalAssets,
  integrationConnections,
  metaConversionEvents,
  metaLeadEvents,
  metaLeadForms,
} from '../../../drizzle/schema';
import { and, desc, eq, lte } from 'drizzle-orm';
import { meta } from '../../api/MetaApiService';
import { decryptMetaSetting, encryptMetaSetting } from '../../integrations/meta/metaSettingsCrypto';
import { getDb } from './connection';
import { getIntegrationToken } from './integrationConnections';

async function requireDb() {
  const db = await getDb();
  if (!db) {
    throw new Error('قاعدة بيانات عمليات Meta غير متاحة حالياً.');
  }
  return db;
}

export async function upsertMetaLeadForm(input: {
  connectionId: number;
  pageAssetId?: number | null;
  externalFormId: string;
  externalPageId: string;
  displayName?: string | null;
  campaignId?: number | null;
  fieldMapping?: Record<string, string>;
  isActive?: boolean;
}) {
  const db = await requireDb();
  const values = {
    connectionId: input.connectionId,
    pageAssetId: input.pageAssetId ?? null,
    externalFormId: input.externalFormId.trim(),
    externalPageId: input.externalPageId.trim(),
    displayName: input.displayName?.trim() || null,
    campaignId: input.campaignId ?? null,
    fieldMapping: input.fieldMapping ? JSON.stringify(input.fieldMapping) : null,
    isActive: input.isActive ?? true,
    lastSyncedAt: new Date(),
    lastError: null,
  };
  await db.insert(metaLeadForms).values(values).onDuplicateKeyUpdate({ set: values });
}

/** يسجل إشعار Lead Ads مرة واحدة فقط؛ الحمولات محفوظة مشفرة ولا تعاد إلى أي واجهة. */
export async function recordMetaLeadEvent(input: {
  connectionId: number;
  leadFormId?: number | null;
  externalLeadId: string;
  eventKey: string;
  payload: Record<string, unknown>;
}) {
  const db = await requireDb();
  const [existing] = await db
    .select({ id: metaLeadEvents.id, status: metaLeadEvents.status })
    .from(metaLeadEvents)
    .where(eq(metaLeadEvents.externalLeadId, input.externalLeadId))
    .limit(1);
  if (existing) {
    return { id: existing.id, duplicate: true, status: existing.status };
  }
  const [created] = await db
    .insert(metaLeadEvents)
    .values({
      connectionId: input.connectionId,
      leadFormId: input.leadFormId ?? null,
      externalLeadId: input.externalLeadId.trim(),
      eventKey: input.eventKey.trim().slice(0, 255),
      payloadEncrypted: encryptMetaSetting(JSON.stringify(input.payload)),
      status: 'received',
    })
    .$returningId();
  return { id: Number(created.id), duplicate: false, status: 'received' as const };
}

/** يربط إشعار leadgen بالاتصال والنموذج المعروفين ثم يحفظه دون استرجاع حقول العميل حتى مرحلة الربط الحي. */
export async function recordMetaLeadgenNotification(input: {
  externalLeadId: string;
  externalFormId: string;
  externalPageId: string;
  eventKey: string;
  raw: Record<string, unknown>;
}) {
  const db = await requireDb();
  const [form] = await db
    .select()
    .from(metaLeadForms)
    .where(eq(metaLeadForms.externalFormId, input.externalFormId))
    .limit(1);
  let connectionId = form?.connectionId ?? null;
  if (!connectionId) {
    const [page] = await db
      .select({ connectionId: integrationExternalAssets.connectionId })
      .from(integrationExternalAssets)
      .innerJoin(
        integrationConnections,
        eq(integrationExternalAssets.connectionId, integrationConnections.id)
      )
      .where(eq(integrationExternalAssets.externalAssetId, input.externalPageId))
      .limit(1);
    connectionId = page?.connectionId ?? null;
  }
  if (!connectionId) {
    return { ignored: true, reason: 'unknown_page_or_form' as const };
  }
  const result = await recordMetaLeadEvent({
    connectionId,
    leadFormId: form?.id ?? null,
    externalLeadId: input.externalLeadId,
    eventKey: input.eventKey,
    payload: input.raw,
  });
  return { ignored: false, ...result };
}

/** يضع حدث CAPI مشفراً في Outbox؛ لا ينفذ الإرسال إلى أن يرتبط Dataset وتوكن Meta الحيان. */
export async function queueMetaConversionEvent(input: {
  connectionId: number;
  datasetAssetId?: number | null;
  eventName: string;
  eventId: string;
  payload: Record<string, unknown>;
}) {
  const db = await requireDb();
  const [existing] = await db
    .select({ id: metaConversionEvents.id, status: metaConversionEvents.status })
    .from(metaConversionEvents)
    .where(eq(metaConversionEvents.eventId, input.eventId))
    .limit(1);
  if (existing) {
    return { id: existing.id, duplicate: true, status: existing.status };
  }
  const [created] = await db
    .insert(metaConversionEvents)
    .values({
      connectionId: input.connectionId,
      datasetAssetId: input.datasetAssetId ?? null,
      eventName: input.eventName.trim().slice(0, 100),
      eventId: input.eventId.trim().slice(0, 255),
      payloadEncrypted: encryptMetaSetting(JSON.stringify(input.payload)),
      status: 'queued',
    })
    .$returningId();
  return { id: Number(created.id), duplicate: false, status: 'queued' as const };
}

export async function getMetaOperationsOverview() {
  const db = await requireDb();
  const [forms, leadEvents, conversionEvents, assets] = await Promise.all([
    db.select().from(metaLeadForms).orderBy(desc(metaLeadForms.updatedAt)).limit(30),
    db
      .select({
        id: metaLeadEvents.id,
        externalLeadId: metaLeadEvents.externalLeadId,
        status: metaLeadEvents.status,
        receivedAt: metaLeadEvents.receivedAt,
        processedAt: metaLeadEvents.processedAt,
        lastError: metaLeadEvents.lastError,
      })
      .from(metaLeadEvents)
      .orderBy(desc(metaLeadEvents.receivedAt))
      .limit(30),
    db
      .select({
        id: metaConversionEvents.id,
        eventName: metaConversionEvents.eventName,
        eventId: metaConversionEvents.eventId,
        status: metaConversionEvents.status,
        attemptCount: metaConversionEvents.attemptCount,
        lastError: metaConversionEvents.lastError,
        createdAt: metaConversionEvents.createdAt,
      })
      .from(metaConversionEvents)
      .orderBy(desc(metaConversionEvents.createdAt))
      .limit(30),
    db
      .select({ id: integrationExternalAssets.id, assetType: integrationExternalAssets.assetType })
      .from(integrationExternalAssets)
      .where(eq(integrationExternalAssets.isSelected, true)),
  ]);
  return {
    forms,
    leadEvents,
    conversionEvents,
    totals: {
      activeForms: forms.filter((form) => form.isActive).length,
      pendingLeads: leadEvents.filter((event) => event.status === 'received').length,
      queuedConversions: conversionEvents.filter((event) => event.status === 'queued').length,
      selectedDatasets: assets.filter(
        (asset) => asset.assetType === 'dataset' || asset.assetType === 'pixel'
      ).length,
    },
  };
}

/** يستهلك أحداث CAPI المؤجلة؛ يستعمل Dataset وتوكناً مفوضين ولا يقرأ أي اعتماد من المتصفح. */
export async function dispatchQueuedMetaConversionEvents(limit = 20) {
  const db = await requireDb();
  const now = new Date();
  const candidates = await db
    .select()
    .from(metaConversionEvents)
    .where(and(eq(metaConversionEvents.status, 'queued'), lte(metaConversionEvents.runAfter, now)))
    .orderBy(metaConversionEvents.runAfter)
    .limit(limit);
  let sent = 0;
  let failed = 0;
  let skipped = 0;
  for (const event of candidates) {
    const claimed = await db
      .update(metaConversionEvents)
      .set({ status: 'sending', attemptCount: event.attemptCount + 1 })
      .where(and(eq(metaConversionEvents.id, event.id), eq(metaConversionEvents.status, 'queued')));
    if (Number(claimed[0]?.affectedRows ?? 0) !== 1) {
      continue;
    }
    const [asset] = event.datasetAssetId
      ? await db
          .select()
          .from(integrationExternalAssets)
          .where(eq(integrationExternalAssets.id, event.datasetAssetId))
          .limit(1)
      : [];
    const token =
      (await getIntegrationToken(event.connectionId, 'access')) ??
      (await getIntegrationToken(event.connectionId, 'system'));
    if (!asset || !token || !['dataset', 'pixel'].includes(asset.assetType)) {
      await db
        .update(metaConversionEvents)
        .set({
          status: 'failed',
          lastError: 'يتطلب الحدث Dataset أو Pixel محدداً وتوكناً مفوضاً قبل الإرسال.',
        })
        .where(eq(metaConversionEvents.id, event.id));
      skipped += 1;
      continue;
    }
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(decryptMetaSetting(event.payloadEncrypted)) as Record<string, unknown>;
    } catch {
      await db
        .update(metaConversionEvents)
        .set({ status: 'failed', lastError: 'تعذر فك أو قراءة حمولة حدث التحويل المشفرة.' })
        .where(eq(metaConversionEvents.id, event.id));
      failed += 1;
      continue;
    }
    const response = await meta.postWithAccessToken<Record<string, unknown>>(
      `${asset.externalAssetId}/events`,
      token,
      payload
    );
    if (response.ok) {
      await db
        .update(metaConversionEvents)
        .set({
          status: 'succeeded',
          sentAt: new Date(),
          lastError: null,
          responseSummary: 'استلمت Meta الحدث؛ راجع Events Manager للتحقق من المطابقة والجودة.',
        })
        .where(eq(metaConversionEvents.id, event.id));
      sent += 1;
      continue;
    }
    const retryable =
      [0, 1, 2, 4, 17, 32].includes(response.error?.code ?? response.status) ||
      response.status >= 500;
    const exhausted = event.attemptCount + 1 >= event.maxAttempts;
    await db
      .update(metaConversionEvents)
      .set({
        status: retryable && !exhausted ? 'queued' : 'failed',
        runAfter: new Date(Date.now() + Math.min(30, 2 ** event.attemptCount) * 60_000),
        lastError: response.error?.message?.slice(0, 4000) ?? 'تعذر إرسال حدث Conversions API.',
      })
      .where(eq(metaConversionEvents.id, event.id));
    failed += 1;
  }
  return { inspected: candidates.length, sent, failed, skipped };
}
