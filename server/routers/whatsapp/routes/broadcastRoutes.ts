/**
 * Broadcast Routes
 * مسارات البث
 */

import { sendTextMessage } from '../../../services/whatsappService';

export const broadcastRoutes = {
  sendSimpleText: async ({ input }: { input: Record<string, unknown> }) => {
    return sendTextMessage(input.phone as string, input.message as string, {
      priority: input.priority as 'high' | 'normal' | 'low' | undefined,
    });
  },

  sendWelcomeMsg: async ({ input }: { input: Record<string, unknown> }) => {
    const { sendWelcomeMessage } = await import('../../../services/whatsappService');
    return sendWelcomeMessage({
      phone: input.phone as string,
      fullName: input.fullName as string,
      campaignName: input.campaignName as string,
    });
  },

  sendBroadcast: async ({ input }: { input: Record<string, unknown> }) => {
    const { sendBroadcast } = await import('../../../services/whatsappBroadcast');
    return sendBroadcast({
      message: input.message as string,
      recipients: input.recipients as string[],
      priority: input.priority as 'high' | 'normal' | 'low' | undefined,
      delay: input.delay as number | undefined,
    });
  },

  getBroadcastStatus: async ({ input }: { input: Record<string, unknown> }) => {
    const { getBroadcastStatus } = await import('../../../services/whatsappBroadcast');
    return getBroadcastStatus(parseInt(input.jobId as string));
  },

  getBroadcastStats: async () => {
    const { getBroadcastStats } = await import('../../../services/whatsappBroadcast');
    return getBroadcastStats();
  },

  scheduleBroadcast: async ({ input }: { input: Record<string, unknown> }) => {
    const { scheduleBroadcast } = await import('../../../services/whatsappBroadcast');
    return scheduleBroadcast({
      message: input.message as string,
      recipients: input.recipients as string[],
      scheduledAt: input.scheduledAt as Date,
      priority: input.priority as 'high' | 'normal' | 'low' | undefined,
    });
  },
};
