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

import { media } from './05-cms-portal';
import { users } from './07-users-rbac';
import { integrationConnections, integrationExternalAssets } from './10-system-settings';

/**
 * Campaigns table - stores comprehensive marketing campaign information
 * يخزّن معلومات شاملة عن الحملات التسويقية
 */
export const campaigns = mysqlTable('campaigns', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),

  // Campaign Type & Status
  type: mysqlEnum('type', ['digital', 'field', 'awareness', 'mixed']).default('digital').notNull(),
  status: mysqlEnum('status', ['draft', 'active', 'paused', 'completed', 'cancelled'])
    .default('draft')
    .notNull(),

  // Budget
  plannedBudget: int('plannedBudget'), // الميزانية المخططة
  actualBudget: int('actualBudget'), // الميزانية الفعلية
  currency: varchar('currency', { length: 10 }).default('YER'),

  // Dates
  startDate: timestamp('startDate'),
  endDate: timestamp('endDate'),
  endDateNotifiedAt: timestamp('endDateNotifiedAt'),
  budgetAlertLevel: int('budgetAlertLevel').default(0).notNull(),

  // Platforms (JSON array)
  platforms: text('platforms'), // ["facebook", "instagram", "google", "whatsapp", "field"]

  // Goals & KPIs
  goals: text('goals'), // الأهداف (JSON)
  targetLeads: int('targetLeads'), // هدف العملاء المحتملين
  targetBookings: int('targetBookings'), // هدف الحجوزات
  targetROI: int('targetROI'), // هدف عائد الاستثمار (%)
  targetRevenue: decimal('targetRevenue', { precision: 15, scale: 2 }), // هدف الإيرادات
  kpis: text('kpis'), // مؤشرات الأداء الرئيسية (JSON)
  notes: text('notes'), // ملاحظات إضافية

  // Team
  teamLeaderId: int('teamLeaderId'), // قائد الفريق
  teamMembers: text('teamMembers'), // JSON array of user IDs

  // Meta/Facebook Integration
  metaPixelId: varchar('metaPixelId', { length: 100 }),
  metaAccessToken: text('metaAccessToken'),

  // WhatsApp Integration
  whatsappEnabled: boolean('whatsappEnabled').default(false).notNull(),
  whatsappWelcomeMessage: text('whatsappWelcomeMessage'),

  // Legacy field
  isActive: boolean('isActive').default(true).notNull(),

  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = typeof campaigns.$inferInsert;

/** إعداد فحص تنبيهات الحملات اليومية. */

/** إعداد فحص تنبيهات الحملات اليومية. */
export const campaignAlertSchedules = mysqlTable(
  'campaignAlertSchedules',
  {
    id: int('id').autoincrement().primaryKey(),
    enabled: mysqlEnum('enabled', ['yes', 'no']).default('yes').notNull(),
    endWarningDays: int('endWarningDays').default(7).notNull(),
    budgetWarningPercent: int('budgetWarningPercent').default(90).notNull(),
    scheduleCronTaskUid: varchar('scheduleCronTaskUid', { length: 65 }),
    lastRunAt: timestamp('lastRunAt'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    taskUidIdx: index('campaign_alert_schedule_task_uid_idx').on(table.scheduleCronTaskUid),
  })
);

/**
 * Leads table - stores customer registration data
 */

/**
 * Leads table - stores customer registration data
 */
export const leads = mysqlTable('leads', {
  id: int('id').autoincrement().primaryKey(),
  campaignId: int('campaignId').notNull(),
  fullName: varchar('fullName', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  email: varchar('email', { length: 320 }),
  status: mysqlEnum('status', [
    'new',
    'contacted',
    'booked',
    'not_interested',
    'no_answer',
    'pending',
    'confirmed',
    'completed',
    'cancelled',
  ])
    .default('new')
    .notNull(),
  source: varchar('source', { length: 100 }),
  utmSource: varchar('utmSource', { length: 100 }),
  utmMedium: varchar('utmMedium', { length: 100 }),
  utmCampaign: varchar('utmCampaign', { length: 100 }),
  utmTerm: varchar('utmTerm', { length: 100 }),
  utmContent: varchar('utmContent', { length: 100 }),
  utmPlacement: varchar('utmPlacement', { length: 100 }),
  notes: text('notes'),
  assignedToUserId: int('assignedToUserId'),
  emailSent: boolean('emailSent').default(false).notNull(),
  whatsappSent: boolean('whatsappSent').default(false).notNull(),
  bookingConfirmationSent: boolean('bookingConfirmationSent').default(false).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

/**
 * Lead status history - tracks all status changes
 */

/**
 * Lead status history - tracks all status changes
 */
export const leadStatusHistory = mysqlTable('leadStatusHistory', {
  id: int('id').autoincrement().primaryKey(),
  leadId: int('leadId').notNull(),
  userId: int('userId'),
  oldStatus: varchar('oldStatus', { length: 50 }),
  newStatus: varchar('newStatus', { length: 50 }).notNull(),
  notes: text('notes'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export type LeadStatusHistory = typeof leadStatusHistory.$inferSelect;
export type InsertLeadStatusHistory = typeof leadStatusHistory.$inferInsert;

/**
 * Settings table - stores system configuration
 */

/**
 * Campaign-Offers linking table (many-to-many)
 * جدول ربط الحملات بالعروض
 */
export const campaignOffers = mysqlTable(
  'campaignOffers',
  {
    id: int('id').autoincrement().primaryKey(),
    campaignId: int('campaignId').notNull(),
    offerId: int('offerId').notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
  },
  (table) => ({
    campaignIdx: index('campaignOffers_campaign_idx').on(table.campaignId),
    offerIdx: index('campaignOffers_offer_idx').on(table.offerId),
    uniqueIdx: index('campaignOffers_unique_idx').on(table.campaignId, table.offerId),
  })
);

export type CampaignOffer = typeof campaignOffers.$inferSelect;
export type InsertCampaignOffer = typeof campaignOffers.$inferInsert;

/**
 * Campaign-Camps linking table (many-to-many)
 * جدول ربط الحملات بالمخيمات
 */

/**
 * Campaign-Camps linking table (many-to-many)
 * جدول ربط الحملات بالمخيمات
 */
export const campaignCamps = mysqlTable(
  'campaignCamps',
  {
    id: int('id').autoincrement().primaryKey(),
    campaignId: int('campaignId').notNull(),
    campId: int('campId').notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
  },
  (table) => ({
    campaignIdx: index('campaignCamps_campaign_idx').on(table.campaignId),
    campIdx: index('campaignCamps_camp_idx').on(table.campId),
    uniqueIdx: index('campaignCamps_unique_idx').on(table.campaignId, table.campId),
  })
);

export type CampaignCamp = typeof campaignCamps.$inferSelect;
export type InsertCampaignCamp = typeof campaignCamps.$inferInsert;

/**
 * Campaign-Doctors linking table (many-to-many)
 * جدول ربط الحملات بالأطباء
 */

/**
 * Campaign-Doctors linking table (many-to-many)
 * جدول ربط الحملات بالأطباء
 */
export const campaignDoctors = mysqlTable(
  'campaignDoctors',
  {
    id: int('id').autoincrement().primaryKey(),
    campaignId: int('campaignId').notNull(),
    doctorId: int('doctorId').notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
  },
  (table) => ({
    campaignIdx: index('campaignDoctors_campaign_idx').on(table.campaignId),
    doctorIdx: index('campaignDoctors_doctor_idx').on(table.doctorId),
    uniqueIdx: index('campaignDoctors_unique_idx').on(table.campaignId, table.doctorId),
  })
);

export type CampaignDoctor = typeof campaignDoctors.$inferSelect;
export type InsertCampaignDoctor = typeof campaignDoctors.$inferInsert;

/**
 * PWA Installs Tracking Table
 * يتتبع عمليات تثبيت التطبيق لكل تطبيق (عام / إدارة)
 * يُستخدم لإحصائيات التثبيت ومعرفة عدد المرضى والموظفين الذين ثبتوا التطبيق
 */

/** نماذج Lead Ads المختارة وربطها الاختياري بحملات CRM. */
export const metaLeadForms = mysqlTable(
  'meta_lead_forms',
  {
    id: int('id').autoincrement().primaryKey(),
    connectionId: int('connectionId').notNull(),
    pageAssetId: int('pageAssetId'),
    externalFormId: varchar('externalFormId', { length: 255 }).notNull(),
    externalPageId: varchar('externalPageId', { length: 255 }).notNull(),
    displayName: varchar('displayName', { length: 255 }),
    campaignId: int('campaignId').references(() => campaigns.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
    fieldMapping: text('fieldMapping'),
    isActive: boolean('isActive').default(true).notNull(),
    lastSyncedAt: timestamp('lastSyncedAt'),
    lastError: text('lastError'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    connectionFk: foreignKey({
      name: 'meta_lead_forms_connection_fk',
      columns: [table.connectionId],
      foreignColumns: [integrationConnections.id],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
    formUnique: uniqueIndex('metaLeadForms_external_form_unique').on(table.externalFormId),
    connectionIdx: index('metaLeadForms_connection_idx').on(table.connectionId),
    pageAssetFk: foreignKey({
      name: 'meta_lead_forms_page_asset_fk',
      columns: [table.pageAssetId],
      foreignColumns: [integrationExternalAssets.id],
    })
      .onDelete('set null')
      .onUpdate('cascade'),
  })
);

/** إشعارات Lead Ads؛ تحفظ الحقول المستلمة مشفرة حتى يتم إدخالها إلى CRM مع منع التكرار. */

/** إشعارات Lead Ads؛ تحفظ الحقول المستلمة مشفرة حتى يتم إدخالها إلى CRM مع منع التكرار. */
export const metaLeadEvents = mysqlTable(
  'meta_lead_events',
  {
    id: int('id').autoincrement().primaryKey(),
    connectionId: int('connectionId').notNull(),
    leadFormId: int('leadFormId').references(() => metaLeadForms.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
    externalLeadId: varchar('externalLeadId', { length: 255 }).notNull(),
    eventKey: varchar('eventKey', { length: 255 }).notNull(),
    payloadEncrypted: text('payloadEncrypted'),
    status: mysqlEnum('status', ['received', 'processing', 'ingested', 'failed', 'ignored'])
      .default('received')
      .notNull(),
    crmLeadId: int('crmLeadId').references(() => leads.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
    lastError: text('lastError'),
    receivedAt: timestamp('receivedAt').defaultNow().notNull(),
    processedAt: timestamp('processedAt'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    connectionFk: foreignKey({
      name: 'meta_lead_events_connection_fk',
      columns: [table.connectionId],
      foreignColumns: [integrationConnections.id],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
    leadUnique: uniqueIndex('metaLeadEvents_external_lead_unique').on(table.externalLeadId),
    eventUnique: uniqueIndex('metaLeadEvents_event_key_unique').on(table.eventKey),
    statusIdx: index('metaLeadEvents_status_idx').on(table.status, table.receivedAt),
  })
);

/** Outbox مشفر لأحداث Conversions API؛ لا يحمل تشخيصات أو محتوى علاجي. */

/** Outbox مشفر لأحداث Conversions API؛ لا يحمل تشخيصات أو محتوى علاجي. */
export const metaConversionEvents = mysqlTable(
  'meta_conversion_events',
  {
    id: int('id').autoincrement().primaryKey(),
    connectionId: int('connectionId').notNull(),
    datasetAssetId: int('datasetAssetId'),
    eventName: varchar('eventName', { length: 100 }).notNull(),
    eventId: varchar('eventId', { length: 255 }).notNull(),
    payloadEncrypted: text('payloadEncrypted').notNull(),
    status: mysqlEnum('status', ['queued', 'sending', 'succeeded', 'failed', 'cancelled'])
      .default('queued')
      .notNull(),
    runAfter: timestamp('runAfter').defaultNow().notNull(),
    attemptCount: int('attemptCount').default(0).notNull(),
    maxAttempts: int('maxAttempts').default(5).notNull(),
    lastError: text('lastError'),
    responseSummary: text('responseSummary'),
    sentAt: timestamp('sentAt'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    connectionFk: foreignKey({
      name: 'meta_conversion_events_connection_fk',
      columns: [table.connectionId],
      foreignColumns: [integrationConnections.id],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
    eventUnique: uniqueIndex('metaConversionEvents_event_unique').on(table.eventId),
    dispatchIdx: index('metaConversionEvents_dispatch_idx').on(table.status, table.runAfter),
    datasetAssetFk: foreignKey({
      name: 'meta_conversion_events_dataset_fk',
      columns: [table.datasetAssetId],
      foreignColumns: [integrationExternalAssets.id],
    })
      .onDelete('set null')
      .onUpdate('cascade'),
  })
);

/**
 * Social Publishing Accounts - حسابات النشر المتصلة لكل منصة
 * لا تُخزن الأسرار هنا بصيغة مكشوفة؛ تحفظ بيانات OAuth المشفرة لاحقاً في خدمة الاتصال.
 */

/**
 * Social Publishing Accounts - حسابات النشر المتصلة لكل منصة
 * لا تُخزن الأسرار هنا بصيغة مكشوفة؛ تحفظ بيانات OAuth المشفرة لاحقاً في خدمة الاتصال.
 */
export const socialPublishAccounts = mysqlTable(
  'social_publish_accounts',
  {
    id: int('id').autoincrement().primaryKey(),
    connectionId: int('connectionId'),
    integrationAssetId: int('integrationAssetId'),
    platform: mysqlEnum('platform', [
      'facebook',
      'instagram',
      'x',
      'linkedin',
      'youtube',
      'tiktok',
    ]).notNull(),
    accountType: mysqlEnum('accountType', [
      'page',
      'profile',
      'business',
      'channel',
      'organization',
    ])
      .default('profile')
      .notNull(),
    displayName: varchar('displayName', { length: 255 }).notNull(),
    externalAccountId: varchar('externalAccountId', { length: 255 }).notNull(),
    avatarUrl: varchar('avatarUrl', { length: 500 }),
    connectionStatus: mysqlEnum('connectionStatus', [
      'disconnected',
      'pending',
      'connected',
      'error',
      'expired',
    ])
      .default('disconnected')
      .notNull(),
    capabilities: text('capabilities'),
    lastValidatedAt: timestamp('lastValidatedAt'),
    lastError: text('lastError'),
    isActive: boolean('isActive').default(true).notNull(),
    createdByUserId: int('createdByUserId').references(() => users.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    connectionFk: foreignKey({
      name: 'social_publish_accounts_connection_fk',
      columns: [table.connectionId],
      foreignColumns: [integrationConnections.id],
    })
      .onDelete('set null')
      .onUpdate('cascade'),
    assetFk: foreignKey({
      name: 'social_publish_accounts_asset_fk',
      columns: [table.integrationAssetId],
      foreignColumns: [integrationExternalAssets.id],
    })
      .onDelete('set null')
      .onUpdate('cascade'),
    platformStatusIdx: index('socialPublishAccounts_platform_status_idx').on(
      table.platform,
      table.connectionStatus
    ),
    connectionIdx: index('socialPublishAccounts_connection_idx').on(table.connectionId),
    integrationAssetIdx: index('socialPublishAccounts_asset_idx').on(table.integrationAssetId),
    externalAccountIdx: uniqueIndex('socialPublishAccounts_external_unique').on(
      table.platform,
      table.externalAccountId
    ),
  })
);

export type SocialPublishAccount = typeof socialPublishAccounts.$inferSelect;
export type InsertSocialPublishAccount = typeof socialPublishAccounts.$inferInsert;

/**
 * Social Publishing Posts - المسودة المركزية وسير الموافقة والجدولة
 */

/**
 * Social Publishing Posts - المسودة المركزية وسير الموافقة والجدولة
 */
export const socialPublishPosts = mysqlTable(
  'social_publish_posts',
  {
    id: int('id').autoincrement().primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    baseCaption: text('baseCaption'),
    contentType: mysqlEnum('contentType', ['post', 'image', 'video', 'reel', 'story', 'short'])
      .default('post')
      .notNull(),
    status: mysqlEnum('status', [
      'draft',
      'in_review',
      'approved',
      'scheduled',
      'publishing',
      'published',
      'partial_failed',
      'failed',
      'cancelled',
    ])
      .default('draft')
      .notNull(),
    campaignId: int('campaignId'),
    scheduledAt: timestamp('scheduledAt'),
    timezone: varchar('timezone', { length: 64 }).default('Asia/Aden').notNull(),
    scheduleCronTaskUid: varchar('scheduleCronTaskUid', { length: 65 }),
    metadata: text('metadata'),
    approvalNotes: text('approvalNotes'),
    createdByUserId: int('createdByUserId')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
    approvedByUserId: int('approvedByUserId').references(() => users.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
    approvedAt: timestamp('approvedAt'),
    rejectedByUserId: int('rejectedByUserId').references(() => users.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
    rejectedAt: timestamp('rejectedAt'),
    publishedAt: timestamp('publishedAt'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    statusScheduleIdx: index('socialPublishPosts_status_schedule_idx').on(
      table.status,
      table.scheduledAt
    ),
    campaignIdx: index('socialPublishPosts_campaign_idx').on(table.campaignId),
    createdByIdx: index('socialPublishPosts_createdBy_idx').on(table.createdByUserId),
    scheduleTaskIdx: index('socialPublishPosts_schedule_task_idx').on(table.scheduleCronTaskUid),
  })
);

export type SocialPublishPost = typeof socialPublishPosts.$inferSelect;
export type InsertSocialPublishPost = typeof socialPublishPosts.$inferInsert;

/**
 * Social Publishing Post Media - مراجع مرتبة لأصول مكتبة الوسائط داخل المسودة.
 */

/**
 * Social Publishing Post Media - مراجع مرتبة لأصول مكتبة الوسائط داخل المسودة.
 */
export const socialPublishPostMedia = mysqlTable(
  'social_publish_post_media',
  {
    id: int('id').autoincrement().primaryKey(),
    postId: int('postId')
      .notNull()
      .references(() => socialPublishPosts.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    mediaId: int('mediaId')
      .notNull()
      .references(() => media.id, { onDelete: 'restrict', onUpdate: 'cascade' }),
    role: mysqlEnum('role', ['primary', 'cover', 'supplementary']).default('primary').notNull(),
    sortOrder: int('sortOrder').default(0).notNull(),
    altText: text('altText'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
  },
  (table) => ({
    postOrderIdx: index('socialPublishPostMedia_post_order_idx').on(table.postId, table.sortOrder),
    mediaIdx: index('socialPublishPostMedia_media_idx').on(table.mediaId),
  })
);

export type SocialPublishPostMedia = typeof socialPublishPostMedia.$inferSelect;
export type InsertSocialPublishPostMedia = typeof socialPublishPostMedia.$inferInsert;

/**
 * Social Publishing Destinations - نسخة وناتج كل منصة مستقلان عن بقية الوجهات.
 */

/**
 * Social Publishing Destinations - نسخة وناتج كل منصة مستقلان عن بقية الوجهات.
 */
export const socialPublishDestinations = mysqlTable(
  'social_publish_destinations',
  {
    id: int('id').autoincrement().primaryKey(),
    postId: int('postId').notNull(),
    accountId: int('accountId'),
    platform: mysqlEnum('platform', [
      'facebook',
      'instagram',
      'x',
      'linkedin',
      'youtube',
      'tiktok',
    ]).notNull(),
    captionOverride: text('captionOverride'),
    settings: text('settings'),
    publicationStatus: mysqlEnum('publicationStatus', [
      'not_ready',
      'pending',
      'queued',
      'uploading',
      'processing',
      'published',
      'failed',
      'skipped',
      'cancelled',
    ])
      .default('not_ready')
      .notNull(),
    externalPostId: varchar('externalPostId', { length: 255 }),
    externalUrl: varchar('externalUrl', { length: 500 }),
    providerState: text('providerState'),
    lastAttemptAt: timestamp('lastAttemptAt'),
    publishedAt: timestamp('publishedAt'),
    retryCount: int('retryCount').default(0).notNull(),
    lastError: text('lastError'),
    idempotencyKey: varchar('idempotencyKey', { length: 128 }).notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    postFk: foreignKey({
      name: 'social_publish_destinations_post_fk',
      columns: [table.postId],
      foreignColumns: [socialPublishPosts.id],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
    accountFk: foreignKey({
      name: 'social_publish_destinations_account_fk',
      columns: [table.accountId],
      foreignColumns: [socialPublishAccounts.id],
    })
      .onDelete('set null')
      .onUpdate('cascade'),
    postIdx: index('socialPublishDestinations_post_idx').on(table.postId),
    accountIdx: index('socialPublishDestinations_account_idx').on(table.accountId),
    platformStatusIdx: index('socialPublishDestinations_platform_status_idx').on(
      table.platform,
      table.publicationStatus
    ),
    idempotencyUnique: uniqueIndex('socialPublishDestinations_idempotency_unique').on(
      table.idempotencyKey
    ),
  })
);

export type SocialPublishDestination = typeof socialPublishDestinations.$inferSelect;
export type InsertSocialPublishDestination = typeof socialPublishDestinations.$inferInsert;

/**
 * Social Publishing Attempts - سجل تدقيق منفصل للمحاولات والنتائج من دون أسرار.
 */

/**
 * Social Publishing Attempts - سجل تدقيق منفصل للمحاولات والنتائج من دون أسرار.
 */
export const socialPublishAttempts = mysqlTable(
  'social_publish_attempts',
  {
    id: int('id').autoincrement().primaryKey(),
    destinationId: int('destinationId').notNull(),
    operation: mysqlEnum('operation', [
      'validate',
      'upload',
      'publish',
      'status',
      'retry',
      'cancel',
    ]).notNull(),
    status: mysqlEnum('status', ['started', 'succeeded', 'failed', 'skipped']).notNull(),
    httpStatus: int('httpStatus'),
    correlationId: varchar('correlationId', { length: 255 }),
    requestSummary: text('requestSummary'),
    responseSummary: text('responseSummary'),
    errorMessage: text('errorMessage'),
    performedByUserId: int('performedByUserId').references(() => users.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
  },
  (table) => ({
    destinationFk: foreignKey({
      name: 'social_publish_attempts_destination_fk',
      columns: [table.destinationId],
      foreignColumns: [socialPublishDestinations.id],
    })
      .onDelete('cascade')
      .onUpdate('cascade'),
    destinationCreatedIdx: index('socialPublishAttempts_destination_created_idx').on(
      table.destinationId,
      table.createdAt
    ),
    operationStatusIdx: index('socialPublishAttempts_operation_status_idx').on(
      table.operation,
      table.status
    ),
  })
);

export type SocialPublishAttempt = typeof socialPublishAttempts.$inferSelect;
export type InsertSocialPublishAttempt = typeof socialPublishAttempts.$inferInsert;

/**
 * Broadcast Recipients table - يخزن المستقبلين في كل بث
 * تتبع كل مستقبل على حدة مع معلومات التصفية والمتغيرات
 */

/**
 * Broadcast Recipients table - يخزن المستقبلين في كل بث
 * تتبع كل مستقبل على حدة مع معلومات التصفية والمتغيرات
 */
export const broadcastRecipients = mysqlTable(
  'broadcast_recipients',
  {
    id: int('id').autoincrement().primaryKey(),

    // الربط مع البث
    broadcastId: int('broadcastId').notNull(),

    // معلومات الاتصال
    phoneNumber: varchar('phoneNumber', { length: 20 }).notNull(),
    fullName: varchar('fullName', { length: 255 }),
    email: varchar('email', { length: 320 }),

    // معلومات المصدر
    recipientType: mysqlEnum('recipientType', [
      'appointment',
      'camp_registration',
      'offer_lead',
      'lead',
    ]).notNull(),
    recipientId: int('recipientId').notNull(),

    // معلومات إضافية
    sourceId: int('sourceId'), // appointmentId, campRegistrationId, offerLeadId, leadId
    sourceType: mysqlEnum('sourceType', [
      'appointment',
      'camp_registration',
      'offer_lead',
      'lead',
    ]).notNull(),

    // حالة الإرسال
    status: mysqlEnum('status', ['pending', 'sent', 'delivered', 'read', 'failed'])
      .default('pending')
      .notNull(),

    // متغيرات القالب (JSON)
    templateVariables: text('templateVariables'), // JSON

    // التوقيتات
    sentAt: timestamp('sentAt'),
    deliveredAt: timestamp('deliveredAt'),
    readAt: timestamp('readAt'),
    errorInfo: text('errorInfo'),

    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    broadcastIdx: index('broadcast_recipients_broadcastId_idx').on(table.broadcastId),
    phoneIdx: index('broadcast_recipients_phone_idx').on(table.phoneNumber),
    statusIdx: index('broadcast_recipients_status_idx').on(table.status),
    recipientTypeIdx: index('broadcast_recipients_type_idx').on(table.recipientType),
  })
);

export type BroadcastRecipient = typeof broadcastRecipients.$inferSelect;
export type InsertBroadcastRecipient = typeof broadcastRecipients.$inferInsert;

/**
 * Broadcast Recipient Results table - نتائج الإرسال التفصيلية
 * تتبع تفاصيل كل رسالة مرسلة من Meta
 */

/**
 * Broadcast Recipient Results table - نتائج الإرسال التفصيلية
 * تتبع تفاصيل كل رسالة مرسلة من Meta
 */
export const broadcastRecipientResults = mysqlTable(
  'broadcast_recipient_results',
  {
    id: int('id').autoincrement().primaryKey(),

    // الربط
    broadcastId: int('broadcastId').notNull(),
    recipientId: int('recipientId').notNull(),

    // معرف الرسالة من Meta
    whatsappMessageId: varchar('whatsappMessageId', { length: 255 }),

    // حالة الإرسال
    status: mysqlEnum('status', ['sent', 'delivered', 'read', 'failed']).default('sent').notNull(),

    // معلومات الخطأ
    errorCode: varchar('errorCode', { length: 50 }),
    errorMessage: text('errorMessage'),

    // التوقيتات
    sentAt: timestamp('sentAt'),
    deliveredAt: timestamp('deliveredAt'),
    readAt: timestamp('readAt'),

    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    broadcastIdx: index('broadcast_recipient_results_broadcastId_idx').on(table.broadcastId),
    statusIdx: index('broadcast_recipient_results_status_idx').on(table.status),
  })
);

export type BroadcastRecipientResult = typeof broadcastRecipientResults.$inferSelect;
export type InsertBroadcastRecipientResult = typeof broadcastRecipientResults.$inferInsert;

/**
 * Contact Exports table - تسجيل عمليات تصدير الجهات
 */

/**
 * Contact Exports table - تسجيل عمليات تصدير الجهات
 */
export const contactExports = mysqlTable(
  'contact_exports',
  {
    id: int('id').autoincrement().primaryKey(),

    // نوع التصدير
    exportType: mysqlEnum('exportType', ['vcf', 'csv', 'google_sync']).notNull(),

    // معايير التصفية المستخدمة
    filterCriteria: text('filterCriteria'), // JSON

    // النتائج
    totalContacts: int('totalContacts').default(0).notNull(),
    exportedContacts: int('exportedContacts').default(0).notNull(),
    failedContacts: int('failedContacts').default(0).notNull(),

    // معلومات الملف
    fileUrl: varchar('fileUrl', { length: 500 }),
    fileKey: varchar('fileKey', { length: 500 }),

    // الحالة
    status: mysqlEnum('status', ['pending', 'processing', 'completed', 'failed'])
      .default('pending')
      .notNull(),
    errorInfo: text('errorInfo'),

    // المستخدم
    createdBy: int('createdBy').notNull(),

    createdAt: timestamp('createdAt').defaultNow().notNull(),
    completedAt: timestamp('completedAt'),
  },
  (table) => ({
    statusIdx: index('contact_exports_status_idx').on(table.status),
    createdAtIdx: index('contact_exports_createdAt_idx').on(table.createdAt),
  })
);

export type ContactExport = typeof contactExports.$inferSelect;
export type InsertContactExport = typeof contactExports.$inferInsert;

/**
 * Contact Sync Logs table - سجلات مزامنة Google Contacts
 */

/**
 * Contact Sync Logs table - سجلات مزامنة Google Contacts
 */
export const contactSyncLogs = mysqlTable(
  'contact_sync_logs',
  {
    id: int('id').autoincrement().primaryKey(),

    // نوع المزامنة
    syncType: mysqlEnum('syncType', [
      'export_to_google',
      'import_from_google',
      'sync_bidirectional',
    ]).notNull(),

    // النتائج
    totalContacts: int('totalContacts').default(0).notNull(),
    syncedContacts: int('syncedContacts').default(0).notNull(),
    failedContacts: int('failedContacts').default(0).notNull(),

    // الحالة
    status: mysqlEnum('status', ['pending', 'processing', 'completed', 'failed'])
      .default('pending')
      .notNull(),
    errorInfo: text('errorInfo'),

    // حساب Google
    googleAccountEmail: varchar('googleAccountEmail', { length: 320 }),

    // المستخدم
    createdBy: int('createdBy').notNull(),

    createdAt: timestamp('createdAt').defaultNow().notNull(),
    completedAt: timestamp('completedAt'),
  },
  (table) => ({
    syncTypeIdx: index('contact_sync_logs_syncType_idx').on(table.syncType),
    statusIdx: index('contact_sync_logs_status_idx').on(table.status),
    createdAtIdx: index('contact_sync_logs_createdAt_idx').on(table.createdAt),
  })
);

export type ContactSyncLog = typeof contactSyncLogs.$inferSelect;
export type InsertContactSyncLog = typeof contactSyncLogs.$inferInsert;
