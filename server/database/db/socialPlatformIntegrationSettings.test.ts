import { afterEach, describe, expect, it, vi } from 'vitest';

const getDbMock = vi.hoisted(() => vi.fn());

vi.mock('./connection', () => ({ getDb: getDbMock }));

import { saveSocialPlatformIntegrationSettings } from './socialPlatformIntegrationSettings';

const testJwtSecret = 'test-jwt-secret-is-longer-than-thirty-two-characters';

describe('general platform integration settings persistence', () => {
  afterEach(() => {
    vi.clearAllMocks();
    delete process.env.JWT_SECRET;
  });

  it('encrypts a platform Client Secret and returns configuration status without exposing it', async () => {
    process.env.JWT_SECRET = testJwtSecret;
    const limit = vi.fn().mockResolvedValue([]);
    const orderBy = vi.fn().mockResolvedValue([
      {
        id: 1,
        platform: 'x',
        clientId: 'x-client-id',
        clientSecretEncrypted: 'encrypted-secret',
        requestedScopes: 'tweet.read tweet.write',
        isEnabled: true,
        lastError: null,
        updatedAt: new Date('2026-08-18T00:00:00.000Z'),
      },
    ]);
    const values = vi.fn().mockResolvedValue([{ insertId: 1 }]);
    const db = {
      select: vi
        .fn()
        .mockReturnValueOnce({ from: vi.fn(() => ({ where: vi.fn(() => ({ limit })) })) })
        .mockReturnValueOnce({ from: vi.fn(() => ({ orderBy })) }),
      insert: vi.fn(() => ({ values })),
    };
    getDbMock.mockResolvedValue(db);

    const result = await saveSocialPlatformIntegrationSettings(
      {
        platform: 'x',
        clientId: 'x-client-id',
        clientSecret: 'raw-x-client-secret',
        isEnabled: true,
      },
      7
    );

    const saved = values.mock.calls[0][0] as Record<string, unknown>;
    expect(saved.clientSecretEncrypted).not.toBe('raw-x-client-secret');
    expect(result.find((item) => item.platform === 'x')).toEqual(
      expect.objectContaining({
        configured: true,
        hasClientSecret: true,
        connectionStatus: 'ready_for_oauth',
      })
    );
    expect(result.find((item) => item.platform === 'x')).not.toHaveProperty('clientSecret');
    expect(JSON.stringify(result)).not.toContain('raw-x-client-secret');
  });
});
