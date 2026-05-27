import { 
  COMPANY_NAME,
  COMPANY_LOGO,
  COMPANY_ARABIC_NAME,
  COMPANY_ENGLISH_NAME,
  COMPANY_PHONE,
  COMPANY_EMAIL,
  FACEBOOK_URL,
  INSTAGRAM_URL,
  TWITTER_URL,
  LINKEDIN_URL,
  getCompanyName,
  getAppTitle,
  getContactInfo,
  getSocialMediaUrl,
  getSocialMediaUrls
} from "./config";

// Constants that should remain shared
export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = 'Please login (10001)';
export const NOT_ADMIN_ERR_MSG = 'You do not have required permission (10002)';

// Use centralized configuration
export const APP_TITLE = getAppTitle('ar');
export const APP_LOGO = COMPANY_LOGO;

// Re-export company info for easy access
export {
  COMPANY_NAME,
  COMPANY_ARABIC_NAME,
  COMPANY_ENGLISH_NAME,
  COMPANY_PHONE,
  COMPANY_EMAIL,
  FACEBOOK_URL,
  INSTAGRAM_URL,
  TWITTER_URL,
  LINKEDIN_URL
};

// Re-export helper functions
export {
  getCompanyName,
  getAppTitle,
  getContactInfo,
  getSocialMediaUrl,
  getSocialMediaUrls
};

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/oauth/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};

// Local authentication login URL
export const getLocalLoginUrl = () => {
  return "/admin-login";
};