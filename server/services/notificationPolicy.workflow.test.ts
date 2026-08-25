import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_NOTIFICATION_SYSTEM_SETTINGS,
  normalizeNotificationPreferences,
  normalizeNotificationSystemSettings,
} from './notificationPolicy';

const routerSource = readFileSync(resolve(process.cwd(), 'server/routers/notifications.ts'), 'utf8');
const appointmentSource = readFileSync(resolve(process.cwd(), 'server/routers/appointments/routes/submitRoute.ts'), 'utf8');
const campSource = readFileSync(resolve(process.cwd(), 'server/routers/campRegistrations/registration.ts'), 'utf8');
const offerSource = readFileSync(resolve(process.cwd(), 'server/routers/offerLeads/registration.ts'), 'utf8');
const helperSource = readFileSync(resolve(process.cwd(), 'server/_core/notificationHelper.ts'), 'utf8');
const profileSource = readFileSync(resolve(process.cwd(), 'client/src/pages/admin/ProfilePage.tsx'), 'utf8');
const settingsPageSource = readFileSync(
  resolve(process.cwd(), 'client/src/pages/admin/SettingsPage.tsx'),
  'utf8'
);
const digestServiceSource = readFileSync(
  resolve(process.cwd(), 'server/services/notificationDigestService.ts'),
  'utf8'
);
const scheduledDigestSource = readFileSync(
  resolve(process.cwd(), 'server/api/notificationDigestScheduledRoute.ts'),
  'utf8'
);
const notificationsPageSource = readFileSync(
  resolve(process.cwd(), 'client/src/pages/admin/NotificationsPage.tsx'),
  'utf8'
);
const notificationCenterSource = readFileSync(
  resolve(process.cwd(), 'client/src/components/NotificationCenter.tsx'),
  'utf8'
);
const appointmentStatusSource = readFileSync(
  resolve(process.cwd(), 'server/routers/appointments/routes/updateRoutes.ts'),
  'utf8'
);
const campStatusSource = readFileSync(
  resolve(process.cwd(), 'server/routers/campRegistrations/status.ts'),
  'utf8'
);
const offerStatusSource = readFileSync(
  resolve(process.cwd(), 'server/routers/offerLeads/status.ts'),
  'utf8'
);

describe('سياسة تفضيلات الإشعارات وربط التسجيلات', () => {
  it('تحافظ على الافتراضات الآمنة عند غياب تفضيلات المستخدم', () => {
    const preferences = normalizeNotificationPreferences(undefined);
    expect(preferences.enabled).toBe(true);
    expect(preferences.enabledSources.bookings).toBe(true);
    expect(preferences.enabledSources.camps).toBe(true);
    expect(preferences.enabledSources.offers).toBe(true);
    expect(preferences.dailyDigestEnabled).toBe(false);
    expect(preferences.visualAlertEnabled).toBe(true);
    expect(preferences.soundAlertEnabled).toBe(false);
  });

  it('يحترم نموذج النظام إيقاف مصدر محدد وتخصيص مستلمي المصدر', () => {
    const settings = normalizeNotificationSystemSettings({
      enabled: true,
      sourceEnabled: { ...DEFAULT_NOTIFICATION_SYSTEM_SETTINGS.sourceEnabled, offers: false },
      recipientRoles: { ...DEFAULT_NOTIFICATION_SYSTEM_SETTINGS.recipientRoles, camps: ['admin'] },
    });
    expect(settings.sourceEnabled.offers).toBe(false);
    expect(settings.recipientRoles.camps).toEqual(['admin']);
  });

  it('يقيد إعدادات النظام بالمسؤول ويتيح تفضيلات خاصة بالمستلم', () => {
    expect(routerSource).toContain('preferences: protectedProcedure');
    expect(routerSource).toContain('updatePreferences: protectedProcedure');
    expect(routerSource).toContain('systemSettings: adminProcedure');
    expect(routerSource).toContain('updateSystemSettings: adminProcedure');
    expect(routerSource).toContain('shouldDeliverNotification');
    expect(helperSource).toContain('shouldDeliverNotification');
  });

  it('يعرض التفضيلات الشخصية في الملف الشخصي والسياسة النظامية للمسؤولين', () => {
    expect(profileSource).toContain('NotificationPreferencesCard');
    expect(settingsPageSource).toContain('SystemNotificationSettingsCard');
    expect(settingsPageSource).toContain("user?.role === 'admin'");
  });

  it('يربط إنشاء الموعد والمخيم والعرض بسياسة الإشعارات دون تعطيل التسجيل', () => {
    expect(appointmentSource).toContain("source: 'bookings'");
    expect(appointmentSource).toContain('notifyEligibleRecipients');
    expect(campSource).toContain("source: 'camps'");
    expect(campSource).toContain('notifyEligibleRecipients');
    expect(offerSource).toContain("source: 'offers'");
    expect(offerSource).toContain('notifyEligibleRecipients');
  });

  it('يدعم الملخص التلقائي والملخص الفوري مع مسار Heartbeat آمن', () => {
    expect(routerSource).toContain('dailyDigestSettings: adminProcedure');
    expect(routerSource).toContain('createDigestNow: protectedProcedure');
    expect(digestServiceSource).toContain('dispatchDailyUnreadNotificationDigests');
    expect(scheduledDigestSource).toContain("'/api/scheduled/notification-digest'");
    expect(scheduledDigestSource).toContain('user.isCron || !user.taskUid');
  });

  it('يسجل إعدادات الإشعارات وينبه المتابعة عند تغيّر حالات التسجيل', () => {
    expect(routerSource).toContain('notification_preferences_updated');
    expect(routerSource).toContain('notification_system_settings_updated');
    expect(routerSource).toContain('notification_digest_schedule_updated');
    expect(appointmentStatusSource).toContain('notifyRegistrationStatusFollowUp');
    expect(campStatusSource).toContain('notifyRegistrationStatusFollowUp');
    expect(offerStatusSource).toContain('notifyRegistrationStatusFollowUp');
  });

  it('يعزز واجهة المركز بخيار غير المقروءة والملخص ومؤشر جرس رقمي', () => {
    expect(notificationsPageSource).toContain('غير المقروءة فقط');
    expect(notificationsPageSource).toContain('إنشاء ملخص الآن');
    expect(notificationCenterSource).toContain("unreadCount > 99 ? '99+' : unreadCount");
    expect(notificationCenterSource).toContain('animate-[pulse_1.8s_ease-in-out_infinite]');
  });

  it('ينظم الإشعارات حسب المصدر ويحترم تفضيلات التنبيه المرئي والصوتي', () => {
    expect(notificationCenterSource).toContain('notificationGroups');
    expect(notificationCenterSource).toContain('playImportantNotificationTone');
    expect(notificationCenterSource).toContain('visualAlertEnabled');
    expect(notificationCenterSource).toContain('soundAlertEnabled');
    expect(routerSource).toContain('visualAlertEnabled: z.boolean()');
    expect(routerSource).toContain('soundAlertEnabled: z.boolean()');
  });

  it('يسجل مصادر واتساب والصندوق الاجتماعي في السياسة الموحدة', () => {
    expect(routerSource).toContain('source: input.source || \'manual\'');
    expect(notificationCenterSource).toContain("whatsapp: 'رسائل WhatsApp'");
    expect(notificationCenterSource).toContain("social_inbox: 'صندوق البريد الاجتماعي'");
  });

  it('يدعم مصدر المهام وتنبيهات الاستحقاق عبر Heartbeat آمن', () => {
    const taskReminderSource = readFileSync(
      resolve(process.cwd(), 'server/services/taskReminderService.ts'),
      'utf8'
    );
    const reminderRouteSource = readFileSync(
      resolve(process.cwd(), 'server/api/taskReminderScheduledRoute.ts'),
      'utf8'
    );
    expect(taskReminderSource).toContain("source: 'tasks'");
    expect(taskReminderSource).toContain("type: overdue ? 'task_overdue' : 'task_due'");
    expect(taskReminderSource).toContain('scheduleCronTaskUid');
    expect(reminderRouteSource).toContain("'/api/scheduled/task-reminders'");
    expect(reminderRouteSource).toContain('user.isCron || !user.taskUid');
  });
});
