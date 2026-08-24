import { useEffect, useState } from 'react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
export const PRIVACY_PREFERENCES_OPEN_EVENT = 'privacyPreferencesRequested';
export const PRIVACY_POLICY_CONSENT_RESET_EVENT = 'privacyPolicyConsentReset';

export function getPrivacyPolicyConsent(): PrivacyConsentRecord | null {
  return SafeLocalStorage.getJSON<PrivacyConsentRecord>(PRIVACY_POLICY_CONSENT_STORAGE_KEY);
}

export function hasAcceptedPrivacyPolicy(version = PRIVACY_POLICY_VERSION): boolean {
  return getPrivacyPolicyConsent()?.version === version;
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

export function clearPrivacyPolicyConsent(): void {
  SafeLocalStorage.removeItem(PRIVACY_POLICY_CONSENT_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(PRIVACY_POLICY_CONSENT_RESET_EVENT));
}

export function openPrivacyPreferences(): void {
  window.dispatchEvent(new CustomEvent(PRIVACY_PREFERENCES_OPEN_EVENT));
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
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [consentRecord, setConsentRecord] = useState<PrivacyConsentRecord | null>(null);
  const reduceMotion = useReducedMotion();
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
    let timer: number | undefined;
    const revealConsent = () => {
      if (!isPublicVisitor || isPrivacyPolicyPage || hasAcceptedPrivacyPolicy()) {
        setVisible(false);
        return;
      }
      timer = window.setTimeout(() => setVisible(true), 650);
    };
    const openPreferences = () => {
      setConsentRecord(getPrivacyPolicyConsent());
      setPreferencesOpen(true);
    };

    revealConsent();
    window.addEventListener(PRIVACY_PREFERENCES_OPEN_EVENT, openPreferences);
    window.addEventListener(PRIVACY_POLICY_CONSENT_RESET_EVENT, revealConsent);

    return () => {
      if (timer) {
        window.clearTimeout(timer);
      }
      window.removeEventListener(PRIVACY_PREFERENCES_OPEN_EVENT, openPreferences);
      window.removeEventListener(PRIVACY_POLICY_CONSENT_RESET_EVENT, revealConsent);
    };
  }, [isPublicVisitor, isPrivacyPolicyPage, location]);

  const handleAccept = () => {
    savePrivacyPolicyConsent();
    setConsentRecord(getPrivacyPolicyConsent());
    setVisible(false);
  };

  const handleRevoke = () => {
    clearPrivacyPolicyConsent();
    setConsentRecord(null);
    setPreferencesOpen(false);
  };

  const handleManageAccept = () => {
    savePrivacyPolicyConsent();
    setConsentRecord(getPrivacyPolicyConsent());
    setVisible(false);
  };

  if (!isPublicVisitor) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {visible && !isPrivacyPolicyPage && (
          <motion.aside
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.98 }}
            animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: reduceMotion ? 0.15 : 0.28, ease: 'easeOut' }}
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
                <p
                  id="privacy-consent-description"
                  className="text-sm leading-relaxed text-gray-700"
                >
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
          </motion.aside>
        )}
      </AnimatePresence>

      <Dialog open={preferencesOpen} onOpenChange={setPreferencesOpen}>
        <DialogContent dir={language === 'ar' ? 'rtl' : 'ltr'} className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('manageTitle', 'إدارة الخصوصية')}</DialogTitle>
            <DialogDescription className="leading-relaxed">
              {t(
                'manageDescription',
                'يمكنك مراجعة قرارك الحالي أو تحديثه. إزالة الموافقة ستعيد عرض طلب الموافقة في الزيارة الحالية.'
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border border-green-100 bg-green-50 p-3 text-sm text-green-900">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-700" aria-hidden="true" />
              <div>
                <p className="font-semibold">
                  {consentRecord
                    ? t('manageAccepted', 'تم قبول الإصدار الحالي من سياسة الخصوصية.')
                    : t('managePending', 'لم يُسجّل قبول للإصدار الحالي بعد.')}
                </p>
                {consentRecord && (
                  <p className="mt-1 text-xs text-green-800">
                    {t('manageVersionPrefix', 'الإصدار:')} {consentRecord.version}
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={handleRevoke}
              className="border-red-200 text-red-700 hover:bg-red-50"
            >
              {t('manageRevoke', 'إزالة الموافقة')}
            </Button>
            <Button onClick={handleManageAccept} className="bg-green-700 hover:bg-green-800">
              {t('manageAccept', 'اعتماد الإصدار الحالي')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
