import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const source = (file: string) => readFileSync(resolve(process.cwd(), file), 'utf8');

describe('الإنفاذ التفصيلي لقنوات التواصل', () => {
  it('يحصر الردود ورسائل المتابعة وقوالب WhatsApp في الصلاحيات المناسبة', () => {
    const messages = source('server/routers/whatsapp/messages.ts');
    const templates = source('server/routers/whatsapp/templates.ts');
    const leads = source('server/routers/leads.ts');

    expect(messages).toContain('send: communicationReplyProcedure');
    expect(messages).toContain('sendBroadcast: communicationBroadcastProcedure');
    expect(messages).toContain('quickReplies: router');
    expect(messages).toContain('create: communicationTemplatesProcedure');
    expect(templates).toContain('sendTemplate: communicationReplyProcedure');
    expect(templates).toContain('sendMedia: communicationReplyProcedure');
    expect(templates).toContain('syncFromMeta: communicationTemplatesProcedure');
    expect(leads).toContain('sendWhatsApp: communicationsReplyProcedure');
  });

  it('يفصل العرض والإسناد والرد في الصندوق الموحد ومحادثات WhatsApp', () => {
    const conversations = source('server/routers/whatsapp/conversations.ts');
    const inbox = source('server/routers/socialInbox.ts');

    expect(conversations).toContain('list: communicationViewProcedure');
    expect(conversations).toContain('assignToUser: communicationAssignProcedure');
    expect(inbox).toContain('threads: socialInboxViewProcedure');
    expect(inbox).toContain('assign: socialInboxAssignProcedure');
    expect(inbox).toContain('replyToComment: socialInboxReplyProcedure');
    expect(inbox).toContain('createAccount: socialInboxManagementProcedure');
  });

  it('يحافظ على التوافق مع من كان يملك إدارة التواصل الكاملة فقط', () => {
    const permissions = source('server/services/rolePermissionService.ts');
    expect(permissions).toContain("'communications.reply': 'communications.manage'");
    expect(permissions).toContain("'communications.broadcast': 'communications.manage'");
    expect(permissions).toContain("'communications.templates.manage': 'communications.manage'");
  });
});
