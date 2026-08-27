import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const routerSource = readFileSync(resolve(process.cwd(), 'server/routers/notifications.ts'), 'utf8');
const schemaSource = readFileSync(resolve(process.cwd(), 'drizzle/schema.ts'), 'utf8');
const pageSource = readFileSync(resolve(process.cwd(), 'client/src/pages/admin/NotificationsPage.tsx'), 'utf8');
const helperSource = readFileSync(resolve(process.cwd(), 'server/_core/notificationHelper.ts'), 'utf8');

describe('نظام الإشعارات الموحد', () => {
  it('يفصل إرسال الإشعارات عن صيانة مركز الإشعارات', () => {
    expect(routerSource).toContain('notificationsManagementProcedure');
    expect(routerSource).toContain("'notifications.manage'");
    expect(routerSource).toContain("'notifications.send'");
    expect(routerSource).toContain('create: notificationsSendProcedure');
    expect(routerSource).toContain('createForUser: notificationsSendProcedure');
    expect(routerSource).toContain('broadcastToAdmins: notificationsSendProcedure');
    expect(routerSource).toContain('delete: notificationsManagementProcedure');
    expect(routerSource).toContain('deleteRead: notificationsManagementProcedure');
    expect(routerSource).toContain("value.startsWith('/')");
  });

  it('يحرس العرض والقراءة والتفضيلات والإعدادات بصلاحيات مستقلة', () => {
    expect(routerSource).toContain("'notifications.view'");
    expect(routerSource).toContain("'notifications.mark_read'");
    expect(routerSource).toContain("'notifications.preferences.manage'");
    expect(routerSource).toContain("'notifications.settings.manage'");
    expect(routerSource).toContain('overview: notificationsViewProcedure');
    expect(routerSource).toContain('markAsUnread: notificationsReadProcedure');
    expect(routerSource).toContain('preferences: notificationsPreferencesProcedure');
    expect(routerSource).toContain('systemSettings: notificationsSettingsProcedure');
    expect(routerSource).toContain('eq(notifications.userId, ctx.user.id)');
    expect(routerSource).toContain('filters.source');
  });

  it('يوسع المخطط بالمصدر والسياق التشغيلي اللازمين للمركز الموحد', () => {
    expect(schemaSource).toContain("'booking_pending'");
    expect(schemaSource).toContain("source: mysqlEnum('source'");
    expect(schemaSource).toContain("entityType: varchar('entityType'");
    expect(schemaSource).toContain("entityId: varchar('entityId'");
  });

  it('يربط واجهة المركز بالفلاتر والقراءة والانتقال إلى الإجراء', () => {
    expect(pageSource).toContain('useNotificationsOverview');
    expect(pageSource).toContain('markAsUnread');
    expect(pageSource).toContain("const canViewNotifications = can('notifications.view')");
    expect(pageSource).toContain("const canMarkNotifications = can('notifications.mark_read')");
    expect(pageSource).toContain("const canManageNotifications = can('notifications.manage')");
    expect(pageSource).toContain('enabled: canViewNotifications');
    expect(pageSource).toContain('setLocation(notification.actionUrl)');
    expect(pageSource).toContain('مركز الإشعارات');
  });

  it('يرسل مساعد الموافقات والمحتوى إشعارات بمصدر محتوى موحد', () => {
    expect(helperSource).toContain("source: 'content'");
    expect(helperSource).toContain('entityType: options.entityType');
    expect(helperSource).toContain('entityId: options.entityId');
  });
});
