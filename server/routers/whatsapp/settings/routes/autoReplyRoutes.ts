/**
 * WhatsApp Auto Reply Routes
 * مسارات الرد التلقائي لواتساب
 */

import { router } from '../../../../_core/trpc';
import { permissionProcedure } from '../../../permissionProcedures';
import { z } from 'zod';

export const autoReplyRouter = router({
  addAutoReplyRule: permissionProcedure(
    'communications.automation.manage',
    'إنشاء قواعد الرد الآلي في WhatsApp'
  )
    .input(
      z.object({
        name: z.string().min(1),
        triggerType: z.enum(['keyword', 'outside_hours', 'first_message', 'faq']),
        triggerValue: z.string().optional(),
        replyMessage: z.string().min(1),
        priority: z.number().optional(),
      })
    )
    .mutation(
      async ({
        input,
        ctx,
      }: {
        input: {
          name: string;
          triggerType: 'keyword' | 'outside_hours' | 'first_message' | 'faq';
          triggerValue?: string;
          replyMessage: string;
          priority?: number;
        };
        ctx: { user: { id: number } };
      }) => {
        const { addAutoReplyRule } = await import('../../../../services/whatsappAutoReply');
        return addAutoReplyRule({
          name: input.name,
          triggerType: input.triggerType,
          triggerValue: input.triggerValue,
          replyMessage: input.replyMessage,
          priority: input.priority,
          createdBy: ctx.user.id,
        });
      }
    ),

  deleteAutoReplyRule: permissionProcedure(
    'communications.automation.manage',
    'حذف قواعد الرد الآلي في WhatsApp'
  )
    .input(z.object({ ruleId: z.number() }))
    .mutation(async ({ input }: { input: { ruleId: number } }) => {
      const { deleteAutoReplyRule } = await import('../../../../services/whatsappAutoReply');
      return deleteAutoReplyRule(input.ruleId);
    }),

  getAutoReplyRules: permissionProcedure(
    'communications.automation.view',
    'عرض قواعد الرد الآلي في WhatsApp'
  ).query(async () => {
    const { getAutoReplyRules } = await import('../../../../services/whatsappAutoReply');
    return getAutoReplyRules();
  }),

  toggleAutoReplyRule: permissionProcedure(
    'communications.automation.manage',
    'تفعيل قواعد الرد الآلي في WhatsApp'
  )
    .input(
      z.object({
        ruleId: z.number(),
        enabled: z.boolean(),
      })
    )
    .mutation(async ({ input }: { input: { ruleId: number; enabled: boolean } }) => {
      const { toggleAutoReplyRule } = await import('../../../../services/whatsappAutoReply');
      return toggleAutoReplyRule(input.ruleId, input.enabled);
    }),
});
