import { SafeLocalStorage } from '@/utils/errorHandling';

export interface CookiePreferences {
  essential: boolean;
  analytical: boolean;
  marketing: boolean;
}

export const COOKIE_CONSENT_KEY = 'sgh_cookie_consent';
export const COOKIE_PREFS_KEY = 'sgh_cookie_preferences';

export function getCookiePreferences(): CookiePreferences {
  return (
    SafeLocalStorage.getJSON<CookiePreferences>(COOKIE_PREFS_KEY) || {
      essential: true,
      analytical: false,
      marketing: false,
    }
  );
}

export function hasCookieConsentBeenGiven(): boolean {
  return SafeLocalStorage.getItem(COOKIE_CONSENT_KEY) === 'true';
}

export function saveCookiePreferences(prefs: CookiePreferences): void {
  const normalized = { ...prefs, essential: true };
  SafeLocalStorage.setJSON(COOKIE_PREFS_KEY, normalized);
  SafeLocalStorage.setItem(COOKIE_CONSENT_KEY, 'true');
  window.dispatchEvent(new CustomEvent('cookieConsentUpdated', { detail: normalized }));
}
