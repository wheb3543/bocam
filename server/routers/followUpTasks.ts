import { z } from 'zod';
import { router } from '../_core/trpc';
import { ensureDatabaseAvailable } from '../_core/databaseGuard';
import { notifyTaskAssignment } from '../services/taskReminderService';
import {
  createFollowUpTask,
  getFollowUpTasksByEntity,
  getFollowUpTaskCount,
  updateFollowUpTaskStatus,
  deleteFollowUpTask,
} from '../tasks/followUpTasks';
import { assertRolePermission, permissionProcedure } from './permissionProcedures';

const tasksViewProcedure = permissionProcedure('tasks.view', 'عرض مهام المتابعة');
const tasksCreateProcedure = permissionProcedure('tasks.create', 'إنشاء مهام المتابعة');
const tasksUpdateProcedure = permissionProcedure('tasks.update', 'تعديل مهام المتابعة');
const tasksDeleteProcedure = permissionProcedure('tasks.delete', 'حذف مهام المتابعة');

export const followUpTasksRouter = router({
  // Get all tasks
  getAll: tasksViewProcedure.query(async () => {
    const db = await ensureDatabaseAvailable();
    const { followUpTasks } = await import('../../drizzle/schema');
    const { desc } = await import('drizzle-orm');
    return db.select().from(followUpTasks).orderBy(desc(followUpTasks.createdAt));
  }),

  // Get tasks for a specific entity
  getByEntity: tasksViewProcedure
    .input(
      z.object({
        entityType: z.enum(['appointment', 'lead', 'offerLead', 'campRegistration']),
        entityId: z.number(),
      })
    )
    .query(async ({ input }) => {
      return getFollowUpTasksByEntity(input.entityType, input.entityId);
    }),

  // Get task count for a specific entity
  getCount: tasksViewProcedure
    .input(
      z.object({
        entityType: z.enum(['appointment', 'lead', 'offerLead', 'campRegistration']),
        entityId: z.number(),
      })
    )
    .query(async ({ input }) => {
      return getFollowUpTaskCount(input.entityType, input.entityId);
    }),

  // Create a new task
  create: tasksCreateProcedure
    .input(
      z.object({
        entityType: z.enum(['appointment', 'lead', 'offerLead', 'campRegistration']),
        entityId: z.number(),
        title: z.string().min(1),
        description: z.string().optional(),
        priority: z.enum(['low', 'medium', 'high']).default('medium'),
        dueDate: z.string().optional(), // ISO date string
        assignedToId: z.number().optional(),
        assignedToName: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (input.assignedToId && input.assignedToId !== ctx.user.id) {
        await assertRolePermission(ctx.user, 'tasks.assign', 'إسناد مهام المتابعة');
      }
      const created = await createFollowUpTask({
        entityType: input.entityType,
        entityId: input.entityId,
        title: input.title,
        description: input.description,
        priority: input.priority,
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        assignedToId: input.assignedToId,
        assignedToName: input.assignedToName,
        createdById: ctx.user.id,
        createdByName: ctx.user.name || ctx.user.username,
        status: 'pending',
      });

      if (input.assignedToId && input.assignedToId !== ctx.user.id) {
        const db = await ensureDatabaseAvailable();
        void notifyTaskAssignment(db, {
          kind: 'follow_up',
          taskId: created.id,
          assignedUserId: input.assignedToId,
          actorUserId: ctx.user.id,
        }).catch(() => undefined);
      }

      return { success: true, id: created.id };
    }),

  // Update task status
  updateStatus: tasksUpdateProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (input.status === 'completed') {
        await assertRolePermission(ctx.user, 'tasks.complete', 'إكمال مهام المتابعة');
      }
      await updateFollowUpTaskStatus(
        input.id,
        input.status,
        ctx.user.id,
        ctx.user.name || ctx.user.username
      );

      return { success: true };
    }),

  // Delete a task
  delete: tasksDeleteProcedure.input(z.object({ id: z.number() })).mutation(async ({ input }) => {
    await deleteFollowUpTask(input.id);
    return { success: true };
  }),
});
