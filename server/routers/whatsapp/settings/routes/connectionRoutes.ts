/**
 * WhatsApp Connection Routes
 * مسارات اتصال واتساب
 */

import { protectedProcedure, adminProcedure, router } from '../../../../_core/trpc';
import { meta } from '../../../../api/MetaApiService';
import { z } from 'zod';
import { verifyWhatsAppHealth } from '../../../../services/whatsappService';
import { logOperation } from '../utils';

export const connectionRouter = router({
  status: protectedProcedure.query(async () => {
    return verifyWhatsAppHealth();
  }),

  setupHealth: protectedProcedure.query(async () => {
    return verifyWhatsAppHealth();
  }),

  registerPhoneNumber: adminProcedure
    .input(
      z.object({
        pin: z.string().regex(/^\d{6}$/, 'PIN يجب أن يكون 6 أرقام'),
        phoneNumberId: z.string().optional(),
      })
    )
    .mutation(
      async ({
        input,
        ctx,
      }: {
        input: { pin: string; phoneNumberId?: string };
        ctx: { user: { id: number } };
      }) => {
        const phoneNumberId = input.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID;
        if (!phoneNumberId) {
          return { success: false, error: 'WHATSAPP_PHONE_NUMBER_ID غير مُعيَّن' };
        }

        logOperation('registerPhoneNumber', ctx.user.id, {
          phoneNumberId,
        });

        const result = await meta.registerWhatsAppPhoneNumber(phoneNumberId, input.pin);
        return result.success
          ? {
              success: true,
              message: 'تم تسجيل رقم الهاتف بنجاح في WhatsApp Cloud API',
              data: result.data,
            }
          : { success: false, error: result.error };
      }
    ),

  subscribeAppToWaba: adminProcedure
    .input(
      z.object({
        wabaId: z.string().optional(),
        overrideCallbackUri: z.string().url().optional(),
        verifyToken: z.string().optional(),
      })
    )
    .mutation(
      async ({
        input,
        ctx,
      }: {
        input: { wabaId?: string; overrideCallbackUri?: string; verifyToken?: string };
        ctx: { user: { id: number } };
      }) => {
        const wabaId = input.wabaId || process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
        if (!wabaId) {
          return { success: false, error: 'WHATSAPP_BUSINESS_ACCOUNT_ID غير مُعيَّن' };
        }

        const verifyToken =
          input.verifyToken ||
          process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN ||
          process.env.WEBHOOK_VERIFY_TOKEN;

        if (input.overrideCallbackUri && !verifyToken) {
          return {
            success: false,
            error: 'عند استخدام override_callback_uri يجب توفير verify_token',
          };
        }

        logOperation('subscribeAppToWaba', ctx.user.id, {
          wabaId,
          hasOverrideCallbackUri: !!input.overrideCallbackUri,
        });

        const result = await meta.subscribeAppToWaba(wabaId, {
          overrideCallbackUri: input.overrideCallbackUri,
          verifyToken,
        });

        return result.success
          ? { success: true, message: 'تم اشتراك التطبيق في WABA بنجاح', data: result.data }
          : { success: false, error: result.error };
      }
    ),
});
