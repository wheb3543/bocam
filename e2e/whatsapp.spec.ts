/**
 * اختبارات E2E لتكامل واتساب
 * WhatsApp Integration E2E Tests
 */

import { test, expect } from '@playwright/test';

test.describe('WhatsApp Integration', () => {
  test.beforeEach(async ({ page }) => {
    // تسجيل الدخول كمسؤول
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('admin@example.com');
    await page.locator('input[type="password"]').fill('password123');
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL('/dashboard');
  });

  test('يجب أن يعرض قسم واتساب', async ({ page }) => {
    await page.locator('text=واتساب').click();

    await expect(page.locator('h1')).toContainText('إدارة واتساب');
    await expect(page.locator('.whatsapp-status')).toBeVisible();
    await expect(page.locator('.qr-code-section')).toBeVisible();
  });

  test('يجب أن يعرض حالة الاتصال بواتساب', async ({ page }) => {
    await page.locator('text=واتساب').click();

    await expect(page.locator('.connection-status')).toBeVisible();
    await expect(page.locator('.connection-status')).toContainText('متصل');
  });

  test('يجب أن يعرض رمز QR للاتصال', async ({ page }) => {
    await page.locator('text=واتساب').click();
    await page.locator('button[aria-label="إعادة الاتصال"]').click();

    await expect(page.locator('.qr-code')).toBeVisible();
    await expect(page.locator('.qr-code')).toHaveAttribute('src', /data:image\/qr/);
  });

  test('يجب أن يسمح بإرسال رسالة واتساب', async ({ page }) => {
    await page.locator('text=المواعيد').click();
    await page.locator('.appointment-row').first().locator('button[aria-label="إرسال واتساب"]').click();

    await expect(page.locator('.whatsapp-modal')).toBeVisible();
    await page.locator('textarea[name="message"]').fill('تذكير بموعدك غداً الساعة 10 صباحاً');
    await page.locator('button[aria-label="إرسال"]').click();

    await expect(page.locator('.success-message')).toContainText('تم إرسال الرسالة');
  });

  test('يجب أن يسمح بإرسال رسالة جماعية', async ({ page }) => {
    await page.locator('text=واتساب').click();
    await page.locator('button[aria-label="إرسال رسالة جماعية"]').click();

    await page.locator('input[name="recipients"]').fill('0501234567,0509876543');
    await page.locator('textarea[name="message"]').fill('رسالة جماعية للمرضى');
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('.success-message')).toContainText('تم إرسال الرسائل');
  });

  test('يجب أن يعرض سجل الرسائل المرسلة', async ({ page }) => {
    await page.locator('text=واتساب').click();
    await page.locator('text=سجل الرسائل').click();

    await expect(page.locator('.messages-table')).toBeVisible();
    await expect(page.locator('.message-row')).toHaveCount(10);
  });

  test('يجب أن يسمح بتصفية سجل الرسائل', async ({ page }) => {
    await page.locator('text=واتساب').click();
    await page.locator('text=سجل الرسائل').click();
    await page.locator('input[name="dateFrom"]').fill('2024-01-01');
    await page.locator('input[name="dateTo"]').fill('2024-12-31');
    await page.locator('button[aria-label="تصفية"]').click();

    await expect(page.locator('.message-row')).toHaveCount(8);
  });

  test('يجب أن يسمح بإعادة إرسال الرسالة', async ({ page }) => {
    await page.locator('text=واتساب').click();
    await page.locator('text=سجل الرسائل').click();
    await page.locator('.message-row').first().locator('button[aria-label="إعادة الإرسال"]').click();

    await expect(page.locator('.success-message')).toContainText('تم إعادة إرسال الرسالة');
  });

  test('يجب أن يسمح بحذف الرسالة من السجل', async ({ page }) => {
    await page.locator('text=واتساب').click();
    await page.locator('text=سجل الرسائل').click();
    await page.locator('.message-row').first().locator('button[aria-label="حذف"]').click();
    await page.locator('text=تأكيد الحذف').click();

    await expect(page.locator('.success-message')).toContainText('تم حذف الرسالة');
  });

  test('يجب أن يعرض قوالب الرسائل', async ({ page }) => {
    await page.locator('text=واتساب').click();
    await page.locator('text=القوالب').click();

    await expect(page.locator('.templates-section')).toBeVisible();
    await expect(page.locator('.template-card')).toHaveCount(5);
  });

  test('يجب أن يسمح بإنشاء قالب رسالة جديد', async ({ page }) => {
    await page.locator('text=واتساب').click();
    await page.locator('text=القوالب').click();
    await page.locator('button[aria-label="إنشاء قالب"]').click();

    await page.locator('input[name="name"]').fill('تذكير موعد');
    await page.locator('textarea[name="content"]').fill('تذكير بموعدك في {date} الساعة {time}');
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('.success-message')).toContainText('تم إنشاء القالب');
  });

  test('يجب أن يسمح بتعديل القالب', async ({ page }) => {
    await page.locator('text=واتساب').click();
    await page.locator('text=القوالب').click();
    await page.locator('.template-card').first().locator('button[aria-label="تعديل"]').click();

    await page.locator('textarea[name="content"]').fill('تذكير بموعدك في {date} الساعة {time} - يرجى الحضور في الوقت المحدد');
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('.success-message')).toContainText('تم تحديث القالب');
  });

  test('يجب أن يسمح بحذف القالب', async ({ page }) => {
    await page.locator('text=واتساب').click();
    await page.locator('text=القوالب').click();
    await page.locator('.template-card').first().locator('button[aria-label="حذف"]').click();
    await page.locator('text=تأكيد الحذف').click();

    await expect(page.locator('.success-message')).toContainText('تم حذف القالب');
  });

  test('يجب أن يسمح باستخدام القالب في إرسال الرسالة', async ({ page }) => {
    await page.locator('text=واتساب').click();
    await page.locator('text=القوالب').click();
    await page.locator('.template-card').first().locator('button[aria-label="استخدام"]').click();

    await expect(page.locator('.whatsapp-modal')).toBeVisible();
    await expect(page.locator('textarea[name="message"]')).toHaveValue(/تذكير بموعدك/);
  });

  test('يجب أن يعرض إحصائيات واتساب', async ({ page }) => {
    await page.locator('text=واتساب').click();
    await page.locator('text=الإحصائيات').click();

    await expect(page.locator('.stats-section')).toBeVisible();
    await expect(page.locator('.stat-card')).toHaveCount(4);
  });

  test('يجب أن يعرض عدد الرسائل المرسلة', async ({ page }) => {
    await page.locator('text=واتساب').click();
    await page.locator('text=الإحصائيات').click();

    await expect(page.locator('.stat-card').nth(0)).toContainText('الرسائل المرسلة');
    await expect(page.locator('.stat-card').nth(0)).toContainText('150');
  });

  test('يجب أن يعرض معدل التسليم', async ({ page }) => {
    await page.locator('text=واتساب').click();
    await page.locator('text=الإحصائيات').click();

    await expect(page.locator('.stat-card').nth(1)).toContainText('معدل التسليم');
    await expect(page.locator('.stat-card').nth(1)).toContainText('95%');
  });

  test('يجب أن يعرض الرسائل الفاشلة', async ({ page }) => {
    await page.locator('text=واتساب').click();
    await page.locator('text=الإحصائيات').click();

    await expect(page.locator('.stat-card').nth(2)).toContainText('الرسائل الفاشلة');
    await expect(page.locator('.stat-card').nth(2)).toContainText('5');
  });

  test('يجب أن يسمح بتصدير سجل الرسائل', async ({ page }) => {
    await page.locator('text=واتساب').click();
    await page.locator('text=سجل الرسائل').click();
    const downloadPromise = page.waitForEvent('download');
    await page.locator('button[aria-label="تصدير"]').click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toContain('whatsapp-messages');
  });

  test('يجب أن يعرض رسالة خطأ عند فشل الاتصال', async ({ page }) => {
    await page.locator('text=واتساب').click();
    await page.locator('button[aria-label="قطع الاتصال"]').click();

    await expect(page.locator('.error-message')).toContainText('تم قطع الاتصال');
    await expect(page.locator('.connection-status')).toContainText('غير متصل');
  });

  test('يجب أن يسمح بإعادة الاتصال', async ({ page }) => {
    await page.locator('text=واتساب').click();
    await page.locator('button[aria-label="قطع الاتصال"]').click();
    await page.locator('button[aria-label="إعادة الاتصال"]').click();

    await expect(page.locator('.success-message')).toContainText('تم إعادة الاتصال');
  });

  test('يجب أن يعرض حالة الجلسة', async ({ page }) => {
    await page.locator('text=واتساب').click();

    await expect(page.locator('.session-info')).toBeVisible();
    await expect(page.locator('.session-info')).toContainText('رقم الهاتف');
    await expect(page.locator('.session-info')).toContainText('تاريخ الاتصال');
  });

  test('يجب أن يسمح بتسجيل الخروج من واتساب', async ({ page }) => {
    await page.locator('text=واتساب').click();
    await page.locator('button[aria-label="تسجيل الخروج"]').click();
    await page.locator('text=تأكيد تسجيل الخروج').click();

    await expect(page.locator('.success-message')).toContainText('تم تسجيل الخروج');
  });
});

test.describe('WhatsApp Integration - Error Handling', () => {
  test('يجب أن يتعامل مع رقم هاتف غير صحيح', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('admin@example.com');
    await page.locator('input[type="password"]').fill('password123');
    await page.locator('button[type="submit"]').click();

    await page.locator('text=المواعيد').click();
    await page.locator('.appointment-row').first().locator('button[aria-label="إرسال واتساب"]').click();
    await page.locator('input[name="phone"]').fill('invalid-number');
    await page.locator('button[aria-label="إرسال"]').click();

    await expect(page.locator('.error-message')).toContainText('رقم الهاتف غير صحيح');
  });

  test('يجب أن يتعامل مع رسالة فارغة', async ({ page }) => {
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('admin@example.com');
    await page.locator('input[type="password"]').fill('password123');
    await page.locator('button[type="submit"]').click();

    await page.locator('text=المواعيد').click();
    await page.locator('.appointment-row').first().locator('button[aria-label="إرسال واتساب"]').click();
    await page.locator('button[aria-label="إرسال"]').click();

    await expect(page.locator('.error-message')).toContainText('الرجاء إدخال رسالة');
  });
});
