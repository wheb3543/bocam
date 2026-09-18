import { z } from 'zod';

// ============================================================================
// WhatsApp Schemas
// ============================================================================

export const whatsappMessageFormSchema = z.object({
  recipientPhone: z
    .string()
    .regex(/^[0-9+\-\s()]+$/, 'رقم الهاتف غير صحيح')
    .min(7, 'رقم الهاتف قصير جداً')
    .max(20, 'رقم الهاتف طويل جداً'),
  message: z.string().min(1, 'الرسالة مطلوبة').max(4096, 'الرسالة لا يجب أن تتجاوز 4096 حرف'),
  templateId: z.number().int('يجب اختيار قالب صحيح').optional(),
});

export type WhatsAppMessageFormData = z.infer<typeof whatsappMessageFormSchema>;

export const whatsappTemplateFormSchema = z.object({
  name: z.string().min(1, 'اسم القالب مطلوب'),
  language: z.string().default('ar'),
  category: z.enum(['MARKETING', 'UTILITY', 'AUTHENTICATION']),
});

export type WhatsAppTemplateFormData = z.infer<typeof whatsappTemplateFormSchema>;
