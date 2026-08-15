import { z } from 'zod';
import { router, publicProcedure, mergeRouters } from '../_core/trpc';
import { verifyWhatsAppHealth } from '../services/whatsappService';
import { normalizePhoneNumber } from '../database/db';
import { sendWhatsAppTextMessage } from '../services/whatsappCloudAPI';
import { whatsappAppRouter } from './whatsapp/appRouter';

const baseWhatsAppRouter = router({
  health: publicProcedure.query(async () => {
    return verifyWhatsAppHealth();
  }),

  testConnection: publicProcedure
    .input(z.object({ phone: z.string().min(9).max(15) }))
    .mutation(async ({ input }) => {
      try {
        const normalizedPhone = normalizePhoneNumber(input.phone);
        const testMessage = `اختبار الاتصال بـ WhatsApp ✅\nالوقت: ${new Date().toLocaleString('ar-YE')}`;

        const result = await sendWhatsAppTextMessage(normalizedPhone, testMessage);

        return {
          success: result.success,
          message: result.success ? 'تم إرسال رسالة الاختبار بنجاح' : undefined,
          error: result.error,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }),

  normalizePhone: publicProcedure.input(z.object({ phone: z.string() })).query(({ input }) => {
    const normalized = normalizePhoneNumber(input.phone);
    return {
      original: input.phone,
      normalized,
      isValid: normalized.length >= 9 && normalized.length <= 15,
    };
  }),
});

export const whatsappRouter = mergeRouters(baseWhatsAppRouter, whatsappAppRouter);
