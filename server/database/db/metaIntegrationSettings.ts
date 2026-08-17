import { desc, eq } from 'drizzle-orm';
import { metaIntegrationSettings } from '../../../drizzle/schema';
import { decryptMetaSetting, encryptMetaSetting } from '../../integrations/meta/metaSettingsCrypto';
import { ensureSocialInboxAccount } from './socialInbox';
import { getDb } from './connection';

export type SaveMetaIntegrationSettingsInput = {
  appId?: string;
  facebookPageId?: string;
  instagramAccountId?: string;
  appSecret?: string;
  verifyToken?: string;
  pageAccessToken?: string;
  isEnabled?: boolean;
};

function optionalValue(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed || null;
}

async function getLatestMetaIntegrationSettingsRow() {
  const db = await getDb();
  if (!db) {
    return null;
  }

  const [settings] = await db
    .select()
    .from(metaIntegrationSettings)
    .orderBy(desc(metaIntegrationSettings.updatedAt))
    .limit(1);
  return settings ?? null;
}

export async function getMetaIntegrationSettingsStatus() {
  const settings = await getLatestMetaIntegrationSettingsRow();
  if (!settings) {
    return {
      configured: false,
      isEnabled: false,
      appId: null,
      facebookPageId: null,
      instagramAccountId: null,
      hasAppSecret: false,
      hasVerifyToken: false,
      hasPageAccessToken: false,
      updatedAt: null,
    };
  }

  return {
    configured: Boolean(settings.appSecretEncrypted && settings.verifyTokenEncrypted),
    isEnabled: settings.isEnabled,
    appId: settings.appId,
    facebookPageId: settings.facebookPageId,
    instagramAccountId: settings.instagramAccountId,
    hasAppSecret: Boolean(settings.appSecretEncrypted),
    hasVerifyToken: Boolean(settings.verifyTokenEncrypted),
    hasPageAccessToken: Boolean(settings.pageAccessTokenEncrypted),
    updatedAt: settings.updatedAt,
  };
}

export async function saveMetaIntegrationSettings(
  input: SaveMetaIntegrationSettingsInput,
  updatedByUserId: number
) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  const existing = await getLatestMetaIntegrationSettingsRow();
  const appSecretEncrypted = input.appSecret
    ? encryptMetaSetting(input.appSecret.trim())
    : (existing?.appSecretEncrypted ?? null);
  const verifyTokenEncrypted = input.verifyToken
    ? encryptMetaSetting(input.verifyToken.trim())
    : (existing?.verifyTokenEncrypted ?? null);
  const pageAccessTokenEncrypted = input.pageAccessToken
    ? encryptMetaSetting(input.pageAccessToken.trim())
    : (existing?.pageAccessTokenEncrypted ?? null);
  const isEnabled = input.isEnabled ?? existing?.isEnabled ?? false;

  if (isEnabled && (!appSecretEncrypted || !verifyTokenEncrypted)) {
    throw new Error('لا يمكن تفعيل Meta قبل حفظ App Secret وVerify Token');
  }

  const patch = {
    appId: optionalValue(input.appId) ?? existing?.appId ?? null,
    facebookPageId: optionalValue(input.facebookPageId) ?? existing?.facebookPageId ?? null,
    instagramAccountId:
      optionalValue(input.instagramAccountId) ?? existing?.instagramAccountId ?? null,
    appSecretEncrypted,
    verifyTokenEncrypted,
    pageAccessTokenEncrypted,
    isEnabled,
    updatedByUserId,
  };

  if (existing) {
    await db
      .update(metaIntegrationSettings)
      .set(patch)
      .where(eq(metaIntegrationSettings.id, existing.id));
  } else {
    await db.insert(metaIntegrationSettings).values(patch);
  }

  if (patch.facebookPageId) {
    await Promise.all([
      ensureSocialInboxAccount({
        platform: 'messenger',
        externalAccountId: patch.facebookPageId,
        displayName: 'Messenger Page',
      }),
      ensureSocialInboxAccount({
        platform: 'facebook',
        externalAccountId: patch.facebookPageId,
        displayName: 'Facebook Page',
      }),
    ]);
  }
  if (patch.instagramAccountId) {
    await ensureSocialInboxAccount({
      platform: 'instagram',
      externalAccountId: patch.instagramAccountId,
      displayName: 'Instagram Professional',
      accountType: 'business',
    });
  }

  return getMetaIntegrationSettingsStatus();
}

export async function getMetaWebhookCredentials() {
  const settings = await getLatestMetaIntegrationSettingsRow();
  if (!settings?.isEnabled || !settings.appSecretEncrypted || !settings.verifyTokenEncrypted) {
    return null;
  }

  return {
    appSecret: decryptMetaSetting(settings.appSecretEncrypted),
    verifyToken: decryptMetaSetting(settings.verifyTokenEncrypted),
    pageAccessToken: settings.pageAccessTokenEncrypted
      ? decryptMetaSetting(settings.pageAccessTokenEncrypted)
      : null,
    appId: settings.appId,
    facebookPageId: settings.facebookPageId,
    instagramAccountId: settings.instagramAccountId,
  };
}
