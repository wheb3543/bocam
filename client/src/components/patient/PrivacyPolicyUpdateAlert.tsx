import { useEffect, useState } from 'react';
import { AlertTriangle, ArrowLeft, ShieldCheck } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePublicPageContent } from '@/hooks/usePublicContent';
import { PRIVACY_POLICY_VERSION } from '@/config';
import {
  hasAcceptedPrivacyPolicy,
  openPrivacyPreferences,
  PRIVACY_POLICY_CONSENT_RESET_EVENT,
} from '@/components/PrivacyPolicyConsentBanner';

type PublicPageTextContent = {
  key: string;
  content: string;
};

export function requiresPrivacyPolicyReview(): boolean {
  return !hasAcceptedPrivacyPolicy();
}

export default function PrivacyPolicyUpdateAlert() {
  const { language } = useLanguage();
  const [requiresReview, setRequiresReview] = useState(requiresPrivacyPolicyReview);
  const pageContentQuery = usePublicPageContent('privacy', language) as {
    data?: { textContents: PublicPageTextContent[] };
  };
  const t = (key: string, fallback: string) =>
    pageContentQuery.data?.textContents.find(
      (item) => item.key === `privacy.dashboard.${key}.${language}`
    )?.content || fallback;

  useEffect(() => {
    const syncReviewState = () => setRequiresReview(requiresPrivacyPolicyReview());
    window.addEventListener('privacyPolicyConsentUpdated', syncReviewState);
    window.addEventListener(PRIVACY_POLICY_CONSENT_RESET_EVENT, syncReviewState);
    return () => {
      window.removeEventListener('privacyPolicyConsentUpdated', syncReviewState);
      window.removeEventListener(PRIVACY_POLICY_CONSENT_RESET_EVENT, syncReviewState);
    };
  }, []);

  if (!requiresReview) {
    return null;
  }

  return (
    <section
      className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm sm:mb-6 sm:p-5"
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      role="alert"
      aria-labelledby="privacy-update-alert-title"
    >
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h2
              id="privacy-update-alert-title"
              className="text-sm font-bold text-amber-950 sm:text-base"
            >
              {t('title', 'تحديث مهم لسياسة الخصوصية')}
            </h2>
            <span className="text-xs font-medium text-amber-800">
              {t('versionPrefix', 'الإصدار')} {PRIVACY_POLICY_VERSION}
            </span>
          </div>
          <p className="mt-1 text-xs leading-6 text-amber-900 sm:text-sm">
            {t(
              'description',
              'نشرنا تحديثاً جوهرياً. يرجى مراجعة سجل التغييرات وتأكيد اختيارات الخصوصية لمواصلة الاستفادة من خدمات البوابة.'
            )}
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              asChild
              size="sm"
              variant="outline"
              className="border-amber-300 bg-white text-amber-900 hover:bg-amber-100"
            >
              <Link href="/privacy-policy-changelog">
                {t('reviewChanges', 'مراجعة التغييرات')}
                <ArrowLeft className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              size="sm"
              onClick={openPrivacyPreferences}
              className="bg-green-700 hover:bg-green-800"
            >
              <ShieldCheck className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
              {t('manage', 'إدارة الخصوصية')}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
