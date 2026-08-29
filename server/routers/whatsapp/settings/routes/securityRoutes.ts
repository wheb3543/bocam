/**
 * WhatsApp Security Routes
 * مسارات الأمان لواتساب
 */

import { router } from '../../../../_core/trpc';
import { permissionProcedure } from '../../../permissionProcedures';
import { z } from 'zod';

export const securityRouter = router({
  blockPhone: permissionProcedure('communications.security.manage', 'إدارة حظر أرقام WhatsApp')
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

  unblockPhone: permissionProcedure('communications.security.manage', 'إلغاء حظر أرقام WhatsApp')
    .input(z.object({ phone: z.string().min(9).max(15) }))
    .mutation(async ({ input }: { input: { phone: string } }) => {
      const { unblockPhone } = await import('../../../../services/whatsappSecurity');
      return unblockPhone(input.phone);
    }),

  getBlockedPhones: permissionProcedure(
    'communications.security.view',
    'عرض قائمة أرقام WhatsApp المحظورة'
  ).query(async () => {
    const { getBlockedPhones } = await import('../../../../services/whatsappSecurity');
    return getBlockedPhones();
  }),

  handleOptOutRequest: permissionProcedure(
    'communications.security.manage',
    'معالجة طلبات إلغاء الاشتراك في WhatsApp'
  )
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

  getOptOutRequests: permissionProcedure(
    'communications.security.view',
    'عرض طلبات إلغاء الاشتراك في WhatsApp'
  ).query(async () => {
    const { getBlockedPhones } = await import('../../../../services/whatsappSecurity');
    return getBlockedPhones();
  }),

  validateMetaCompliance: permissionProcedure(
    'communications.security.view',
    'التحقق من امتثال رسائل WhatsApp'
  )
    .input(z.object({ message: z.string() }))
    .query(async ({ input }: { input: { message: string } }) => {
      const { validateMetaCompliance } = await import('../../../../services/whatsappSecurity');
      return validateMetaCompliance(input.message);
    }),

  getSecurityStats: permissionProcedure(
    'communications.security.view',
    'عرض إحصاءات أمان WhatsApp'
  ).query(async () => {
    const { getSecurityStats } = await import('../../../../services/whatsappSecurity');
    return getSecurityStats();
  }),
});
