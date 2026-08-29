import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(path, 'utf8');

describe('P1-E WhatsApp governance authorization', () => {
  it('protects WhatsApp security actions with separate view/manage permissions', () => {
    const source = read('server/routers/whatsapp/settings/routes/securityRoutes.ts');

    expect(source).toContain("'communications.security.manage'");
    expect(source).toContain("'communications.security.view'");
    expect(source).not.toContain('protectedProcedure');
    expect(source).toContain('blockPhone: permissionProcedure');
    expect(source).toContain('getBlockedPhones: permissionProcedure');
    expect(source).toContain('handleOptOutRequest: permissionProcedure');
  });

  it('protects opt-in and opt-out reads separately from status changes', () => {
    const source = read('server/routers/whatsapp/settings/routes/subscriptionRoutes.ts');

    expect(source).toContain("'communications.consents.view'");
    expect(source).toContain("'communications.consents.manage'");
    expect(source).toContain('getAll: permissionProcedure');
    expect(source).toContain('updateStatus: permissionProcedure');
    expect(source).toContain('getStats: permissionProcedure');
    expect(source).not.toContain('protectedProcedure');
  });

  it('protects auto-reply reads separately from mutations', () => {
    const source = read('server/routers/whatsapp/settings/routes/autoReplyRoutes.ts');

    expect(source).toContain("'communications.automation.view'");
    expect(source).toContain("'communications.automation.manage'");
    expect(source).toContain('getAutoReplyRules: permissionProcedure');
    expect(source).toContain('addAutoReplyRule: permissionProcedure');
    expect(source).toContain('toggleAutoReplyRule: permissionProcedure');
    expect(source).toContain('deleteAutoReplyRule: permissionProcedure');
  });

  it('protects template test reads and sends independently', () => {
    const source = read('server/routers/whatsappTemplateTest.ts');

    expect(source).toContain("'communications.testing.view'");
    expect(source).toContain("'communications.testing.send'");
    expect(source).toContain('listApprovedTemplates: permissionProcedure');
    expect(source).toContain('getTemplateDetails: permissionProcedure');
    expect(source).toContain('sendTemplate: permissionProcedure');
    expect(source).toContain('sendWelcomeGreeting: permissionProcedure');
    expect(source).not.toContain('protectedProcedure');
  });
});
