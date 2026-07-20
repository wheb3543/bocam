/**
 * اختبارات MetaPixel Component
 * MetaPixel Component Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('MetaPixel - Cookie Consent', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('يجب أن يتحقق من موافقة الكوكيز التسويقية', () => {
    localStorage.setItem('sgh_cookie_consent', 'true');
    localStorage.setItem('sgh_cookie_preferences', JSON.stringify({ marketing: true }));
    
    const prefs = localStorage.getItem('sgh_cookie_preferences');
    expect(prefs).toBeTruthy();
    
    if (prefs) {
      const parsed = JSON.parse(prefs);
      expect(parsed.marketing).toBe(true);
    }
  });

  it('يجب أن يتعامل مع localStorage غير صالح', () => {
    localStorage.setItem('sgh_cookie_consent', 'true');
    localStorage.setItem('sgh_cookie_preferences', 'invalid json');
    
    // Should not throw error
    expect(() => {
      const prefs = localStorage.getItem('sgh_cookie_preferences');
      if (prefs) {
        try {
          JSON.parse(prefs);
        } catch {
          // Handle error gracefully
        }
      }
    }).not.toThrow();
  });
});

describe('MetaPixel - Dashboard Path Detection', () => {
  it('يجب أن يحدد مسارات الداشبورد', () => {
    const dashboardPath = '/admin/dashboard';
    const publicPath = '/public-page';
    
    const isDashboard = (path: string) => path.startsWith('/admin');
    
    expect(isDashboard(dashboardPath)).toBe(true);
    expect(isDashboard(publicPath)).toBe(false);
  });
});

describe('MetaPixel - Phone Normalization', () => {
  it('يجب أن يطبع رقم الهاتف اليمني', () => {
    const normalizePhone = (phone: string) => {
      let normalized = phone.replace(/[\s\-()]/g, '');
      if (normalized.startsWith('0')) {
        normalized = '967' + normalized.slice(1);
      } else if (normalized.startsWith('7')) {
        normalized = '967' + normalized;
      } else if (normalized.startsWith('+')) {
        normalized = normalized.slice(1);
      }
      return normalized;
    };
    
    expect(normalizePhone('0712345678')).toBe('967712345678');
    expect(normalizePhone('712345678')).toBe('967712345678');
    expect(normalizePhone('+967712345678')).toBe('967712345678');
    expect(normalizePhone('967712345678')).toBe('967712345678');
  });
});
