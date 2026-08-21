import { TRPCError } from '@trpc/server';
import { protectedProcedure } from '../../_core/trpc';

export type ContentCapability = 'read' | 'edit' | 'review' | 'publish';

const roleCapabilities: Record<string, readonly ContentCapability[]> = {
  admin: ['read', 'edit', 'review', 'publish'],
  manager: ['read', 'edit', 'review', 'publish'],
  team_leader: ['read', 'edit', 'review'],
  staff: ['read', 'edit'],
  viewer: ['read'],
  user: [],
};

export function assertContentCapability(role: string, capability: ContentCapability) {
  const capabilities = roleCapabilities[role] ?? [];

  if (!capabilities.includes(capability)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'ليس لديك الصلاحية المطلوبة لتنفيذ هذا الإجراء في إدارة المحتوى.',
    });
  }
}

function contentProcedure(capability: ContentCapability) {
  return protectedProcedure.use(async ({ ctx, next }) => {
    assertContentCapability(ctx.user.role, capability);

    return next({ ctx });
  });
}

export const contentReadProcedure = contentProcedure('read');
export const contentEditProcedure = contentProcedure('edit');
export const contentReviewProcedure = contentProcedure('review');
export const contentPublishProcedure = contentProcedure('publish');
