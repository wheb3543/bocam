/**
 * Broadcast Execution Service V2
 * تنفيذ البث عبر Meta WhatsApp API
 */

import { getDb, normalizePhoneNumber as normalizeDatabasePhoneNumber } from '../../../database/db';
import {
  whatsappBroadcasts,
  broadcastRecipients,
  broadcastRecipientResults,
  whatsappTemplates,
  doctors,
} from '../../../../drizzle/schema';
import { eq } from 'drizzle-orm';
import axios from 'axios';

export function getInsertedBroadcastId(insertResult: unknown): number {
  const resultHeader = Array.isArray(insertResult) ? insertResult[0] : insertResult;
  const rawInsertId = (resultHeader as { insertId?: unknown } | undefined)?.insertId;
  const broadcastId = typeof rawInsertId === 'bigint' ? Number(rawInsertId) : Number(rawInsertId);

  if (!Number.isSafeInteger(broadcastId) || broadcastId <= 0) {
    throw new Error('Failed to create broadcast record');
  }

  return broadcastId;
}

export function normalizeWhatsAppRecipientPhone(phone: string): string {
  return normalizeDatabasePhoneNumber(phone);
}

function isPrivateOrLocalHostname(hostname: string): boolean {
  const normalized = hostname.toLowerCase();
  if (normalized === 'localhost' || normalized.endsWith('.local')) {
    return true;
  }
  if (/^(127\.|10\.|0\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(normalized)) {
    return true;
  }
  return normalized === '::1' || normalized.startsWith('fc') || normalized.startsWith('fd');
}

export async function validatePublicHeaderImageUrl(value: string): Promise<string> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(value);
  } catch {
    throw new Error('Header image URL must be a valid public HTTPS URL');
  }

  if (parsedUrl.protocol !== 'https:' || isPrivateOrLocalHostname(parsedUrl.hostname)) {
    throw new Error('Header image URL must use public HTTPS and cannot point to a local network');
  }

  try {
    const response = await axios.get(parsedUrl.toString(), {
      responseType: 'stream',
      timeout: 10_000,
      maxRedirects: 3,
      headers: { Range: 'bytes=0-1023' },
    });
    response.data?.destroy?.();
    const contentType = String(response.headers?.['content-type'] ?? '').toLowerCase();
    if (!/^(image\/(jpeg|png|webp))\b/.test(contentType)) {
      throw new Error('Header image URL does not point to a supported image');
    }
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Header image URL')) {
      throw error;
    }
    throw new Error('Unable to load the public header image URL', { cause: error });
  }

  return parsedUrl.toString();
}

type MetaTemplateComponentSource = {
  variables?: string[];
  headerText?: string | null;
  headerFormat?: string | null;
  headerMediaUrl?: string | null;
  footerText?: string | null;
  buttons?: Array<{ type?: string; url?: string; example?: string[] }>;
};

/**
 * قوالب WhatsApp ذات أزرار URL الديناميكية تخزن النطاق في القالب المعتمد،
 * وتستقبل Meta اللاحقة فقط. لذلك يحول رابط صفحة محتوى SGH الكامل إلى مساره.
 */
export function getMetaDynamicUrlSuffix(staticUrlPrefix: string, value: string): string {
  const normalizedValue = value.trim();
  if (!normalizedValue) {
    return normalizedValue;
  }

  if (normalizedValue.startsWith(staticUrlPrefix)) {
    return normalizedValue.slice(staticUrlPrefix.length);
  }

  try {
    const templateBaseUrl = new URL(staticUrlPrefix);
    const selectedContentUrl = new URL(normalizedValue);
    const hospitalHosts = new Set([
      templateBaseUrl.hostname.toLowerCase(),
      'sghsanaa.net',
      'www.sghsanaa.net',
    ]);

    if (hospitalHosts.has(selectedContentUrl.hostname.toLowerCase())) {
      return `${selectedContentUrl.pathname}${selectedContentUrl.search}${selectedContentUrl.hash}`.replace(
        /^\/+/,
        ''
      );
    }
  } catch {
    // القيمة ليست رابطاً كاملاً؛ وهي لاحقة مسار صالحة لقالب Meta.
  }

  return normalizedValue.replace(/^\/+/, '');
}

function getPlaceholderNames(text?: string | null): string[] {
  if (!text) {
    return [];
  }
  return Array.from(text.matchAll(/\{\{\s*([^}]+?)\s*\}\}/g), (match) => match[1]);
}

export function buildMetaTemplateComponents(
  template: MetaTemplateComponentSource,
  variables: Record<string, string>
) {
  const components: Array<Record<string, unknown>> = [];
  const textParameter = (name: string) => {
    const value = variables[name];
    if (!value?.trim()) {
      throw new Error(`Missing text parameter: ${name}`);
    }

    return {
      type: 'text',
      parameter_name: name,
      text: value,
    };
  };

  // ترسل Meta رأس الصورة كوسيط image مستقل. أما الرأس النصي الثابت فلا يُرسل في الطلب.
  if (template.headerFormat?.toUpperCase() === 'IMAGE') {
    if (!template.headerMediaUrl) {
      throw new Error('Missing approved image header media for template');
    }
    components.push({
      type: 'header',
      parameters: [{ type: 'image', image: { link: template.headerMediaUrl } }],
    });
  } else {
    const headerVariables = getPlaceholderNames(template.headerText);
    if (headerVariables.length > 0) {
      components.push({
        type: 'header',
        parameters: headerVariables.map(textParameter),
      });
    }
  }

  const bodyVariables = template.variables ?? [];
  if (bodyVariables.length > 0) {
    components.push({
      type: 'body',
      parameters: bodyVariables.map(textParameter),
    });
  }

  // لا يوجد مكوّن footer قابل للتخصيص في طلب الإرسال؛ التذييل المعتمد يُعرض تلقائياً من القالب.
  (template.buttons ?? []).forEach((button, index) => {
    if (button.type !== 'URL' || typeof button.url !== 'string') {
      return;
    }
    const dynamicPlaceholder = button.url.match(/\{\{\d+\}\}/)?.[0];
    if (!dynamicPlaceholder) {
      return;
    }

    const value =
      variables[`button_${index}`] || variables[dynamicPlaceholder] || button.example?.[0];
    if (!value) {
      throw new Error(`Missing URL parameter for button ${index}`);
    }

    const staticUrlPrefix = button.url.replace(dynamicPlaceholder, '');
    const urlSuffix = getMetaDynamicUrlSuffix(staticUrlPrefix, String(value));

    components.push({
      type: 'button',
      sub_type: 'url',
      index: String(index),
      parameters: [{ type: 'text', text: encodeURI(urlSuffix) }],
    });
  });

  return components;
}

type MetaMessageTemplateSource = MetaTemplateComponentSource & {
  metaName?: string | null;
  languageCode?: string | null;
};

export function buildMetaTemplateMessagePayload(
  phoneNumber: string,
  template: MetaMessageTemplateSource,
  variables: Record<string, string>,
  headerImageUrl?: string
) {
  return {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: phoneNumber,
    type: 'template',
    template: {
      name: template.metaName,
      language: { code: template.languageCode || 'ar' },
      components: buildMetaTemplateComponents(
        { ...template, headerMediaUrl: headerImageUrl || template.headerMediaUrl },
        variables
      ),
    },
  };
}

interface BroadcastExecutionParams {
  templateId: number;
  variables: Record<string, string>;
  headerDoctorId?: number;
  headerImageUrl?: string;
  existingBroadcastId?: number;
  recipients: Array<{
    phone: string;
    fullName: string;
    source: string;
  }>;
}

export class BroadcastExecutionServiceV2 {
  private metaAccessToken: string;
  private whatsappBusinessAccountId: string;
  private whatsappPhoneNumberId: string;
  private metaApiUrl = 'https://graph.facebook.com/v18.0';

  constructor() {
    this.metaAccessToken = process.env.META_ACCESS_TOKEN || '';
    this.whatsappBusinessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '';
    this.whatsappPhoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || '';

    if (!this.metaAccessToken || !this.whatsappBusinessAccountId || !this.whatsappPhoneNumberId) {
      console.warn('[BroadcastExecutionService] Meta credentials not fully configured');
    }
  }

  /**
   * تنفيذ البث الكامل
   */
  async executeBroadcast(params: BroadcastExecutionParams) {
    try {
      const db = await getDb();
      if (!db) {
        throw new Error('Database connection failed');
      }

      const headerImageUrl = params.headerImageUrl
        ? await validatePublicHeaderImageUrl(params.headerImageUrl)
        : params.headerDoctorId
          ? await this.getDoctorImageUrl(params.headerDoctorId)
          : undefined;

      // 1. إنشاء سجل البث أو متابعة سجل مجدول محفوظ مسبقاً.
      let broadcastId = params.existingBroadcastId;
      if (!broadcastId) {
        const broadcastRecord = await db.insert(whatsappBroadcasts).values({
          name: `Broadcast - ${new Date().toISOString()}`,
          templateId: params.templateId,
          message: JSON.stringify(params.variables),
          recipientCount: params.recipients.length,
          sentCount: 0,
          deliveredCount: 0,
          readCount: 0,
          failedCount: 0,
          status: 'sending',
          headerImageUrl,
          createdBy: 1, // النظام
        });
        broadcastId = getInsertedBroadcastId(broadcastRecord);
      } else {
        await db
          .update(whatsappBroadcasts)
          .set({ status: 'sending', headerImageUrl })
          .where(eq(whatsappBroadcasts.id, broadcastId));
      }

      // 2. إدخال المستقبلين في جدول broadcast_recipients
      const recipientRecords = [];
      for (const r of params.recipients) {
        const normalizedPhone = this.normalizePhoneNumber(r.phone);
        const recipientInsert = await db.insert(broadcastRecipients).values({
          broadcastId,
          phoneNumber: normalizedPhone,
          fullName: r.fullName,
          recipientType: 'lead',
          recipientId: 0,
          sourceType: 'lead',
          status: 'pending',
          templateVariables: JSON.stringify({
            name: r.fullName,
            ...params.variables,
          }),
        });
        recipientRecords.push({
          id: getInsertedBroadcastId(recipientInsert),
          phone: normalizedPhone,
          fullName: r.fullName,
        });
      }

      // 3. إرسال الرسائل
      let sentCount = 0;
      let failedCount = 0;

      for (const recipient of recipientRecords) {
        try {
          const result = await this.sendWhatsAppMessage(
            recipient.phone,
            params.templateId,
            {
              name: recipient.fullName,
              ...params.variables,
            },
            headerImageUrl
          );

          if (result.success) {
            sentCount++;
            const sentAt = new Date();
            await db
              .update(broadcastRecipients)
              .set({ status: 'sent', sentAt, errorInfo: null })
              .where(eq(broadcastRecipients.id, recipient.id));
            await db.insert(broadcastRecipientResults).values({
              broadcastId,
              recipientId: recipient.id,
              whatsappMessageId: result.messageId ?? null,
              status: 'sent',
              sentAt,
            });
          } else {
            failedCount++;
            const errorMessage = result.error || 'Meta did not accept the message';
            await db
              .update(broadcastRecipients)
              .set({ status: 'failed', errorInfo: errorMessage })
              .where(eq(broadcastRecipients.id, recipient.id));
            await db.insert(broadcastRecipientResults).values({
              broadcastId,
              recipientId: recipient.id,
              status: 'failed',
              errorMessage,
            });
          }
        } catch (error: any) {
          failedCount++;
          const errorMessage = error?.message || 'Unexpected Meta send error';
          await db
            .update(broadcastRecipients)
            .set({ status: 'failed', errorInfo: errorMessage })
            .where(eq(broadcastRecipients.id, recipient.id));
          await db.insert(broadcastRecipientResults).values({
            broadcastId,
            recipientId: recipient.id,
            status: 'failed',
            errorMessage,
          });
          console.error(`[BroadcastExecutionService] Error sending to ${recipient.phone}:`, error);
        }
      }

      // 4. تحديث سجل البث
      await db
        .update(whatsappBroadcasts)
        .set({
          sentCount,
          failedCount,
          status: sentCount > 0 ? 'completed' : 'failed',
          completedAt: new Date(),
        })
        .where(eq(whatsappBroadcasts.id, broadcastId));

      return {
        success: sentCount > 0,
        broadcastId,
        totalRecipients: params.recipients.length,
        sentCount,
        failedCount,
      };
    } catch (error) {
      console.error('[BroadcastExecutionService] Broadcast execution failed:', error);
      throw error;
    }
  }

  /**
   * إرسال رسالة WhatsApp عبر Meta API
   */
  private async sendWhatsAppMessage(
    phoneNumber: string,
    templateId: number,
    variables: Record<string, string>,
    headerImageUrl?: string
  ) {
    try {
      // الحصول على بيانات القالب من قاعدة البيانات
      const template = await this.getTemplateData(templateId);
      if (!template) {
        return { success: false, error: 'Template not found' };
      }

      const metaHeader = await this.getMetaTemplateHeader(template.metaTemplateId);

      // بناء طلب Meta API
      const payload = buildMetaTemplateMessagePayload(
        phoneNumber,
        { ...template, ...metaHeader },
        variables,
        headerImageUrl
      );

      // إرسال الطلب إلى Meta
      const response = await axios.post(
        `${this.metaApiUrl}/${this.whatsappPhoneNumberId}/messages`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.metaAccessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data?.messages?.[0]?.id) {
        return {
          success: true,
          messageId: response.data.messages[0].id,
        };
      } else {
        return {
          success: false,
          error: response.data?.error?.message || 'Unknown error',
        };
      }
    } catch (error: any) {
      console.error(
        '[BroadcastExecutionService] Meta API error:',
        error.response?.data || error.message
      );
      return {
        success: false,
        error: error.response?.data?.error?.message || error.message,
      };
    }
  }

  /**
   * يجلب نوع رأس القالب والوسيط النموذجي المعتمد مباشرةً من Meta لمنع اختلاف السجل المحلي عن القالب الفعلي.
   */
  private async getMetaTemplateHeader(metaTemplateId: string | null) {
    if (!metaTemplateId) {
      return {};
    }

    const response = await axios.get(`${this.metaApiUrl}/${metaTemplateId}`, {
      params: { fields: 'components' },
      headers: { Authorization: `Bearer ${this.metaAccessToken}` },
    });

    const header = response.data?.components?.find(
      (component: { type?: string }) => component.type?.toUpperCase() === 'HEADER'
    );
    const headerFormat = header?.format?.toUpperCase();
    const headerMediaUrl =
      headerFormat === 'IMAGE' ? header?.example?.header_handle?.[0] : undefined;

    return { headerFormat, headerMediaUrl };
  }

  async getTemplateHeaderRequirement(templateId: number) {
    const template = await this.getTemplateData(templateId);
    if (!template) {
      throw new Error('Approved Meta template not found');
    }

    const metaHeader = await this.getMetaTemplateHeader(template.metaTemplateId);
    return {
      headerFormat: metaHeader.headerFormat ?? null,
      requiresImageHeader: metaHeader.headerFormat === 'IMAGE',
    };
  }

  private async getDoctorImageUrl(doctorId: number): Promise<string | undefined> {
    const db = await getDb();
    if (!db) {
      throw new Error('Database connection failed while loading doctor image');
    }

    const [doctor] = await db
      .select({ image: doctors.image })
      .from(doctors)
      .where(eq(doctors.id, doctorId))
      .limit(1);

    if (!doctor?.image) {
      throw new Error('The selected doctor does not have a usable image for the template header');
    }

    return doctor.image;
  }

  /**
   * الحصول على بيانات القالب من قاعدة البيانات
   */
  private async getTemplateData(templateId: number) {
    try {
      const db = await getDb();
      if (!db) {
        return null;
      }
      const rows = await db
        .select()
        .from(whatsappTemplates)
        .where(eq(whatsappTemplates.id, templateId))
        .limit(1);
      const template = rows[0];
      if (!template || template.metaStatus !== 'APPROVED' || !template.metaName) {
        return null;
      }

      const parseJson = <T>(value: string | null, fallback: T): T => {
        if (!value) {
          return fallback;
        }
        try {
          return JSON.parse(value) as T;
        } catch {
          return fallback;
        }
      };

      return {
        ...template,
        languageCode: template.languageCode || 'ar',
        variables: parseJson<string[]>(template.variables, []),
        buttons: parseJson<any[]>(template.buttons, []),
      };
    } catch (error) {
      console.error('[BroadcastExecutionService] Error fetching template:', error);
      return null;
    }
  }

  /**
   * تطبيع رقم الهاتف
   */
  private normalizePhoneNumber(phone: string): string {
    return normalizeWhatsAppRecipientPhone(phone);
  }
}

export const broadcastExecutionService = new BroadcastExecutionServiceV2();
