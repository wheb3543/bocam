import { afterEach, describe, expect, it, vi } from 'vitest';

const getDbMock = vi.hoisted(() => vi.fn());
const ensureAccountMock = vi.hoisted(() => vi.fn());

vi.mock('./connection', () => ({ getDb: getDbMock }));
vi.mock('./socialInbox', () => ({ ensureSocialInboxAccount: ensureAccountMock }));

import { saveMetaIntegrationSettings } from './metaIntegrationSettings';

const testJwtSecret = 'test-jwt-secret-is-longer-than-thirty-two-characters';

describe('Meta integration settings persistence', () => {
  afterEach(() => {
    vi.clearAllMocks();
    delete process.env.JWT_SECRET;
  });

  it('encrypts supplied secrets and returns only their configuration state', async () => {
    process.env.JWT_SECRET = testJwtSecret;
    const limit = vi
      .fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: 1,
          appId: 'meta-app-1',
          facebookPageId: null,
          instagramAccountId: null,
          appSecretEncrypted: 'encrypted-app-secret',
          verifyTokenEncrypted: 'encrypted-verify-token',
          pageAccessTokenEncrypted: 'encrypted-page-token',
          isEnabled: true,
          updatedAt: new Date('2026-08-17T00:00:00.000Z'),
        },
      ]);
    const values = vi.fn().mockResolvedValue([{ insertId: 1 }]);
    const db = {
      select: vi.fn(() => ({ from: vi.fn(() => ({ orderBy: vi.fn(() => ({ limit })) })) })),
      insert: vi.fn(() => ({ values })),
    };
    getDbMock.mockResolvedValue(db);

    const result = await saveMetaIntegrationSettings(
      {
        appId: 'meta-app-1',
        appSecret: 'raw-app-secret',
        verifyToken: 'raw-verify-token',
        pageAccessToken: 'raw-page-token',
        isEnabled: true,
      },
      7
    );

    const saved = values.mock.calls[0][0] as Record<string, unknown>;
    expect(saved.appSecretEncrypted).not.toBe('raw-app-secret');
    expect(saved.verifyTokenEncrypted).not.toBe('raw-verify-token');
    expect(saved.pageAccessTokenEncrypted).not.toBe('raw-page-token');
    expect(result).toEqual(
      expect.objectContaining({
        configured: true,
        hasAppSecret: true,
        hasVerifyToken: true,
        hasPageAccessToken: true,
      })
    );
    expect(result).not.toHaveProperty('appSecret');
    expect(result).not.toHaveProperty('verifyToken');
    expect(result).not.toHaveProperty('pageAccessToken');
  });
});
