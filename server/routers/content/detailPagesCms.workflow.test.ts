import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const offerDetailSource = readFileSync(
  resolve(process.cwd(), 'client/src/pages/public/OfferDetailPage.tsx'),
  'utf8'
);
const campDetailSource = readFileSync(
  resolve(process.cwd(), 'client/src/pages/public/CampDetailPage.tsx'),
  'utf8'
);
const thankYouSource = readFileSync(resolve(process.cwd(), 'client/src/pages/public/ThankYou.tsx'), 'utf8');
const privacyPolicySource = readFileSync(
  resolve(process.cwd(), 'client/src/pages/public/PrivacyPolicyPage.tsx'),
  'utf8'
);
const privacyConsentSource = readFileSync(
  resolve(process.cwd(), 'client/src/components/PrivacyPolicyConsentBanner.tsx'),
  'utf8'
);
const privacyChangelogSource = readFileSync(
  resolve(process.cwd(), 'client/src/pages/public/PrivacyPolicyChangelogPage.tsx'),
  'utf8'
);
const privacyDashboardAlertSource = readFileSync(
  resolve(process.cwd(), 'client/src/components/patient/PrivacyPolicyUpdateAlert.tsx'),
  'utf8'
);

describe('تكامل CMS لصفحات التفاصيل', () => {
  it('يبقي نصوص صفحة تفاصيل العرض قابلة للإدارة عبر مفاتيح CMS', () => {
    expect(offerDetailSource).toContain('offers.detail.hero.badge.${language}');
    expect(offerDetailSource).toContain('offers.detail.included.title.${language}');
    expect(offerDetailSource).toContain('offers.detail.form.submit.${language}');
    expect(offerDetailSource).toContain('offers.detail.contact.whatsapp.message.${language}');
    expect(offerDetailSource).toContain('offers.detail.alert.success.${language}');
    expect(offerDetailSource).toContain('offers.detail.alert.phone.${language}');
    expect(offerDetailSource).toContain('trpc.offers.getBySlug.useQuery');
  });

  it('ينقل النصوص الثابتة في صفحة تفاصيل المخيم إلى محتوى الصفحة المنشور', () => {
    expect(campDetailSource).toContain("usePublicPageContent('camps', language)");
    expect(campDetailSource).toContain('camps.detail.${key}.${language}');
    expect(campDetailSource).toContain("detailText('form.submit', 'تسجيل في المخيم مجاناً')");
    expect(campDetailSource).toContain("'contact.whatsapp.message'");
    expect(campDetailSource).toContain("detailText('alert.success', 'تم تسجيلك بنجاح! سنتواصل معك قريباً')");
    expect(campDetailSource).toContain("detailText('alert.phone', 'رقم الهاتف غير صحيح')");
    expect(campDetailSource).toContain('trpc.camps.getBySlug.useQuery');
    expect(campDetailSource).toContain('trpc.campRegistrations.submit.useMutation');
  });

  it('يبقي نصوص صفحة الشكر قابلة للتحرير عبر محتوى الصفحة المنشور', () => {
    expect(thankYouSource).toContain("usePublicPageContent('thankyou', language)");
    expect(thankYouSource).toContain('thankyou.${key}.${language}');
    expect(thankYouSource).toContain("thankYouText('details.title', 'تفاصيل الحجز')");
    expect(thankYouSource).toContain("thankYouText('next.step3', 'سنرسل لك رسالة تأكيد عبر الواتساب')");
    expect(thankYouSource).toContain("thankYouText('action.home', 'العودة للصفحة الرئيسية')");
    expect(thankYouSource).toContain('dir={language === \'ar\' ? \'rtl\' : \'ltr\'}');
  });

  it('ينقل كامل سياسة الخصوصية إلى محتوى الصفحة المنشور مع دعم العربية والإنجليزية', () => {
    expect(privacyPolicySource).toContain("usePublicPageContent('privacy', language)");
    expect(privacyPolicySource).toContain('privacy.${key}.${language}');
    expect(privacyPolicySource).toContain("t('rights.heading', '11. حقوقك بموجب نظام حماية البيانات الشخصية (PDPL)')");
    expect(privacyPolicySource).toContain("t('cookies.table.required', 'إلزامي؟')");
    expect(privacyPolicySource).toContain("t('contact.emailAddress', 'DPO@sghsanaa.net')");
    expect(privacyPolicySource).toContain("dir={copy.language === 'ar' ? 'rtl' : 'ltr'}");
  });

  it('يربط طلب موافقة سياسة الخصوصية بمفاتيح CMS وإصدار قابل للتحديث', () => {
    expect(privacyConsentSource).toContain("usePublicPageContent('privacy', language)");
    expect(privacyConsentSource).toContain('privacy.consent.${key}.${language}');
    expect(privacyConsentSource).toContain('PRIVACY_POLICY_VERSION');
    expect(privacyConsentSource).toContain('PRIVACY_POLICY_CONSENT_STORAGE_KEY');
    expect(privacyConsentSource).toContain('AnimatePresence');
    expect(privacyConsentSource).toContain('openPrivacyPreferences');
  });

  it('يعرض سجل تغييرات الخصوصية من مفاتيح CMS المنشورة', () => {
    expect(privacyChangelogSource).toContain("usePublicPageContent('privacy-changelog', language)");
    expect(privacyChangelogSource).toContain('privacy.changelog.${key}.${language}');
    expect(privacyChangelogSource).toContain("t('current.version', 'الإصدار 2026-03-01')");
    expect(privacyChangelogSource).toContain("t('previous.heading', 'الإصدارات السابقة')");
  });

  it('يوفر تنبيهاً داخل بوابة المستخدم لتحديثات سياسة الخصوصية', () => {
    expect(privacyDashboardAlertSource).toContain("usePublicPageContent('privacy', language)");
    expect(privacyDashboardAlertSource).toContain('privacy.dashboard.${key}.${language}');
    expect(privacyDashboardAlertSource).toContain('requiresPrivacyPolicyReview');
    expect(privacyDashboardAlertSource).toContain('openPrivacyPreferences');
  });
});
