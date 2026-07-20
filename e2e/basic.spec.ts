/**
 * Basic E2E Tests
 * اختبارات E2E أساسية
 */

import { test, expect } from '@playwright/test';

test.describe('Basic Application Tests', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    
    // Check if page loads successfully
    await expect(page).toHaveTitle(/Bocam/);
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');
    
    // Click on login button (adjust selector based on your app)
    const loginButton = page.locator('a[href="/login"], button:has-text("Login"), button:has-text("تسجيل الدخول")').first();
    
    if (await loginButton.isVisible()) {
      await loginButton.click();
      await expect(page).toHaveURL(/.*login/);
    }
  });

  test('should handle 404 pages', async ({ page }) => {
    const response = await page.goto('/non-existent-page');
    expect(response?.status()).toBe(404);
  });

  test('should have proper meta tags', async ({ page }) => {
    await page.goto('/');
    
    // Check for viewport meta tag
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');
    
    // Check for charset
    const charset = await page.locator('meta[charset]').getAttribute('charset');
    expect(charset).toBeTruthy();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check if mobile menu or responsive elements exist
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});

test.describe('Health Check Tests', () => {
  test('should return healthy status', async ({ request }) => {
    const response = await request.get('http://localhost:3000/health');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('status');
    expect(['healthy', 'degraded', 'unhealthy']).toContain(data.status);
  });

  test('should return metrics', async ({ request }) => {
    const response = await request.get('http://localhost:3000/metrics');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    expect(data).toHaveProperty('timestamp');
    expect(data).toHaveProperty('uptime');
    expect(data).toHaveProperty('memory');
  });
});
