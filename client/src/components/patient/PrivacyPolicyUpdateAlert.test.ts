import { afterEach, describe, expect, it } from 'vitest';
import { PRIVACY_POLICY_CONSENT_STORAGE_KEY, savePrivacyPolicyConsent } from '@/components/PrivacyPolicyConsentBanner';
import { requiresPrivacyPolicyReview } from './PrivacyPolicyUpdateAlert';

describe('PrivacyPolicyUpdateAlert', () => {
  afterEach(() => {
    localStorage.removeItem(PRIVACY_POLICY_CONSENT_STORAGE_KEY);
  });

  it('ينبه المستخدم عند عدم قبول الإصدار الحالي من سياسة الخصوصية', () => {
    expect(requiresPrivacyPolicyReview()).toBe(true);

    savePrivacyPolicyConsent('2026-03-01');

    expect(requiresPrivacyPolicyReview()).toBe(false);
  });

  it('يعيد التنبيه عند اختلاف الإصدار المحفوظ عن الإصدار الحالي', () => {
    savePrivacyPolicyConsent('2025-12-01');

    expect(requiresPrivacyPolicyReview()).toBe(true);
  });
});
