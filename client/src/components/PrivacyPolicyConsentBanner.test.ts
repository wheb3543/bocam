import { afterEach, describe, expect, it } from 'vitest';
import {
  clearPrivacyPolicyConsent,
  hasAcceptedPrivacyPolicy,
  isPublicVisitorPath,
  PRIVACY_POLICY_CONSENT_STORAGE_KEY,
  savePrivacyPolicyConsent,
} from './PrivacyPolicyConsentBanner';
import {
  getCookiePreferences,
  saveCookiePreferences,
} from '@/lib/privacy/cookiePreferences';

describe('PrivacyPolicyConsentBanner', () => {
  afterEach(() => {
    localStorage.removeItem(PRIVACY_POLICY_CONSENT_STORAGE_KEY);
    localStorage.removeItem('sgh_cookie_consent');
    localStorage.removeItem('sgh_cookie_preferences');
  });

  it('يحفظ قبول المستخدم للإصدار الحالي من السياسة', () => {
    expect(hasAcceptedPrivacyPolicy('2026-03-01')).toBe(false);

    savePrivacyPolicyConsent('2026-03-01');

    expect(hasAcceptedPrivacyPolicy('2026-03-01')).toBe(true);
    expect(localStorage.getItem(PRIVACY_POLICY_CONSENT_STORAGE_KEY)).toContain('acceptedAt');
  });

  it('يعيد طلب الموافقة عند تغيّر إصدار سياسة الخصوصية', () => {
    savePrivacyPolicyConsent('2026-03-01');

    expect(hasAcceptedPrivacyPolicy('2026-04-01')).toBe(false);
  });

  it('يسمح بإزالة القرار الحالي لإعادة طلب الموافقة لاحقاً', () => {
    savePrivacyPolicyConsent('2026-03-01');
    clearPrivacyPolicyConsent();

    expect(hasAcceptedPrivacyPolicy('2026-03-01')).toBe(false);
    expect(localStorage.getItem(PRIVACY_POLICY_CONSENT_STORAGE_KEY)).toBeNull();
  });

  it('يعرض الطلب للمسارات العامة فقط', () => {
    expect(isPublicVisitorPath('/')).toBe(true);
    expect(isPublicVisitorPath('/privacy-policy')).toBe(true);
    expect(isPublicVisitorPath('/admin')).toBe(false);
    expect(isPublicVisitorPath('/preview/example')).toBe(false);
    expect(isPublicVisitorPath('/patient-portal/home')).toBe(false);
  });

  it('يحفظ التفضيلات التحليلية والتسويقية مع إبقاء ملفات الارتباط الأساسية مفعلة', () => {
    saveCookiePreferences({ essential: false, analytical: true, marketing: false });

    expect(getCookiePreferences()).toEqual({ essential: true, analytical: true, marketing: false });
  });
});
