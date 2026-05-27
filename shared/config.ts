/**
 * Application Configuration
 * 
 * Centralized configuration management for BOCAM application.
 * Reads all configuration from environment variables and provides
 * type-safe access throughout the application.
 * 
 * @module config
 * @description Provides centralized configuration management
 */

/**
 * Company Information
 * Company-related configuration and branding
 */

/**
 * Company name (English)
 */
export const COMPANY_NAME = process.env.COMPANY_NAME || 'App';

/**
 * Company name (Arabic)
 */
export const COMPANY_ARABIC_NAME = process.env.COMPANY_ARABIC_NAME || 'تطبيق';

/**
 * Company name (English) - preferred for international contexts
 */
export const COMPANY_ENGLISH_NAME = process.env.COMPANY_ENGLISH_NAME || 'App';

/**
 * Company logo path
 */
export const COMPANY_LOGO = process.env.COMPANY_LOGO || '/logos/default.png';

/**
 * Company phone number
 */
export const COMPANY_PHONE = process.env.COMPANY_PHONE || '';

/**
 * Company email address
 */
export const COMPANY_EMAIL = process.env.COMPANY_EMAIL || '';

/**
 * Company physical address
 */
export const COMPANY_ADDRESS = process.env.COMPANY_ADDRESS || '';

/**
 * Social Media URLs
 * External social media links
 */

/**
 * Facebook page URL
 */
export const FACEBOOK_URL = process.env.FACEBOOK_URL || '';

/**
 * Instagram profile URL
 */
export const INSTAGRAM_URL = process.env.INSTAGRAM_URL || '';

/**
 * Twitter/X profile URL
 */
export const TWITTER_URL = process.env.TWITTER_URL || '';

/**
 * LinkedIn company page URL
 */
export const LINKEDIN_URL = process.env.LINKEDIN_URL || '';

/**
 * Meta Pixel Configuration
 * Facebook/Meta tracking and analytics
 */

/**
 * Meta Pixel ID for tracking
 */
export const META_PIXEL_ID = process.env.META_PIXEL_ID || '';

/**
 * Meta Access Token for API calls
 */
export const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || '';

/**
 * Meta Test Event Code for testing
 */
export const META_TEST_EVENT_CODE = process.env.META_TEST_EVENT_CODE || '';

/**
 * WhatsApp Configuration
 * WhatsApp Business API integration
 */

/**
 * WhatsApp Access Token for API authentication
 */
export const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || '';

/**
 * WhatsApp Phone Number ID
 */
export const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '';

/**
 * WhatsApp Business Account ID
 */
export const WHATSAPP_BUSINESS_ACCOUNT_ID = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '';

/**
 * WhatsApp Webhook Verify Token
 */
export const WHATSAPP_WEBHOOK_VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || '';

/**
 * Email Service Configuration
 * Email delivery service integration
 */

/**
 * Email service provider (e.g., sendgrid, mailgun)
 */
export const EMAIL_SERVICE = process.env.EMAIL_SERVICE || '';

/**
 * Email API key for authentication
 */
export const EMAIL_API_KEY = process.env.EMAIL_API_KEY || '';

/**
 * Default sender email address
 */
export const EMAIL_FROM = process.env.EMAIL_FROM || '';

/**
 * Default sender name
 */
export const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || '';

/**
 * SMS Service Configuration
 * SMS gateway integration
 */

/**
 * SMS service provider (e.g., twilio, nexmo)
 */
export const SMS_SERVICE = process.env.SMS_SERVICE || '';

/**
 * SMS API key for authentication
 */
export const SMS_API_KEY = process.env.SMS_API_KEY || '';

/**
 * SMS API secret for authentication
 */
export const SMS_API_SECRET = process.env.SMS_API_SECRET || '';

/**
 * SMS phone number for sending
 */
export const SMS_PHONE_NUMBER = process.env.SMS_PHONE_NUMBER || '';

/**
 * OAuth Configuration
 * Authentication system integration
 */

/**
 * OAuth server URL
 */
export const OAUTH_SERVER_URL = process.env.OAUTH_SERVER_URL || '';

/**
 * OAuth portal URL
 */
export const VITE_OAUTH_PORTAL_URL = process.env.VITE_OAUTH_PORTAL_URL || '';

/**
 * Application ID for OAuth
 */
export const VITE_APP_ID = process.env.VITE_APP_ID || '';

/**
 * Owner's OpenID
 */
export const OWNER_OPEN_ID = process.env.OWNER_OPEN_ID || '';

/**
 * Owner's name
 */
export const OWNER_NAME = process.env.OWNER_NAME || '';

/**
 * JWT secret for token signing
 */
export const JWT_SECRET = process.env.JWT_SECRET || '';

/**
 * Database Configuration
 * Database connection settings
 */

/**
 * Database URL (connection string)
 */
export const DATABASE_URL = process.env.DATABASE_URL || '';

/**
 * Database host
 */
export const DB_HOST = process.env.DB_HOST || 'localhost';

/**
 * Database port
 */
export const DB_PORT = process.env.DB_PORT || '3306';

/**
 * Database name
 */
export const DB_NAME = process.env.DB_NAME || 'sgh_crm';

/**
 * Database user
 */
export const DB_USER = process.env.DB_USER || 'root';

/**
 * Database password
 */
export const DB_PASSWORD = process.env.DB_PASSWORD || '';

/**
 * Server Configuration
 * Application server settings
 */

/**
 * Server port
 */
export const PORT = process.env.PORT || '3000';

/**
 * Node environment (development, production, test)
 */
export const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Is production environment
 */
export const IS_PRODUCTION = NODE_ENV === 'production';

/**
 * Is development environment
 */
export const IS_DEVELOPMENT = NODE_ENV === 'development';

/**
 * Is test environment
 */
export const IS_TEST = NODE_ENV === 'test';

/**
 * Mocking Configuration
 * Development mocking mode
 */

/**
 * Mocking mode enabled (development/test only)
 */
export const MOCK_MODE = process.env.MOCK_MODE === 'true' || IS_DEVELOPMENT || IS_TEST;

/**
 * Mock WhatsApp API
 */
export const MOCK_WHATSAPP = process.env.MOCK_WHATSAPP === 'true' || MOCK_MODE;

/**
 * Mock SMS API
 */
export const MOCK_SMS = process.env.MOCK_SMS === 'true' || MOCK_MODE;

/**
 * Mock Email API
 */
export const MOCK_EMAIL = process.env.MOCK_EMAIL === 'true' || MOCK_MODE;

/**
 * Mock Meta Pixel API
 */
export const MOCK_META_PIXEL = process.env.MOCK_META_PIXEL === 'true' || MOCK_MODE;

/**
 * Enable mock logging to console
 */
export const MOCK_LOGGING = process.env.MOCK_LOGGING === 'true' || IS_DEVELOPMENT;

/**
 * Mock log level (debug, info, warn, error)
 */
export const MOCK_LOG_LEVEL = process.env.MOCK_LOG_LEVEL || 'debug';

/**
 * Redis Configuration
 * Cache and queue service
 */

/**
 * Redis connection URL
 */
export const REDIS_URL = process.env.REDIS_URL || '';

/**
 * Analytics Configuration
 * Third-party analytics
 */

/**
 * Google Analytics ID
 */
export const GOOGLE_ANALYTICS_ID = process.env.GOOGLE_ANALYTICS_ID || '';

/**
 * Validation Functions
 * Environment variable validation
 */

/**
 * Validates all required environment variables are set
 * 
 * @throws {Error} When required environment variables are missing
 * @returns {void}
 * 
 * @example
 * ```typescript
 * import { validateEnv } from '@shared/config';
 * 
 * validateEnv(); // Throws if required vars are missing
 * ```
 */
export function validateEnv(): void {
  const required: Array<{
    key: string;
    description: string;
  }> = [
    {
      key: 'DATABASE_URL',
      description: 'Database connection string'
    },
    {
      key: 'JWT_SECRET',
      description: 'JWT secret for token signing (min 32 characters)'
    },
    {
      key: 'OAUTH_SERVER_URL',
      description: 'OAuth server URL'
    },
    {
      key: 'VITE_APP_ID',
      description: 'Application ID for OAuth'
    }
  ];

  const missing = required.filter(({ key }) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing
        .map(({ key, description }) => `- ${key}: ${description}`)
        .join('\n')}`
    );
  }

  // Validate JWT secret length
  const jwtSecret = process.env.JWT_SECRET;
  if (jwtSecret && jwtSecret.length < 32) {
    throw new Error(
      'JWT_SECRET must be at least 32 characters long for security'
    );
  }
}

/**
 * Gets display name based on language preference
 * 
 * @param language - Preferred language ('ar' for Arabic, otherwise English)
 * @returns Company display name
 * 
 * @example
 * ```typescript
 * import { getCompanyName } from '@shared/config';
 * 
 * getCompanyName('ar'); // Returns "المستشفى السعودي الألماني"
 * getCompanyName('en'); // Returns "Saudi German Hospital"
 * ```
 */
export function getCompanyName(language: 'ar' | 'en' = 'ar'): string {
  return language === 'ar' ? COMPANY_ARABIC_NAME : COMPANY_ENGLISH_NAME;
}

/**
 * Gets app title based on language preference
 * 
 * @param language - Preferred language ('ar' for Arabic, otherwise English)
 * @returns App title
 * 
 * @example
 * ```typescript
 * import { getAppTitle } from '@shared/config';
 * 
 * getAppTitle('ar'); // Returns "المستشفى السعودي الألماني - صنعاء"
 * getAppTitle('en'); // Returns "Saudi German Hospital - Sana'a"
 * ```
 */
export function getAppTitle(language: 'ar' | 'en' = 'ar'): string {
  const arabicTitle = `${COMPANY_ARABIC_NAME} - صنعاء`;
  const englishTitle = `${COMPANY_ENGLISH_NAME} - Sana'a`;
  return language === 'ar' ? arabicTitle : englishTitle;
}

/**
 * Checks if a social media URL is configured
 * 
 * @param platform - Social media platform ('facebook', 'instagram', 'twitter', 'linkedin')
 * @returns true if URL is configured and not empty
 * 
 * @example
 * ```typescript
 * import { hasSocialMedia } from '@shared/config';
 * 
 * if (hasSocialMedia('facebook')) {
 *   // Show Facebook link
 * }
 * ```
 */
export function hasSocialMedia(
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin'
): boolean {
  const urls: Record<string, string> = {
    facebook: FACEBOOK_URL,
    instagram: INSTAGRAM_URL,
    twitter: TWITTER_URL,
    linkedin: LINKEDIN_URL
  };

  return Boolean(urls[platform]);
}

/**
 * Gets social media URL for a platform
 * 
 * @param platform - Social media platform
 * @returns Social media URL or empty string if not configured
 * 
 * @example
 * ```typescript
 * import { getSocialMediaUrl } from '@shared/config';
 * 
 * const facebookUrl = getSocialMediaUrl('facebook');
 * ```
 */
export function getSocialMediaUrl(
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin'
): string {
  const urls: Record<string, string> = {
    facebook: FACEBOOK_URL,
    instagram: INSTAGRAM_URL,
    twitter: TWITTER_URL,
    linkedin: LINKEDIN_URL
  };

  return urls[platform] || '';
}

/**
 * Gets configured social media URLs
 * 
 * @returns Object with available social media URLs
 * 
 * @example
 * ```typescript
 * import { getSocialMediaUrls } from '@shared/config';
 * 
 * const socials = getSocialMediaUrls();
 * // { facebook: 'https://...', instagram: 'https://...', ... }
 * ```
 */
export function getSocialMediaUrls(): Record<
  'facebook' | 'instagram' | 'twitter' | 'linkedin',
  string
> {
  return {
    facebook: FACEBOOK_URL,
    instagram: INSTAGRAM_URL,
    twitter: TWITTER_URL,
    linkedin: LINKEDIN_URL
  };
}

/**
 * Validates if WhatsApp is properly configured
 * 
 * @returns true if WhatsApp has valid configuration
 */
export function isWhatsAppConfigured(): boolean {
  return Boolean(
    WHATSAPP_ACCESS_TOKEN &&
    WHATSAPP_PHONE_NUMBER_ID &&
    WHATSAPP_BUSINESS_ACCOUNT_ID
  );
}

/**
 * Validates if email service is properly configured
 * 
 * @returns true if email service has valid configuration
 */
export function isEmailConfigured(): boolean {
  return Boolean(EMAIL_SERVICE && EMAIL_API_KEY && EMAIL_FROM);
}

/**
 * Validates if SMS service is properly configured
 * 
 * @returns true if SMS service has valid configuration
 */
export function isSMSConfigured(): boolean {
  return Boolean(SMS_SERVICE && SMS_API_KEY && SMS_PHONE_NUMBER);
}

/**
 * Gets contact information for display
 * 
 * @returns Object with contact information
 */
export function getContactInfo(): {
  phone: string;
  email: string;
  address: string;
} {
  return {
    phone: COMPANY_PHONE,
    email: COMPANY_EMAIL,
    address: COMPANY_ADDRESS
  };
}
