import { describe, expect, it } from 'vitest';
import { readSourceFile as read } from '@core/testing/helpers/sourceReader';

describe('P1-E WhatsApp governance UI authorization', () => {
  it('gates the compliance page queries, SSE, and management actions', () => {
    const source = read('client/src/apps/admin/modules/03-omni-inbox/whatsapp/WhatsAppCompliance.tsx');

    expect(source).toContain("can('communications.security.view')");
    expect(source).toContain("can('communications.security.manage')");
    expect(source).toContain('enabled: canViewSecurity');
    expect(source).toContain('enabled: canViewAudit');
    expect(source).toContain('disabled={!canManageSecurity || isLoading}');
    expect(source).toContain('الوصول إلى الأمان والامتثال مقيّد');
  });

  it('gates subscriptions reads and status updates', () => {
    const source = read('client/src/apps/admin/modules/03-omni-inbox/whatsapp/WhatsAppUserSubscriptionsPage.tsx');

    expect(source).toContain("can('communications.consents.view')");
    expect(source).toContain("can('communications.consents.manage')");
    expect(source).toContain('enabled: canViewConsents');
    expect(source).toContain('disabled={!canManageConsents || updateStatusMutation.isPending}');
    expect(source).toContain('الوصول إلى الاشتراكات مقيّد');
  });

  it('gates auto-reply and template testing controls', () => {
    const page = read('client/src/apps/admin/modules/03-omni-inbox/whatsapp/WhatsAppPage.tsx');
    const autoReplyPage = read('client/src/apps/admin/modules/03-omni-inbox/whatsapp/WhatsAppAutoReply.tsx');
    const analytics = read('client/src/apps/admin/modules/03-omni-inbox/whatsapp/WhatsAppAnalytics.tsx');
    const integration = read('client/src/apps/admin/modules/03-omni-inbox/whatsapp/WhatsAppIntegration.tsx');
    const dialog = read('client/src/apps/admin/modules/03-omni-inbox/whatsapp/components/dialogs/AutoReplyDialog.tsx');

    expect(page).toContain("can('communications.automation.view')");
    expect(page).toContain("can('communications.automation.manage')");
    expect(page).toContain('enabled: canViewAutoReply');
    expect(page).toContain('readOnly={!canManageAutoReply}');
    expect(autoReplyPage).toContain("can('communications.automation.view')");
    expect(autoReplyPage).toContain("can('communications.automation.manage')");
    expect(autoReplyPage).toContain('enabled: canViewAutoReply');
    expect(autoReplyPage).toContain('الوصول إلى الرد الآلي مقيّد');
    expect(analytics).toContain('canViewAutoReply');
    expect(analytics).toContain('canViewAnalytics && canViewCommunication && canViewAutoReply');
    expect(integration).toContain("can('communications.testing.view')");
    expect(integration).toContain("can('communications.testing.send')");
    expect(integration).toContain('enabled: canViewTesting');
    expect(integration).toContain('الوصول إلى أدوات الاختبار مقيّد');
    expect(dialog).toContain('readOnly?: boolean');
    expect(dialog).toContain('disabled={isPending || readOnly}');
  });

  it('adds permission-aware navigation entries for P1-E pages', () => {
    const sidebar = read('client/src/apps/admin/layout/config/sidebarNavigation.ts');
    const configurable = read('client/src/apps/admin/layout/config/sidebarNavigation.ts');

    for (const source of [sidebar, configurable]) {
      expect(source).toContain("'communications.automation.view'");
      expect(source).toContain("'communications.security.view'");
      expect(source).toContain("'communications.testing.view'");
    }
    expect(sidebar).toContain("'communications.consents.view'");
  });
});
