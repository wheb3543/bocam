/**
 * WhatsApp Connection Routes
 * مسارات اتصال واتساب
 */

import { router } from '../../../../_core/trpc';
import { meta } from '../../../../api/MetaApiService';
import { z } from 'zod';
import { verifyWhatsAppHealth } from '../../../../services/whatsappService';
import { logOperation } from '../utils';
import { permissionProcedure } from '../../../permissionProcedures';

const integrationsViewProcedure = permissionProcedure(
  'integrations.view',
  'عرض حالة تكامل WhatsApp'
);
const integrationsConnectProcedure = permissionProcedure(
  'integrations.connect',
  'ربط تكامل WhatsApp'
);
const webhooksManagementProcedure = permissionProcedure(
  'integrations.webhooks.manage',
  'إدارة اشتراكات Webhooks'
);

export const connectionRouter = router({
  status: integrationsViewProcedure.query(async () => {
    return verifyWhatsAppHealth();
  }),

  setupHealth: integrationsViewProcedure.query(async () => {
    return verifyWhatsAppHealth();
  }),

  registerPhoneNumber: integrationsConnectProcedure
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
          usesProvidedPhoneNumber: Boolean(input.phoneNumberId),
        });

        const result = await meta.registerWhatsAppPhoneNumber(phoneNumberId, input.pin);
        return result.success
          ? {
              success: true,
              message: 'تم تسجيل رقم الهاتف بنجاح في WhatsApp Cloud API',
            }
          : { success: false, error: result.error };
      }
    ),

  subscribeAppToWaba: webhooksManagementProcedure
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
          hasOverrideCallbackUri: !!input.overrideCallbackUri,
        });

        const result = await meta.subscribeAppToWaba(wabaId, {
          overrideCallbackUri: input.overrideCallbackUri,
          verifyToken,
        });

        return result.success
          ? { success: true, message: 'تم اشتراك التطبيق في WABA بنجاح' }
          : { success: false, error: result.error };
      }
    ),
});
