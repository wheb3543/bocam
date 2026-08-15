import {
  COMPANY_NAME,
  COMPANY_ARABIC_NAME,
  COMPANY_ENGLISH_NAME,
  COMPANY_LOGO,
  COMPANY_PHONE,
  COMPANY_EMAIL,
  COMPANY_ADDRESS,
  FACEBOOK_URL,
  INSTAGRAM_URL,
  TWITTER_URL,
  LINKEDIN_URL,
  META_PIXEL_ID,
  META_ACCESS_TOKEN,
  META_TEST_EVENT_CODE,
  WHATSAPP_PHONE_NUMBER_ID,
  WHATSAPP_BUSINESS_ACCOUNT_ID,
  WHATSAPP_WEBHOOK_VERIFY_TOKEN,
  EMAIL_SERVICE,
  EMAIL_API_KEY,
  EMAIL_FROM,
  EMAIL_FROM_NAME,
  SMS_SERVICE,
  SMS_API_KEY,
  SMS_API_SECRET,
  SMS_PHONE_NUMBER,
  DATABASE_URL,
  DB_HOST,
  DB_PORT,
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
  HOSPITAL_DB_URL,
  HOSPITAL_DB_HOST,
  HOSPITAL_DB_PORT,
  HOSPITAL_DB_NAME,
  HOSPITAL_DB_USER,
  HOSPITAL_DB_PASSWORD,
  FILE_UPLOAD_BASE_URL,
  FILE_UPLOAD_PATH,
  JWT_SECRET,
  OAUTH_SERVER_URL,
  OWNER_OPEN_ID,
  OWNER_NAME,
  IS_PRODUCTION,
  IS_DEVELOPMENT,
  MOCK_MODE,
  MOCK_WHATSAPP,
  MOCK_SMS,
  MOCK_EMAIL,
  MOCK_META_PIXEL,
  MOCK_LOGGING,
  MOCK_LOG_LEVEL,
  REDIS_URL,
  GOOGLE_ANALYTICS_ID,
  validateEnv,
} from '@shared/config';

// Initialize environment validation
// Call this once at application startup
validateEnv();

export const ENV = {
  // Company Information
  companyName: COMPANY_NAME,
  companyArabicName: COMPANY_ARABIC_NAME,
  companyEnglishName: COMPANY_ENGLISH_NAME,
  companyLogo: COMPANY_LOGO,
  companyPhone: COMPANY_PHONE,
  companyEmail: COMPANY_EMAIL,
  companyAddress: COMPANY_ADDRESS,

  // Social Media
  facebookUrl: FACEBOOK_URL,
  instagramUrl: INSTAGRAM_URL,
  twitterUrl: TWITTER_URL,
  linkedinUrl: LINKEDIN_URL,

  // Meta (Facebook / Instagram / WhatsApp)
  /**
   * التوكن الموحد لجميع خدمات Meta.
   * ⚠️  لا تستخدم META_ACCESS_TOKEN مباشرة في كود الخادم.
   *     استخدم MetaApiService: import { meta } from '../MetaApiService';
   *     أو ENV.metaAccessToken هنا فقط للتحقق من وجود التوكن.
   */
  metaAccessToken: META_ACCESS_TOKEN,
  whatsappPhoneNumberId: WHATSAPP_PHONE_NUMBER_ID,
  whatsappBusinessAccountId: WHATSAPP_BUSINESS_ACCOUNT_ID,
  instagramBusinessAccountId: process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID ?? '',
  facebookPageId: process.env.FACEBOOK_PAGE_ID ?? '',
  metaPixelId: META_PIXEL_ID,
  metaTestEventCode: META_TEST_EVENT_CODE,
  webhookVerifyToken: WHATSAPP_WEBHOOK_VERIFY_TOKEN,

  // Email Service
  emailService: EMAIL_SERVICE,
  emailApiKey: EMAIL_API_KEY,
  emailFrom: EMAIL_FROM,
  emailFromName: EMAIL_FROM_NAME,

  // SMS Service
  smsService: SMS_SERVICE,
  smsApiKey: SMS_API_KEY,
  smsApiSecret: SMS_API_SECRET,
  smsPhoneNumber: SMS_PHONE_NUMBER,

  // Database Configuration
  databaseUrl: DATABASE_URL,
  dbHost: DB_HOST,
  dbPort: DB_PORT,
  dbName: DB_NAME,
  dbUser: DB_USER,
  dbPassword: DB_PASSWORD,

  // Hospital Database Configuration
  hospitalDbUrl: HOSPITAL_DB_URL,
  hospitalDbHost: HOSPITAL_DB_HOST,
  hospitalDbPort: HOSPITAL_DB_PORT,
  hospitalDbName: HOSPITAL_DB_NAME,
  hospitalDbUser: HOSPITAL_DB_USER,
  hospitalDbPassword: HOSPITAL_DB_PASSWORD,

  // File Upload Configuration
  fileUploadBaseUrl: FILE_UPLOAD_BASE_URL,
  fileUploadPath: FILE_UPLOAD_PATH,

  // OAuth Configuration
  appId: process.env.META_APP_ID ?? process.env.VITE_APP_ID ?? '',
  cookieSecret: JWT_SECRET,
  oAuthServerUrl: OAUTH_SERVER_URL,
  ownerOpenId: OWNER_OPEN_ID,
  ownerName: OWNER_NAME,

  // Environment
  isProduction: IS_PRODUCTION,
  isDevelopment: IS_DEVELOPMENT,
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? '',
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? '',

  // Mocking Mode
  mockMode: MOCK_MODE,
  mockWhatsApp: MOCK_WHATSAPP,
  mockSMS: MOCK_SMS,
  mockEmail: MOCK_EMAIL,
  mockMetaPixel: MOCK_META_PIXEL,
  mockLogging: MOCK_LOGGING,
  mockLogLevel: MOCK_LOG_LEVEL,

  // Additional Services
  redisUrl: REDIS_URL,
  googleAnalyticsId: GOOGLE_ANALYTICS_ID,
};
