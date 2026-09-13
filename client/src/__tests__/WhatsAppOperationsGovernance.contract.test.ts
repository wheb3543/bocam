import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const readSource = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), 'utf8');

describe('مراكز التحليلات والعمليات والحوكمة في واتساب', () => {
  it('يسجل المراكز الجديدة مع إبقاء الروابط التفصيلية القديمة صالحة', () => {
    const adminRoutes = readSource('client/src/components/layout/AdminContentRoutes.tsx');

    expect(adminRoutes).toContain('path="/admin/whatsapp/analytics"');
    expect(adminRoutes).toContain('path="/admin/whatsapp/operations"');
    expect(adminRoutes).toContain('path="/admin/whatsapp/governance"');
    [
      '/admin/whatsapp/costs',
      '/admin/whatsapp/connection',
      '/admin/whatsapp/account-health',
      '/admin/whatsapp/phone-quality',
      '/admin/whatsapp/webhook-inspector',
      '/admin/whatsapp/compliance',
      '/admin/whatsapp/subscriptions',
    ].forEach((path) => expect(adminRoutes).toContain(`path="${path}"`));
  });

  it('يعيد استخدام الواجهات الأصلية في المراكز بدلاً من تكرار العقود', () => {
    const analyticsCenter = readSource(
      'client/src/pages/admin/whatsapp/WhatsAppAnalyticsCenter.tsx'
    );
    const operationsCenter = readSource(
      'client/src/pages/admin/whatsapp/WhatsAppOperationsCenter.tsx'
    );
    const governanceCenter = readSource(
      'client/src/pages/admin/whatsapp/WhatsAppGovernanceCenter.tsx'
    );

    expect(analyticsCenter).toContain('<WhatsAppAnalyticsContent />');
    expect(analyticsCenter).toContain('<WhatsAppCostsContent />');
    expect(operationsCenter).toContain('<WhatsAppConnectionContent />');
    expect(operationsCenter).toContain('<WhatsAppAccountHealthPage />');
    expect(operationsCenter).toContain('<WhatsAppPhoneQualityPage />');
    expect(operationsCenter).toContain('<WhatsAppWebhookInspectorPage />');
    expect(governanceCenter).toContain('<WhatsAppComplianceContent />');
    expect(governanceCenter).toContain('<WhatsAppUserSubscriptionsPage />');
  });

  it('لا يعرض مؤشرات تحليلية أو اتجاه تدقيق مصطنعة ويطبق فلتر التكلفة فعلياً', () => {
    const analytics = readSource('client/src/pages/admin/whatsapp/WhatsAppAnalytics.tsx');
    const costs = readSource('client/src/pages/admin/whatsapp/WhatsAppCostsPage.tsx');
    const compliance = readSource('client/src/pages/admin/whatsapp/WhatsAppCompliance.tsx');

    expect(analytics).not.toContain('messages: 45, response: 2.1');
    expect(analytics).not.toContain('ملصقات');
    expect(analytics).not.toContain('2.5</div>');
    expect(compliance).not.toContain('const auditTrendData = [');
    expect(costs).toContain('const filteredConversationCosts');
    expect(costs).toContain("pricingCategory === 'all'");
  });

  it('يقيد إجراءات الحوكمة والتشخيص الحساسة ويستعمل المستخدم الفعلي لحل التنبيه', () => {
    const securityRoutes = readSource(
      'server/routers/whatsapp/settings/routes/securityRoutes.ts'
    );
    const subscriptionRoutes = readSource(
      'server/routers/whatsapp/settings/routes/subscriptionRoutes.ts'
    );
    const webhookRoutes = readSource(
      'server/routers/whatsapp/settings/routes/webhookRoutes.ts'
    );
    const analyticsRoutes = readSource('server/routers/whatsapp/analytics.ts');
    const accountHealth = readSource(
      'client/src/pages/admin/whatsapp/WhatsAppAccountHealthPage.tsx'
    );
    const accountHealthRoutes = readSource(
      'server/routers/whatsapp/settings/routes/accountHealthRoutes.ts'
    );

    expect(analyticsRoutes).toContain('exportAuditLogs: auditExportProcedure');
    expect(securityRoutes).toContain("'communications.security.manage'");
    expect(securityRoutes).toContain('blockPhone:');
    expect(securityRoutes).toContain('unblockPhone:');
    expect(securityRoutes).toContain('handleOptOutRequest:');
    expect(subscriptionRoutes).toContain("'communications.consents.manage'");
    expect(subscriptionRoutes).toContain('updateStatus:');
    expect(webhookRoutes).toContain("'integrations.webhooks.manage'");
    expect(webhookRoutes).toContain('markAsProcessed:');
    expect(accountHealthRoutes).toContain('resolvedBy: ctx.user.id');
    expect(accountHealth).toContain('resolveAlertMutation.mutate({ id: alertId })');
  });

  it('ينظم واجهة الحوكمة للهاتف ويمنع تكرار قائمة الاشتراكات في سجل Webhook', () => {
    const governanceCenter = readSource(
      'client/src/pages/admin/whatsapp/WhatsAppGovernanceCenter.tsx'
    );
    const compliance = readSource('client/src/pages/admin/whatsapp/WhatsAppCompliance.tsx');
    const subscriptions = readSource(
      'client/src/pages/admin/whatsapp/WhatsAppUserSubscriptionsPage.tsx'
    );

    expect(governanceCenter).toContain('max-w-[1440px]');
    expect(governanceCenter).toContain('flex-1 gap-1.5 px-2 text-xs sm:gap-2 sm:text-sm');
    expect(compliance).toContain(
      'sgh-compact-stat-grid grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4'
    );
    expect(compliance).toContain('const hasAuditedMessages = totalMessages > 0');
    expect(compliance).toContain('لا توجد رسائل مدققة ضمن السجل الحالي');
    expect(compliance).not.toContain(': 100;\n  const nonCompliantPercentage');
    expect(subscriptions).toContain(
      'sgh-compact-stat-grid mb-5 grid grid-cols-2 sm:mb-6 sm:grid-cols-2 lg:grid-cols-4'
    );
    expect(subscriptions).toContain('min-w-[650px]');
    expect(subscriptions).toContain("activeTab !== 'webhook-events'");
    expect(subscriptions).toContain('TabsContent value="webhook-events"');
  });
});
