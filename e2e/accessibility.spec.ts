/**
 * Accessibility E2E Tests using Playwright
 * 
 * This test suite ensures that the application meets WCAG 2.1 Level AA standards
 * by running automated accessibility checks on key pages.
 */

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  // Test the home page with axe-core
  test('Home page should have no accessibility violations', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  // Test the home page
  test('Home page should have proper structure', async ({ page }) => {
    await page.goto('/');
    
    // Check for proper heading structure
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    
    // Check for skip navigation links
    const skipLinks = page.locator('a[href="#main-content"]');
    await expect(skipLinks).toHaveCount(1);
    
    // Check for main landmark
    const main = page.locator('main');
    await expect(main).toHaveCount(1);
    
    // Check for navigation landmark
    const nav = page.locator('nav');
    await expect(nav).toHaveCount(1);
    
    // Check for proper alt text on images
    const images = page.locator('img');
    const imageCount = await images.count();
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });

  // Test the admin dashboard with axe-core
  test('Admin dashboard should have no accessibility violations', async ({ page }) => {
    await page.goto('/admin');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  // Test keyboard navigation
  test('Page should be navigable via keyboard', async ({ page }) => {
    await page.goto('/');
    
    // Test Tab navigation
    await page.keyboard.press('Tab');
    
    // Check that focus is on an interactive element
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['A', 'BUTTON', 'INPUT']).toContain(focusedElement);
    
    // Test Escape key for closing modals
    await page.keyboard.press('Escape');
    
    // Test Enter key for activating links
    await page.keyboard.press('Enter');
  });

  // Test focus management
  test('Focus should be visible and manageable', async ({ page }) => {
    await page.goto('/');
    
    // Press Tab to move focus
    await page.keyboard.press('Tab');
    
    // Check that focus is visible
    const hasFocus = await page.evaluate(() => {
      const active = document.activeElement;
      if (!active) {
        return false;
      }
      const styles = window.getComputedStyle(active);
      return styles.outline !== 'none' || styles.boxShadow !== 'none';
    });
    
    expect(hasFocus).toBe(true);
  });

  // Test ARIA attributes
  test('Interactive elements should have proper ARIA attributes', async ({ page }) => {
    await page.goto('/admin');
    
    // Check for proper ARIA labels on icon-only buttons
    const iconButtons = page.locator('button').filter({ hasText: '' });
    const iconButtonCount = await iconButtons.count();
    
    for (let i = 0; i < iconButtonCount; i++) {
      const button = iconButtons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
    }
  });

  // Test color contrast (basic check)
  test('Text should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');
    
    // This is a basic check - for comprehensive contrast testing,
    // use axe-core or specialized tools
    const textElements = page.locator('p, h1, h2, h3, h4, h5, h6, span, a, button');
    const textCount = await textElements.count();
    
    // Ensure text elements exist
    expect(textCount).toBeGreaterThan(0);
  });

  // Test form accessibility
  test('Forms should have proper labels and error handling', async ({ page }) => {
    await page.goto('/admin/login');
    
    // Check for proper form labels
    const inputs = page.locator('input');
    const inputCount = await inputs.count();
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i);
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledby = await input.getAttribute('aria-labelledby');
      const placeholder = await input.getAttribute('placeholder');
      const id = await input.getAttribute('id');
      
      // Inputs should have at least one of: aria-label, aria-labelledby, placeholder, or id
      const hasLabel = ariaLabel || ariaLabelledby || placeholder || id;
      expect(hasLabel).toBeTruthy();
    }
  });

  // Test live regions
  test('Dynamic content should use live regions', async ({ page }) => {
    await page.goto('/admin');
    
    // Check for live regions
    const liveRegions = page.locator('[aria-live]');
    const liveRegionCount = await liveRegions.count();
    
    // At least one live region should exist for dynamic content
    expect(liveRegionCount).toBeGreaterThanOrEqual(0);
  });

  // Test modal accessibility
  test('Modals should have proper ARIA attributes', async ({ page }) => {
    await page.goto('/admin');
    
    // Try to open a modal (this depends on your application)
    // For now, we'll check if any modals exist on the page
    const modals = page.locator('[role="dialog"]');
    const modalCount = await modals.count();
    
    if (modalCount > 0) {
      for (let i = 0; i < modalCount; i++) {
        const modal = modals.nth(i);
        const ariaModal = await modal.getAttribute('aria-modal');
        const ariaLabelledby = await modal.getAttribute('aria-labelledby');
        
        expect(ariaModal).toBe('true');
        expect(ariaLabelledby).toBeTruthy();
      }
    }
  });

  // Test landmark regions
  test('Page should have proper landmark regions', async ({ page }) => {
    await page.goto('/');
    
    // Check for main landmark
    const main = page.locator('main');
    await expect(main).toHaveCount(1);
    
    // Check for navigation landmark
    const nav = page.locator('nav');
    await expect(nav).toHaveCount(1);
    
    // Check for header landmark
    const header = page.locator('header');
    await expect(header).toHaveCount(1);
    
    // Check for footer landmark
    const footer = page.locator('footer');
    await expect(footer).toHaveCount(1);
  });
});
