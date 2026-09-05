/**
 * Client-side Configuration
 *
 * Centralized configuration for BOCAM client application.
 * Uses Vite's import.meta.env for environment variables.
 * This file is safe to use in the browser.
 */

/**
 * Company Information
 * Company-related configuration and branding
 */

const runtimeTenant =
  ((globalThis as Record<string, unknown>)?.__BOCAM_TENANT__ as
    Record<string, string> | undefined) ?? {};

const readTenantValue = (key: string, fallback: string): string => {
  const value = runtimeTenant[key];
  return typeof value === 'string' && value.trim() ? value : fallback;
};

const readTenantThemeValue = (key: string, fallback: string): string => {
  const theme = (runtimeTenant as Record<string, unknown>).theme;
  const value = theme && typeof theme === 'object' ? (theme as Record<string, unknown>)[key] : null;
  return typeof value === 'string' && value.trim() ? value : fallback;
};

export const BRAND_PRIMARY_COLOR = readTenantThemeValue('primary', '#00A651');
export const BRAND_SECONDARY_COLOR = readTenantThemeValue('secondary', '#0088CC');

/**
 * Company name (English)
 * Safe default only when no tenant runtime config is available.
 */
export const COMPANY_NAME = readTenantValue(
  'companyName',
  readTenantValue('companyEnglishName', 'BOCAM')
);

/**
 * Company name (Arabic)
 * Safe default only when no tenant runtime config is available.
 */
export const COMPANY_ARABIC_NAME = readTenantValue('companyArabicName', 'BOCAM');

/**
 * Company name (English) - preferred for international contexts
 * Safe default only when no tenant runtime config is available.
 */
export const COMPANY_ENGLISH_NAME = readTenantValue('companyEnglishName', 'BOCAM');

/**
 * Company logo path
 */
export const COMPANY_LOGO = readTenantValue('companyLogo', '/tenant-assets/logo-color.png');

/**
 * Company phone number
 */
export const COMPANY_PHONE = readTenantValue('companyPhone', '');

/**
 * Company email address
 */
export const COMPANY_EMAIL = readTenantValue('companyEmail', '');

/**
 * Company physical address
 */
export const COMPANY_ADDRESS = readTenantValue('companyAddress', '');

export const COMPANY_CITY = readTenantValue('companyCity', '');

/**
 * Company slogan/tagline
 * Safe default only when no tenant runtime config is available.
 */
export const COMPANY_SLOGAN = readTenantValue('companySlogan', 'نظام إدارة متكامل');

export const COMPANY_SLOGAN_EN = readTenantValue('companySloganEn', 'Integrated management system');

/**
 * Privacy-policy version requiring a renewed visitor acknowledgement when changed.
 * Bump this value whenever a material policy update is published.
 */
export const PRIVACY_POLICY_VERSION = '2026-03-01';

/**
 * Social Media URLs
 * External social media links
 */

/**
 * Facebook page URL
 */
export const FACEBOOK_URL = readTenantValue('facebookUrl', '');

/**
 * Instagram profile URL
 */
export const INSTAGRAM_URL = readTenantValue('instagramUrl', '');

/**
 * Twitter/X profile URL
 */
export const TWITTER_URL = readTenantValue('twitterUrl', '');

/**
 * LinkedIn company page URL
 */
export const LINKEDIN_URL = readTenantValue('linkedinUrl', '');

/**
 * Meta Pixel Configuration
 * Facebook/Meta tracking and analytics
 */

/**
 * Meta Pixel ID for tracking
 */
export const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID || '';

/**
 * OAuth Configuration
 * Authentication system integration
 */

/**
 * OAuth server URL
 */
export const OAUTH_SERVER_URL = import.meta.env.VITE_OAUTH_SERVER_URL || '';

/**
 * OAuth portal URL
 */
export const VITE_OAUTH_PORTAL_URL = import.meta.env.VITE_OAUTH_PORTAL_URL || '';

/**
 * Application ID for OAuth
 */
export const VITE_APP_ID = import.meta.env.VITE_APP_ID || '';

/**
 * Owner's OpenID
 */
export const OWNER_OPEN_ID = import.meta.env.VITE_OWNER_OPEN_ID || '';

/**
 * Owner's name
 */
export const OWNER_NAME = import.meta.env.VITE_OWNER_NAME || '';

/**
 * Helper Functions
 * Utility functions for accessing configuration
 */

/**
 * Get company name based on language
 */
export function getCompanyName(lang: 'ar' | 'en' = 'ar'): string {
  return lang === 'ar' ? COMPANY_ARABIC_NAME : COMPANY_ENGLISH_NAME;
}

/**
 * Get app title based on language
 */
export function getAppTitle(lang: 'ar' | 'en' = 'ar'): string {
  const arabicTitle = COMPANY_ARABIC_NAME;
  const englishTitle = COMPANY_ENGLISH_NAME;
  return lang === 'ar' ? arabicTitle : englishTitle;
}

/**
 * Get contact information
 */
export function getContactInfo(): {
  phone: string;
  email: string;
  address: string;
} {
  return {
    phone: COMPANY_PHONE,
    email: COMPANY_EMAIL,
    address: COMPANY_ADDRESS,
  };
}

/**
 * Get social media URL by platform
 */
export function getSocialMediaUrl(
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin'
): string {
  const urls = {
    facebook: FACEBOOK_URL,
    instagram: INSTAGRAM_URL,
    twitter: TWITTER_URL,
    linkedin: LINKEDIN_URL,
  };
  return urls[platform] || '';
}

/**
 * Get all social media URLs
 */
export function getSocialMediaUrls(): {
  facebook: string;
  instagram: string;
  twitter: string;
  linkedin: string;
} {
  return {
    facebook: FACEBOOK_URL,
    instagram: INSTAGRAM_URL,
    twitter: TWITTER_URL,
    linkedin: LINKEDIN_URL,
  };
}

/**
 * Get company slogan
 */
export function getCompanySlogan(): string {
  return COMPANY_SLOGAN;
}
