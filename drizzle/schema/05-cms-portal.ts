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

import { users } from './07-users-rbac';

/**
 * Text Content Table - جدول النصوص والعناوين
 * يخزّن جميع النصوص والعناوين في المنصة مع دعم متعدد اللغات
 */
export const textContent = mysqlTable(
  'textContent',
  {
    id: int('id').autoincrement().primaryKey(),
    key: varchar('key', { length: 255 }).notNull().unique(),
    language: varchar('language', { length: 10 }).default('ar').notNull(),
    content: text('content').notNull(),
    section: varchar('section', { length: 100 }),
    sectionId: int('sectionId').references(() => sections.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }), // معرف القسم المرتبط
    pageId: int('pageId').references(() => pages.id, { onDelete: 'set null', onUpdate: 'cascade' }), // معرف الصفحة المرتبطة
    type: mysqlEnum('type', [
      'title', // عنوان
      'subtitle', // عنوان فرعي
      'description', // وصف
      'text', // نص عادي
      'button', // نص زر
      'link', // نص رابط
      'label', // تسمية
      'placeholder', // نص placeholder
      'error', // رسالة خطأ
      'success', // رسالة نجاح
      'warning', // رسالة تحذير
      'info', // رسالة معلومات
    ])
      .default('text')
      .notNull(),
    status: mysqlEnum('status', ['draft', 'published', 'archived']).default('draft').notNull(), // حالة النشر
    isActive: mysqlEnum('isActive', ['yes', 'no']).default('yes').notNull(),
    publishedAt: timestamp('publishedAt'), // تاريخ النشر
    deletedAt: timestamp('deletedAt'), // تاريخ الحذف الناعم
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
  },
  (table) => ({
    languageIdx: index('textContent_language_idx').on(table.language),
    sectionIdx: index('textContent_section_idx').on(table.section),
    sectionIdIdx: index('textContent_sectionId_idx').on(table.sectionId),
    pageIdIdx: index('textContent_pageId_idx').on(table.pageId),
    typeIdx: index('textContent_type_idx').on(table.type),
    statusIdx: index('textContent_status_idx').on(table.status),
    isActiveIdx: index('textContent_isActive_idx').on(table.isActive),
    pageLanguageIdx: index('textContent_pageLanguage_idx').on(table.pageId, table.language),
    sectionLanguageIdx: index('textContent_sectionLanguage_idx').on(table.section, table.language),
    statusPageIdx: index('textContent_statusPage_idx').on(table.status, table.pageId),
    deletedAtIdx: index('textContent_deletedAt_idx').on(table.deletedAt),
  })
);

export type TextContent = typeof textContent.$inferSelect;
export type InsertTextContent = typeof textContent.$inferInsert;

/**
 * Images Table - جدول الصور
 * يخزّن جميع الصور المستخدمة في المنصة
 */

/**
 * Images Table - جدول الصور
 * يخزّن جميع الصور المستخدمة في المنصة
 */
export const images = mysqlTable(
  'images',
  {
    id: int('id').autoincrement().primaryKey(),
    key: varchar('key', { length: 255 }).notNull().unique(),
    url: varchar('url', { length: 500 }).notNull(),
    altAr: text('altAr'), // نص بديل بالعربية
    altEn: text('altEn'), // نص بديل بالإنجليزية
    section: varchar('section', { length: 100 }),
    sectionId: int('sectionId').references(() => sections.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }), // معرف القسم المرتبط
    pageId: int('pageId').references(() => pages.id, { onDelete: 'set null', onUpdate: 'cascade' }), // معرف الصفحة المرتبطة
    width: int('width'),
    height: int('height'),
    format: varchar('format', { length: 10 }),
    size: int('size'),
    status: mysqlEnum('status', ['draft', 'published', 'archived']).default('draft').notNull(), // حالة النشر
    isActive: mysqlEnum('isActive', ['yes', 'no']).default('yes').notNull(),
    publishedAt: timestamp('publishedAt'), // تاريخ النشر
    deletedAt: timestamp('deletedAt'), // تاريخ الحذف الناعم
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
  },
  (table) => ({
    sectionIdx: index('images_section_idx').on(table.section),
    sectionIdIdx: index('images_sectionId_idx').on(table.sectionId),
    pageIdIdx: index('images_pageId_idx').on(table.pageId),
    statusIdx: index('images_status_idx').on(table.status),
    isActiveIdx: index('images_isActive_idx').on(table.isActive),
    pageSectionIdx: index('images_pageSection_idx').on(table.pageId, table.section),
    statusPageIdx: index('images_statusPage_idx').on(table.status, table.pageId),
    deletedAtIdx: index('images_deletedAt_idx').on(table.deletedAt),
  })
);

export type Image = typeof images.$inferSelect;
export type InsertImage = typeof images.$inferInsert;

/**
 * Media folders table - شجرة مجلدات مكتبة الوسائط
 */

/**
 * Media folders table - شجرة مجلدات مكتبة الوسائط
 */
export const mediaFolders = mysqlTable(
  'media_folders',
  {
    id: int('id').autoincrement().primaryKey(),
    name: varchar('name', { length: 120 }).notNull(),
    parentId: int('parentId'),
    path: varchar('path', { length: 500 }).notNull().unique(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    parentIdx: index('media_folders_parent_idx').on(table.parentId),
  })
);

export type MediaFolder = typeof mediaFolders.$inferSelect;
export type InsertMediaFolder = typeof mediaFolders.$inferInsert;

/**
 * Media Table - جدول الوسائط العام
 * يخزّن جميع أنواع الوسائط: الصور والفيديو والصوت والمستندات.
 */

/**
 * Media Table - جدول الوسائط العام
 * يخزّن جميع أنواع الوسائط: الصور والفيديو والصوت والمستندات.
 */
export const media = mysqlTable(
  'media',
  {
    id: int('id').autoincrement().primaryKey(),
    key: varchar('key', { length: 255 }).notNull().unique(),
    url: varchar('url', { length: 500 }).notNull(),
    type: mysqlEnum('type', ['image', 'video', 'audio', 'document', 'other'])
      .default('image')
      .notNull(), // نوع الميديا
    mimeType: varchar('mimeType', { length: 100 }), // نوع MIME
    fileName: varchar('fileName', { length: 255 }), // اسم الملف الأصلي
    altAr: text('altAr'), // نص بديل بالعربية
    altEn: text('altEn'), // نص بديل بالإنجليزية
    descriptionAr: text('descriptionAr'), // وصف بالعربية
    descriptionEn: text('descriptionEn'), // وصف بالإنجليزية
    section: varchar('section', { length: 100 }),
    folderId: int('folderId'),
    sectionId: int('sectionId').references(() => sections.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }), // معرف القسم المرتبط
    pageId: int('pageId').references(() => pages.id, { onDelete: 'set null', onUpdate: 'cascade' }), // معرف الصفحة المرتبطة
    width: int('width'), // العرض (للصور والفيديو)
    height: int('height'), // الارتفاع (للصور والفيديو)
    duration: int('duration'), // المدة بالثواني (للفيديو والصوت)
    format: varchar('format', { length: 10 }), // صيغة الملف
    size: int('size'), // الحجم بالبايت
    thumbnailUrl: varchar('thumbnailUrl', { length: 500 }), // رابط الصورة المصغرة (للفيديو)
    status: mysqlEnum('status', ['draft', 'published', 'archived']).default('draft').notNull(), // حالة النشر
    isActive: mysqlEnum('isActive', ['yes', 'no']).default('yes').notNull(),
    publishedAt: timestamp('publishedAt'), // تاريخ النشر
    deletedAt: timestamp('deletedAt'), // تاريخ الحذف الناعم
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
  },
  (table) => ({
    typeIdx: index('media_type_idx').on(table.type),
    sectionIdx: index('media_section_idx').on(table.section),
    folderIdx: index('media_folder_idx').on(table.folderId),
    sectionIdIdx: index('media_sectionId_idx').on(table.sectionId),
    pageIdIdx: index('media_pageId_idx').on(table.pageId),
    statusIdx: index('media_status_idx').on(table.status),
    isActiveIdx: index('media_isActive_idx').on(table.isActive),
    pageSectionIdx: index('media_pageSection_idx').on(table.pageId, table.section),
    typePageIdx: index('media_typePage_idx').on(table.type, table.pageId),
    statusPageIdx: index('media_statusPage_idx').on(table.status, table.pageId),
    deletedAtIdx: index('media_deletedAt_idx').on(table.deletedAt),
  })
);

export type Media = typeof media.$inferSelect;
export type InsertMedia = typeof media.$inferInsert;

/**
 * Color Scheme Table - جدول الألوان
 * يخزّن نظام الألوان المستخدم في المنصة
 */

/**
 * Color Scheme Table - جدول الألوان
 * يخزّن نظام الألوان المستخدم في المنصة
 */
export const colorScheme = mysqlTable('colorScheme', {
  id: int('id').autoincrement().primaryKey(),
  key: varchar('key', { length: 255 }).notNull().unique(),
  value: varchar('value', { length: 50 }).notNull(),
  type: mysqlEnum('type', ['primary', 'secondary', 'accent', 'background', 'text', 'border']),
  shade: varchar('shade', { length: 20 }),
  isActive: mysqlEnum('isActive', ['yes', 'no']).default('yes').notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export type ColorScheme = typeof colorScheme.$inferSelect;
export type InsertColorScheme = typeof colorScheme.$inferInsert;

/**
 * SEO Settings Table - جدول إعدادات SEO
 * يخزّن إعدادات SEO لكل صفحة
 */

/**
 * SEO Settings Table - جدول إعدادات SEO
 * يخزّن إعدادات SEO لكل صفحة
 */
export const seoSettings = mysqlTable(
  'seoSettings',
  {
    id: int('id').autoincrement().primaryKey(),
    pageId: int('pageId'),
    pageKey: varchar('pageKey', { length: 255 }),
    slug: varchar('slug', { length: 255 }),
    language: varchar('language', { length: 10 }).default('ar'),
    title: varchar('title', { length: 255 }),
    description: text('description'),
    keywords: text('keywords'),
    ogTitle: varchar('ogTitle', { length: 255 }),
    ogDescription: text('ogDescription'),
    ogImage: varchar('ogImage', { length: 500 }),
    canonicalUrl: varchar('canonicalUrl', { length: 500 }),
    robots: text('robots'),
    structuredData: text('structuredData'),
    isActive: mysqlEnum('isActive', ['yes', 'no']).default('yes').notNull(),
    status: mysqlEnum('status', ['draft', 'published', 'archived']).default('draft').notNull(),
    publishedAt: timestamp('publishedAt'),
    deletedAt: timestamp('deletedAt'),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
  },
  (table) => ({
    pageIdIdx: index('seoSettings_pageId_idx').on(table.pageId),
    pageKeyIdx: index('seoSettings_pageKey_idx').on(table.pageKey),
    slugLanguageIdx: index('seoSettings_slugLanguage_idx').on(table.slug, table.language),
    statusIdx: index('seoSettings_status_idx').on(table.status),
    deletedAtIdx: index('seoSettings_deletedAt_idx').on(table.deletedAt),
  })
);

export type SEOSettings = typeof seoSettings.$inferSelect;
export type InsertSEOSettings = typeof seoSettings.$inferInsert;

/**
 * Content Audit Log Table - جدول سجل التغييرات
 * يخزّن سجل جميع التغييرات على المحتوى
 */

/**
 * Content Audit Log Table - جدول سجل التغييرات
 * يخزّن سجل جميع التغييرات على المحتوى
 */
export const contentAuditLog = mysqlTable('contentAuditLog', {
  id: int('id').autoincrement().primaryKey(),
  entityType: mysqlEnum('entityType', [
    'text',
    'image',
    'color',
    'seo',
    'page',
    'section',
    'sectionButton',
    'operation',
  ]),
  entityId: int('entityId'),
  action: mysqlEnum('action', [
    'create',
    'update',
    'delete',
    'operation_succeeded',
    'operation_failed',
  ]),
  oldValue: text('oldValue'),
  newValue: text('newValue'),
  userId: int('userId'),
  ipAddress: varchar('ipAddress', { length: 50 }),
  userAgent: text('userAgent'),
  reason: text('reason'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export type ContentAuditLog = typeof contentAuditLog.$inferSelect;
export type InsertContentAuditLog = typeof contentAuditLog.$inferInsert;

/**
 * CMS Trash Retention Policy - سياسة الاحتفاظ بسلة محذوفات المحتوى
 * صف وحيد للتحكم في الحذف النهائي المؤجل ومهمة Heartbeat المرتبطة به.
 */

/**
 * CMS Trash Retention Policy - سياسة الاحتفاظ بسلة محذوفات المحتوى
 * صف وحيد للتحكم في الحذف النهائي المؤجل ومهمة Heartbeat المرتبطة به.
 */
export const cmsTrashRetentionPolicies = mysqlTable(
  'cmsTrashRetentionPolicies',
  {
    id: int('id').autoincrement().primaryKey(),
    policyKey: varchar('policyKey', { length: 50 }).notNull().unique(),
    retentionDays: int('retentionDays').default(30).notNull(),
    isEnabled: boolean('isEnabled').default(true).notNull(),
    scheduleCronTaskUid: varchar('scheduleCronTaskUid', { length: 65 }),
    lastPurgeAt: timestamp('lastPurgeAt'),
    lastPurgeSummary: text('lastPurgeSummary'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    scheduleCronTaskUidIdx: index('cmsTrashRetentionPolicies_scheduleCronTaskUid_idx').on(
      table.scheduleCronTaskUid
    ),
  })
);

export type CmsTrashRetentionPolicy = typeof cmsTrashRetentionPolicies.$inferSelect;
export type InsertCmsTrashRetentionPolicy = typeof cmsTrashRetentionPolicies.$inferInsert;

/**
 * Content Versions Table - جدول النسخ المحفوظة
 * يخزّن النسخ المحفوظة من المحتوى للتراجع والإعادة
 */

/**
 * Content Versions Table - جدول النسخ المحفوظة
 * يخزّن النسخ المحفوظة من المحتوى للتراجع والإعادة
 */
export const contentVersions = mysqlTable('contentVersions', {
  id: int('id').autoincrement().primaryKey(),
  entityType: mysqlEnum('entityType', [
    'text',
    'image',
    'color',
    'seo',
    'page',
    'section',
    'sectionButton',
  ]).notNull(),
  entityId: int('entityId').notNull(),
  versionNumber: int('versionNumber').notNull(),
  data: text('data').notNull(), // JSON string of the complete entity data
  userId: int('userId'),
  reason: text('reason'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export type ContentVersion = typeof contentVersions.$inferSelect;
export type InsertContentVersion = typeof contentVersions.$inferInsert;

/**
 * Pages Table - جدول الصفحات
 * يخزّن معلومات الصفحات الرئيسية والفرعية مع بيانات SEO كاملة
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const pages: any = mysqlTable(
  'pages',
  {
    id: int('id').autoincrement().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    type: mysqlEnum('type', ['main', 'sub']).default('main').notNull(),
    parentId: int('parentId').references(() => pages.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
    titleAr: varchar('titleAr', { length: 255 }).notNull(),
    titleEn: varchar('titleEn', { length: 255 }).notNull(),
    metaTitleAr: varchar('metaTitleAr', { length: 255 }),
    metaTitleEn: varchar('metaTitleEn', { length: 255 }),
    metaDescriptionAr: text('metaDescriptionAr'),
    metaDescriptionEn: text('metaDescriptionEn'),
    keywordsAr: text('keywordsAr'),
    keywordsEn: text('keywordsEn'),
    isActive: mysqlEnum('isActive', ['yes', 'no']).default('yes').notNull(),
    sortOrder: int('sortOrder').default(0).notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
    status: mysqlEnum('status', ['draft', 'published', 'archived']).default('draft').notNull(),
    publishedAt: timestamp('publishedAt'),
    deletedAt: timestamp('deletedAt'),
  },
  (table) => ({
    slugIdx: index('pages_slug_idx').on(table.slug),
    typeIdx: index('pages_type_idx').on(table.type),
    parentIdIdx: index('pages_parentId_idx').on(table.parentId),
    statusIdx: index('pages_status_idx').on(table.status),
    isActiveIdx: index('pages_isActive_idx').on(table.isActive),
    sortOrderIdx: index('pages_sortOrder_idx').on(table.sortOrder),
    typeParentIdx: index('pages_typeParent_idx').on(table.type, table.parentId),
    statusActiveIdx: index('pages_statusActive_idx').on(table.status, table.isActive),
    deletedAtIdx: index('pages_deletedAt_idx').on(table.deletedAt),
  })
);

export type Page = typeof pages.$inferSelect;
export type InsertPage = typeof pages.$inferInsert;

/**
 * CMS Preview Tokens Table - روابط قصيرة العمر لمعاينة مسودات الصفحة دون جعلها عامة.
 * لا يُخزّن الرمز الخام، بل بصمة SHA-256 فقط حتى لا يمكن استعادته من قاعدة البيانات.
 */

/**
 * CMS Preview Tokens Table - روابط قصيرة العمر لمعاينة مسودات الصفحة دون جعلها عامة.
 * لا يُخزّن الرمز الخام، بل بصمة SHA-256 فقط حتى لا يمكن استعادته من قاعدة البيانات.
 */
export const cmsPreviewTokens = mysqlTable(
  'cmsPreviewTokens',
  {
    id: int('id').autoincrement().primaryKey(),
    tokenHash: varchar('tokenHash', { length: 64 }).notNull().unique(),
    pageId: int('pageId')
      .notNull()
      .references(() => pages.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    language: varchar('language', { length: 10 }).default('ar').notNull(),
    createdByUserId: int('createdByUserId').references(() => users.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
    expiresAt: timestamp('expiresAt').notNull(),
    revokedAt: timestamp('revokedAt'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
  },
  (table) => ({
    pageIdIdx: index('cmsPreviewTokens_pageId_idx').on(table.pageId),
    expiresAtIdx: index('cmsPreviewTokens_expiresAt_idx').on(table.expiresAt),
    revokedAtIdx: index('cmsPreviewTokens_revokedAt_idx').on(table.revokedAt),
  })
);

export type CmsPreviewToken = typeof cmsPreviewTokens.$inferSelect;
export type InsertCmsPreviewToken = typeof cmsPreviewTokens.$inferInsert;

/**
 * Sections Table - جدول الأقسام
 * يخزّن معلومات الأقسام داخل الصفحات
 */

/**
 * Sections Table - جدول الأقسام
 * يخزّن معلومات الأقسام داخل الصفحات
 */
export const sections = mysqlTable(
  'sections',
  {
    id: int('id').autoincrement().primaryKey(),
    pageId: int('pageId')
      .notNull()
      .references(() => pages.id, { onDelete: 'cascade', onUpdate: 'cascade' }), // معرف الصفحة المرتبطة
    name: varchar('name', { length: 255 }).notNull(), // اسم القسم (للعرض في لوحة الإدارة)
    titleAr: varchar('titleAr', { length: 255 }), // عنوان القسم بالعربية
    titleEn: varchar('titleEn', { length: 255 }), // عنوان القسم بالإنجليزية
    subtitleAr: varchar('subtitleAr', { length: 255 }), // العنوان الفرعي بالعربية
    subtitleEn: varchar('subtitleEn', { length: 255 }), // العنوان الفرعي بالإنجليزية
    type: mysqlEnum('type', [
      'slider', // سلايدر (صور متعددة مع نصوص)
      'text', // نصوص فقط
      'text-cards', // بطاقات نصوص
      'stats-cards', // بطاقات إحصائيات
      'image-cards', // بطاقات صور متعددة
      'image', // صورة واحدة
      'video', // فيديو
      'hero', // قسم رئيسي
      'cta', // دعوة للإجراء
      'features', // ميزات
      'testimonials', // شهادات العملاء
      'faq', // أسئلة شائعة
      'contact', // نموذج تواصل
      'pricing', // أسعار
      'team', // فريق العمل
      'gallery', // معرض صور
      'timeline', // جدول زمني
      'custom', // مخصص
    ])
      .default('text')
      .notNull(), // نوع القسم
    settings: text('settings'), // إعدادات مخصصة لكل نوع قسم (JSON)
    status: mysqlEnum('status', ['draft', 'published', 'archived']).default('draft').notNull(), // حالة النشر
    sortOrder: int('sortOrder').default(0).notNull(), // ترتيب القسم
    isActive: mysqlEnum('isActive', ['yes', 'no']).default('yes').notNull(), // حالة القسم: نشط أو معطل
    publishedAt: timestamp('publishedAt'), // تاريخ النشر
    deletedAt: timestamp('deletedAt'), // تاريخ الحذف الناعم
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    pageIdIdx: index('sections_pageId_idx').on(table.pageId),
    typeIdx: index('sections_type_idx').on(table.type),
    statusIdx: index('sections_status_idx').on(table.status),
    isActiveIdx: index('sections_isActive_idx').on(table.isActive),
    sortOrderIdx: index('sections_sortOrder_idx').on(table.sortOrder),
    pageTypeIdx: index('sections_pageType_idx').on(table.pageId, table.type),
    pageActiveIdx: index('sections_pageActive_idx').on(table.pageId, table.isActive),
    statusPageIdx: index('sections_statusPage_idx').on(table.status, table.pageId),
    deletedAtIdx: index('sections_deletedAt_idx').on(table.deletedAt),
  })
);

export type Section = typeof sections.$inferSelect;
export type InsertSection = typeof sections.$inferInsert;

/**
 * Section Buttons Table - جدول أزرار الأقسام
 * يخزّن أزرار الأقسام المرتبطة
 */

/**
 * Section Buttons Table - جدول أزرار الأقسام
 * يخزّن أزرار الأقسام المرتبطة
 */
export const sectionButtons = mysqlTable(
  'sectionButtons',
  {
    id: int('id').autoincrement().primaryKey(),
    sectionId: int('sectionId')
      .notNull()
      .references(() => sections.id, { onDelete: 'cascade', onUpdate: 'cascade' }), // معرف القسم المرتبط
    textAr: varchar('textAr', { length: 255 }).notNull(), // نص الزر بالعربية
    textEn: varchar('textEn', { length: 255 }).notNull(), // نص الزر بالإنجليزية
    link: varchar('link', { length: 500 }).notNull(), // رابط الزر
    style: mysqlEnum('style', ['primary', 'secondary', 'outline', 'ghost'])
      .default('primary')
      .notNull(), // نمط الزر
    sortOrder: int('sortOrder').default(0).notNull(), // ترتيب الزر
    isActive: mysqlEnum('isActive', ['yes', 'no']).default('yes').notNull(), // حالة الزر: نشط أو معطل
    status: mysqlEnum('status', ['draft', 'published', 'archived']).default('draft').notNull(),
    publishedAt: timestamp('publishedAt'),
    deletedAt: timestamp('deletedAt'), // تاريخ الحذف الناعم
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    sectionIdIdx: index('sectionButtons_sectionId_idx').on(table.sectionId),
    statusIdx: index('sectionButtons_status_idx').on(table.status),
    deletedAtIdx: index('sectionButtons_deletedAt_idx').on(table.deletedAt),
    sectionStatusIdx: index('sectionButtons_sectionStatus_idx').on(table.sectionId, table.status),
  })
);

export type SectionButton = typeof sectionButtons.$inferSelect;
export type InsertSectionButton = typeof sectionButtons.$inferInsert;

/**
 * Content Approvals Table - جدول موافقات المحتوى
 * يخزّن طلبات الموافقة على التغييرات في المحتوى
 */

/**
 * Content Approvals Table - جدول موافقات المحتوى
 * يخزّن طلبات الموافقة على التغييرات في المحتوى
 */
export const contentApprovals = mysqlTable(
  'contentApprovals',
  {
    id: int('id').autoincrement().primaryKey(),
    entityType: varchar('entityType', { length: 50 }).notNull(), // نوع الكيان (textContent, image, media, page, section)
    entityId: int('entityId').notNull(), // معرف الكيان
    entityTypeVersion: int('entityTypeVersion').default(0).notNull(), // إصدار الكيان
    requestedBy: int('requestedBy')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' }), // معرف المستخدم الذي طلب الموافقة
    requestedAt: timestamp('requestedAt').defaultNow().notNull(), // تاريخ طلب الموافقة
    assignedReviewerId: int('assignedReviewerId').references(() => users.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }), // المراجع المعيّن للطلب، إن وجد
    approvedBy: int('approvedBy').references(() => users.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }), // معرف المستخدم الذي وافق
    approvedAt: timestamp('approvedAt'), // تاريخ الموافقة
    rejectedBy: int('rejectedBy').references(() => users.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }), // معرف المستخدم الذي رفض
    rejectedAt: timestamp('rejectedAt'), // تاريخ الرفض
    status: mysqlEnum('status', ['pending', 'approved', 'rejected']).default('pending').notNull(), // حالة الموافقة
    rejectionReason: text('rejectionReason'), // سبب الرفض
    changes: text('changes').notNull(), // التغييرات المطلوبة (JSON)
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    entityTypeEntityIdIdx: index('contentApprovals_entityTypeEntityId_idx').on(
      table.entityType,
      table.entityId
    ),
    statusIdx: index('contentApprovals_status_idx').on(table.status),
    requestedByIdx: index('contentApprovals_requestedBy_idx').on(table.requestedBy),
    assignedReviewerIdx: index('contentApprovals_assignedReviewer_idx').on(
      table.assignedReviewerId
    ),
    approvedByIdx: index('contentApprovals_approvedBy_idx').on(table.approvedBy),
    rejectedByIdx: index('contentApprovals_rejectedBy_idx').on(table.rejectedBy),
    requestedAtIdx: index('contentApprovals_requestedAt_idx').on(table.requestedAt),
  })
);

export type ContentApproval = typeof contentApprovals.$inferSelect;
export type InsertContentApproval = typeof contentApprovals.$inferInsert;

/**
 * Notifications Table - جدول الإشعارات
 * يخزّن جميع الإشعارات للمستخدمين
 */
