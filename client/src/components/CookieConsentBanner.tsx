/**
 * Cookie Consent Banner - شريط موافقة ملفات تعريف الارتباط
 *
 * Compliant with:
 * - Meta/WhatsApp Business API requirements
 * - GDPR principles
 * - SGH Group privacy standards
 *
 * Cookie categories:
 * - Essential: Always enabled (session, security)
 * - Analytical: Traffic measurement and site improvement
 * - Marketing: Ads, Meta Pixel, retargeting
 */

import { useState, useEffect } from 'react';
import { Shield, ChevronDown, ChevronUp, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

export interface CookiePreferences {
  essential: boolean; // Always true
  analytical: boolean; // Google Analytics, etc.
  marketing: boolean; // Meta Pixel, WhatsApp tracking
}

import { SafeLocalStorage } from '../utils/errorHandling';

const COOKIE_CONSENT_KEY = 'sgh_cookie_consent';
const COOKIE_PREFS_KEY = 'sgh_cookie_preferences';

export function getCookiePreferences(): CookiePreferences {
  const stored = SafeLocalStorage.getItem(COOKIE_PREFS_KEY);
  if (stored) {
    const parsed = SafeLocalStorage.getJSON<CookiePreferences>(COOKIE_PREFS_KEY);
    if (parsed) {
      return parsed;
    }
  }
  return { essential: true, analytical: false, marketing: false };
}

export function hasConsentBeenGiven(): boolean {
  return SafeLocalStorage.getItem(COOKIE_CONSENT_KEY) === 'true';
}

export function saveCookiePreferences(prefs: CookiePreferences): void {
  SafeLocalStorage.setJSON(COOKIE_PREFS_KEY, { ...prefs, essential: true });
  SafeLocalStorage.setItem(COOKIE_CONSENT_KEY, 'true');
  // Dispatch event so other components can react
  window.dispatchEvent(new CustomEvent('cookieConsentUpdated', { detail: prefs }));
}

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [prefs, setPrefs] = useState<CookiePreferences>({
    essential: true,
    analytical: false,
    marketing: false,
  });

  useEffect(() => {
    // Show banner only if consent hasn't been given yet
    if (!hasConsentBeenGiven()) {
      // Small delay for better UX
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const allPrefs: CookiePreferences = { essential: true, analytical: true, marketing: true };
    setPrefs(allPrefs);
    saveCookiePreferences(allPrefs);
    setVisible(false);
  };

  const handleSaveSelection = () => {
    saveCookiePreferences({ ...prefs, essential: true });
    setVisible(false);
  };

  const handleRejectAll = () => {
    const minimalPrefs: CookiePreferences = {
      essential: true,
      analytical: false,
      marketing: false,
    };
    saveCookiePreferences(minimalPrefs);
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4"
      dir="rtl"
      role="dialog"
      aria-label="إعدادات ملفات تعريف الارتباط"
    >
      <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-green-100 bg-white shadow-2xl ring-1 ring-black/5 dark:border-green-900/50 dark:bg-gray-900">
        {/* Header */}
        <div className="flex items-center justify-between bg-gradient-to-l from-brand-green to-status-success px-4 py-3 text-brand-green-foreground sm:px-5">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span className="font-semibold text-sm sm:text-base">تفضيلات ملفات تعريف الارتباط</span>
          </div>
          <button
            onClick={handleRejectAll}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-green-100 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="رفض الكل وإغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 sm:px-5 py-3 sm:py-4">
          <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            نستخدم ملفات تعريف الارتباط لتحسين تجربتك وقياس أداء خدماتنا. اختر ما تسمح به، أو اقبل
            الكل للحصول على أفضل تجربة.{' '}
            <Link href="/privacy-policy">
              <span className="cursor-pointer font-medium text-brand-green underline transition-colors hover:text-brand-green/80">
                سياسة الخصوصية
              </span>
            </Link>
          </p>

          {/* Toggle detailed settings */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 inline-flex min-h-11 items-center gap-1 rounded-lg px-2 text-sm font-medium text-brand-green transition-colors hover:bg-status-success-subtle hover:text-brand-green/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green"
            aria-expanded={expanded}
            aria-controls="cookie-preferences-details"
          >
            {expanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
            <span>{expanded ? 'إخفاء التفاصيل' : 'إدارة التفضيلات'}</span>
          </button>

          {/* Detailed settings */}
          {expanded && (
            <div
              id="cookie-preferences-details"
              className="mt-3 space-y-3 border-t border-gray-100 pt-3 dark:border-gray-800"
            >
              {/* Essential */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    الأساسية (مطلوبة دائماً)
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    تشغيل الموقع، الجلسات، الأمان. لا يمكن تعطيلها.
                  </p>
                </div>
                <div className="mt-0.5 flex h-11 w-12 items-center justify-center rounded-full bg-status-success shrink-0">
                  <Check className="w-3 h-3 text-white" />
                </div>
              </div>

              {/* Analytical */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    التحليلية
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    قياس حركة المرور وتحسين الموقع (Google Analytics).
                  </p>
                </div>
                <button
                  onClick={() => setPrefs((p) => ({ ...p, analytical: !p.analytical }))}
                  className={`relative mt-0.5 h-11 w-12 rounded-full transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 ${
                    prefs.analytical ? 'bg-status-success' : 'bg-muted'
                  }`}
                  role="switch"
                  aria-checked={prefs.analytical}
                >
                  <span
                    className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow transition-all ${
                      prefs.analytical ? 'right-1.5' : 'left-1.5'
                    }`}
                  />
                </button>
              </div>

              {/* Marketing */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    التسويقية
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    الإعلانات وإعادة الاستهداف (Meta Pixel، واتساب).
                  </p>
                </div>
                <button
                  onClick={() => setPrefs((p) => ({ ...p, marketing: !p.marketing }))}
                  className={`relative mt-0.5 h-11 w-12 rounded-full transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 ${
                    prefs.marketing ? 'bg-status-success' : 'bg-muted'
                  }`}
                  role="switch"
                  aria-checked={prefs.marketing}
                >
                  <span
                    className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow transition-all ${
                      prefs.marketing ? 'right-1.5' : 'left-1.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-4 sm:px-5 pb-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            onClick={handleAcceptAll}
            className="min-h-11 flex-1 bg-brand-green text-sm text-brand-green-foreground hover:bg-brand-green/90"
          >
            قبول الكل
          </Button>
          {expanded && (
            <Button
              onClick={handleSaveSelection}
              variant="outline"
              className="min-h-11 flex-1 border-brand-green text-sm text-brand-green hover:bg-status-success-subtle"
            >
              حفظ الاختيار
            </Button>
          )}
          <Button
            onClick={handleRejectAll}
            variant="outline"
            className="min-h-11 flex-1 border-gray-300 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            الأساسية فقط
          </Button>
        </div>
      </div>
    </div>
  );
}
