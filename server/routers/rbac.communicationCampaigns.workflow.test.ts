import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('صلاحيات الحملات وقنوات التواصل', () => {
  it('يحمي الحملات بصلاحية campaigns.manage', () => {
    const source = readFileSync(resolve(process.cwd(), 'server/routers/campaigns.ts'), 'utf8');
    expect(source).toContain("permissionProcedure('campaigns.manage'");
    expect(source).toContain('create: campaignsManagementProcedure');
    expect(source).toContain('linkOffers: campaignsManagementProcedure');
  });

  it('يحمي عمليات WhatsApp وصندوق التواصل بصلاحية communications.manage', () => {
    const conversations = readFileSync(resolve(process.cwd(), 'server/routers/whatsapp/conversations.ts'), 'utf8');
    const messages = readFileSync(resolve(process.cwd(), 'server/routers/whatsapp/messages.ts'), 'utf8');
    const socialInbox = readFileSync(resolve(process.cwd(), 'server/routers/socialInbox.ts'), 'utf8');
    [conversations, messages, socialInbox].forEach((source) => {
      expect(source).toContain("'communications.manage'");
    });
    expect(conversations).toContain('assignToUser: communicationManagementProcedure');
    expect(messages).toContain('sendBroadcast: communicationManagementProcedure');
    expect(socialInbox).toContain('const socialInboxProcedure = permissionProcedure');
  });
});
