import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  completeConnection: vi.fn(),
  consumeState: vi.fn(),
  createAudit: vi.fn(),
  createConnection: vi.fn(),
  createState: vi.fn(),
  failState: vi.fn(),
  getAppCredentials: vi.fn(),
  markConnectionError: vi.fn(),
  storeTokens: vi.fn(),
  upsertAsset: vi.fn(),
  upsertWebhook: vi.fn(),
}));

vi.mock('../../database/db', () => ({
  completeIntegrationConnection: mocks.completeConnection,
  consumeIntegrationOauthState: mocks.consumeState,
  createIntegrationAuditEvent: mocks.createAudit,
  createIntegrationConnection: mocks.createConnection,
  createIntegrationOauthState: mocks.createState,
  failIntegrationOauthState: mocks.failState,
  getMetaOAuthAppCredentials: mocks.getAppCredentials,
  markIntegrationConnectionError: mocks.markConnectionError,
  storeIntegrationTokens: mocks.storeTokens,
  upsertIntegrationExternalAsset: mocks.upsertAsset,
  upsertIntegrationWebhookSubscription: mocks.upsertWebhook,
}));

import { completeMetaBusinessOAuth, startMetaBusinessOAuth } from './metaBusinessOAuth';

describe('Meta Business OAuth service', () => {
  beforeEach(() => {
    Object.values(mocks).forEach((mock) => mock.mockReset());
    mocks.getAppCredentials.mockResolvedValue({
      appId: 'meta-app-id',
      appSecret: 'server-only-app-secret',
      facebookLoginConfigId: 'business-config-id',
      whatsappEmbeddedSignupConfigId: 'whatsapp-config-id',
    });
    mocks.createConnection.mockResolvedValue(41);
    mocks.createState.mockResolvedValue(undefined);
    mocks.createAudit.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('creates a short-lived hashed state and a Meta authorization URL without exposing the app secret', async () => {
    const result = await startMetaBusinessOAuth({
      initiatedByUserId: 8,
      redirectUri: 'https://sgh.example/api/integrations/meta/callback',
    });

    const authorizationUrl = new URL(result.authorizationUrl);
    expect(authorizationUrl.searchParams.get('client_id')).toBe('meta-app-id');
    expect(authorizationUrl.searchParams.get('config_id')).toBe('business-config-id');
    expect(authorizationUrl.searchParams.get('response_type')).toBe('code');
    expect(authorizationUrl.searchParams.get('state')).toHaveLength(43);
    expect(result.authorizationUrl).not.toContain('server-only-app-secret');
    expect(mocks.createState).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: 'meta',
        flow: 'meta_business',
        stateHash: expect.stringMatching(/^[a-f0-9]{64}$/),
        codeVerifier: expect.any(String),
      })
    );
  });

  it('exchanges the callback code on the server and saves the received token only through encrypted persistence', async () => {
    mocks.consumeState.mockResolvedValue({
      provider: 'meta',
      flow: 'meta_business',
      connectionId: 41,
      redirectUri: 'https://sgh.example/api/integrations/meta/callback',
      requestedScopes: ['pages_show_list'],
      initiatedByUserId: 8,
    });
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        if (url.includes('/oauth/access_token')) {
          return { ok: true, json: async () => ({ access_token: 'server-only-access-token', expires_in: 3600 }) };
        }
        return { ok: true, json: async () => ({ data: [] }) };
      })
    );

    await expect(completeMetaBusinessOAuth({ code: 'provider-code', state: 'state-value' })).resolves.toEqual({
      connectionId: 41,
    });

    expect(mocks.storeTokens).toHaveBeenCalledWith(
      expect.objectContaining({
        connectionId: 41,
        tokens: [expect.objectContaining({ type: 'access', value: 'server-only-access-token' })],
      })
    );
    expect(mocks.completeConnection).toHaveBeenCalledWith(
      expect.objectContaining({ connectionId: 41, authorizationMethod: 'facebook_login_for_business' })
    );
    expect(JSON.stringify(mocks.createAudit.mock.calls)).not.toContain('server-only-access-token');
  });
});
