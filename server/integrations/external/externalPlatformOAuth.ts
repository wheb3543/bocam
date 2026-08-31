import { createHash, randomBytes } from 'crypto';
import {
  completeIntegrationConnection,
  consumeIntegrationOauthState,
  createIntegrationAuditEvent,
  createIntegrationConnection,
  createIntegrationOauthState,
  failIntegrationOauthState,
  getSocialPlatformOAuthCredentials,
  markIntegrationConnectionError,
  storeIntegrationTokens,
  upsertIntegrationExternalAsset,
} from '../../database/db';
import { notifyIntegrationIssue } from '../../services/integrationNotificationService';
import type { ExternalPublishingPlatform } from '../../database/db/socialPlatformIntegrationSettings';

const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;

type ProviderSpec = {
  authorizationEndpoint: string;
  tokenEndpoint: string;
  authorizationMethod: string;
  requiresPkce: boolean;
};

const PROVIDERS: Record<ExternalPublishingPlatform, ProviderSpec> = {
  x: {
    authorizationEndpoint: 'https://x.com/i/oauth2/authorize',
    tokenEndpoint: 'https://api.x.com/2/oauth2/token',
    authorizationMethod: 'oauth2_pkce',
    requiresPkce: true,
  },
  linkedin: {
    authorizationEndpoint: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenEndpoint: 'https://www.linkedin.com/oauth/v2/accessToken',
    authorizationMethod: 'oauth2_authorization_code',
    requiresPkce: false,
  },
  youtube: {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    authorizationMethod: 'google_oauth2',
    requiresPkce: true,
  },
  tiktok: {
    authorizationEndpoint: 'https://www.tiktok.com/v2/auth/authorize/',
    tokenEndpoint: 'https://open.tiktokapis.com/v2/oauth/token/',
    authorizationMethod: 'tiktok_oauth2',
    requiresPkce: false,
  },
};

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  refresh_expires_in?: number;
  scope?: string;
  error?: string | { message?: string };
  error_description?: string;
  message?: string;
};

function digest(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

function createState() {
  return randomBytes(32).toString('base64url');
}

function createPkceVerifier() {
  return randomBytes(48).toString('base64url');
}

function pkceChallenge(verifier: string) {
  return createHash('sha256').update(verifier).digest('base64url');
}

function expiration(seconds?: number) {
  return typeof seconds === 'number' && seconds > 0 ? new Date(Date.now() + seconds * 1000) : null;
}

function conciseError(payload: TokenResponse, fallback: string) {
  if (typeof payload.error_description === 'string') {
    return payload.error_description.slice(0, 500);
  }
  if (typeof payload.message === 'string') {
    return payload.message.slice(0, 500);
  }
  if (typeof payload.error === 'string') {
    return payload.error.slice(0, 500);
  }
  if (payload.error && typeof payload.error.message === 'string') {
    return payload.error.message.slice(0, 500);
  }
  return fallback;
}

async function exchangeCode(input: {
  provider: ExternalPublishingPlatform;
  code: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  codeVerifier?: string | null;
}) {
  const spec = PROVIDERS[input.provider];
  const body = new URLSearchParams({ grant_type: 'authorization_code', code: input.code });
  const headers: Record<string, string> = { 'Content-Type': 'application/x-www-form-urlencoded' };
  if (input.provider === 'x') {
    headers.Authorization = `Basic ${Buffer.from(`${input.clientId}:${input.clientSecret}`).toString('base64')}`;
    body.set('redirect_uri', input.redirectUri);
    if (input.codeVerifier) {
      body.set('code_verifier', input.codeVerifier);
    }
  } else if (input.provider === 'tiktok') {
    body.set('client_key', input.clientId);
    body.set('client_secret', input.clientSecret);
    body.set('redirect_uri', input.redirectUri);
  } else {
    body.set('client_id', input.clientId);
    body.set('client_secret', input.clientSecret);
    body.set('redirect_uri', input.redirectUri);
    if (input.codeVerifier) {
      body.set('code_verifier', input.codeVerifier);
    }
  }
  const response = await fetch(spec.tokenEndpoint, { method: 'POST', headers, body });
  const payload = (await response.json()) as TokenResponse;
  if (!response.ok || !payload.access_token) {
    throw new Error(conciseError(payload, `تعذر استبدال رمز ${input.provider} بتوكن وصول.`));
  }
  return payload;
}

async function discoverPrimaryAsset(input: {
  provider: ExternalPublishingPlatform;
  connectionId: number;
  accessToken: string;
}) {
  const headers = { Authorization: `Bearer ${input.accessToken}` };
  try {
    if (input.provider === 'x') {
      const response = await fetch('https://api.x.com/2/users/me?user.fields=profile_image_url', {
        headers,
      });
      const payload = (await response.json()) as {
        data?: { id?: string; name?: string; username?: string; profile_image_url?: string };
      };
      if (!response.ok || !payload.data?.id) {
        throw new Error('تعذر قراءة حساب X المفوض.');
      }
      await upsertIntegrationExternalAsset({
        connectionId: input.connectionId,
        provider: 'x',
        assetType: 'profile',
        externalAssetId: payload.data.id,
        displayName: payload.data.username
          ? `@${payload.data.username}`
          : (payload.data.name ?? 'X account'),
        avatarUrl: payload.data.profile_image_url ?? null,
        capabilities: ['publish', 'inbox'],
        metadata: { source: 'users/me' },
      });
      return;
    }
    if (input.provider === 'linkedin') {
      const response = await fetch('https://api.linkedin.com/v2/userinfo', { headers });
      const payload = (await response.json()) as { sub?: string; name?: string; picture?: string };
      if (!response.ok || !payload.sub) {
        throw new Error('تعذر قراءة عضو LinkedIn المفوض.');
      }
      await upsertIntegrationExternalAsset({
        connectionId: input.connectionId,
        provider: 'linkedin',
        assetType: 'profile',
        externalAssetId: payload.sub,
        displayName: payload.name ?? 'LinkedIn member',
        avatarUrl: payload.picture ?? null,
        capabilities: ['publish'],
        metadata: { source: 'userinfo' },
      });
      return;
    }
    if (input.provider === 'youtube') {
      const response = await fetch(
        'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
        { headers }
      );
      const payload = (await response.json()) as {
        items?: Array<{
          id?: string;
          snippet?: { title?: string; thumbnails?: { default?: { url?: string } } };
        }>;
      };
      const channel = payload.items?.[0];
      if (!response.ok || !channel?.id) {
        throw new Error('تعذر قراءة قناة YouTube المفوضة.');
      }
      await upsertIntegrationExternalAsset({
        connectionId: input.connectionId,
        provider: 'youtube',
        assetType: 'channel',
        externalAssetId: channel.id,
        displayName: channel.snippet?.title ?? 'YouTube channel',
        avatarUrl: channel.snippet?.thumbnails?.default?.url ?? null,
        capabilities: ['publish', 'upload_video'],
        metadata: { source: 'channels.list(mine=true)' },
      });
      return;
    }
    const response = await fetch(
      'https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url',
      { method: 'GET', headers }
    );
    const payload = (await response.json()) as {
      data?: { user?: { open_id?: string; display_name?: string; avatar_url?: string } };
    };
    const user = payload.data?.user;
    if (!response.ok || !user?.open_id) {
      throw new Error('تعذر قراءة حساب TikTok المفوض.');
    }
    await upsertIntegrationExternalAsset({
      connectionId: input.connectionId,
      provider: 'tiktok',
      assetType: 'profile',
      externalAssetId: user.open_id,
      displayName: user.display_name ?? 'TikTok creator',
      avatarUrl: user.avatar_url ?? null,
      capabilities: ['publish', 'upload_video'],
      metadata: { source: 'user.info' },
    });
  } catch (error) {
    await createIntegrationAuditEvent({
      provider: input.provider,
      connectionId: input.connectionId,
      action: 'assets.discovery.partial_failure',
      status: 'failed',
      summary: `اكتمل التفويض، لكن تعذر استرجاع أصل ${input.provider} الأولي.`,
      errorMessage: error instanceof Error ? error.message : 'فشل اكتشاف الأصل.',
    });
  }
}

export async function startExternalPlatformOAuth(input: {
  provider: ExternalPublishingPlatform;
  initiatedByUserId: number;
  redirectUri: string;
}) {
  const credentials = await getSocialPlatformOAuthCredentials(input.provider);
  if (!credentials) {
    throw new Error(
      `أدخل Client ID وClient Secret وفعّل ${input.provider} في إعدادات الربط أولاً.`
    );
  }
  const spec = PROVIDERS[input.provider];
  const state = createState();
  const codeVerifier = spec.requiresPkce ? createPkceVerifier() : null;
  const connectionId = await createIntegrationConnection({
    provider: input.provider,
    connectionType: 'social_oauth',
    initiatedByUserId: input.initiatedByUserId,
    displayName: `${input.provider} (قيد التفويض)`,
  });
  await createIntegrationOauthState({
    provider: input.provider,
    flow: 'social_oauth',
    stateHash: digest(state),
    codeVerifier,
    redirectUri: input.redirectUri,
    requestedScopes: credentials.requestedScopes.split(/\s+/).filter(Boolean),
    initiatedByUserId: input.initiatedByUserId,
    connectionId,
    expiresAt: new Date(Date.now() + OAUTH_STATE_TTL_MS),
  });
  const url = new URL(spec.authorizationEndpoint);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set(
    input.provider === 'tiktok' ? 'client_key' : 'client_id',
    credentials.clientId
  );
  url.searchParams.set('redirect_uri', input.redirectUri);
  url.searchParams.set('state', state);
  url.searchParams.set('scope', credentials.requestedScopes);
  if (codeVerifier) {
    url.searchParams.set('code_challenge', pkceChallenge(codeVerifier));
    url.searchParams.set('code_challenge_method', 'S256');
  }
  if (input.provider === 'youtube') {
    url.searchParams.set('access_type', 'offline');
    url.searchParams.set('prompt', 'consent');
  }
  await createIntegrationAuditEvent({
    provider: input.provider,
    connectionId,
    action: 'oauth.social.started',
    status: 'started',
    performedByUserId: input.initiatedByUserId,
    summary: `بدأ تفويض OAuth لمنصة ${input.provider}.`,
  });
  return {
    connectionId,
    authorizationUrl: url.toString(),
    expiresAt: new Date(Date.now() + OAUTH_STATE_TTL_MS),
  };
}

export async function completeExternalPlatformOAuth(input: {
  provider: ExternalPublishingPlatform;
  code: string;
  state: string;
}) {
  const stateHash = digest(input.state);
  const oauthState = await consumeIntegrationOauthState(stateHash);
  if (!oauthState || oauthState.provider !== input.provider || oauthState.flow !== 'social_oauth') {
    throw new Error('جلسة التفويض غير صالحة أو منتهية. ابدأ الربط من لوحة الإدارة مجدداً.');
  }
  const credentials = await getSocialPlatformOAuthCredentials(input.provider);
  if (!credentials || !oauthState.connectionId) {
    throw new Error(`إعدادات تطبيق ${input.provider} غير مكتملة.`);
  }
  const connectionId = oauthState.connectionId;
  try {
    const token = await exchangeCode({
      provider: input.provider,
      code: input.code,
      clientId: credentials.clientId,
      clientSecret: credentials.clientSecret,
      redirectUri: oauthState.redirectUri,
      codeVerifier: oauthState.codeVerifier,
    });
    const scopes = token.scope?.split(/\s+/).filter(Boolean) ?? oauthState.requestedScopes;
    const accessToken = token.access_token;
    if (!accessToken) {
      throw new Error(`رمز وصول ${input.provider} غير متاح بعد التفويض.`);
    }
    await storeIntegrationTokens({
      connectionId,
      tokens: [
        {
          type: 'access',
          value: accessToken,
          expiresAt: expiration(token.expires_in),
          scopes,
        },
        ...(token.refresh_token
          ? [
              {
                type: 'refresh' as const,
                value: token.refresh_token,
                expiresAt: expiration(token.refresh_expires_in),
                scopes,
              },
            ]
          : []),
      ],
    });
    await completeIntegrationConnection({
      connectionId,
      displayName: input.provider,
      grantedScopes: scopes,
      expiresAt: expiration(token.expires_in),
      authorizationMethod: PROVIDERS[input.provider].authorizationMethod,
    });
    await discoverPrimaryAsset({
      provider: input.provider,
      connectionId,
      accessToken,
    });
    await createIntegrationAuditEvent({
      provider: input.provider,
      connectionId,
      action: 'oauth.social.completed',
      status: 'succeeded',
      performedByUserId: oauthState.initiatedByUserId,
      summary: `اكتمل تفويض ${input.provider} وحُفظت التوكنات مشفرة.`,
    });
    return { connectionId: oauthState.connectionId };
  } catch (error) {
    const message = error instanceof Error ? error.message : `تعذر إكمال تفويض ${input.provider}.`;
    await failIntegrationOauthState(stateHash, message);
    await markIntegrationConnectionError(connectionId, message);
    void notifyIntegrationIssue({
      connectionId,
      provider: input.provider,
      event: 'connection_error',
    }).catch(() => undefined);
    await createIntegrationAuditEvent({
      provider: input.provider,
      connectionId,
      action: 'oauth.social.completed',
      status: 'failed',
      performedByUserId: oauthState.initiatedByUserId,
      errorMessage: message,
      summary: `فشل تفويض ${input.provider} دون كشف اعتماد في السجل.`,
    });
    throw error;
  }
}
