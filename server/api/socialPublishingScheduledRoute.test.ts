import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  authenticateRequest: vi.fn(),
  dispatchDueSocialPublishPosts: vi.fn(),
  dispatchQueuedMetaConversionEvents: vi.fn(),
}));

vi.mock('../_core/sdk', () => ({ sdk: { authenticateRequest: mocks.authenticateRequest } }));
vi.mock('../database/db/socialPublishing', () => ({
  dispatchDueSocialPublishPosts: mocks.dispatchDueSocialPublishPosts,
}));
vi.mock('../database/db/metaOperations', () => ({
  dispatchQueuedMetaConversionEvents: mocks.dispatchQueuedMetaConversionEvents,
}));

import { createSocialPublishingScheduledRouter } from './socialPublishingScheduledRoute';

function responseMock() {
  const response = {
    status: vi.fn(),
    json: vi.fn(),
  };
  response.status.mockReturnValue(response);
  return response;
}

function scheduledHandler() {
  const router = createSocialPublishingScheduledRouter();
  const layer = router.stack.find((entry: any) => entry.route?.path === '/api/scheduled/social-publish');
  return layer?.route?.stack[0]?.handle as (req: any, res: any, next: any) => Promise<void>;
}

describe('social publishing scheduled route', () => {
  it('ينفذ فقط عبر هوية Heartbeat ويستدعي المعالج بمعرف المهمة الموثوق', async () => {
    mocks.authenticateRequest.mockResolvedValue({ isCron: true, taskUid: 'task_publish_001' });
    mocks.dispatchDueSocialPublishPosts.mockResolvedValue({ inspected: 2, locked: 1, skipped: 1 });
    mocks.dispatchQueuedMetaConversionEvents.mockResolvedValue({ inspected: 1, sent: 1, failed: 0, skipped: 0 });
    const response = responseMock();
    const handler = scheduledHandler();

    await handler({} as any, response as any, vi.fn());

    expect(mocks.dispatchDueSocialPublishPosts).toHaveBeenCalledWith('task_publish_001');
    expect(mocks.dispatchQueuedMetaConversionEvents).toHaveBeenCalledWith();
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: true,
        taskUid: 'task_publish_001',
        publishing: expect.objectContaining({ locked: 1 }),
        conversions: expect.objectContaining({ sent: 1 }),
      })
    );
  });

  it('يرفض أي طلب لا يحمل هوية مهمة مجدولة', async () => {
    mocks.authenticateRequest.mockResolvedValue({ isCron: false });
    const response = responseMock();
    const handler = scheduledHandler();

    await handler({} as any, response as any, vi.fn());

    expect(response.status).toHaveBeenCalledWith(403);
    expect(response.json).toHaveBeenCalledWith({ error: 'cron-only' });
  });
});
