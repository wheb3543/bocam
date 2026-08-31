import { describe, expect, it } from 'vitest';
import { getSafeNavigationTarget } from '@/lib/safeNavigation';

describe('getSafeNavigationTarget', () => {
  it('يُعيد مساراً داخلياً دون تغيير', () => {
    expect(getSafeNavigationTarget('/pricing')).toBe('/pricing');
  });

  it('يُعيد رابطاً خارجياً آمناً بصيغة كاملة', () => {
    expect(getSafeNavigationTarget('https://example.com/contact')).toBe('https://example.com/contact');
  });

  it('يُسمح بالروابط الهاتفية والبريدية الآمنة', () => {
    expect(getSafeNavigationTarget('tel:+966500000000')).toBe('tel:+966500000000');
    expect(getSafeNavigationTarget('mailto:hello@example.com')).toBe('mailto:hello@example.com');
  });

  it('يُرجع null للقيم الفارغة أو المكسورة', () => {
    expect(getSafeNavigationTarget('')).toBeNull();
    expect(getSafeNavigationTarget('javascript:alert(1)')).toBeNull();
    expect(getSafeNavigationTarget('data:text/html;base64,abc')).toBeNull();
  });
});
