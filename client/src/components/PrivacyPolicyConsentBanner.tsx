import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePublicPageContent } from '@/hooks/usePublicContent';
import { PRIVACY_POLICY_VERSION } from '@/config';
import { SafeLocalStorage } from '@/utils/errorHandling';

type PublicPageTextContent = {
  key: string;
  content: string;
};

type PrivacyConsentRecord = {
  version: string;
  acceptedAt: string;
};

export const PRIVACY_POLICY_CONSENT_STORAGE_KEY = 'sgh_privacy_policy_consent';

export function hasAcceptedPrivacyPolicy(version = PRIVACY_POLICY_VERSION): boolean {
  const record = SafeLocalStorage.getJSON<PrivacyConsentRecord>(PRIVACY_POLICY_CONSENT_STORAGE_KEY);
  return record?.version === version;
}

export function savePrivacyPolicyConsent(version = PRIVACY_POLICY_VERSION): void {
  SafeLocalStorage.setJSON<PrivacyConsentRecord>(PRIVACY_POLICY_CONSENT_STORAGE_KEY, {
    version,
    acceptedAt: new Date().toISOString(),
  });

  window.dispatchEvent(
    new CustomEvent('privacyPolicyConsentUpdated', {
      detail: { version },
    })
  );
}

export function isPublicVisitorPath(path: string): boolean {
  return (
    !path.startsWith('/admin') && !path.startsWith('/activation') && !path.startsWith('/preview')
  );
}

export default function PrivacyPolicyConsentBanner() {
  const { language } = useLanguage();
  const [location] = useLocation();
  const [visible, setVisible] = useState(false);
  const pageContentQuery = usePublicPageContent('privacy', language) as {
    data?: { textContents: PublicPageTextContent[] };
  };
  const isPublicVisitor = isPublicVisitorPath(location);
  const isPrivacyPolicyPage = location === '/privacy-policy';
  const t = (key: string, fallback: string) =>
    pageContentQuery.data?.textContents.find(
      (item) => item.key === `privacy.consent.${key}.${language}`
    )?.content || fallback;

  useEffect(() => {
    if (!isPublicVisitor || isPrivacyPolicyPage || hasAcceptedPrivacyPolicy()) {
      setVisible(false);
      return;
    }

    const timer = window.setTimeout(() => setVisible(true), 650);
    return () => window.clearTimeout(timer);
  }, [isPublicVisitor, isPrivacyPolicyPage, location]);

  const handleAccept = () => {
    savePrivacyPolicyConsent();
    setVisible(false);
  };

  if (!isPublicVisitor || isPrivacyPolicyPage || !visible) {
    return null;
  }

  return (
    <aside
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto w-auto max-w-xl sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-[30rem]"
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      role="dialog"
      aria-labelledby="privacy-consent-title"
      aria-describedby="privacy-consent-description"
    >
      <div className="overflow-hidden rounded-xl border border-green-200 bg-white shadow-2xl">
        <div className="flex items-center gap-2 bg-green-700 px-4 py-3 text-white">
          <ShieldCheck className="h-5 w-5 shrink-0" aria-hidden="true" />
          <h2 id="privacy-consent-title" className="text-sm font-semibold sm:text-base">
            {t('title', 'تحديث سياسة الخصوصية')}
          </h2>
        </div>
        <div className="space-y-3 px-4 py-4">
          <p id="privacy-consent-description" className="text-sm leading-relaxed text-gray-700">
            {t(
              'description',
              'نرجو مراجعة سياسة الخصوصية المحدثة والموافقة عليها قبل متابعة استخدام خدماتنا الرقمية.'
            )}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button
              onClick={handleAccept}
              className="min-h-10 flex-1 bg-green-700 text-sm text-white hover:bg-green-800"
            >
              {t('accept', 'أوافق على سياسة الخصوصية')}
            </Button>
            <Button
              asChild
              variant="outline"
              className="min-h-10 flex-1 border-green-700 text-sm text-green-700 hover:bg-green-50"
            >
              <Link href="/privacy-policy">{t('readPolicy', 'قراءة سياسة الخصوصية')}</Link>
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
