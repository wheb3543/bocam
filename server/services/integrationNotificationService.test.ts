import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  ensureDatabaseAvailable: vi.fn(),
  notifyEligibleRecipients: vi.fn(),
}));

vi.mock('../_core/databaseGuard', () => ({
  ensureDatabaseAvailable: mocks.ensureDatabaseAvailable,
}));
vi.mock('./notificationPolicy', () => ({
  notifyEligibleRecipients: mocks.notifyEligibleRecipients,
}));

import { notifyIntegrationIssue } from './integrationNotificationService';

describe('integration notification service', () => {
  beforeEach(() => {
    mocks.ensureDatabaseAvailable.mockReset();
    mocks.notifyEligibleRecipients.mockReset();
    mocks.ensureDatabaseAvailable.mockResolvedValue({});
    mocks.notifyEligibleRecipients.mockResolvedValue({ recipients: 2, skipped: null });
  });

  it('sends a high-priority, privacy-safe alert for a connection error', async () => {
    const result = await notifyIntegrationIssue({
      connectionId: 21,
      provider: 'whatsapp',
      event: 'connection_error',
    });

    expect(result).toEqual({ recipients: 2, skipped: null });
    expect(mocks.notifyEligibleRecipients).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        source: 'integrations',
        type: 'connection_error',
        entityId: 21,
        priority: 'high',
        actionUrl: '/admin/communications/integration-settings',
      })
    );
    expect(mocks.notifyEligibleRecipients.mock.calls[0][1].message).not.toContain('token');
  });

  it('uses the distinct authorization-expiring event for proactive alerts', async () => {
    await notifyIntegrationIssue({
      connectionId: 22,
      provider: 'youtube',
      event: 'authorization_expiring',
    });

    expect(mocks.notifyEligibleRecipients).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ type: 'authorization_expiring', source: 'integrations' })
    );
  });
});
