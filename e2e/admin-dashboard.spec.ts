/**
 * اختبارات E2E للوحة التحكم الإدارية
 * Admin Dashboard E2E Tests
 */

import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // تسجيل الدخول كمسؤول
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('admin@example.com');
    await page.locator('input[type="password"]').fill('password123');
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL('/dashboard');
  });

  test('يجب أن يعرض لوحة التحكم', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('لوحة التحكم');
    await expect(page.locator('.stats-cards')).toBeVisible();
    await expect(page.locator('.recent-activity')).toBeVisible();
  });

  test('يجب أن يعرض الإحصائيات الرئيسية', async ({ page }) => {
    await expect(page.locator('.stat-card')).toHaveCount(4);
    await expect(page.locator('.stat-card').nth(0)).toContainText('المواعيد');
    await expect(page.locator('.stat-card').nth(1)).toContainText('المرضى');
    await expect(page.locator('.stat-card').nth(2)).toContainText('الأطباء');
    await expect(page.locator('.stat-card').nth(3)).toContainText('الإيرادات');
  });

  test('يجب أن يعرض قائمة المواعيد', async ({ page }) => {
    await page.locator('text=المواعيد').click();

    await expect(page.locator('.appointments-table')).toBeVisible();
    await expect(page.locator('.appointment-row')).toHaveCount(10);
  });

  test('يجب أن يسمح بتصفية المواعيد', async ({ page }) => {
    await page.locator('text=المواعيد').click();
    await page.locator('select[name="status"]').selectOption('pending');
    await page.locator('button[aria-label="تصفية"]').click();

    await expect(page.locator('.appointment-row')).toHaveCount(5);
  });

  test('يجب أن يسمح بالبحث في المواعيد', async ({ page }) => {
    await page.locator('text=المواعيد').click();
    await page.locator('input[name="search"]').fill('أحمد');
    await page.locator('button[aria-label="بحث"]').click();

    await expect(page.locator('.appointment-row')).toHaveCount(3);
  });

  test('يجب أن يسمح بتعديل الموعد', async ({ page }) => {
    await page.locator('text=المواعيد').click();
    await page.locator('.appointment-row').first().locator('button[aria-label="تعديل"]').click();

    await page.locator('input[type="date"]').fill('2024-12-20');
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('.success-message')).toContainText('تم تحديث الموعد');
  });

  test('يجب أن يسمح بحذف الموعد', async ({ page }) => {
    await page.locator('text=المواعيد').click();
    await page.locator('.appointment-row').first().locator('button[aria-label="حذف"]').click();
    await page.locator('text=تأكيد الحذف').click();

    await expect(page.locator('.success-message')).toContainText('تم حذف الموعد');
  });

  test('يجب أن يعرض قائمة المرضى', async ({ page }) => {
    await page.locator('text=المرضى').click();

    await expect(page.locator('.patients-table')).toBeVisible();
    await expect(page.locator('.patient-row')).toHaveCount(15);
  });

  test('يجب أن يسمح بإضافة مريض جديد', async ({ page }) => {
    await page.locator('text=المرضى').click();
    await page.locator('button[aria-label="إضافة مريض"]').click();

    await page.locator('input[name="name"]').fill('محمد أحمد');
    await page.locator('input[name="phone"]').fill('0501234567');
    await page.locator('input[name="email"]').fill('mohammed@example.com');
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('.success-message')).toContainText('تم إضافة المريض');
  });

  test('يجب أن يسمح بعرض تفاصيل المريض', async ({ page }) => {
    await page.locator('text=المرضى').click();
    await page.locator('.patient-row').first().locator('button[aria-label="عرض التفاصيل"]').click();

    await expect(page.locator('.patient-details')).toBeVisible();
    await expect(page.locator('.patient-details')).toContainText('المعلومات الشخصية');
    await expect(page.locator('.patient-details')).toContainText('التاريخ الطبي');
  });

  test('يجب أن يعرض قائمة الأطباء', async ({ page }) => {
    await page.locator('text=الأطباء').click();

    await expect(page.locator('.doctors-table')).toBeVisible();
    await expect(page.locator('.doctor-row')).toHaveCount(8);
  });

  test('يجب أن يسمح بإضافة طبيب جديد', async ({ page }) => {
    await page.locator('text=الأطباء').click();
    await page.locator('button[aria-label="إضافة طبيب"]').click();

    await page.locator('input[name="name"]').fill('د. خالد محمد');
    await page.locator('input[name="specialty"]').fill('طب القلب');
    await page.locator('input[name="phone"]').fill('0509876543');
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('.success-message')).toContainText('تم إضافة الطبيب');
  });

  test('يجب أن يعرض التقارير', async ({ page }) => {
    await page.locator('text=التقارير').click();

    await expect(page.locator('.reports-section')).toBeVisible();
    await expect(page.locator('.report-card')).toHaveCount(5);
  });

  test('يجب أن يسمح بتصدير التقرير', async ({ page }) => {
    await page.locator('text=التقارير').click();
    const downloadPromise = page.waitForEvent('download');
    await page.locator('.report-card').first().locator('button[aria-label="تصدير"]').click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toContain('report');
  });

  test('يجب أن يعرض الإعدادات', async ({ page }) => {
    await page.locator('text=الإعدادات').click();

    await expect(page.locator('.settings-section')).toBeVisible();
    await expect(page.locator('.settings-form')).toBeVisible();
  });

  test('يجب أن يسمح بتحديث الإعدادات', async ({ page }) => {
    await page.locator('text=الإعدادات').click();
    await page.locator('input[name="clinicName"]').fill('عيادة الشفاء');
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('.success-message')).toContainText('تم تحديث الإعدادات');
  });

  test('يجب أن يعرض سجل التدقيق', async ({ page }) => {
    await page.locator('text=سجل التدقيق').click();

    await expect(page.locator('.audit-log-table')).toBeVisible();
    await expect(page.locator('.audit-log-row')).toHaveCount(20);
  });

  test('يجب أن يسمح بتصفية سجل التدقيق', async ({ page }) => {
    await page.locator('text=سجل التدقيق').click();
    await page.locator('input[name="dateFrom"]').fill('2024-01-01');
    await page.locator('input[name="dateTo"]').fill('2024-12-31');
    await page.locator('button[aria-label="تصفية"]').click();

    await expect(page.locator('.audit-log-row')).toHaveCount(15);
  });

  test('يجب أن يعرض لوحة الإشعارات', async ({ page }) => {
    await page.locator('button[aria-label="الإشعارات"]').click();

    await expect(page.locator('.notifications-panel')).toBeVisible();
    await expect(page.locator('.notification-item')).toHaveCount(5);
  });

  test('يجب أن يسمح بتعليم الإشعار كمقروء', async ({ page }) => {
    await page.locator('button[aria-label="الإشعارات"]').click();
    await page.locator('.notification-item').first().click();

    await expect(page.locator('.notification-item').first()).toHaveClass(/read/);
  });
});

test.describe('Admin Dashboard - Performance', () => {
  test('يجب أن تحمل الصفحة بسرعة', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/dashboard');
    const endTime = Date.now();
    const loadTime = endTime - startTime;

    expect(loadTime).toBeLessThan(3000);
  });

  test('يجب أن يكون التفاعل سريعاً', async ({ page }) => {
    await page.goto('/dashboard');
    const startTime = Date.now();
    await page.locator('text=المواعيد').click();
    const endTime = Date.now();
    const interactionTime = endTime - startTime;

    expect(interactionTime).toBeLessThan(500);
  });
});
