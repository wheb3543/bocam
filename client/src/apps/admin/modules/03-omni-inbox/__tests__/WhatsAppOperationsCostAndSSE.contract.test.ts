import { describe, expect, it } from 'vitest';
import { createOperationalCostSummary } from '@/lib/whatsappOperationalCostSummary';
import { readSourceFile as readSource } from '@core/testing/helpers/sourceReader';

describe('ملخص تكلفة التشغيل ومراقبة SSE', () => {
  it('يحسب الملخص الموحد من صفوف التكلفة الفعلية دون قيم افتراضية مخترعة', () => {
    const summary = createOperationalCostSummary([
      { id: 1, conversationCost: 0.4, billable: true },
      { id: 2, conversationCost: 1.6, billable: true },
      { id: 3, conversationCost: 0, billable: false },
    ]);

    expect(summary.totalCost).toBe(2);
    expect(summary.averageCost).toBeCloseTo(2 / 3);
    expect(summary.conversationCount).toBe(3);
    expect(summary.billableCount).toBe(2);
    expect(summary.highCostCount).toBe(1);
    expect(summary.highCostTotal).toBe(1.6);
  });

  it('يستهلك التبويبان الملخص المشترك ويعرض المركز حالة الاتصال والعداد', () => {
    const health = readSource('client/src/apps/admin/modules/03-omni-inbox/whatsapp/WhatsAppAccountHealthPage.tsx');
    const quality = readSource('client/src/apps/admin/modules/03-omni-inbox/whatsapp/WhatsAppPhoneQualityPage.tsx');
    const center = readSource('client/src/apps/admin/modules/03-omni-inbox/whatsapp/WhatsAppOperationsCenter.tsx');
    const monitor = readSource('client/src/apps/admin/modules/03-omni-inbox/components/whatsapp/WhatsAppSSEMonitor.tsx');
    const provider = readSource('client/src/apps/admin/modules/03-omni-inbox/hooks/useWhatsAppOperationsSSE.tsx');

    expect(health).toContain('useWhatsAppOperationalCostSummary');
    expect(quality).toContain('useWhatsAppOperationalCostSummary');
    expect(health).toContain('WhatsAppOperationalCostSummary');
    expect(quality).toContain('WhatsAppOperationalCostSummary');
    expect(center).toContain('WhatsAppSSEMonitor');
    expect(monitor).toContain('SSE:');
    expect(monitor).toContain('حدث مستلم');
    expect(provider).toContain('costsQuery');
    expect(provider).toContain('lastEventAt');
    expect(readSource('client/src/apps/admin/modules/03-omni-inbox/components/whatsapp/WhatsAppOperationalCostSummary.tsx')).toContain(
      'آخر {summary.conversationCount} محادثة في النطاق'
    );
  });
});
