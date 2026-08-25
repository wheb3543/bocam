import { TRPCError } from '@trpc/server';
import { protectedProcedure } from '../../_core/trpc';
import { ensureDatabaseAvailable } from '../../_core/databaseGuard';
import { hasRolePermission } from '../../services/rolePermissionService';
import type { RolePermission } from '../../../shared/rolePermissions';

export type ContentCapability = 'read' | 'edit' | 'review' | 'publish';

const capabilityPermissions: Record<ContentCapability, RolePermission> = {
  read: 'content.view',
  edit: 'content.manage',
  review: 'content.manage',
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
export const contentEditProcedure = contentProcedure('edit');
export const contentReviewProcedure = contentProcedure('review');
export const contentPublishProcedure = contentProcedure('publish');
