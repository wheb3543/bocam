import { createHash, randomBytes } from 'node:crypto';
import {
  completeIntegrationConnection,
  consumeIntegrationOauthState,
  createIntegrationAuditEvent,
  createIntegrationConnection,
  createIntegrationOauthState,
  failIntegrationOauthState,
  getMetaOAuthAppCredentials,
  markIntegrationConnectionError,
  storeIntegrationTokens,
  upsertIntegrationExternalAsset,
  upsertIntegrationWebhookSubscription,
} from '../../database/db';
import { notifyIntegrationIssue } from '../../services/integrationNotificationService';

const META_GRAPH_VERSION = 'v26.0';
const META_OAUTH_DIALOG_URL = `https://www.facebook.com/${META_GRAPH_VERSION}/dialog/oauth`;
const META_TOKEN_URL = `https://graph.facebook.com/${META_GRAPH_VERSION}/oauth/access_token`;
const OAUTH_STATE_TTL_MS = 10 * 60 * 1000;

export const META_BUSINESS_REQUESTED_PERMISSIONS = [
  'business_management',
  'pages_show_list',
  'pages_read_engagement',
  'pages_manage_posts',
  'pages_manage_engagement',
  'pages_manage_metadata',
  'pages_messaging',
  'instagram_basic',
  'instagram_content_publish',
  'instagram_manage_comments',
  'instagram_manage_messages',
  'instagram_manage_insights',
  'ads_read',
  'leads_retrieval',
] as const;

type MetaTokenResponse = {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  error?: { message?: string; code?: number; type?: string };
};

type GraphList<T> = { data?: T[]; error?: { message?: string; code?: number } };

type MetaPage = {
  id: string;
  name?: string;
  picture?: { data?: { url?: string } };
  instagram_business_account?: {
    id?: string;
    username?: string;
    profile_picture_url?: string;
  };
};

type MetaAdAccount = { id: string; name?: string; account_status?: number };

function digest(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

function createPkceVerifier() {
  return randomBytes(48).toString('base64url');
}

function pkceChallenge(verifier: string) {
  return createHash('sha256').update(verifier).digest('base64url');
}

function createState() {
  return randomBytes(32).toString('base64url');
}

function tokenExpiry(expiresIn?: number) {
  return typeof expiresIn === 'number' && expiresIn > 0
    ? new Date(Date.now() + expiresIn * 1000)
    : null;
}

function safeMetaError(value: unknown, fallback: string) {
  if (typeof value === 'object' && value && 'error' in value) {
    const error = (value as { error?: { message?: unknown } }).error;
    if (typeof error?.message === 'string') {
      return error.message.slice(0, 500);
    }
  }
  return fallback;
}

async function exchangeMetaCode(input: {
  code: string;
  appId: string;
  appSecret: string;
  redirectUri: string;
}) {
  const params = new URLSearchParams({
    client_id: input.appId,
    client_secret: input.appSecret,
    redirect_uri: input.redirectUri,
    code: input.code,
  });
  const response = await fetch(`${META_TOKEN_URL}?${params.toString()}`);
  const payload = (await response.json()) as MetaTokenResponse;
  if (!response.ok || !payload.access_token) {
    throw new Error(safeMetaError(payload, 'تعذر استبدال رمز Meta بتوكن وصول.'));
  }
  return {
    accessToken: payload.access_token,
    expiresAt: tokenExpiry(payload.expires_in),
  };
}

async function graphList<T>(path: string, accessToken: string, fields: string) {
  const params = new URLSearchParams({ fields, access_token: accessToken });
  const response = await fetch(`https://graph.facebook.com/${META_GRAPH_VERSION}${path}?${params}`);
  const payload = (await response.json()) as GraphList<T>;
  if (!response.ok || payload.error) {
    throw new Error(safeMetaError(payload, `تعذر قراءة أصول Meta من ${path}.`));
  }
  return payload.data ?? [];
}

async function discoverMetaAssets(connectionId: number, accessToken: string) {
  const [pagesResult, adAccountsResult] = await Promise.allSettled([
    graphList<MetaPage>(
      '/me/accounts',
      accessToken,
      'id,name,picture{url},instagram_business_account{id,username,profile_picture_url}'
    ),
    graphList<MetaAdAccount>('/me/adaccounts', accessToken, 'id,name,account_status'),
  ]);

  if (pagesResult.status === 'fulfilled') {
    for (const page of pagesResult.value) {
      await upsertIntegrationExternalAsset({
        connectionId,
        provider: 'meta',
        assetType: 'page',
        externalAssetId: page.id,
        displayName: page.name ?? 'Facebook Page',
        avatarUrl: page.picture?.data?.url ?? null,
        capabilities: ['inbox', 'comments', 'publish', 'webhooks'],
        metadata: { source: 'me/accounts' },
      });
      const instagram = page.instagram_business_account;
      if (instagram?.id) {
        await upsertIntegrationExternalAsset({
          connectionId,
          provider: 'meta',
          assetType: 'instagram_account',
          externalAssetId: instagram.id,
          parentExternalAssetId: page.id,
          displayName: instagram.username ? `@${instagram.username}` : 'Instagram Professional',
          avatarUrl: instagram.profile_picture_url ?? null,
          capabilities: ['inbox', 'comments', 'publish', 'insights'],
          metadata: { source: 'page.instagram_business_account' },
        });
      }
    }
  }

  if (adAccountsResult.status === 'fulfilled') {
    for (const account of adAccountsResult.value) {
      await upsertIntegrationExternalAsset({
        connectionId,
        provider: 'meta',
        assetType: 'ad_account',
        externalAssetId: account.id,
        displayName: account.name ?? account.id,
        capabilities: ['insights', 'lead_ads', 'marketing_api'],
        metadata: { accountStatus: account.account_status ?? null },
      });
    }
  }

  const failed = [pagesResult, adAccountsResult].filter(
    (result): result is PromiseRejectedResult => result.status === 'rejected'
  );
  if (failed.length) {
    await createIntegrationAuditEvent({
      provider: 'meta',
      connectionId,
      action: 'assets.discovery.partial_failure',
      status: 'failed',
      summary: 'تم الاتصال، لكن تعذر استرجاع بعض أصول Meta. راجع الصلاحيات والأصول المفوضة.',
      errorMessage: failed.map((result) => String(result.reason)).join(' | '),
    });
  }
}

export async function startMetaBusinessOAuth(input: {
  initiatedByUserId: number;
  redirectUri: string;
}) {
  const app = await getMetaOAuthAppCredentials();
  if (!app?.facebookLoginConfigId) {
    throw new Error('أدخل Facebook Login for Business Configuration ID في إعدادات Meta أولاً.');
  }

  const connectionId = await createIntegrationConnection({
    provider: 'meta',
    connectionType: 'meta_business',
    initiatedByUserId: input.initiatedByUserId,
    displayName: 'Meta Business (قيد التفويض)',
  });
  const state = createState();
  const codeVerifier = createPkceVerifier();
  await createIntegrationOauthState({
    provider: 'meta',
    flow: 'meta_business',
    stateHash: digest(state),
    codeVerifier,
    redirectUri: input.redirectUri,
    requestedScopes: [...META_BUSINESS_REQUESTED_PERMISSIONS],
    initiatedByUserId: input.initiatedByUserId,
    connectionId,
    expiresAt: new Date(Date.now() + OAUTH_STATE_TTL_MS),
  });
  await createIntegrationAuditEvent({
    provider: 'meta',
    connectionId,
    action: 'oauth.meta_business.started',
    status: 'started',
    performedByUserId: input.initiatedByUserId,
    summary: 'بدأ تفويض Facebook Login for Business.',
  });

  const url = new URL(META_OAUTH_DIALOG_URL);
  url.searchParams.set('client_id', app.appId);
  url.searchParams.set('redirect_uri', input.redirectUri);
  url.searchParams.set('state', state);
  url.searchParams.set('config_id', app.facebookLoginConfigId);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('override_default_response_type', 'true');
  url.searchParams.set('code_challenge', pkceChallenge(codeVerifier));
  url.searchParams.set('code_challenge_method', 'S256');

  return {
    connectionId,
    authorizationUrl: url.toString(),
    expiresAt: new Date(Date.now() + OAUTH_STATE_TTL_MS),
  };
}

export async function completeMetaBusinessOAuth(input: { code: string; state: string }) {
  const stateHash = digest(input.state);
  const oauthState = await consumeIntegrationOauthState(stateHash);
  if (!oauthState || oauthState.flow !== 'meta_business' || oauthState.provider !== 'meta') {
    throw new Error('جلسة تفويض Meta غير صالحة أو منتهية. ابدأ الربط من لوحة الإدارة مجدداً.');
  }
  const app = await getMetaOAuthAppCredentials();
  if (!app) {
    await markIntegrationConnectionError(oauthState.connectionId!, 'بيانات تطبيق Meta غير مكتملة.');
    void notifyIntegrationIssue({
      connectionId: oauthState.connectionId!,
      provider: 'meta',
      event: 'connection_error',
    }).catch(() => undefined);
    throw new Error('بيانات تطبيق Meta غير مكتملة.');
  }

  try {
    const token = await exchangeMetaCode({
      code: input.code,
      appId: app.appId,
      appSecret: app.appSecret,
      redirectUri: oauthState.redirectUri,
    });
    await storeIntegrationTokens({
      connectionId: oauthState.connectionId!,
      tokens: [
        {
          type: 'access',
          value: token.accessToken,
          expiresAt: token.expiresAt,
          scopes: oauthState.requestedScopes,
        },
      ],
    });
    await completeIntegrationConnection({
      connectionId: oauthState.connectionId!,
      displayName: 'Meta Business',
      grantedScopes: oauthState.requestedScopes,
      expiresAt: token.expiresAt,
      authorizationMethod: 'facebook_login_for_business',
    });
    await discoverMetaAssets(oauthState.connectionId!, token.accessToken);
    await createIntegrationAuditEvent({
      provider: 'meta',
      connectionId: oauthState.connectionId,
      action: 'oauth.meta_business.completed',
      status: 'succeeded',
      performedByUserId: oauthState.initiatedByUserId,
      summary: 'اكتمل تفويض Meta وحفظ التوكن مشفراً.',
    });
    return { connectionId: oauthState.connectionId };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'تعذر إكمال تفويض Meta.';
    await failIntegrationOauthState(stateHash, message);
    await markIntegrationConnectionError(oauthState.connectionId!, message);
    void notifyIntegrationIssue({
      connectionId: oauthState.connectionId!,
      provider: 'meta',
      event: 'connection_error',
    }).catch(() => undefined);
    await createIntegrationAuditEvent({
      provider: 'meta',
      connectionId: oauthState.connectionId,
      action: 'oauth.meta_business.completed',
      status: 'failed',
      performedByUserId: oauthState.initiatedByUserId,
      errorMessage: message,
      summary: 'فشل إكمال تفويض Meta دون حفظ تفاصيل حساسة في السجل.',
    });
    throw error;
  }
}

export async function startWhatsAppEmbeddedSignup(input: {
  initiatedByUserId: number;
  redirectUri: string;
}) {
  const app = await getMetaOAuthAppCredentials();
  if (!app?.whatsappEmbeddedSignupConfigId) {
    throw new Error('أدخل WhatsApp Embedded Signup Configuration ID في إعدادات Meta أولاً.');
  }
  const connectionId = await createIntegrationConnection({
    provider: 'whatsapp',
    connectionType: 'whatsapp_embedded_signup',
    initiatedByUserId: input.initiatedByUserId,
    displayName: 'WhatsApp Business (قيد الربط)',
  });
  const state = createState();
  await createIntegrationOauthState({
    provider: 'whatsapp',
    flow: 'whatsapp_embedded_signup',
    stateHash: digest(state),
    redirectUri: input.redirectUri,
    requestedScopes: ['whatsapp_business_management', 'whatsapp_business_messaging'],
    initiatedByUserId: input.initiatedByUserId,
    connectionId,
    expiresAt: new Date(Date.now() + OAUTH_STATE_TTL_MS),
  });
  await createIntegrationAuditEvent({
    provider: 'whatsapp',
    connectionId,
    action: 'embedded_signup.started',
    status: 'started',
    performedByUserId: input.initiatedByUserId,
    summary: 'بدأت جلسة WhatsApp Embedded Signup.',
  });
  return {
    connectionId,
    state,
    appId: app.appId,
    configId: app.whatsappEmbeddedSignupConfigId,
    graphApiVersion: META_GRAPH_VERSION,
    expiresAt: new Date(Date.now() + OAUTH_STATE_TTL_MS),
  };
}

export async function completeWhatsAppEmbeddedSignup(input: {
  code: string;
  state: string;
  wabaId: string;
  phoneNumberId: string;
}) {
  const stateHash = digest(input.state);
  const oauthState = await consumeIntegrationOauthState(stateHash);
  if (
    !oauthState ||
    oauthState.flow !== 'whatsapp_embedded_signup' ||
    oauthState.provider !== 'whatsapp'
  ) {
    throw new Error('جلسة ربط WhatsApp غير صالحة أو منتهية.');
  }
  const app = await getMetaOAuthAppCredentials();
  if (!app) {
    await markIntegrationConnectionError(oauthState.connectionId!, 'بيانات تطبيق Meta غير مكتملة.');
    void notifyIntegrationIssue({
      connectionId: oauthState.connectionId!,
      provider: 'whatsapp',
      event: 'connection_error',
    }).catch(() => undefined);
    throw new Error('بيانات تطبيق Meta غير مكتملة.');
  }

  try {
    const token = await exchangeMetaCode({
      code: input.code,
      appId: app.appId,
      appSecret: app.appSecret,
      redirectUri: oauthState.redirectUri,
    });
    await storeIntegrationTokens({
      connectionId: oauthState.connectionId!,
      tokens: [
        {
          type: 'business',
          value: token.accessToken,
          expiresAt: token.expiresAt,
          scopes: oauthState.requestedScopes,
        },
      ],
    });
    await completeIntegrationConnection({
      connectionId: oauthState.connectionId!,
      displayName: `WhatsApp Business ${input.wabaId}`,
      externalBusinessId: input.wabaId,
      grantedScopes: oauthState.requestedScopes,
      expiresAt: token.expiresAt,
      authorizationMethod: 'whatsapp_embedded_signup',
    });
    await upsertIntegrationExternalAsset({
      connectionId: oauthState.connectionId!,
      provider: 'whatsapp',
      assetType: 'whatsapp_business_account',
      externalAssetId: input.wabaId,
      displayName: `WABA ${input.wabaId}`,
      capabilities: ['messaging', 'templates', 'webhooks'],
      isSelected: true,
    });
    await upsertIntegrationExternalAsset({
      connectionId: oauthState.connectionId!,
      provider: 'whatsapp',
      assetType: 'whatsapp_phone_number',
      externalAssetId: input.phoneNumberId,
      parentExternalAssetId: input.wabaId,
      displayName: `Phone ${input.phoneNumberId}`,
      capabilities: ['messaging', 'quality', 'webhooks'],
      isSelected: true,
    });
    await upsertIntegrationWebhookSubscription({
      connectionId: oauthState.connectionId!,
      provider: 'whatsapp',
      callbackPath: '/api/webhooks/whatsapp',
      subscribedFields: ['messages', 'message_template_quality_update', 'account_update'],
      status: 'pending',
    });
    await createIntegrationAuditEvent({
      provider: 'whatsapp',
      connectionId: oauthState.connectionId,
      action: 'embedded_signup.completed',
      status: 'succeeded',
      performedByUserId: oauthState.initiatedByUserId,
      summary:
        'اكتمل الربط وحفظ توكن WhatsApp مشفراً؛ بقيت عملية التسجيل والاشتراك الحي في Webhook معلّمة كخطوة تالية.',
    });
    return { connectionId: oauthState.connectionId };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'تعذر إكمال WhatsApp Embedded Signup.';
    await failIntegrationOauthState(stateHash, message);
    await markIntegrationConnectionError(oauthState.connectionId!, message);
    void notifyIntegrationIssue({
      connectionId: oauthState.connectionId!,
      provider: 'whatsapp',
      event: 'connection_error',
    }).catch(() => undefined);
    await createIntegrationAuditEvent({
      provider: 'whatsapp',
      connectionId: oauthState.connectionId,
      action: 'embedded_signup.completed',
      status: 'failed',
      performedByUserId: oauthState.initiatedByUserId,
      summary: 'فشل الربط دون تسجيل رمز أو توكن في سجل التدقيق.',
      errorMessage: message,
    });
    throw error;
  }
}
