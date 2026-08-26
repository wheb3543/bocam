import { TRPCError } from '@trpc/server';
import { protectedProcedure } from '../../_core/trpc';
import { ensureDatabaseAvailable } from '../../_core/databaseGuard';
import { hasRolePermission } from '../../services/rolePermissionService';
import type { RolePermission } from '../../../shared/rolePermissions';

export type ContentCapability =
  'read' | 'create' | 'update' | 'delete' | 'restore' | 'review' | 'publish';

const capabilityPermissions: Record<ContentCapability, RolePermission> = {
  read: 'content.view',
  create: 'content.create',
  update: 'content.update',
  delete: 'content.delete',
  restore: 'content.restore',
  review: 'content.review',
  publish: 'content.publish',
};

export async function assertContentCapability(
  user: { id: number; role: string },
  capability: ContentCapability
) {
  const db = await ensureDatabaseAvailable();
  if (!(await hasRolePermission(db, user.id, user.role, capabilityPermissions[capability]))) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'ليس لديك الصلاحية المطلوبة لتنفيذ هذا الإجراء في إدارة المحتوى.',
    });
  }
}

function contentProcedure(capability: ContentCapability) {
  return protectedProcedure.use(async ({ ctx, next }) => {
    await assertContentCapability(ctx.user, capability);

    return next({ ctx });
  });
}

export const contentReadProcedure = contentProcedure('read');
export const contentCreateProcedure = contentProcedure('create');
export const contentUpdateProcedure = contentProcedure('update');
export const contentDeleteProcedure = contentProcedure('delete');
export const contentRestoreProcedure = contentProcedure('restore');
export const contentReviewProcedure = contentProcedure('review');
export const contentPublishProcedure = contentProcedure('publish');
