import { router } from '../_core/trpc';
import { z } from 'zod';
import {
  fetchTemplatesFromMeta,
  pushTemplateToMeta,
  checkTemplateStatus,
  deleteTemplateFromMeta,
  syncTemplatesCompletely,
} from '../services/metaTemplateSync';
import { ENV } from '../_core/env';
import { permissionProcedure } from './permissionProcedures';

const templatesManagementProcedure = permissionProcedure(
  'communications.templates.manage',
  'إدارة قوالب التواصل'
);
const templateSyncProcedure = permissionProcedure('integrations.sync.manage', 'مزامنة قوالب Meta');

export const metaSyncRouter = router({
  /**
   * جلب جميع القوالب من Meta
   */
  fetchTemplates: templateSyncProcedure.mutation(async () => {
    const phoneNumberId = ENV.whatsappPhoneNumberId;
    const wabaId = ENV.whatsappBusinessAccountId;
    const accessToken = ENV.metaAccessToken;

    const configured = Boolean(phoneNumberId || wabaId) && Boolean(accessToken);

    if (!accessToken) {
      return {
        success: false,
        message: 'بيانات اعتماد Meta غير مكتملة.',
        configured,
      };
    }

    if (!phoneNumberId && !wabaId) {
      return {
        success: false,
        message: 'إعدادات حساب WhatsApp غير مكتملة.',
        configured,
      };
    }

    const result = await fetchTemplatesFromMeta(phoneNumberId || wabaId, accessToken);
    return { ...result, configured };
  }),

  /**
   * دفع قالب جديد إلى Meta
   */
  pushTemplate: templatesManagementProcedure
    .input(
      z.object({
        templateName: z.string().min(1),
        content: z.string().min(1),
        category: z.enum(['MARKETING', 'UTILITY', 'AUTHENTICATION']).default('MARKETING'),
        language: z.string().default('ar'),
      })
    )
    .mutation(async ({ input }) => {
      const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
      const accessToken = ENV.metaAccessToken;

      if (!phoneNumberId || !accessToken) {
        return {
          success: false,
          message: 'بيانات اعتماد Meta غير مكتملة',
        };
      }

      return pushTemplateToMeta(
        phoneNumberId,
        accessToken,
        input.templateName,
        input.content,
        input.category,
        input.language
      );
    }),

  /**
   * التحقق من حالة قالب معين
   */
  checkStatus: templateSyncProcedure
    .input(
      z.object({
        templateId: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
      const accessToken = ENV.metaAccessToken;

      if (!phoneNumberId || !accessToken) {
        return {
          success: false,
          message: 'بيانات اعتماد Meta غير مكتملة',
        };
      }

      return checkTemplateStatus(phoneNumberId, accessToken, input.templateId);
    }),

  /**
   * حذف قالب من Meta
   */
  deleteTemplate: templatesManagementProcedure
    .input(
      z.object({
        templateName: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
      const accessToken = ENV.metaAccessToken;

      if (!phoneNumberId || !accessToken) {
        return {
          success: false,
          message: 'بيانات اعتماد Meta غير مكتملة',
        };
      }

      return deleteTemplateFromMeta(phoneNumberId, accessToken, input.templateName);
    }),

  /**
   * مزامنة شاملة للقوالب
   */
  syncAll: templateSyncProcedure.mutation(async () => {
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
    const accessToken = ENV.metaAccessToken;

    if (!phoneNumberId || !accessToken) {
      return {
        success: false,
        message: 'بيانات اعتماد Meta غير مكتملة',
      };
    }

    return syncTemplatesCompletely(phoneNumberId, accessToken);
  }),
});
