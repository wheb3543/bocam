import { createHash, randomBytes } from 'node:crypto';
import { and, eq, isNull } from 'drizzle-orm';
import { z } from 'zod';
import { cmsPreviewTokens, pages } from '../../../drizzle/schema';
import { ensureDatabaseAvailable } from '../../_core/databaseGuard';
import { router } from '../../_core/trpc';
import { contentUpdateProcedure } from './authorization';

const PREVIEW_TTL_MINUTES = 15;

function hashPreviewToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * روابط المعاينة لا تحمل بيانات الصفحة ولا تحفظ الرمز الخام. من يملك الرابط
 * يستطيع رؤيته حتى انتهاء صلاحيته، لذا يصدر للمحررين فقط لمدة قصيرة قابلة للإلغاء.
 */
export const previewRouter = router({
  issue: contentUpdateProcedure
    .input(
      z.object({
        pageId: z.number().int().positive(),
        language: z.enum(['ar', 'en']).default('ar'),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDatabaseAvailable();
      const page = await db
        .select({ id: pages.id })
        .from(pages)
        .where(and(eq(pages.id, input.pageId), isNull(pages.deletedAt)))
        .limit(1);

      if (!page[0]) {
        throw new Error('لا يمكن إصدار معاينة لصفحة غير موجودة أو محذوفة.');
      }

      const token = randomBytes(32).toString('base64url');
      const expiresAt = new Date(Date.now() + PREVIEW_TTL_MINUTES * 60 * 1000);
      const inserted = await db
        .insert(cmsPreviewTokens)
        .values({
          tokenHash: hashPreviewToken(token),
          pageId: input.pageId,
          language: input.language,
          createdByUserId: ctx.user.id,
          expiresAt,
        })
        .$returningId();

      return {
        id: Number(inserted[0].id),
        previewUrl: `/preview/${token}`,
        expiresAt,
      };
    }),

  revoke: contentUpdateProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const db = await ensureDatabaseAvailable();
      await db
        .update(cmsPreviewTokens)
        .set({ revokedAt: new Date() })
        .where(and(eq(cmsPreviewTokens.id, input.id), isNull(cmsPreviewTokens.revokedAt)));
      return { success: true };
    }),
});
