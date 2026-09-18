import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  index,
  decimal,
  foreignKey,
  uniqueIndex,
  json,
} from 'drizzle-orm/mysql-core';

import { socialPublishDestinations } from './04-marketing-publishing';
import { users } from './07-users-rbac';

/**
 * Settings table - stores system configuration
 */
export const settings = mysqlTable('settings', {
  id: int('id').autoincrement().primaryKey(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  value: text('value'),
  description: text('description'),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = typeof settings.$inferInsert;

/**
 * Departments table - stores medical departments and clinics
 */

/**
 * Saved Searches table - stores saved search filters for conversations
 * جدول البحثات المحفوظة - يخزن فلاتر البحث المحفوظة للمحادثات
 */
export const savedSearches = mysqlTable('saved_searches', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('userId').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  searchQuery: varchar('searchQuery', { length: 500 }),
  filterType: varchar('filterType', { length: 50 }), // all, unread, important, archived, unnamed, unreplied
  dateRange: varchar('dateRange', { length: 50 }), // today, week, month, custom
  messageType: varchar('messageType', { length: 50 }),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export type SavedSearch = typeof savedSearches.$inferSelect;
export type InsertSavedSearch = typeof savedSearches.$inferInsert;

/**
 * Message Settings table - stores automated message configurations
 * جدول إعدادات الرسائل - يخزن إعدادات الرسائل التلقائية
 */

/** حالة انتقالات تنبيهات عمليات النظام لمنع التكرار وإظهار التعافي مرة واحدة. */
export const operationalAlertStates = mysqlTable(
  'operationalAlertStates',
  {
    id: int('id').autoincrement().primaryKey(),
    operationKey: varchar('operationKey', { length: 80 }).notNull().unique(),
    status: mysqlEnum('status', ['healthy', 'degraded']).default('healthy').notNull(),
    lastFailureAt: timestamp('lastFailureAt'),
    lastRecoveryAt: timestamp('lastRecoveryAt'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    operationKeyIdx: index('operational_alert_states_operation_key_idx').on(table.operationKey),
  })
);

/** إعداد Heartbeat لفحص التحديثات بدلاً من جدولة مؤقت داخل الذاكرة. */

/** إعداد Heartbeat لفحص التحديثات بدلاً من جدولة مؤقت داخل الذاكرة. */
export const updateCheckSchedules = mysqlTable(
  'updateCheckSchedules',
  {
    id: int('id').autoincrement().primaryKey(),
    enabled: mysqlEnum('enabled', ['yes', 'no']).default('yes').notNull(),
    scheduleCronTaskUid: varchar('scheduleCronTaskUid', { length: 65 }),
    lastRunAt: timestamp('lastRunAt'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    scheduleTaskUidIdx: index('update_check_schedule_task_uid_idx').on(table.scheduleCronTaskUid),
  })
);

/**
 * User Preferences table - stores user-specific preferences and settings
 * جدول تفضيلات المستخدم - يخزن إعدادات وتفضيلات كل مستخدم
 */

/**
 * User Preferences table - stores user-specific preferences and settings
 * جدول تفضيلات المستخدم - يخزن إعدادات وتفضيلات كل مستخدم
 */
export const userPreferences = mysqlTable(
  'userPreferences',
  {
    id: int('id').autoincrement().primaryKey(),
    userId: int('userId').notNull(),
    // Preference key (e.g., 'appointmentVisibleColumns', 'offerLeadVisibleColumns')
    preferenceKey: varchar('preferenceKey', { length: 100 }).notNull(),
    // Preference value (JSON string)
    preferenceValue: text('preferenceValue').notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userKeyIdx: index('userPreferences_userKey_idx').on(table.userId, table.preferenceKey),
    userKeyUnique: uniqueIndex('userPreferences_userKey_unique').on(
      table.userId,
      table.preferenceKey
    ),
  })
);

export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = typeof userPreferences.$inferInsert;

/**
 * جدول القوالب المشتركة للأعمدة - يخزن القوالب التي ينشئها المدير وتظهر لجميع المستخدمين
 */

/**
 * جدول القوالب المشتركة للأعمدة - يخزن القوالب التي ينشئها المدير وتظهر لجميع المستخدمين
 */
export const sharedColumnTemplates = mysqlTable(
  'sharedColumnTemplates',
  {
    id: int('id').autoincrement().primaryKey(),
    /** اسم القالب */
    name: varchar('name', { length: 100 }).notNull(),
    /** نوع الجدول: appointments, offerLeads, campRegistrations */
    tableKey: varchar('tableKey', { length: 50 }).notNull(),
    /** إعدادات الأعمدة المرئية (JSON) */
    columns: text('columns').notNull(),
    /** معرف المستخدم الذي أنشأ القالب (المدير) */
    createdBy: int('createdBy').notNull(),
    /** اسم المنشئ */
    createdByName: varchar('createdByName', { length: 255 }),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    tableKeyIdx: index('sharedColumnTemplates_tableKey_idx').on(table.tableKey),
  })
);

export type SharedColumnTemplate = typeof sharedColumnTemplates.$inferSelect;
export type InsertSharedColumnTemplate = typeof sharedColumnTemplates.$inferInsert;

/**
 * جدول سجل التغييرات - يتتبع جميع التغييرات على السجلات
 * Audit log table - tracks all changes to records
 */

/**
 * جدول سجل التغييرات - يتتبع جميع التغييرات على السجلات
 * Audit log table - tracks all changes to records
 */
export const auditLogs = mysqlTable(
  'auditLogs',
  {
    id: int('id').autoincrement().primaryKey(),
    /** نوع الكيان: appointment, offerLead, campRegistration, lead */
    entityType: varchar('entityType', { length: 50 }).notNull(),
    /** معرف الكيان */
    entityId: int('entityId').notNull(),
    /** نوع الإجراء: status_change, bulk_update, delete, create, update */
    action: varchar('action', { length: 50 }).notNull(),
    /** القيمة القديمة (JSON) */
    oldValue: text('oldValue'),
    /** القيمة الجديدة (JSON) */
    newValue: text('newValue'),
    /** معرف المستخدم الذي أجرى التغيير */
    userId: int('userId'),
    /** اسم المستخدم الذي أجرى التغيير */
    userName: varchar('userName', { length: 255 }),
    /** ملاحظات إضافية */
    notes: text('notes'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
  },
  (table) => ({
    entityIdx: index('auditLogs_entity_idx').on(table.entityType, table.entityId),
    actionIdx: index('auditLogs_action_idx').on(table.action),
    userIdx: index('auditLogs_user_idx').on(table.userId),
  })
);
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

/**
 * جدول الفلاتر المحفوظة - يخزن إعدادات الفلاتر المفضلة للمستخدمين
 * Saved filters table - stores user's favorite filter configurations
 */

/**
 * جدول الفلاتر المحفوظة - يخزن إعدادات الفلاتر المفضلة للمستخدمين
 * Saved filters table - stores user's favorite filter configurations
 */
export const savedFilters = mysqlTable(
  'savedFilters',
  {
    id: int('id').autoincrement().primaryKey(),
    /** اسم الفلتر */
    name: varchar('name', { length: 100 }).notNull(),
    /** نوع الصفحة: appointments, offerLeads, campRegistrations */
    pageType: varchar('pageType', { length: 50 }).notNull(),
    /** إعدادات الفلاتر (JSON) */
    filterConfig: text('filterConfig').notNull(),
    /** معرف المستخدم */
    userId: int('userId').notNull(),
    /** هل هو فلتر افتراضي */
    isDefault: boolean('isDefault').default(false).notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userPageIdx: index('savedFilters_userPage_idx').on(table.userId, table.pageType),
  })
);
export type SavedFilter = typeof savedFilters.$inferSelect;
export type InsertSavedFilter = typeof savedFilters.$inferInsert;

/**
 * جدول المرضى - يخزن بيانات المرضى المسجلين في بوابة المريض
 * Patients table - stores patient portal registered users
 */

/**
 * PWA Installs Tracking Table
 * يتتبع عمليات تثبيت التطبيق لكل تطبيق (عام / إدارة)
 * يُستخدم لإحصائيات التثبيت ومعرفة عدد المرضى والموظفين الذين ثبتوا التطبيق
 */
export const pwaInstalls = mysqlTable('pwaInstalls', {
  id: int('id').autoincrement().primaryKey(),
  /** نوع التطبيق: public = للمرضى، admin = للموظفين */
  appType: mysqlEnum('appType', ['public', 'admin']).notNull(),
  /** معرف المستخدم (إن كان مسجلاً) */
  userId: int('userId'),
  /** معلومات الجهاز والمتصفح */
  userAgent: text('userAgent'),
  platform: varchar('platform', { length: 100 }),
  /** عنوان IP للتحليلات */
  ipAddress: varchar('ipAddress', { length: 45 }),
  /** تاريخ التثبيت */
  installedAt: timestamp('installedAt').defaultNow().notNull(),
});

export type PwaInstall = typeof pwaInstalls.$inferSelect;
export type InsertPwaInstall = typeof pwaInstalls.$inferInsert;

/**
 * Visit Sessions Table - جلسات الزيارة
 * يتتبع كل زيارة للموقع مع مصدرها ومسار التنقل
 */

/**
 * Visit Sessions Table - جلسات الزيارة
 * يتتبع كل زيارة للموقع مع مصدرها ومسار التنقل
 */
export const visitSessions = mysqlTable('visitSessions', {
  id: int('id').autoincrement().primaryKey(),
  sessionId: varchar('sessionId', { length: 64 }).notNull(),
  source: varchar('source', { length: 64 }),
  utmSource: varchar('utmSource', { length: 128 }),
  utmMedium: varchar('utmMedium', { length: 128 }),
  utmCampaign: varchar('utmCampaign', { length: 256 }),
  utmContent: varchar('utmContent', { length: 256 }),
  utmTerm: varchar('utmTerm', { length: 256 }),
  fbclid: varchar('fbclid', { length: 256 }),
  gclid: varchar('gclid', { length: 256 }),
  landingPage: varchar('landingPage', { length: 512 }),
  referrer: varchar('referrer', { length: 512 }),
  userAgent: text('userAgent'),
  converted: boolean('converted').default(false),
  conversionType: varchar('conversionType', { length: 64 }),
  conversionId: int('conversionId'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});
export type VisitSession = typeof visitSessions.$inferSelect;
export type InsertVisitSession = typeof visitSessions.$inferInsert;

/**
 * Abandoned Forms Table - النماذج غير المكتملة (الفرص الضائعة)
 */

/**
 * Abandoned Forms Table - النماذج غير المكتملة (الفرص الضائعة)
 */
export const abandonedForms = mysqlTable('abandonedForms', {
  id: int('id').autoincrement().primaryKey(),
  formType: mysqlEnum('formType', ['appointment', 'offer', 'camp', 'general']).notNull(),
  phone: varchar('phone', { length: 32 }),
  name: varchar('name', { length: 256 }),
  relatedId: int('relatedId'),
  relatedName: varchar('relatedName', { length: 256 }),
  formData: text('formData'),
  source: varchar('source', { length: 64 }),
  utmSource: varchar('utmSource', { length: 128 }),
  utmCampaign: varchar('utmCampaign', { length: 256 }),
  sessionId: varchar('sessionId', { length: 64 }),
  contacted: boolean('contacted').default(false),
  contactedAt: timestamp('contactedAt'),
  converted: boolean('converted').default(false),
  convertedAt: timestamp('convertedAt'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});
export type AbandonedForm = typeof abandonedForms.$inferSelect;
export type InsertAbandonedForm = typeof abandonedForms.$inferInsert;

/**
 * Tracking Events Table - أحداث التتبع
 */

/**
 * Tracking Events Table - أحداث التتبع
 */
export const trackingEvents = mysqlTable('trackingEvents', {
  id: int('id').autoincrement().primaryKey(),
  sessionId: varchar('sessionId', { length: 64 }),
  eventType: varchar('eventType', { length: 64 }).notNull(),
  page: varchar('page', { length: 512 }),
  metadata: text('metadata'),
  source: varchar('source', { length: 64 }),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});
export type TrackingEvent = typeof trackingEvents.$inferSelect;
export type InsertTrackingEvent = typeof trackingEvents.$inferInsert;

/**
 * WhatsApp Notifications Table - تتبع إشعارات WhatsApp المرسلة
 * يربط كل رسالة واتساب بالسجل المرتبط بها (موعد، تسجيل مخيم، حجز عرض)
 */

/**
 * Notifications Table - جدول الإشعارات
 * يخزّن جميع الإشعارات للمستخدمين
 */
export const notifications = mysqlTable(
  'notifications',
  {
    id: int('id').autoincrement().primaryKey(),
    userId: int('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }), // معرف المستخدم المستلم
    type: mysqlEnum('type', [
      'approval_requested', // طلب موافقة
      'approval_approved', // تمت الموافقة
      'approval_rejected', // تم الرفض
      'content_updated', // تحديث المحتوى
      'content_deleted', // حذف المحتوى
      'content_published', // نشر المحتوى
      'booking_pending', // حجز أو تسجيل يحتاج متابعة
      'booking_confirmed', // تأكيد حجز أو تسجيل
      'booking_status_changed', // تغيير حالة حجز أو تسجيل
      'booking_schedule_changed', // تعديل تاريخ أو طبيب الموعد
      'booking_message_failed', // فشل رسالة متعلقة بالموعد
      'message_received', // رسالة واردة جديدة
      'comment_received', // تعليق وارد جديد
      'conversation_assigned', // إسناد محادثة إلى مستخدم
      'comment_assigned', // إسناد تعليق إلى مستخدم
      'task_assigned', // إسناد مهمة إلى مستخدم
      'task_due', // اقتراب موعد استحقاق مهمة
      'task_overdue', // تجاوز موعد استحقاق مهمة
      'lead_created', // عميل محتمل جديد
      'lead_status_changed', // تغيير مرحلة عميل محتمل
      'connection_error', // فشل اتصال تكامل
      'authorization_expiring', // قرب انتهاء تفويض تكامل
      'campaign_assigned', // إسناد قيادة حملة
      'campaign_ending', // قرب نهاية حملة نشطة
      'campaign_budget_threshold', // بلوغ عتبة ميزانية حملة
      'job_failed', // فشل نهائي لمهمة تشغيلية
      'backup_failed', // فشل نسخة أو استعادة احتياطية
      'campaign_review', // مراجعة حملة
      'integration_status', // حالة تكامل خارجي
      'privacy_update', // تحديث سياسة أو تفضيل خصوصية
      'security', // تنبيه أمني
      'system', // إشعار نظام
    ]).notNull(), // نوع الإشعار
    source: mysqlEnum('source', [
      'content',
      'bookings',
      'camps',
      'offers',
      'whatsapp',
      'social_inbox',
      'tasks',
      'leads',
      'campaigns',
      'integrations',
      'operations',
      'privacy',
      'security',
      'system',
      'manual',
    ])
      .default('system')
      .notNull(), // المصدر التشغيلي للإشعار
    title: varchar('title', { length: 255 }).notNull(), // عنوان الإشعار
    message: text('message').notNull(), // نص الإشعار
    data: text('data'), // بيانات إضافية (JSON)
    entityType: varchar('entityType', { length: 100 }), // نوع السجل المرتبط
    entityId: varchar('entityId', { length: 100 }), // معرف السجل المرتبط
    isRead: mysqlEnum('isRead', ['yes', 'no']).default('no').notNull(), // حالة القراءة
    readAt: timestamp('readAt'), // تاريخ القراءة
    actionUrl: varchar('actionUrl', { length: 500 }), // رابط الإجراء
    actionLabel: varchar('actionLabel', { length: 100 }), // نص زر الإجراء
    priority: mysqlEnum('priority', ['low', 'medium', 'high']).default('medium').notNull(), // الأولوية
    expiresAt: timestamp('expiresAt'), // تاريخ انتهاء الصلاحية
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('notifications_userId_idx').on(table.userId),
    typeIdx: index('notifications_type_idx').on(table.type),
    sourceIdx: index('notifications_source_idx').on(table.source),
    isReadIdx: index('notifications_isRead_idx').on(table.isRead),
    priorityIdx: index('notifications_priority_idx').on(table.priority),
    createdAtIdx: index('notifications_createdAt_idx').on(table.createdAt),
    userIdIsReadIdx: index('notifications_userIdIsRead_idx').on(table.userId, table.isRead),
    userIdCreatedAtIdx: index('notifications_userIdCreatedAt_idx').on(
      table.userId,
      table.createdAt
    ),
    userIdSourceIdx: index('notifications_userIdSource_idx').on(table.userId, table.source),
  })
);

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Notification digest schedule - إعداد المهمة الدورية للملخص اليومي.
 * يحتفظ بمعرف مهمة Heartbeat الموثوق وبتاريخ آخر ملخص لضمان idempotency.
 */

/**
 * Notification digest schedule - إعداد المهمة الدورية للملخص اليومي.
 * يحتفظ بمعرف مهمة Heartbeat الموثوق وبتاريخ آخر ملخص لضمان idempotency.
 */
export const notificationDigestSchedules = mysqlTable(
  'notificationDigestSchedules',
  {
    id: int('id').autoincrement().primaryKey(),
    enabled: boolean('enabled').default(true).notNull(),
    deliveryHour: int('deliveryHour').default(9).notNull(),
    timezone: varchar('timezone', { length: 64 }).default('Asia/Aden').notNull(),
    scheduleCronTaskUid: varchar('scheduleCronTaskUid', { length: 65 }),
    lastDigestDate: varchar('lastDigestDate', { length: 10 }),
    updatedBy: int('updatedBy'),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    taskUidIdx: index('notificationDigestSchedules_taskUid_idx').on(table.scheduleCronTaskUid),
  })
);

export type NotificationDigestSchedule = typeof notificationDigestSchedules.$inferSelect;
export type InsertNotificationDigestSchedule = typeof notificationDigestSchedules.$inferInsert;

/**
 * Social Inbox Accounts - حسابات المنصات الاجتماعية المرتبطة بصندوق البريد الموحد
 */

/**
 * Meta Integration Settings - بيانات ربط Meta المشفّرة لصندوق البريد
 * لا تُعاد الحقول المشفّرة مطلقاً إلى الواجهة؛ تستخدمها نقطة Webhook على الخادم فقط.
 */
export const metaIntegrationSettings = mysqlTable('meta_integration_settings', {
  id: int('id').autoincrement().primaryKey(),
  appId: varchar('appId', { length: 255 }),
  facebookLoginConfigId: varchar('facebookLoginConfigId', { length: 255 }),
  whatsappEmbeddedSignupConfigId: varchar('whatsappEmbeddedSignupConfigId', { length: 255 }),
  facebookPageId: varchar('facebookPageId', { length: 255 }),
  instagramAccountId: varchar('instagramAccountId', { length: 255 }),
  appSecretEncrypted: text('appSecretEncrypted'),
  verifyTokenEncrypted: text('verifyTokenEncrypted'),
  pageAccessTokenEncrypted: text('pageAccessTokenEncrypted'),
  isEnabled: boolean('isEnabled').default(false).notNull(),
  updatedByUserId: int('updatedByUserId').references(() => users.id, {
    onDelete: 'set null',
    onUpdate: 'cascade',
  }),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type MetaIntegrationSettings = typeof metaIntegrationSettings.$inferSelect;
export type InsertMetaIntegrationSettings = typeof metaIntegrationSettings.$inferInsert;

/**
 * إعدادات تطبيقات النشر الخارجية. لا يُعاد clientSecretEncrypted إلى الواجهة مطلقاً.
 * تحفظ توكنات الحسابات المنفصلة لاحقاً في طبقة OAuth عند اكتمال ربط كل منصة.
 */

/**
 * إعدادات تطبيقات النشر الخارجية. لا يُعاد clientSecretEncrypted إلى الواجهة مطلقاً.
 * تحفظ توكنات الحسابات المنفصلة لاحقاً في طبقة OAuth عند اكتمال ربط كل منصة.
 */
export const socialPlatformIntegrationSettings = mysqlTable(
  'social_platform_integration_settings',
  {
    id: int('id').autoincrement().primaryKey(),
    platform: mysqlEnum('platform', ['x', 'linkedin', 'youtube', 'tiktok']).notNull(),
    clientId: varchar('clientId', { length: 255 }),
    clientSecretEncrypted: text('clientSecretEncrypted'),
    requestedScopes: text('requestedScopes'),
    isEnabled: boolean('isEnabled').default(false).notNull(),
    lastError: text('lastError'),
    updatedByUserId: int('updatedByUserId').references(() => users.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    platformUnique: uniqueIndex('socialPlatformIntegrations_platform_unique').on(table.platform),
  })
);

export type SocialPlatformIntegrationSettings =
  typeof socialPlatformIntegrationSettings.$inferSelect;
export type InsertSocialPlatformIntegrationSettings =
  typeof socialPlatformIntegrationSettings.$inferInsert;

/**
 * Integration Connections - اتصال مفوض مع مزود خارجي أو حساب أعمال.
 * يفصل تعريف الاتصال عن التوكنات والأصول لكي يمكن تجديد وإبطال التوكنات بأمان.
 */

/**
 * Integration Connections - اتصال مفوض مع مزود خارجي أو حساب أعمال.
 * يفصل تعريف الاتصال عن التوكنات والأصول لكي يمكن تجديد وإبطال التوكنات بأمان.
 */
export const integrationConnections = mysqlTable(
  'integration_connections',
  {
    id: int('id').autoincrement().primaryKey(),
    provider: mysqlEnum('provider', [
      'meta',
      'whatsapp',
      'x',
      'linkedin',
      'youtube',
      'tiktok',
    ]).notNull(),
    connectionType: mysqlEnum('connectionType', [
      'meta_business',
      'whatsapp_embedded_signup',
      'social_oauth',
    ]).notNull(),
    status: mysqlEnum('status', [
      'draft',
      'authorization_pending',
      'connected',
      'reauthorization_required',
      'expired',
      'revoked',
      'error',
      'disconnected',
    ])
      .default('draft')
      .notNull(),
    displayName: varchar('displayName', { length: 255 }),
    externalBusinessId: varchar('externalBusinessId', { length: 255 }),
    grantedScopes: text('grantedScopes'),
    authorizationMethod: varchar('authorizationMethod', { length: 80 }),
    expiresAt: timestamp('expiresAt'),
    authorizationExpiryNotifiedAt: timestamp('authorizationExpiryNotifiedAt'),
    lastValidatedAt: timestamp('lastValidatedAt'),
    lastError: text('lastError'),
    disconnectedAt: timestamp('disconnectedAt'),
    initiatedByUserId: int('initiatedByUserId').references(() => users.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    providerStatusIdx: index('integrationConnections_provider_status_idx').on(
      table.provider,
      table.status
    ),
    initiatorIdx: index('integrationConnections_initiator_idx').on(table.initiatedByUserId),
    externalBusinessIdx: index('integrationConnections_external_business_idx').on(
      table.provider,
      table.externalBusinessId
    ),
  })
);

export type IntegrationConnection = typeof integrationConnections.$inferSelect;
export type InsertIntegrationConnection = typeof integrationConnections.$inferInsert;

/**
 * Integration alert scheduler configuration - إعداد فحص انتهاء تفويض التكاملات
 */

/**
 * Integration alert scheduler configuration - إعداد فحص انتهاء تفويض التكاملات
 */
export const integrationAlertSchedules = mysqlTable(
  'integrationAlertSchedules',
  {
    id: int('id').autoincrement().primaryKey(),
    enabled: mysqlEnum('enabled', ['yes', 'no']).default('yes').notNull(),
    leadTimeHours: int('leadTimeHours').default(72).notNull(),
    scheduleCronTaskUid: varchar('scheduleCronTaskUid', { length: 65 }),
    lastRunAt: timestamp('lastRunAt'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    scheduleTaskUidIdx: index('integration_alert_schedule_task_uid_idx').on(
      table.scheduleCronTaskUid
    ),
  })
);

export type IntegrationAlertSchedule = typeof integrationAlertSchedules.$inferSelect;

/**
 * Integration Connection Tokens - أسرار OAuth المشفرة؛ لا تعاد إلى الواجهة أو سجل التدقيق.
 */

/**
 * Integration Connection Tokens - أسرار OAuth المشفرة؛ لا تعاد إلى الواجهة أو سجل التدقيق.
 */
export const integrationConnectionTokens = mysqlTable(
  'integration_connection_tokens',
  {
    id: int('id').autoincrement().primaryKey(),
    connectionId: int('connectionId').notNull(),
    tokenType: mysqlEnum('tokenType', ['access', 'refresh', 'business', 'system']).notNull(),
    tokenEncrypted: text('tokenEncrypted').notNull(),
    tokenExpiresAt: timestamp('tokenExpiresAt'),
    scopes: text('scopes'),
    encryptionKeyVersion: varchar('encryptionKeyVersion', { length: 32 }).default('v1').notNull(),
    lastRefreshedAt: timestamp('lastRefreshedAt'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    connectionFk: foreignKey({
      name: 'integration_connection_tokens_connection_fk',
      columns: [table.connectionId],
      foreignColumns: [integrationConnections.id],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
    connectionTokenUnique: uniqueIndex('integrationConnectionTokens_connection_token_unique').on(
      table.connectionId,
      table.tokenType
    ),
    expiryIdx: index('integrationConnectionTokens_expiry_idx').on(table.tokenExpiresAt),
  })
);

export type IntegrationConnectionToken = typeof integrationConnectionTokens.$inferSelect;
export type InsertIntegrationConnectionToken = typeof integrationConnectionTokens.$inferInsert;

/**
 * Integration External Assets - Page أو Instagram Account أو WABA أو رقم هاتف أو Ad Account.
 */

/**
 * Integration External Assets - Page أو Instagram Account أو WABA أو رقم هاتف أو Ad Account.
 */
export const integrationExternalAssets = mysqlTable(
  'integration_external_assets',
  {
    id: int('id').autoincrement().primaryKey(),
    connectionId: int('connectionId').notNull(),
    provider: mysqlEnum('provider', [
      'meta',
      'whatsapp',
      'x',
      'linkedin',
      'youtube',
      'tiktok',
    ]).notNull(),
    assetType: mysqlEnum('assetType', [
      'business_portfolio',
      'page',
      'instagram_account',
      'whatsapp_business_account',
      'whatsapp_phone_number',
      'ad_account',
      'pixel',
      'dataset',
      'profile',
      'organization',
      'channel',
    ]).notNull(),
    externalAssetId: varchar('externalAssetId', { length: 255 }).notNull(),
    parentExternalAssetId: varchar('parentExternalAssetId', { length: 255 }),
    displayName: varchar('displayName', { length: 255 }),
    avatarUrl: varchar('avatarUrl', { length: 500 }),
    capabilities: text('capabilities'),
    metadata: text('metadata'),
    isSelected: boolean('isSelected').default(false).notNull(),
    isActive: boolean('isActive').default(true).notNull(),
    lastSyncedAt: timestamp('lastSyncedAt'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    connectionFk: foreignKey({
      name: 'integration_external_assets_connection_fk',
      columns: [table.connectionId],
      foreignColumns: [integrationConnections.id],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
    providerAssetUnique: uniqueIndex('integrationExternalAssets_provider_asset_unique').on(
      table.provider,
      table.externalAssetId
    ),
    connectionTypeIdx: index('integrationExternalAssets_connection_type_idx').on(
      table.connectionId,
      table.assetType
    ),
    selectedIdx: index('integrationExternalAssets_selected_idx').on(table.isSelected),
  })
);

export type IntegrationExternalAsset = typeof integrationExternalAssets.$inferSelect;
export type InsertIntegrationExternalAsset = typeof integrationExternalAssets.$inferInsert;

/**
 * Integration OAuth States - state عشوائي مخزّن كهاش وPKCE verifier مشفّر حتى وصول callback.
 */

/**
 * Integration OAuth States - state عشوائي مخزّن كهاش وPKCE verifier مشفّر حتى وصول callback.
 */
export const integrationOauthStates = mysqlTable(
  'integration_oauth_states',
  {
    id: int('id').autoincrement().primaryKey(),
    provider: mysqlEnum('provider', [
      'meta',
      'whatsapp',
      'x',
      'linkedin',
      'youtube',
      'tiktok',
    ]).notNull(),
    flow: mysqlEnum('flow', [
      'meta_business',
      'whatsapp_embedded_signup',
      'social_oauth',
    ]).notNull(),
    stateHash: varchar('stateHash', { length: 128 }).notNull(),
    codeVerifierEncrypted: text('codeVerifierEncrypted'),
    redirectUri: varchar('redirectUri', { length: 500 }).notNull(),
    requestedScopes: text('requestedScopes'),
    initiatedByUserId: int('initiatedByUserId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    connectionId: int('connectionId'),
    expiresAt: timestamp('expiresAt').notNull(),
    consumedAt: timestamp('consumedAt'),
    failureReason: text('failureReason'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
  },
  (table) => ({
    connectionFk: foreignKey({
      name: 'integration_oauth_states_connection_fk',
      columns: [table.connectionId],
      foreignColumns: [integrationConnections.id],
    })
      .onDelete('set null')
      .onUpdate('cascade'),
    stateUnique: uniqueIndex('integrationOauthStates_state_unique').on(table.stateHash),
    expirationIdx: index('integrationOauthStates_expiration_idx').on(table.expiresAt),
    actorIdx: index('integrationOauthStates_actor_idx').on(table.initiatedByUserId),
  })
);

export type IntegrationOauthState = typeof integrationOauthStates.$inferSelect;
export type InsertIntegrationOauthState = typeof integrationOauthStates.$inferInsert;

/**
 * Integration Webhook Subscriptions - حالة اشتراك كل أصل خارجي في أحداث Webhook.
 */

/**
 * Integration Webhook Subscriptions - حالة اشتراك كل أصل خارجي في أحداث Webhook.
 */
export const integrationWebhookSubscriptions = mysqlTable(
  'integration_webhook_subscriptions',
  {
    id: int('id').autoincrement().primaryKey(),
    connectionId: int('connectionId').notNull(),
    assetId: int('assetId'),
    provider: mysqlEnum('provider', [
      'meta',
      'whatsapp',
      'x',
      'linkedin',
      'youtube',
      'tiktok',
    ]).notNull(),
    callbackPath: varchar('callbackPath', { length: 500 }).notNull(),
    subscribedFields: text('subscribedFields'),
    externalSubscriptionId: varchar('externalSubscriptionId', { length: 255 }),
    status: mysqlEnum('status', ['pending', 'active', 'failed', 'disabled'])
      .default('pending')
      .notNull(),
    verifiedAt: timestamp('verifiedAt'),
    lastEventAt: timestamp('lastEventAt'),
    lastError: text('lastError'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    connectionFk: foreignKey({
      name: 'integration_webhook_subscriptions_connection_fk',
      columns: [table.connectionId],
      foreignColumns: [integrationConnections.id],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
    assetFk: foreignKey({
      name: 'integration_webhook_subscriptions_asset_fk',
      columns: [table.assetId],
      foreignColumns: [integrationExternalAssets.id],
    })
      .onDelete('set null')
      .onUpdate('cascade'),
    connectionAssetIdx: index('integrationWebhookSubscriptions_connection_asset_idx').on(
      table.connectionId,
      table.assetId
    ),
    statusIdx: index('integrationWebhookSubscriptions_status_idx').on(table.status),
  })
);

export type IntegrationWebhookSubscription = typeof integrationWebhookSubscriptions.$inferSelect;
export type InsertIntegrationWebhookSubscription =
  typeof integrationWebhookSubscriptions.$inferInsert;

/**
 * Integration Delivery Jobs - outbox موثوق للنشر الخارجي، مستقل عن دقات Heartbeat.
 */

/**
 * Integration Delivery Jobs - outbox موثوق للنشر الخارجي، مستقل عن دقات Heartbeat.
 */
export const integrationDeliveryJobs = mysqlTable(
  'integration_delivery_jobs',
  {
    id: int('id').autoincrement().primaryKey(),
    destinationId: int('destinationId').notNull(),
    connectionId: int('connectionId'),
    status: mysqlEnum('status', ['queued', 'processing', 'succeeded', 'failed', 'cancelled'])
      .default('queued')
      .notNull(),
    runAfter: timestamp('runAfter').defaultNow().notNull(),
    leasedUntil: timestamp('leasedUntil'),
    attemptCount: int('attemptCount').default(0).notNull(),
    maxAttempts: int('maxAttempts').default(5).notNull(),
    lastError: text('lastError'),
    providerRequestId: varchar('providerRequestId', { length: 255 }),
    idempotencyKey: varchar('idempotencyKey', { length: 128 }).notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    destinationFk: foreignKey({
      name: 'integration_delivery_jobs_destination_fk',
      columns: [table.destinationId],
      foreignColumns: [socialPublishDestinations.id],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
    connectionFk: foreignKey({
      name: 'integration_delivery_jobs_connection_fk',
      columns: [table.connectionId],
      foreignColumns: [integrationConnections.id],
    })
      .onDelete('set null')
      .onUpdate('cascade'),
    destinationUnique: uniqueIndex('integrationDeliveryJobs_destination_unique').on(
      table.destinationId
    ),
    dispatchIdx: index('integrationDeliveryJobs_dispatch_idx').on(table.status, table.runAfter),
    leaseIdx: index('integrationDeliveryJobs_lease_idx').on(table.leasedUntil),
    idempotencyUnique: uniqueIndex('integrationDeliveryJobs_idempotency_unique').on(
      table.idempotencyKey
    ),
  })
);

export type IntegrationDeliveryJob = typeof integrationDeliveryJobs.$inferSelect;
export type InsertIntegrationDeliveryJob = typeof integrationDeliveryJobs.$inferInsert;

/**
 * Integration Audit Events - سجل عمليات منقى من الأسرار للاتصالات والأصول والتوزيع.
 */

/**
 * Integration Audit Events - سجل عمليات منقى من الأسرار للاتصالات والأصول والتوزيع.
 */
export const integrationAuditEvents = mysqlTable(
  'integration_audit_events',
  {
    id: int('id').autoincrement().primaryKey(),
    provider: mysqlEnum('provider', [
      'meta',
      'whatsapp',
      'x',
      'linkedin',
      'youtube',
      'tiktok',
    ]).notNull(),
    connectionId: int('connectionId'),
    assetId: int('assetId'),
    action: varchar('action', { length: 120 }).notNull(),
    status: mysqlEnum('status', ['started', 'succeeded', 'failed', 'skipped']).notNull(),
    correlationId: varchar('correlationId', { length: 255 }),
    summary: text('summary'),
    errorMessage: text('errorMessage'),
    performedByUserId: int('performedByUserId').references(() => users.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
  },
  (table) => ({
    connectionFk: foreignKey({
      name: 'integration_audit_events_connection_fk',
      columns: [table.connectionId],
      foreignColumns: [integrationConnections.id],
    })
      .onDelete('set null')
      .onUpdate('cascade'),
    assetFk: foreignKey({
      name: 'integration_audit_events_asset_fk',
      columns: [table.assetId],
      foreignColumns: [integrationExternalAssets.id],
    })
      .onDelete('set null')
      .onUpdate('cascade'),
    providerActionIdx: index('integrationAuditEvents_provider_action_idx').on(
      table.provider,
      table.action
    ),
    connectionIdx: index('integrationAuditEvents_connection_idx').on(table.connectionId),
    createdIdx: index('integrationAuditEvents_created_idx').on(table.createdAt),
  })
);

export type IntegrationAuditEvent = typeof integrationAuditEvents.$inferSelect;
export type InsertIntegrationAuditEvent = typeof integrationAuditEvents.$inferInsert;

/** نماذج Lead Ads المختارة وربطها الاختياري بحملات CRM. */
