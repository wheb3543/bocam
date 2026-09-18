import { describe, expect, it } from 'vitest';
import { readSourceFile as readSource } from '@core/testing/helpers/sourceReader';

describe('إلغاء تكرار أحداث Webhook داخل مركز العمليات', () => {
  it('يبقي سجل Webhook الخام في التشخيص فقط ولا يجلبه تبويبا الصحة والجودة', () => {
    const health = readSource('client/src/apps/admin/modules/03-omni-inbox/whatsapp/WhatsAppAccountHealthPage.tsx');
    const quality = readSource('client/src/apps/admin/modules/03-omni-inbox/whatsapp/WhatsAppPhoneQualityPage.tsx');
    const inspector = readSource(
      'client/src/apps/admin/modules/03-omni-inbox/whatsapp/WhatsAppWebhookInspectorPage.tsx'
    );

    expect(health).not.toContain('accountWebhookEvents');
    expect(health).not.toContain('securityWebhookEvents');
    expect(health).not.toContain('TabsTrigger value="webhook-events"');
    expect(quality).not.toContain('qualityWebhookEvents');
    expect(quality).not.toContain('TabsTrigger value="webhook-events"');
    expect(inspector).toContain('trpc.whatsapp.webhookEvents.getAll.useQuery');
    expect(inspector).toContain('trpc.whatsapp.webhookEvents.markAsProcessed.useMutation');
  });

  it('يوفر روابط مفلترة من الصحة والجودة ويفتح التشخيص على الفئة المطلوبة', () => {
    const health = readSource('client/src/apps/admin/modules/03-omni-inbox/whatsapp/WhatsAppAccountHealthPage.tsx');
    const quality = readSource('client/src/apps/admin/modules/03-omni-inbox/whatsapp/WhatsAppPhoneQualityPage.tsx');
    const operations = readSource('client/src/apps/admin/modules/03-omni-inbox/whatsapp/WhatsAppOperationsCenter.tsx');
    const inspector = readSource(
      'client/src/apps/admin/modules/03-omni-inbox/whatsapp/WhatsAppWebhookInspectorPage.tsx'
    );

    expect(health).toContain('tab=webhooks&category=account');
    expect(health).toContain('tab=webhooks&category=security');
    expect(quality).toContain('tab=webhooks&category=quality');
    expect(operations).toContain('useSearch');
    expect(operations).toContain('getTabFromSearch');
    expect(operations).toContain('tab=webhooks&category=');
    expect(inspector).toContain('categoryFromLocation');
    expect(inspector).toContain('initialCategory');
    expect(inspector).toContain('useSearch');
  });
});
