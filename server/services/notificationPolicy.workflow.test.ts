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
const settingsPageSource = readFileSync(resolve(process.cwd(), 'client/src/pages/admin/SettingsPage.tsx'), 'utf8');

describe('سياسة تفضيلات الإشعارات وربط التسجيلات', () => {
  it('تحافظ على الافتراضات الآمنة عند غياب تفضيلات المستخدم', () => {
    const preferences = normalizeNotificationPreferences(undefined);
    expect(preferences.enabled).toBe(true);
    expect(preferences.enabledSources.bookings).toBe(true);
    expect(preferences.enabledSources.camps).toBe(true);
    expect(preferences.enabledSources.offers).toBe(true);
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
});
