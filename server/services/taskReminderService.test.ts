import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createNotification: vi.fn(),
  ensureDatabaseAvailable: vi.fn(),
}));

vi.mock('../_core/notificationHelper', () => ({ createNotification: mocks.createNotification }));
vi.mock('../_core/databaseGuard', () => ({ ensureDatabaseAvailable: mocks.ensureDatabaseAvailable }));

import { notifyTaskAssignment } from './taskReminderService';

describe('task reminder notifications', () => {
  beforeEach(() => {
    mocks.createNotification.mockReset();
    mocks.ensureDatabaseAvailable.mockReset();
  });

  it('notifies the assignee for a follow-up task and links to the task workspace', async () => {
    mocks.createNotification.mockResolvedValue(1);
    const db = {} as never;

    await notifyTaskAssignment(db, {
      kind: 'follow_up',
      taskId: 42,
      assignedUserId: 9,
      actorUserId: 2,
    });

    expect(mocks.createNotification).toHaveBeenCalledWith(
      db,
      expect.objectContaining({
        userId: 9,
        source: 'tasks',
        type: 'task_assigned',
        entityType: 'follow_up_task',
        entityId: 42,
        actionUrl: '/admin/bookings/tasks',
      })
    );
  });

  it('does not notify users when they assign the task to themselves', async () => {
    await notifyTaskAssignment({} as never, {
      kind: 'task',
      taskId: 13,
      assignedUserId: 7,
      actorUserId: 7,
    });

    expect(mocks.createNotification).not.toHaveBeenCalled();
  });
});
