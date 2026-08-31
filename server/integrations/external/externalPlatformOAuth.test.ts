import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getCredentials: vi.fn(),
  createConnection: vi.fn(),
  createState: vi.fn(),
  createAudit: vi.fn(),
  consumeState: vi.fn(),
  completeConnection: vi.fn(),
  failState: vi.fn(),
  markError: vi.fn(),
  storeTokens: vi.fn(),
  upsertAsset: vi.fn(),
}));

vi.mock('../../database/db', () => ({
  getDb: vi.fn().mockResolvedValue(null),
  getSocialPlatformOAuthCredentials: mocks.getCredentials,
  createIntegrationConnection: mocks.createConnection,
  createIntegrationOauthState: mocks.createState,
  createIntegrationAuditEvent: mocks.createAudit,
  consumeIntegrationOauthState: mocks.consumeState,
  completeIntegrationConnection: mocks.completeConnection,
  failIntegrationOauthState: mocks.failState,
  markIntegrationConnectionError: mocks.markError,
  storeIntegrationTokens: mocks.storeTokens,
  upsertIntegrationExternalAsset: mocks.upsertAsset,
}));

import { startExternalPlatformOAuth } from './externalPlatformOAuth';

describe('external platform OAuth', () => {
  it('creates an X authorization URL with PKCE and never includes a client secret', async () => {
    mocks.getCredentials.mockResolvedValue({
      clientId: 'x-client-id',
      clientSecret: 'x-client-secret-never-in-url',
      requestedScopes: 'tweet.read tweet.write users.read offline.access',
    });
    mocks.createConnection.mockResolvedValue(42);
    mocks.createState.mockResolvedValue(undefined);
    mocks.createAudit.mockResolvedValue(undefined);

    const result = await startExternalPlatformOAuth({
      provider: 'x',
      initiatedByUserId: 7,
      redirectUri: 'https://crm.example.com/api/integrations/external/x/callback',
    });

    const url = new URL(result.authorizationUrl);
    expect(url.origin).toBe('https://x.com');
    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('code_challenge_method')).toBe('S256');
    expect(url.searchParams.get('state')).toHaveLength(43);
    expect(result.authorizationUrl).not.toContain('x-client-secret-never-in-url');
    expect(mocks.createState).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'x', flow: 'social_oauth', connectionId: 42 })
    );
  });

  it('refuses to start an external OAuth flow before the platform is configured and enabled', async () => {
    mocks.getCredentials.mockResolvedValue(null);
    await expect(
      startExternalPlatformOAuth({
        provider: 'youtube',
        initiatedByUserId: 7,
        redirectUri: 'https://crm.example.com/api/integrations/external/youtube/callback',
      })
    ).rejects.toThrow('أدخل Client ID وClient Secret');
    expect(mocks.createConnection).not.toHaveBeenCalled();
  });
});
