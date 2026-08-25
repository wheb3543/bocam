import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createNotification: vi.fn(),
  notifyEligibleRecipients: vi.fn(),
  getDb: vi.fn(),
  getSocialInboxThreadById: vi.fn(),
}));

vi.mock('../_core/notificationHelper', () => ({ createNotification: mocks.createNotification }));
vi.mock('../database/db', () => ({
  getDb: mocks.getDb,
  getSocialInboxThreadById: mocks.getSocialInboxThreadById,
}));
vi.mock('./notificationPolicy', () => ({ notifyEligibleRecipients: mocks.notifyEligibleRecipients }));

import {
  notifySocialInboxAssignment,
  notifyStoredSocialInboxInbound,
  notifyWhatsAppAssignment,
  notifyWhatsAppInbound,
} from './communicationNotificationService';

const db = {} as never;

describe('communication notification service', () => {
  beforeEach(() => {
    mocks.createNotification.mockReset();
    mocks.notifyEligibleRecipients.mockReset();
    mocks.getDb.mockReset();
    mocks.getSocialInboxThreadById.mockReset();
  });

  it('sends an inbound WhatsApp notification to the assigned recipient', async () => {
    mocks.createNotification.mockResolvedValue(99);

    await notifyWhatsAppInbound(db, { conversationId: 17, assignedUserId: 7, isImportant: true });

    expect(mocks.createNotification).toHaveBeenCalledWith(
      db,
      expect.objectContaining({
        userId: 7,
        source: 'whatsapp',
        type: 'message_received',
        entityId: 17,
        priority: 'high',
      })
    );
    expect(mocks.notifyEligibleRecipients).not.toHaveBeenCalled();
  });

  it('uses policy-driven recipients when an inbound WhatsApp conversation is unassigned', async () => {
    mocks.notifyEligibleRecipients.mockResolvedValue({ recipients: 2, skipped: null });

    await notifyWhatsAppInbound(db, { conversationId: 21 });

    expect(mocks.notifyEligibleRecipients).toHaveBeenCalledWith(
      db,
      expect.objectContaining({ source: 'whatsapp', type: 'message_received', entityId: 21 })
    );
  });

  it('does not alert a user about an assignment they made to themselves', async () => {
    await notifyWhatsAppAssignment(db, { conversationId: 31, assignedUserId: 4, actorUserId: 4 });

    expect(mocks.createNotification).not.toHaveBeenCalled();
  });

  it('uses the comment-specific type when a social comment is assigned', async () => {
    mocks.createNotification.mockResolvedValue(100);

    await notifySocialInboxAssignment(db, {
      threadId: 44,
      channelType: 'comment',
      assignedUserId: 8,
      actorUserId: 1,
    });

    expect(mocks.createNotification).toHaveBeenCalledWith(
      db,
      expect.objectContaining({
        userId: 8,
        source: 'social_inbox',
        type: 'comment_assigned',
        entityId: 44,
      })
    );
  });

  it('loads stored social context before notifying about an inbound item', async () => {
    mocks.getDb.mockResolvedValue(db);
    mocks.getSocialInboxThreadById.mockResolvedValue({
      thread: { id: 55, channelType: 'message', assignedToUserId: 9 },
      items: [],
    });
    mocks.createNotification.mockResolvedValue(101);

    await notifyStoredSocialInboxInbound(55);

    expect(mocks.createNotification).toHaveBeenCalledWith(
      db,
      expect.objectContaining({
        userId: 9,
        source: 'social_inbox',
        type: 'message_received',
        entityId: 55,
      })
    );
  });
});
