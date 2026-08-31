import { describe, expect, it } from 'vitest';
import { getSafeNavigationTarget } from './DynamicPage';

describe('getSafeNavigationTarget', () => {
  it('يُعيد مساراً داخلياً دون تغيير', () => {
    expect(getSafeNavigationTarget('/pricing')).toBe('/pricing');
  });

  it('يُعيد رابطاً خارجياً آمناً بصيغة كاملة', () => {
    expect(getSafeNavigationTarget('https://example.com/contact')).toBe('https://example.com/contact');
  });

  it('يُرجع null للقيم الفارغة أو المكسورة', () => {
    expect(getSafeNavigationTarget('')).toBeNull();
    expect(getSafeNavigationTarget('javascript:alert(1)')).toBeNull();
  });
});
