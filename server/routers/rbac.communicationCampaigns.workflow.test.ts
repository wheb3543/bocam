import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('صلاحيات الحملات وقنوات التواصل', () => {
  it('يفصل الحملات بين العرض والإنشاء والتعديل والحذف وربط العناصر والحقول الحساسة', () => {
    const source = readFileSync(resolve(process.cwd(), 'server/routers/campaigns.ts'), 'utf8');
    expect(source).toContain("permissionProcedure('campaigns.view', 'عرض الحملات')");
    expect(source).toContain("permissionProcedure('campaigns.create', 'إنشاء الحملات')");
    expect(source).toContain("permissionProcedure('campaigns.update', 'تعديل الحملات')");
    expect(source).toContain("permissionProcedure('campaigns.delete', 'حذف الحملات')");
    expect(source).toContain("permissionProcedure('campaigns.links.manage', 'ربط عناصر الحملة')");
    expect(source).toContain("'campaigns.budget.manage'");
    expect(source).toContain("'campaigns.metrics.manage'");
    expect(source).toContain("'integrations.credentials.manage'");
    expect(source).toContain('create: campaignsCreateProcedure');
    expect(source).toContain('linkOffers: campaignsLinksProcedure');
  });

  it('يفصل إدارة الأدوار وطابور WhatsApp والمجدول إلى صلاحيات تشغيلية مستقلة', () => {
    const roles = readFileSync(resolve(process.cwd(), 'server/routers/roleManagement.ts'), 'utf8');
    const queue = readFileSync(resolve(process.cwd(), 'server/routers/queue.ts'), 'utf8');
    const scheduler = readFileSync(
      resolve(process.cwd(), 'server/routers/whatsapp/settings/routes/schedulerRoutes.ts'),
      'utf8'
    );
    const permissions = readFileSync(resolve(process.cwd(), 'shared/rolePermissions.ts'), 'utf8');

    expect(roles).toContain("permissionProcedure('roles.view', 'عرض الأدوار والصلاحيات')");
    expect(roles).toContain("'users.assign_role'");
    expect(roles).toContain("input.id ? 'roles.update' : 'roles.create'");
    expect(queue).toContain("'operations.queue.manage'");
    expect(queue).toContain('getStats: queueManagementProcedure');
    expect(queue).toContain('getRecentJobs: queueManagementProcedure');
    expect(queue).toContain('maskPhoneNumber(job.data.to)');
    expect(queue).toContain('hasPatientContext: Boolean(job.data.metadata?.patientName)');
    expect(queue).toContain('hasError: Boolean(job.failedReason)');
    expect(scheduler).toContain("'operations.scheduler.manage'");
    expect(scheduler).toContain('getScheduledTasks: schedulerManagementProcedure');
    expect(scheduler).toContain('runReminderJobs: schedulerManagementProcedure');
    expect(permissions).toContain("'operations.scheduler.manage'");
    expect(permissions).toContain("'operations.scheduler.manage': 'إدارة المهام المجدولة التشغيلية'");
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
