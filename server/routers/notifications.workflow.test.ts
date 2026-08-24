import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const routerSource = readFileSync(resolve(process.cwd(), 'server/routers/notifications.ts'), 'utf8');
const schemaSource = readFileSync(resolve(process.cwd(), 'drizzle/schema.ts'), 'utf8');
const pageSource = readFileSync(resolve(process.cwd(), 'client/src/pages/admin/NotificationsPage.tsx'), 'utf8');
const helperSource = readFileSync(resolve(process.cwd(), 'server/_core/notificationHelper.ts'), 'utf8');

describe('نظام الإشعارات الموحد', () => {
  it('يقيّد إنشاء الإشعارات والتوزيع الإداري بصلاحية المدير', () => {
    expect(routerSource).toContain('create: adminProcedure');
    expect(routerSource).toContain('createForUser: adminProcedure');
    expect(routerSource).toContain('broadcastToAdmins: adminProcedure');
    expect(routerSource).toContain("value.startsWith('/')");
  });

  it('يدعم حالة القراءة والفلاتر والملخص التشغيلي لكل مستلم', () => {
    expect(routerSource).toContain('overview: protectedProcedure');
    expect(routerSource).toContain('markAsUnread: protectedProcedure');
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
    expect(pageSource).toContain('setLocation(notification.actionUrl)');
    expect(pageSource).toContain('مركز الإشعارات');
  });

  it('يرسل مساعد الموافقات والمحتوى إشعارات بمصدر محتوى موحد', () => {
    expect(helperSource).toContain("source: 'content'");
    expect(helperSource).toContain('entityType: options.entityType');
    expect(helperSource).toContain('entityId: options.entityId');
  });
});
