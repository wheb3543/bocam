/**
 * اختبارات E2E للمصادقة
 * Authentication E2E Tests
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('يجب أن يعرض صفحة تسجيل الدخول', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('تسجيل الدخول');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('يجب أن يعرض خطأ عند إدخال بيانات غير صحيحة', async ({ page }) => {
    await page.locator('input[type="email"]').fill('invalid@example.com');
    await page.locator('input[type="password"]').fill('wrongpassword');
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('.error-message')).toContainText('بيانات الدخول غير صحيحة');
  });

  test('يجب أن ينجح تسجيل الدخول بالبيانات الصحيحة', async ({ page }) => {
    await page.locator('input[type="email"]').fill('admin@example.com');
    await page.locator('input[type="password"]').fill('password123');
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('لوحة التحكم');
  });

  test('يجب أن يحفظ الجلسة بعد تسجيل الدخول', async ({ page, context }) => {
    await page.locator('input[type="email"]').fill('admin@example.com');
    await page.locator('input[type="password"]').fill('password123');
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL('/dashboard');

    // التحقق من حفظ الجلسة
    const cookies = await context.cookies();
    const sessionCookie = cookies.find(c => c.name === 'session');
    expect(sessionCookie).toBeDefined();
  });

  test('يجب أن يسمح بتسجيل الخروج', async ({ page }) => {
    // تسجيل الدخول أولاً
    await page.locator('input[type="email"]').fill('admin@example.com');
    await page.locator('input[type="password"]').fill('password123');
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL('/dashboard');

    // تسجيل الخروج
    await page.locator('button[aria-label="تسجيل الخروج"]').click();
    await page.locator('text=تأكيد تسجيل الخروج').click();

    await expect(page).toHaveURL('/login');
  });

  test('يجب أن يمنع الوصول للصفحات المحمية بدون تسجيل دخول', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page).toHaveURL('/login');
    await expect(page.locator('.error-message')).toContainText('يجب تسجيل الدخول أولاً');
  });

  test('يجب أن يعرض خطأ عند الحقول الفارغة', async ({ page }) => {
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('input[type="email"]')).toHaveClass(/error/);
    await expect(page.locator('input[type="password"]')).toHaveClass(/error/);
  });

  test('يجب أن يدعم إعادة تعيين كلمة المرور', async ({ page }) => {
    await page.locator('text=نسيت كلمة المرور؟').click();

    await expect(page).toHaveURL('/forgot-password');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('يجب أن يتحقق من صحة تنسيق البريد الإلكتروني', async ({ page }) => {
    await page.locator('input[type="email"]').fill('invalid-email');
    await page.locator('input[type="password"]').fill('password123');
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('.error-message')).toContainText('تنسيق البريد الإلكتروني غير صحيح');
  });
});

test.describe('Password Reset', () => {
  test('يجب أن يرسل رابط إعادة تعيين كلمة المرور', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.locator('input[type="email"]').fill('admin@example.com');
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('.success-message')).toContainText('تم إرسال رابط إعادة التعيين');
  });

  test('يجب أن يعرض خطأ للبريد غير المسجل', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.locator('input[type="email"]').fill('nonexistent@example.com');
    await page.locator('button[type="submit"]').click();

    await expect(page.locator('.error-message')).toContainText('البريد الإلكتروني غير مسجل');
  });
});
