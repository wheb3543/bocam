import {
  integrationAuditEvents,
  integrationConnectionTokens,
  integrationConnections,
  integrationExternalAssets,
  integrationOauthStates,
  integrationWebhookSubscriptions,
  socialPublishAccounts,
} from '../../../drizzle/schema';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { decryptMetaSetting, encryptMetaSetting } from '../../integrations/meta/metaSettingsCrypto';
import { getDb } from './connection';

export type IntegrationProvider = 'meta' | 'whatsapp' | 'x' | 'linkedin' | 'youtube' | 'tiktok';
export type IntegrationConnectionType =
  'meta_business' | 'whatsapp_embedded_signup' | 'social_oauth';
export type IntegrationAssetType =
  | 'business_portfolio'
  | 'page'
  | 'instagram_account'
  | 'whatsapp_business_account'
  | 'whatsapp_phone_number'
  | 'ad_account'
  | 'pixel'
  | 'dataset'
  | 'profile'
  | 'organization'
  | 'channel';

type IntegrationConnectionStatus =
  | 'draft'
  | 'authorization_pending'
  | 'connected'
  | 'reauthorization_required'
  | 'expired'
  | 'revoked'
  | 'error'
  | 'disconnected';

type TokenType = 'access' | 'refresh' | 'business' | 'system';

async function requireDb() {
  const db = await getDb();
  if (!db) {
    throw new Error('قاعدة بيانات التكاملات غير متاحة حالياً');
  }
  return db;
}

function parseJsonArray(value: string | null) {
  if (!value) {
    return [] as string[];
  }
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return [] as string[];
  }
}

export async function createIntegrationConnection(input: {
  provider: IntegrationProvider;
  connectionType: IntegrationConnectionType;
  initiatedByUserId: number;
  displayName?: string | null;
}) {
  const db = await requireDb();
  const [created] = await db
    .insert(integrationConnections)
    .values({
      provider: input.provider,
      connectionType: input.connectionType,
      status: 'authorization_pending',
      displayName: input.displayName?.trim() || null,
      initiatedByUserId: input.initiatedByUserId,
    })
    .$returningId();

  return Number(created.id);
}

export async function createIntegrationOauthState(input: {
  provider: IntegrationProvider;
  flow: IntegrationConnectionType;
  stateHash: string;
  codeVerifier?: string | null;
  redirectUri: string;
  requestedScopes: string[];
  initiatedByUserId: number;
  connectionId: number;
  expiresAt: Date;
}) {
  const db = await requireDb();
  await db.insert(integrationOauthStates).values({
    provider: input.provider,
    flow: input.flow,
    stateHash: input.stateHash,
    codeVerifierEncrypted: input.codeVerifier ? encryptMetaSetting(input.codeVerifier) : null,
    redirectUri: input.redirectUri,
    requestedScopes: JSON.stringify(input.requestedScopes),
    initiatedByUserId: input.initiatedByUserId,
    connectionId: input.connectionId,
    expiresAt: input.expiresAt,
  });
}

export async function consumeIntegrationOauthState(stateHash: string) {
  const db = await requireDb();
  const [state] = await db
    .select()
    .from(integrationOauthStates)
    .where(eq(integrationOauthStates.stateHash, stateHash))
    .limit(1);

  if (!state || state.consumedAt || state.expiresAt.getTime() <= Date.now()) {
    return null;
  }

  const updateResult = await db
    .update(integrationOauthStates)
    .set({ consumedAt: new Date() })
    .where(and(eq(integrationOauthStates.id, state.id), isNull(integrationOauthStates.consumedAt)));
  if (Number(updateResult[0]?.affectedRows ?? 0) !== 1) {
    return null;
  }

  return {
    ...state,
    requestedScopes: parseJsonArray(state.requestedScopes),
    codeVerifier: state.codeVerifierEncrypted
      ? decryptMetaSetting(state.codeVerifierEncrypted)
      : null,
  };
}

export async function failIntegrationOauthState(stateHash: string, failureReason: string) {
  const db = await requireDb();
  await db
    .update(integrationOauthStates)
    .set({ failureReason: failureReason.slice(0, 4000) })
    .where(eq(integrationOauthStates.stateHash, stateHash));
}

export async function storeIntegrationTokens(input: {
  connectionId: number;
  tokens: Array<{ type: TokenType; value: string; expiresAt?: Date | null; scopes?: string[] }>;
}) {
  const db = await requireDb();
  for (const token of input.tokens) {
    await db
      .insert(integrationConnectionTokens)
      .values({
        connectionId: input.connectionId,
        tokenType: token.type,
        tokenEncrypted: encryptMetaSetting(token.value),
        tokenExpiresAt: token.expiresAt ?? null,
        scopes: token.scopes ? JSON.stringify(token.scopes) : null,
        lastRefreshedAt: new Date(),
      })
      .onDuplicateKeyUpdate({
        set: {
          tokenEncrypted: encryptMetaSetting(token.value),
          tokenExpiresAt: token.expiresAt ?? null,
          scopes: token.scopes ? JSON.stringify(token.scopes) : null,
          lastRefreshedAt: new Date(),
        },
      });
  }
}

export async function getIntegrationToken(connectionId: number, tokenType: TokenType) {
  const db = await requireDb();
  const [token] = await db
    .select()
    .from(integrationConnectionTokens)
    .where(
      and(
        eq(integrationConnectionTokens.connectionId, connectionId),
        eq(integrationConnectionTokens.tokenType, tokenType)
      )
    )
    .limit(1);
  return token ? decryptMetaSetting(token.tokenEncrypted) : null;
}

export async function completeIntegrationConnection(input: {
  connectionId: number;
  displayName?: string | null;
  externalBusinessId?: string | null;
  grantedScopes?: string[];
  expiresAt?: Date | null;
  authorizationMethod: string;
}) {
  const db = await requireDb();
  await db
    .update(integrationConnections)
    .set({
      status: 'connected',
      displayName: input.displayName?.trim() || null,
      externalBusinessId: input.externalBusinessId?.trim() || null,
      grantedScopes: input.grantedScopes ? JSON.stringify(input.grantedScopes) : null,
      expiresAt: input.expiresAt ?? null,
      authorizationExpiryNotifiedAt: null,
      authorizationMethod: input.authorizationMethod,
      lastValidatedAt: new Date(),
      lastError: null,
      disconnectedAt: null,
    })
    .where(eq(integrationConnections.id, input.connectionId));
}

export async function markIntegrationConnectionError(connectionId: number, error: string) {
  const db = await requireDb();
  await db
    .update(integrationConnections)
    .set({ status: 'error', lastError: error.slice(0, 4000) })
    .where(eq(integrationConnections.id, connectionId));
}

export async function disconnectIntegrationConnection(connectionId: number, actorUserId: number) {
  const db = await requireDb();
  const [connection] = await db
    .select({ provider: integrationConnections.provider })
    .from(integrationConnections)
    .where(eq(integrationConnections.id, connectionId))
    .limit(1);
  if (!connection) {
    throw new Error('اتصال التكامل غير موجود.');
  }
  await db
    .update(integrationConnections)
    .set({ status: 'disconnected', disconnectedAt: new Date(), lastError: null })
    .where(eq(integrationConnections.id, connectionId));
  await createIntegrationAuditEvent({
    provider: connection.provider,
    connectionId,
    action: 'connection.disconnected',
    status: 'succeeded',
    performedByUserId: actorUserId,
    summary: 'تم إلغاء ربط الاتصال من لوحة الإدارة.',
  });
}

export async function upsertIntegrationExternalAsset(input: {
  connectionId: number;
  provider: IntegrationProvider;
  assetType: IntegrationAssetType;
  externalAssetId: string;
  parentExternalAssetId?: string | null;
  displayName?: string | null;
  avatarUrl?: string | null;
  capabilities?: string[];
  metadata?: Record<string, unknown>;
  isSelected?: boolean;
}) {
  const db = await requireDb();
  const values = {
    connectionId: input.connectionId,
    provider: input.provider,
    assetType: input.assetType,
    externalAssetId: input.externalAssetId,
    parentExternalAssetId: input.parentExternalAssetId ?? null,
    displayName: input.displayName ?? null,
    avatarUrl: input.avatarUrl ?? null,
    capabilities: input.capabilities ? JSON.stringify(input.capabilities) : null,
    metadata: input.metadata ? JSON.stringify(input.metadata) : null,
    isSelected: input.isSelected ?? false,
    isActive: true,
    lastSyncedAt: new Date(),
  };
  await db.insert(integrationExternalAssets).values(values).onDuplicateKeyUpdate({ set: values });
}

export async function setIntegrationAssetSelected(assetId: number, isSelected: boolean) {
  const db = await requireDb();
  const [asset] = await db
    .select()
    .from(integrationExternalAssets)
    .where(eq(integrationExternalAssets.id, assetId))
    .limit(1);
  if (!asset) {
    throw new Error('الأصل الخارجي غير موجود.');
  }
  await db
    .update(integrationExternalAssets)
    .set({ isSelected })
    .where(eq(integrationExternalAssets.id, assetId));

  const publishAccount =
    asset.provider === 'meta' && asset.assetType === 'page'
      ? { platform: 'facebook' as const, accountType: 'page' as const }
      : asset.provider === 'meta' && asset.assetType === 'instagram_account'
        ? { platform: 'instagram' as const, accountType: 'business' as const }
        : null;
  if (!publishAccount) {
    return;
  }

  if (!isSelected) {
    await db
      .update(socialPublishAccounts)
      .set({ connectionStatus: 'disconnected', isActive: false })
      .where(eq(socialPublishAccounts.integrationAssetId, asset.id));
    return;
  }

  const values = {
    connectionId: asset.connectionId,
    integrationAssetId: asset.id,
    platform: publishAccount.platform,
    accountType: publishAccount.accountType,
    displayName: asset.displayName ?? asset.externalAssetId,
    externalAccountId: asset.externalAssetId,
    avatarUrl: asset.avatarUrl,
    connectionStatus: 'connected' as const,
    capabilities: asset.capabilities,
    lastValidatedAt: new Date(),
    lastError: null,
    isActive: true,
    createdByUserId: null,
  };
  await db.insert(socialPublishAccounts).values(values).onDuplicateKeyUpdate({ set: values });
}

export async function upsertIntegrationWebhookSubscription(input: {
  connectionId: number;
  assetId?: number | null;
  provider: IntegrationProvider;
  callbackPath: string;
  subscribedFields: string[];
  status?: 'pending' | 'active' | 'failed' | 'disabled';
  lastError?: string | null;
}) {
  const db = await requireDb();
  const [existing] = await db
    .select()
    .from(integrationWebhookSubscriptions)
    .where(
      and(
        eq(integrationWebhookSubscriptions.connectionId, input.connectionId),
        eq(integrationWebhookSubscriptions.callbackPath, input.callbackPath)
      )
    )
    .limit(1);
  const patch = {
    assetId: input.assetId ?? null,
    provider: input.provider,
    subscribedFields: JSON.stringify(input.subscribedFields),
    status: input.status ?? 'pending',
    lastError: input.lastError ?? null,
    verifiedAt: input.status === 'active' ? new Date() : null,
  };
  if (existing) {
    await db
      .update(integrationWebhookSubscriptions)
      .set(patch)
      .where(eq(integrationWebhookSubscriptions.id, existing.id));
    return existing.id;
  }
  const [created] = await db
    .insert(integrationWebhookSubscriptions)
    .values({ connectionId: input.connectionId, callbackPath: input.callbackPath, ...patch })
    .$returningId();
  return Number(created.id);
}

export async function createIntegrationAuditEvent(input: {
  provider: IntegrationProvider;
  connectionId?: number | null;
  assetId?: number | null;
  action: string;
  status: 'started' | 'succeeded' | 'failed' | 'skipped';
  correlationId?: string | null;
  summary?: string | null;
  errorMessage?: string | null;
  performedByUserId?: number | null;
}) {
  const db = await requireDb();
  await db.insert(integrationAuditEvents).values({
    provider: input.provider,
    connectionId: input.connectionId ?? null,
    assetId: input.assetId ?? null,
    action: input.action.slice(0, 120),
    status: input.status,
    correlationId: input.correlationId ?? null,
    summary: input.summary?.slice(0, 4000) ?? null,
    errorMessage: input.errorMessage?.slice(0, 4000) ?? null,
    performedByUserId: input.performedByUserId ?? null,
  });
}

export async function getIntegrationConnectionsOverview() {
  const db = await requireDb();
  const connections = await db
    .select()
    .from(integrationConnections)
    .orderBy(desc(integrationConnections.updatedAt));
  const assets = await db
    .select()
    .from(integrationExternalAssets)
    .orderBy(integrationExternalAssets.assetType, integrationExternalAssets.displayName);
  const tokens = await db
    .select({
      connectionId: integrationConnectionTokens.connectionId,
      tokenType: integrationConnectionTokens.tokenType,
      tokenExpiresAt: integrationConnectionTokens.tokenExpiresAt,
      lastRefreshedAt: integrationConnectionTokens.lastRefreshedAt,
    })
    .from(integrationConnectionTokens);
  const subscriptions = await db.select().from(integrationWebhookSubscriptions);

  return connections.map((connection) => ({
    connection,
    grantedScopes: parseJsonArray(connection.grantedScopes),
    assets: assets
      .filter((asset) => asset.connectionId === connection.id)
      .map((asset) => ({
        ...asset,
        capabilities: parseJsonArray(asset.capabilities),
      })),
    tokens: tokens.filter((token) => token.connectionId === connection.id),
    webhookSubscriptions: subscriptions.filter(
      (subscription) => subscription.connectionId === connection.id
    ),
  }));
}
