import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  disconnect: vi.fn(),
  overview: vi.fn(),
  selectAsset: vi.fn(),
  startMeta: vi.fn(),
  startWhatsApp: vi.fn(),
  completeWhatsApp: vi.fn(),
}));

vi.mock('../database/db', () => ({
  getDb: vi.fn().mockResolvedValue(null),
  disconnectIntegrationConnection: mocks.disconnect,
  getIntegrationConnectionsOverview: mocks.overview,
  setIntegrationAssetSelected: mocks.selectAsset,
}));

vi.mock('../integrations/meta/metaBusinessOAuth', () => ({
  startMetaBusinessOAuth: mocks.startMeta,
  startWhatsAppEmbeddedSignup: mocks.startWhatsApp,
  completeWhatsAppEmbeddedSignup: mocks.completeWhatsApp,
}));

import { integrationConnectionsRouter } from './integrationConnections';

describe('integrationConnectionsRouter', () => {
  beforeEach(() => {
    Object.values(mocks).forEach((mock) => mock.mockReset());
    mocks.overview.mockResolvedValue([]);
    mocks.startMeta.mockResolvedValue({ connectionId: 1, authorizationUrl: 'https://meta.example/auth' });
  });

  it('starts Meta Business OAuth only for an administrator using the fixed callback path', async () => {
    const caller = integrationConnectionsRouter.createCaller({
      user: { id: 17, role: 'admin' },
      req: { protocol: 'https', get: (header: string) => (header === 'host' ? 'sgh.example' : undefined) },
      res: {},
    } as never);

    await caller.startMetaBusiness();

    expect(mocks.startMeta).toHaveBeenCalledWith({
      initiatedByUserId: 17,
      redirectUri: 'https://sgh.example/api/integrations/meta/callback',
    });
  });

  it('rejects a viewer before exposing connection information', async () => {
    const caller = integrationConnectionsRouter.createCaller({
      user: { id: 18, role: 'viewer' },
      req: { protocol: 'https', get: () => 'sgh.example' },
      res: {},
    } as never);

    await expect(caller.overview()).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});
