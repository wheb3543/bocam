/**
 * WhatsApp Security Routes
 * مسارات الأمان لواتساب
 */

import { protectedProcedure, router } from '../../../../_core/trpc';
import { z } from 'zod';

export const securityRouter = router({
  blockPhone: protectedProcedure
    .input(
      z.object({
        phone: z.string().min(9).max(15),
        reason: z.enum(['opt_out', 'spam', 'manual', 'invalid']),
      })
    )
    .mutation(
      async ({
        input,
      }: {
        input: { phone: string; reason: 'opt_out' | 'spam' | 'manual' | 'invalid' };
      }) => {
        const { blockPhone } = await import('../../../../services/whatsappSecurity');
        return blockPhone(input);
      }
    ),

  unblockPhone: protectedProcedure
    .input(z.object({ phone: z.string().min(9).max(15) }))
    .mutation(async ({ input }: { input: { phone: string } }) => {
      const { unblockPhone } = await import('../../../../services/whatsappSecurity');
      return unblockPhone(input.phone);
    }),

  getBlockedPhones: protectedProcedure.query(async () => {
    const { getBlockedPhones } = await import('../../../../services/whatsappSecurity');
    return getBlockedPhones();
  }),

  handleOptOutRequest: protectedProcedure
    .input(
      z.object({
        phone: z.string().min(9).max(15),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input }: { input: { phone: string; reason?: string } }) => {
      const { handleOptOutRequest } = await import('../../../../services/whatsappSecurity');
      return handleOptOutRequest(input);
    }),

  getOptOutRequests: protectedProcedure.query(async () => {
    const { getBlockedPhones } = await import('../../../../services/whatsappSecurity');
    return getBlockedPhones();
  }),

  validateMetaCompliance: protectedProcedure
    .input(z.object({ message: z.string() }))
    .query(async ({ input }: { input: { message: string } }) => {
      const { validateMetaCompliance } = await import('../../../../services/whatsappSecurity');
      return validateMetaCompliance(input.message);
    }),

  getSecurityStats: protectedProcedure.query(async () => {
    const { getSecurityStats } = await import('../../../../services/whatsappSecurity');
    return getSecurityStats();
  }),
});
