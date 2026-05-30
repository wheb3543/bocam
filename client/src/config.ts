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

/**
 * Company name (English)
 */
export const COMPANY_NAME = import.meta.env.VITE_COMPANY_NAME || 'App';

/**
 * Company name (Arabic)
 */
export const COMPANY_ARABIC_NAME = import.meta.env.VITE_COMPANY_ARABIC_NAME || 'تطبيق';

/**
 * Company name (English) - preferred for international contexts
 */
export const COMPANY_ENGLISH_NAME = import.meta.env.VITE_COMPANY_ENGLISH_NAME || 'App';

/**
 * Company logo path
 */
export const COMPANY_LOGO = import.meta.env.VITE_COMPANY_LOGO || '/logos/default.png';

/**
 * Company phone number
 */
export const COMPANY_PHONE = import.meta.env.VITE_COMPANY_PHONE || '';

/**
 * Company email address
 */
export const COMPANY_EMAIL = import.meta.env.VITE_COMPANY_EMAIL || '';

/**
 * Company physical address
 */
export const COMPANY_ADDRESS = import.meta.env.VITE_COMPANY_ADDRESS || '';

/**
 * Company slogan/tagline
 */
export const COMPANY_SLOGAN = import.meta.env.VITE_COMPANY_SLOGAN || 'نرعاكم كأهالينا';

/**
 * Social Media URLs
 * External social media links
 */

/**
 * Facebook page URL
 */
export const FACEBOOK_URL = import.meta.env.VITE_FACEBOOK_URL || '';

/**
 * Instagram profile URL
 */
export const INSTAGRAM_URL = import.meta.env.VITE_INSTAGRAM_URL || '';

/**
 * Twitter/X profile URL
 */
export const TWITTER_URL = import.meta.env.VITE_TWITTER_URL || '';

/**
 * LinkedIn company page URL
 */
export const LINKEDIN_URL = import.meta.env.VITE_LINKEDIN_URL || '';

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
  const arabicTitle = `${COMPANY_ARABIC_NAME} `;
  const englishTitle = `${COMPANY_ENGLISH_NAME} `;
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
export function getSocialMediaUrl(platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin'): string {
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
