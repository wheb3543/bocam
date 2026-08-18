import { desc, eq } from 'drizzle-orm';
import { socialPlatformIntegrationSettings } from '../../../drizzle/schema';
import { encryptMetaSetting } from '../../integrations/meta/metaSettingsCrypto';
import { getDb } from './connection';

export type ExternalPublishingPlatform = 'x' | 'linkedin' | 'youtube' | 'tiktok';

export type SaveSocialPlatformIntegrationInput = {
  platform: ExternalPublishingPlatform;
  clientId?: string;
  clientSecret?: string;
  requestedScopes?: string;
  isEnabled?: boolean;
};

const platformDefaults: Record<ExternalPublishingPlatform, { scopes: string; label: string }> = {
  x: { label: 'X', scopes: 'tweet.read tweet.write users.read offline.access media.write' },
  linkedin: { label: 'LinkedIn', scopes: 'openid profile w_member_social w_organization_social' },
  youtube: { label: 'YouTube', scopes: 'https://www.googleapis.com/auth/youtube.upload' },
  tiktok: { label: 'TikTok', scopes: 'video.publish user.info.basic' },
};

function optionalValue(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed || null;
}

export async function getSocialPlatformIntegrationStatuses() {
  const db = await getDb();
  const rows = db
    ? await db
        .select()
        .from(socialPlatformIntegrationSettings)
        .orderBy(desc(socialPlatformIntegrationSettings.updatedAt))
    : [];

  return (Object.keys(platformDefaults) as ExternalPublishingPlatform[]).map((platform) => {
    const row = rows.find((item) => item.platform === platform);
    return {
      platform,
      label: platformDefaults[platform].label,
      clientId: row?.clientId ?? null,
      requestedScopes: row?.requestedScopes ?? platformDefaults[platform].scopes,
      isEnabled: row?.isEnabled ?? false,
      configured: Boolean(row?.clientId && row?.clientSecretEncrypted),
      hasClientSecret: Boolean(row?.clientSecretEncrypted),
      connectionStatus:
        row?.isEnabled && row?.clientId && row?.clientSecretEncrypted
          ? 'ready_for_oauth'
          : 'not_configured',
      lastError: row?.lastError ?? null,
      updatedAt: row?.updatedAt ?? null,
    };
  });
}

export async function saveSocialPlatformIntegrationSettings(
  input: SaveSocialPlatformIntegrationInput,
  updatedByUserId: number
) {
  const db = await getDb();
  if (!db) {
    throw new Error('قاعدة البيانات غير متاحة');
  }
  const [existing] = await db
    .select()
    .from(socialPlatformIntegrationSettings)
    .where(eq(socialPlatformIntegrationSettings.platform, input.platform))
    .limit(1);

  const clientId = optionalValue(input.clientId) ?? existing?.clientId ?? null;
  const clientSecretEncrypted = input.clientSecret
    ? encryptMetaSetting(input.clientSecret.trim())
    : (existing?.clientSecretEncrypted ?? null);
  const requestedScopes =
    optionalValue(input.requestedScopes) ??
    existing?.requestedScopes ??
    platformDefaults[input.platform].scopes;
  const isEnabled = input.isEnabled ?? existing?.isEnabled ?? false;

  if (isEnabled && (!clientId || !clientSecretEncrypted)) {
    throw new Error(
      `لا يمكن تفعيل ${platformDefaults[input.platform].label} قبل حفظ Client ID وClient Secret`
    );
  }

  const patch = {
    clientId,
    clientSecretEncrypted,
    requestedScopes,
    isEnabled,
    lastError: null,
    updatedByUserId,
  };
  if (existing) {
    await db
      .update(socialPlatformIntegrationSettings)
      .set(patch)
      .where(eq(socialPlatformIntegrationSettings.id, existing.id));
  } else {
    await db
      .insert(socialPlatformIntegrationSettings)
      .values({ platform: input.platform, ...patch });
  }
  return getSocialPlatformIntegrationStatuses();
}
