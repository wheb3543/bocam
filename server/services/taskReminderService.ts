import { and, eq, gte, inArray, isNotNull, isNull, lt, lte } from 'drizzle-orm';
import { followUpTasks, taskReminderSchedules, tasks } from '../../drizzle/schema';
import { createNotification } from '../_core/notificationHelper';
import { ensureDatabaseAvailable } from '../_core/databaseGuard';

const ACTIVE_FOLLOW_UP_STATUSES = ['pending', 'in_progress'] as const;
const ACTIVE_TASK_STATUSES = ['todo', 'in_progress', 'review'] as const;

function targetFor(kind: 'follow_up' | 'task') {
  return kind === 'follow_up'
    ? { entityType: 'follow_up_task', actionUrl: '/admin/bookings/tasks' }
    : { entityType: 'task', actionUrl: '/admin/teams/digital-marketing' };
}

export async function getTaskReminderSchedule(db: any) {
  const [schedule] = await db.select().from(taskReminderSchedules).limit(1);
  if (schedule) {
    return schedule;
  }
  const [created] = await db
    .insert(taskReminderSchedules)
    .values({ enabled: 'yes', leadTimeHours: 24 })
    .$returningId();
  return (
    await db
      .select()
      .from(taskReminderSchedules)
      .where(eq(taskReminderSchedules.id, created.id))
      .limit(1)
  )[0];
}

export async function attachTaskReminderTask(db: any, taskUid: string) {
  const schedule = await getTaskReminderSchedule(db);
  await db
    .update(taskReminderSchedules)
    .set({ scheduleCronTaskUid: taskUid, updatedAt: new Date() })
    .where(eq(taskReminderSchedules.id, schedule.id));
  return getTaskReminderSchedule(db);
}

export async function notifyTaskAssignment(
  db: any,
  input: {
    kind: 'follow_up' | 'task';
    taskId: number;
    assignedUserId: number;
    actorUserId?: number;
  }
) {
  if (input.assignedUserId === input.actorUserId) {
    return null;
  }
  const target = targetFor(input.kind);
  return createNotification(db, {
    userId: input.assignedUserId,
    source: 'tasks',
    type: 'task_assigned',
    title: input.kind === 'follow_up' ? 'تم إسناد مهمة متابعة إليك' : 'تم إسناد مهمة إليك',
    message: 'أضيفت مهمة جديدة إلى قائمة العمل الخاصة بك.',
    data: JSON.stringify({ taskId: input.taskId, kind: input.kind, event: 'assignment' }),
    entityType: target.entityType,
    entityId: input.taskId,
    actionUrl: target.actionUrl,
    actionLabel: 'فتح المهام',
    priority: 'medium',
  });
}

async function notifyTaskTiming(
  db: any,
  input: {
    kind: 'follow_up' | 'task';
    taskId: number;
    recipientUserId: number;
    event: 'due' | 'overdue';
  }
) {
  const target = targetFor(input.kind);
  const overdue = input.event === 'overdue';
  return createNotification(db, {
    userId: input.recipientUserId,
    source: 'tasks',
    type: overdue ? 'task_overdue' : 'task_due',
    title: overdue ? 'تأخرت مهمة عن موعدها' : 'موعد استحقاق مهمة قريب',
    message: overdue
      ? 'لديك مهمة مفتوحة تجاوزت تاريخ الاستحقاق وتحتاج إلى متابعة.'
      : 'لديك مهمة مفتوحة يقترب موعد استحقاقها وتحتاج إلى متابعة.',
    data: JSON.stringify({ taskId: input.taskId, kind: input.kind, event: input.event }),
    entityType: target.entityType,
    entityId: input.taskId,
    actionUrl: target.actionUrl,
    actionLabel: 'فتح المهام',
    priority: overdue ? 'high' : 'medium',
  });
}

export async function dispatchTaskDueReminders(taskUid: string, now = new Date()) {
  const db = await ensureDatabaseAvailable();
  const [schedule] = await db
    .select()
    .from(taskReminderSchedules)
    .where(eq(taskReminderSchedules.scheduleCronTaskUid, taskUid))
    .limit(1);
  if (!schedule || schedule.enabled !== 'yes') {
    return { skipped: 'disabled_or_orphan', due: 0, overdue: 0 };
  }

  const dueBefore = new Date(now.getTime() + schedule.leadTimeHours * 60 * 60 * 1000);
  let due = 0;
  let overdue = 0;

  const upcomingFollowUps = await db
    .select()
    .from(followUpTasks)
    .where(
      and(
        isNotNull(followUpTasks.dueDate),
        inArray(followUpTasks.status, ACTIVE_FOLLOW_UP_STATUSES),
        isNull(followUpTasks.dueReminderSentAt),
        gte(followUpTasks.dueDate, now),
        lte(followUpTasks.dueDate, dueBefore)
      )
    );
  for (const task of upcomingFollowUps) {
    const created = await notifyTaskTiming(db, {
      kind: 'follow_up',
      taskId: task.id,
      recipientUserId: task.assignedToId ?? task.createdById,
      event: 'due',
    });
    if (created !== null) {
      await db
        .update(followUpTasks)
        .set({ dueReminderSentAt: now })
        .where(eq(followUpTasks.id, task.id));
      due += 1;
    }
  }

  const overdueFollowUps = await db
    .select()
    .from(followUpTasks)
    .where(
      and(
        isNotNull(followUpTasks.dueDate),
        inArray(followUpTasks.status, ACTIVE_FOLLOW_UP_STATUSES),
        isNull(followUpTasks.overdueReminderSentAt),
        lt(followUpTasks.dueDate, now)
      )
    );
  for (const task of overdueFollowUps) {
    const created = await notifyTaskTiming(db, {
      kind: 'follow_up',
      taskId: task.id,
      recipientUserId: task.assignedToId ?? task.createdById,
      event: 'overdue',
    });
    if (created !== null) {
      await db
        .update(followUpTasks)
        .set({ overdueReminderSentAt: now })
        .where(eq(followUpTasks.id, task.id));
      overdue += 1;
    }
  }

  const upcomingTasks = await db
    .select()
    .from(tasks)
    .where(
      and(
        isNotNull(tasks.dueDate),
        inArray(tasks.status, ACTIVE_TASK_STATUSES),
        isNull(tasks.dueReminderSentAt),
        gte(tasks.dueDate, now),
        lte(tasks.dueDate, dueBefore)
      )
    );
  for (const task of upcomingTasks) {
    const created = await notifyTaskTiming(db, {
      kind: 'task',
      taskId: task.id,
      recipientUserId: task.assignedTo ?? task.createdBy,
      event: 'due',
    });
    if (created !== null) {
      await db.update(tasks).set({ dueReminderSentAt: now }).where(eq(tasks.id, task.id));
      due += 1;
    }
  }

  const overdueTasks = await db
    .select()
    .from(tasks)
    .where(
      and(
        isNotNull(tasks.dueDate),
        inArray(tasks.status, ACTIVE_TASK_STATUSES),
        isNull(tasks.overdueReminderSentAt),
        lt(tasks.dueDate, now)
      )
    );
  for (const task of overdueTasks) {
    const created = await notifyTaskTiming(db, {
      kind: 'task',
      taskId: task.id,
      recipientUserId: task.assignedTo ?? task.createdBy,
      event: 'overdue',
    });
    if (created !== null) {
      await db.update(tasks).set({ overdueReminderSentAt: now }).where(eq(tasks.id, task.id));
      overdue += 1;
    }
  }

  await db
    .update(taskReminderSchedules)
    .set({ lastRunAt: now, updatedAt: now })
    .where(eq(taskReminderSchedules.id, schedule.id));
  return { skipped: null, due, overdue };
}
