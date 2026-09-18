import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { trpc } from '@/lib/api/trpc';
import { whatsappMessageFormSchema, type WhatsAppMessageFormData } from '@/lib/validationSchemas';
import { FormWrapper, useFormErrorHandler } from '@apps/admin/shared/feedback/FormErrorHandler';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface WhatsAppMessageFormWithErrorHandlerProps {
  conversationId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const WhatsAppMessageFormWithErrorHandler: React.FC<
  WhatsAppMessageFormWithErrorHandlerProps
> = ({ conversationId, onSuccess, onCancel }) => {
  const utils = trpc.useUtils();
  const form = useForm<WhatsAppMessageFormData>({
    resolver: zodResolver(whatsappMessageFormSchema) as any,
    mode: 'onChange',
    defaultValues: { recipientPhone: '', message: '' },
  });
  const sendMessageMutation = trpc.whatsapp.messages.send.useMutation({
    onSuccess: () => {
      toast.success('تم إرسال الرسالة بنجاح');
      form.reset();
      utils.whatsapp.messages.listByConversation.invalidate({ conversationId });
      onSuccess?.();
    },
  });
  useFormErrorHandler(sendMessageMutation.error as any, { focusFirstError: true });
  const fieldError = (name: keyof WhatsAppMessageFormData) => {
    const error = form.formState.errors[name];
    return typeof error?.message === 'string' ? error.message : undefined;
  };
  const onSubmit = form.handleSubmit(async (data) => {
    await sendMessageMutation.mutateAsync({
      conversationId,
      message: data.message,
      messageType: data.templateId ? 'template' : 'text',
    });
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>إرسال رسالة WhatsApp</CardTitle>
        <CardDescription>أدخل الرسالة لإرسالها ضمن المحادثة المحددة.</CardDescription>
      </CardHeader>
      <CardContent>
        <FormWrapper
          onSubmit={onSubmit}
          error={sendMessageMutation.error as any}
          isLoading={form.formState.isSubmitting || sendMessageMutation.isPending}
          focusFirstError
        >
          <div className="space-y-2">
            <Label htmlFor="recipientPhone">رقم الهاتف</Label>
            <Input
              id="recipientPhone"
              placeholder="+967123456789"
              {...form.register('recipientPhone')}
            />
            {fieldError('recipientPhone') && (
              <p className="text-sm text-red-500">{fieldError('recipientPhone')}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">محتوى الرسالة *</Label>
            <Textarea id="message" rows={5} {...form.register('message')} />
            {fieldError('message') && (
              <p className="text-sm text-red-500">{fieldError('message')}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="templateId">معرّف القالب (اختياري)</Label>
            <Input
              id="templateId"
              type="number"
              {...form.register('templateId', { valueAsNumber: true })}
            />
            {fieldError('templateId') && (
              <p className="text-sm text-red-500">{fieldError('templateId')}</p>
            )}
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={form.formState.isSubmitting || sendMessageMutation.isPending}
              className="flex-1"
            >
              {sendMessageMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                'إرسال الرسالة'
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              إلغاء
            </Button>
          </div>
        </FormWrapper>
      </CardContent>
    </Card>
  );
};

export default WhatsAppMessageFormWithErrorHandler;
