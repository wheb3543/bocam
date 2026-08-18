import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getStatuses: vi.fn(),
  saveSettings: vi.fn(),
}));

vi.mock('../database/db', () => ({
  getSocialPlatformIntegrationStatuses: mocks.getStatuses,
  saveSocialPlatformIntegrationSettings: mocks.saveSettings,
}));

import { generalIntegrationsRouter } from './generalIntegrations';

describe('generalIntegrationsRouter', () => {
  beforeEach(() => {
    mocks.getStatuses.mockReset();
    mocks.saveSettings.mockReset();
    mocks.getStatuses.mockResolvedValue([]);
    mocks.saveSettings.mockResolvedValue([]);
  });

  it('allows an administrator to retrieve and save platform credentials', async () => {
    const caller = generalIntegrationsRouter.createCaller({
      user: { id: 21, role: 'admin' },
      req: {},
      res: {},
    } as never);

    await caller.status();
    await caller.save({
      platform: 'linkedin',
      clientId: 'linkedin-client',
      clientSecret: 'linkedin-secret',
      isEnabled: true,
    });

    expect(mocks.getStatuses).toHaveBeenCalledOnce();
    expect(mocks.saveSettings).toHaveBeenCalledWith(
      expect.objectContaining({ platform: 'linkedin', clientSecret: 'linkedin-secret' }),
      21
    );
  });

  it('rejects access by a non-administrator', async () => {
    const caller = generalIntegrationsRouter.createCaller({
      user: { id: 22, role: 'viewer' },
      req: {},
      res: {},
    } as never);

    await expect(caller.status()).rejects.toMatchObject({ code: 'FORBIDDEN' });
  });
});
