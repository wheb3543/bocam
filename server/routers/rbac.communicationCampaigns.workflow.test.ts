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

  it('يفصل عمليات WhatsApp وصندوق التواصل إلى عرض ورد وإسناد وبث وقوالب', () => {
    const conversations = readFileSync(resolve(process.cwd(), 'server/routers/whatsapp/conversations.ts'), 'utf8');
    const messages = readFileSync(resolve(process.cwd(), 'server/routers/whatsapp/messages.ts'), 'utf8');
    const socialInbox = readFileSync(resolve(process.cwd(), 'server/routers/socialInbox.ts'), 'utf8');
    const templates = readFileSync(resolve(process.cwd(), 'server/routers/whatsapp/templates.ts'), 'utf8');

    [conversations, messages, socialInbox, templates].forEach((source) => {
      expect(source).toContain("'communications.view'");
    });
    expect(conversations).toContain('assignToUser: communicationAssignProcedure');
    expect(messages).toContain('sendBroadcast: communicationBroadcastProcedure');
    expect(messages).toContain('create: communicationTemplatesProcedure');
    expect(templates).toContain('create: communicationTemplatesProcedure');
    expect(socialInbox).toContain('assign: socialInboxAssignProcedure');
    expect(socialInbox).toContain('replyToComment: socialInboxReplyProcedure');
  });
});
