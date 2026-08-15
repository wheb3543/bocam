/**
 * اختبارات E2E للبوابة الطبية
 * Patient Portal E2E Tests
 */

import { test, expect } from '@playwright/test';

test.describe('Patient Portal', () => {
  test.beforeEach(async ({ page }) => {
    // تسجيل الدخول كمريض
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('patient@example.com');
    await page.locator('input[type="password"]').fill('password123');
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL('/patient-portal');
  });

  test('يجب أن يعرض لوحة المريض', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('بوابة المريض');
    await expect(page.locator('.patient-info')).toBeVisible();
    await expect(page.locator('.appointments-section')).toBeVisible();
  });

  test('يجب أن يعرض المواعيد القادمة', async ({ page }) => {
    await page.locator('text=المواعيد').click();

    await expect(page.locator('.appointment-card')).toHaveCount(3);
    await expect(page.locator('.appointment-card').first()).toContainText('موعد قادم');
  });

  test('يجب أن يسمح بحجز موعد جديد', async ({ page }) => {
    await page.locator('text=حجز موعد جديد').click();

    await page.locator('select[name="doctor"]').selectOption('د. أحمد');
    await page.locator('input[type="date"]').fill('2024-12-15');
    await page.locator('select[name="time"]').selectOption('10:00');
    await page.locator('textarea[name="reason"]').fill('فحص دوري');

    await page.locator('button[type="submit"]').click();

    await expect(page.locator('.success-message')).toContainText('تم حجز الموعد بنجاح');
  });

  test('يجب أن يسمح بإلغاء الموعد', async ({ page }) => {
    await page.locator('text=المواعيد').click();
    await page.locator('.appointment-card').first().locator('button[aria-label="إلغاء الموعد"]').click();
    await page.locator('text=تأكيد الإلغاء').click();

    await expect(page.locator('.success-message')).toContainText('تم إلغاء الموعد');
  });

  test('يجب أن يعرض السجلات الطبية', async ({ page }) => {
    await page.locator('text=السجلات الطبية').click();

    await expect(page.locator('.medical-record')).toBeVisible();
    await expect(page.locator('.medical-record')).toContainText('التاريخ');
    await expect(page.locator('.medical-record')).toContainText('التشخيص');
  });

  test('يجب أن يسمح بتحميل السجلات الطبية', async ({ page }) => {
    await page.locator('text=السجلات الطبية').click();
    const downloadPromise = page.waitForEvent('download');
    await page.locator('button[aria-label="تحميل السجل"]').click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toContain('medical-record');
  });

  test('يجب أن يعرض الوصفات الطبية', async ({ page }) => {
    await page.locator('text=الوصفات الطبية').click();

    await expect(page.locator('.prescription-card')).toBeVisible();
    await expect(page.locator('.prescription-card')).toContainText('الدواء');
    await expect(page.locator('.prescription-card')).toContainText('الجرعة');
  });

  test('يجب أن يعرض الفواتير', async ({ page }) => {
    await page.locator('text=الفواتير').click();

    await expect(page.locator('.invoice-card')).toBeVisible();
    await expect(page.locator('.invoice-card')).toContainText('المبلغ');
    await expect(page.locator('.invoice-card')).toContainText('الحالة');
  });

  test('يجب أن يسمح بدفع الفاتورة', async ({ page }) => {
    await page.locator('text=الفواتير').click();
    await page.locator('.invoice-card').first().locator('button[aria-label="دفع"]').click();

    await expect(page.locator('.payment-modal')).toBeVisible();
    await page.locator('button[aria-label="تأكيد الدفع"]').click();

    await expect(page.locator('.success-message')).toContainText('تم الدفع بنجاح');
  });

  test('يجب أن يعرض الإشعارات', async ({ page }) => {
    await page.locator('button[aria-label="الإشعارات"]').click();

    await expect(page.locator('.notification-item')).toBeVisible();
    await expect(page.locator('.notification-item')).toContainText('موعد جديد');
  });

  test('يجب أن يسمح بتحديث المعلومات الشخصية', async ({ page }) => {
    await page.locator('text=الملف الشخصي').click();
    await page.locator('input[name="phone"]').fill('0501234567');
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('.success-message')).toContainText('تم تحديث المعلومات');
  });

  test('يجب أن يعرض رسائل الدعم', async ({ page }) => {
    await page.locator('text=الدعم').click();

    await expect(page.locator('.support-chat')).toBeVisible();
    await page.locator('textarea[name="message"]').fill('أحتاج مساعدة');
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('.success-message')).toContainText('تم إرسال الرسالة');
  });
});

test.describe('Patient Portal - Mobile', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('يجب أن يعمل بشكل صحيح على الجوال', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('patient@example.com');
    await page.locator('input[type="password"]').fill('password123');
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL('/patient-portal');
    await expect(page.locator('.mobile-menu')).toBeVisible();
  });
});
