/**
 * Broadcast Scheduler Service
 * يحفظ البث المجدول كاملاً ويشغله عبر Heartbeat عند الموعد.
 */

import { getDb } from '../../../database/db';
import { whatsappBroadcasts } from '../../../../drizzle/schema';
import { and, eq, lte } from 'drizzle-orm';
import { createHeartbeatJob } from '../../../_core/heartbeatJobs';
import {
  broadcastExecutionService,
  getInsertedBroadcastId,
  validatePublicHeaderImageUrl,
} from './broadcastExecutionServiceV2';

type ScheduledRecipient = { phone: string; fullName: string; source: string };
type CreateScheduledBroadcastInput = {
  templateId: number;
  variables: Record<string, string>;
  recipients: ScheduledRecipient[];
  headerImageUrl?: string;
  scheduledDate: string;
  scheduledTime: string;
  createdBy: number;
};

export class BroadcastSchedulerService {
  /** مسار احتياطي للتشغيل اليدوي؛ التنفيذ المعتاد يتم عبر Heartbeat. */
  async processPendingBroadcasts() {
    const db = await getDb();
    if (!db) {
      throw new Error('Database connection failed');
    }

    const pendingBroadcasts = await db
      .select()
      .from(whatsappBroadcasts)
      .where(
        and(
          eq(whatsappBroadcasts.status, 'scheduled'),
          lte(whatsappBroadcasts.scheduledAt, new Date())
        )
      );

    for (const broadcast of pendingBroadcasts) {
      await this.sendScheduledBroadcast(broadcast);
    }
    return { processed: pendingBroadcasts.length };
  }

  async createScheduledBroadcast(input: CreateScheduledBroadcastInput, userSession: string) {
    if (!this.isValidDate(input.scheduledDate)) {
      throw new Error('Invalid date format. Use YYYY-MM-DD');
    }
    if (!this.isValidTime(input.scheduledTime)) {
      throw new Error('Invalid time format. Use HH:MM:SS');
    }
    if (input.recipients.length === 0) {
      throw new Error('Scheduled broadcast requires at least one recipient');
    }

    const scheduledAt = this.createScheduledAt(input.scheduledDate, input.scheduledTime);
    if (scheduledAt <= new Date()) {
      throw new Error('Scheduled time must be in the future');
    }

    const headerImageUrl = input.headerImageUrl
      ? await validatePublicHeaderImageUrl(input.headerImageUrl)
      : undefined;
    const db = await getDb();
    if (!db) {
      throw new Error('Database connection failed');
    }

    const record = await db.insert(whatsappBroadcasts).values({
      name: `Scheduled broadcast - ${scheduledAt.toISOString()}`,
      templateId: input.templateId,
      message: JSON.stringify(input.variables),
      recipientSnapshot: JSON.stringify(input.recipients),
      headerImageUrl,
      recipientCount: input.recipients.length,
      sentCount: 0,
      deliveredCount: 0,
      readCount: 0,
      failedCount: 0,
      status: 'scheduled',
      scheduledAt,
      createdBy: input.createdBy,
    });
    const broadcastId = getInsertedBroadcastId(record);

    try {
      const job = await createHeartbeatJob(
        {
          name: `broadcast-${broadcastId}`,
          cron: this.toOneTimeCron(scheduledAt),
          path: '/api/scheduled/broadcast',
          payload: { broadcastId },
          description: `Send scheduled WhatsApp broadcast ${broadcastId}`,
        },
        userSession
      );

      await db
        .update(whatsappBroadcasts)
        .set({ scheduleCronTaskUid: job.taskUid })
        .where(eq(whatsappBroadcasts.id, broadcastId));

      return {
        success: true,
        broadcastId,
        scheduledAt,
        nextExecutionAt: job.nextExecutionAt ?? null,
      };
    } catch (error) {
      await db
        .update(whatsappBroadcasts)
        .set({ status: 'draft' })
        .where(eq(whatsappBroadcasts.id, broadcastId));
      throw error;
    }
  }

  async executeScheduledBroadcastByTaskUid(taskUid: string) {
    const db = await getDb();
    if (!db) {
      throw new Error('Database connection failed');
    }

    const broadcast = (
      await db
        .select()
        .from(whatsappBroadcasts)
        .where(eq(whatsappBroadcasts.scheduleCronTaskUid, taskUid))
        .limit(1)
    )[0];
    if (!broadcast) {
      return { ok: true, skipped: 'orphan' };
    }
    if (broadcast.status !== 'scheduled') {
      return { ok: true, skipped: 'already-processed' };
    }
    if (!broadcast.scheduledAt || broadcast.scheduledAt > new Date()) {
      return { ok: true, skipped: 'not-due' };
    }

    await this.sendScheduledBroadcast(broadcast);
    return { ok: true, broadcastId: broadcast.id };
  }

  async scheduleBroadcast(broadcastId: number, scheduledDate: string, scheduledTime: string) {
    if (!this.isValidDate(scheduledDate) || !this.isValidTime(scheduledTime)) {
      throw new Error('Invalid scheduled date or time');
    }
    const scheduledAt = this.createScheduledAt(scheduledDate, scheduledTime);
    if (scheduledAt <= new Date()) {
      throw new Error('Scheduled time must be in the future');
    }
    const db = await getDb();
    if (!db) {
      throw new Error('Database connection failed');
    }
    await db
      .update(whatsappBroadcasts)
      .set({ status: 'scheduled', scheduledAt })
      .where(eq(whatsappBroadcasts.id, broadcastId));
    return { success: true, broadcastId, scheduledDate, scheduledTime };
  }

  async updateScheduledBroadcast(
    broadcastId: number,
    scheduledDate: string,
    scheduledTime: string
  ) {
    if (!this.isValidDate(scheduledDate) || !this.isValidTime(scheduledTime)) {
      throw new Error('Invalid scheduled date or time');
    }
    const db = await getDb();
    if (!db) {
      throw new Error('Database connection failed');
    }
    const broadcast = (
      await db
        .select()
        .from(whatsappBroadcasts)
        .where(eq(whatsappBroadcasts.id, broadcastId))
        .limit(1)
    )[0];
    if (!broadcast) {
      throw new Error('Broadcast not found');
    }
    if (broadcast.status !== 'scheduled') {
      throw new Error('Only scheduled broadcasts can be updated');
    }
    const scheduledAt = this.createScheduledAt(scheduledDate, scheduledTime);
    if (scheduledAt <= new Date()) {
      throw new Error('Scheduled time must be in the future');
    }
    await db
      .update(whatsappBroadcasts)
      .set({ scheduledAt })
      .where(eq(whatsappBroadcasts.id, broadcastId));
    return { success: true, broadcastId, scheduledDate, scheduledTime };
  }

  async cancelScheduledBroadcast(broadcastId: number) {
    const db = await getDb();
    if (!db) {
      throw new Error('Database connection failed');
    }
    const broadcast = (
      await db
        .select()
        .from(whatsappBroadcasts)
        .where(eq(whatsappBroadcasts.id, broadcastId))
        .limit(1)
    )[0];
    if (!broadcast) {
      throw new Error('Broadcast not found');
    }
    if (broadcast.status !== 'scheduled') {
      throw new Error('Only scheduled broadcasts can be cancelled');
    }
    await db
      .update(whatsappBroadcasts)
      .set({ status: 'draft', scheduledAt: null, scheduleCronTaskUid: null })
      .where(eq(whatsappBroadcasts.id, broadcastId));
    return { success: true, broadcastId };
  }

  async getScheduledBroadcasts() {
    const db = await getDb();
    if (!db) {
      throw new Error('Database connection failed');
    }
    return db.select().from(whatsappBroadcasts).where(eq(whatsappBroadcasts.status, 'scheduled'));
  }

  private async sendScheduledBroadcast(broadcast: typeof whatsappBroadcasts.$inferSelect) {
    const db = await getDb();
    if (!db) {
      throw new Error('Database connection failed');
    }
    const recipients = this.parseRecipients(broadcast.recipientSnapshot);
    if (recipients.length === 0) {
      throw new Error('Scheduled broadcast has no stored recipients');
    }

    await db
      .update(whatsappBroadcasts)
      .set({ status: 'sending' })
      .where(eq(whatsappBroadcasts.id, broadcast.id));
    try {
      const result = await broadcastExecutionService.executeBroadcast({
        existingBroadcastId: broadcast.id,
        templateId: broadcast.templateId ?? 0,
        variables: this.parseVariables(broadcast.message),
        headerImageUrl: broadcast.headerImageUrl ?? undefined,
        recipients,
      });
      if (!result.success) {
        throw new Error('Meta did not accept any scheduled broadcast message');
      }
      return result;
    } catch (error) {
      await db
        .update(whatsappBroadcasts)
        .set({ status: 'failed', completedAt: new Date() })
        .where(eq(whatsappBroadcasts.id, broadcast.id));
      throw error;
    }
  }

  private isValidDate(value: string) {
    return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(value).getTime());
  }

  private isValidTime(value: string) {
    return /^\d{2}:\d{2}:\d{2}$/.test(value);
  }

  private createScheduledAt(date: string, time: string) {
    return new Date(`${date}T${time}+03:00`);
  }

  private toOneTimeCron(date: Date) {
    return `0 ${date.getUTCMinutes()} ${date.getUTCHours()} ${date.getUTCDate()} ${date.getUTCMonth() + 1} *`;
  }

  private parseRecipients(snapshot: string | null): ScheduledRecipient[] {
    try {
      const records: unknown = JSON.parse(snapshot ?? '[]');
      return Array.isArray(records)
        ? records.filter(
            (record): record is ScheduledRecipient =>
              typeof record?.phone === 'string' &&
              typeof record?.fullName === 'string' &&
              typeof record?.source === 'string'
          )
        : [];
    } catch {
      return [];
    }
  }

  private parseVariables(message: string): Record<string, string> {
    try {
      const parsed: unknown = JSON.parse(message);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return {};
      }
      return Object.fromEntries(Object.entries(parsed).map(([key, value]) => [key, String(value)]));
    } catch {
      return {};
    }
  }
}

export const broadcastSchedulerService = new BroadcastSchedulerService();
