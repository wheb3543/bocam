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
 * WhatsApp Conversations table - stores all WhatsApp conversations
 * جدول محادثات واتساب - يخزن جميع محادثات واتساب
 */
export const whatsappConversations = mysqlTable(
  'whatsapp_conversations',
  {
    id: int('id').autoincrement().primaryKey(),
    phoneNumber: varchar('phoneNumber', { length: 20 }).notNull(),
    customerName: varchar('customerName', { length: 255 }),
    lastMessage: text('lastMessage'),
    lastMessageAt: timestamp('lastMessageAt'),
    unreadCount: int('unreadCount').default(0).notNull(),
    isImportant: int('isImportant').default(0).notNull(), // 0 = false, 1 = true
    isArchived: int('isArchived').default(0).notNull(),
    // Link to booking/appointment
    leadId: int('leadId'),
    appointmentId: int('appointmentId'),
    offerLeadId: int('offerLeadId'),
    campRegistrationId: int('campRegistrationId'),
    labOrderId: int('labOrderId'), // Link to lab order from hospital database
    assignedToUserId: int('assignedToUserId'), // Assigned staff member
    notes: text('notes'), // Notes about the conversation
    // Conversation data from Meta
    conversationIdMeta: varchar('conversationIdMeta', { length: 255 }), // Meta conversation ID
    originType: varchar('originType', { length: 50 }), // conversation.origin.type
    expirationTimestamp: timestamp('expirationTimestamp'), // conversation.expiration_timestamp
    pricingModel: varchar('pricingModel', { length: 50 }), // pricing.pricing_model
    billable: boolean('billable').default(false).notNull(), // pricing.billable
    pricingCategory: varchar('pricingCategory', { length: 50 }), // pricing.category
    totalCost: int('totalCost').default(0).notNull(), // Total cost of conversation
    messageCount: int('messageCount').default(0).notNull(), // Total messages in conversation
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    labOrderIdx: index('labOrderIdx').on(table.labOrderId),
  })
);

export type WhatsAppConversation = typeof whatsappConversations.$inferSelect;
export type InsertWhatsAppConversation = typeof whatsappConversations.$inferInsert;

/**
 * WhatsApp Messages table - stores all messages in conversations
 * جدول رسائل واتساب - يخزن جميع الرسائل في المحادثات
 */

/**
 * WhatsApp Messages table - stores all messages in conversations
 * جدول رسائل واتساب - يخزن جميع الرسائل في المحادثات
 */
export const whatsappMessages = mysqlTable('whatsapp_messages', {
  id: int('id').autoincrement().primaryKey(),
  conversationId: int('conversationId').notNull(),
  direction: mysqlEnum('direction', ['inbound', 'outbound']).notNull(),
  content: text('content').notNull(),
  messageType: mysqlEnum('messageType', [
    'text',
    'image',
    'document',
    'audio',
    'video',
    'location',
    'template',
    'interactive',
    'contacts',
    'unknown',
    'button_reply',
    'list_reply',
    'sticker',
    'reaction',
    'order',
    'referral',
    'product_enquiry',
    'unsupported',
  ])
    .default('text')
    .notNull(),
  mediaId: varchar('mediaId', { length: 255 }), // WhatsApp Media ID for retrieving media from Meta API
  mediaUrl: varchar('mediaUrl', { length: 500 }), // Temporary media URL from Meta (deprecated, use mediaId instead)
  status: mysqlEnum('status', ['sent', 'delivered', 'read', 'failed', 'received'])
    .default('sent')
    .notNull(),
  whatsappMessageId: varchar('whatsappMessageId', { length: 255 }), // WhatsApp API message ID
  sentBy: int('sentBy'), // User ID who sent (for outbound)
  isAutomated: int('isAutomated').default(0).notNull(), // 0 = manual, 1 = automated
  replyToMessageId: int('replyToMessageId'), // ID of the message being replied to
  sentAt: timestamp('sentAt'), // When the message was actually sent to WhatsApp
  deliveredAt: timestamp('deliveredAt'),
  readAt: timestamp('readAt'),
  errorInfo: text('errorInfo'),
  metadata: text('metadata'), // JSON metadata for additional message data (e.g., image URL, location coordinates)
  // Conversation pricing data
  conversationIdMeta: varchar('conversationIdMeta', { length: 255 }), // Meta conversation ID
  conversationOriginType: varchar('conversationOriginType', { length: 50 }), // conversation.origin.type
  conversationExpirationTimestamp: timestamp('conversationExpirationTimestamp'), // conversation.expiration_timestamp
  pricingModel: varchar('pricingModel', { length: 50 }), // pricing.pricing_model
  pricingBillable: boolean('pricingBillable').default(false).notNull(), // pricing.billable
  pricingCategory: varchar('pricingCategory', { length: 50 }), // pricing.category
  // Identity data
  identityAcknowledged: boolean('identityAcknowledged').default(false).notNull(), // identity.acknowledged
  identityHash: varchar('identityHash', { length: 255 }), // identity.hash
  // Reaction data
  reactionEmoji: varchar('reactionEmoji', { length: 50 }), // reaction.emoji
  reactionMessageId: varchar('reactionMessageId', { length: 255 }), // reaction.message_id
  // Order data
  orderCatalogId: varchar('orderCatalogId', { length: 255 }), // order.catalog_id
  orderProductItems: text('orderProductItems'), // order.product_items (JSON)
  // Referral data
  referralSourceUrl: text('referralSourceUrl'), // referral.source_url
  referralSourceId: varchar('referralSourceId', { length: 255 }), // referral.source_id
  referralSourceType: varchar('referralSourceType', { length: 50 }), // referral.source_type
  // Product enquiry data
  productCatalogId: varchar('productCatalogId', { length: 255 }), // interactive.referred_product.catalog_id
  productRetailerId: varchar('productRetailerId', { length: 255 }), // interactive.referred_product.product_retailer_id
  // Transaction data
  transactionStatus: varchar('transactionStatus', { length: 50 }), // transaction status
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export type WhatsAppMessage = typeof whatsappMessages.$inferSelect;
export type InsertWhatsAppMessage = typeof whatsappMessages.$inferInsert;

/**
 * WhatsApp Templates table - stores message templates
 * جدول قوالب واتساب - يخزن قوالب الرسائل
 */

/**
 * WhatsApp Templates table - stores message templates
 * جدول قوالب واتساب - يخزن قوالب الرسائل
 */
export const whatsappTemplates = mysqlTable('whatsapp_templates', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  category: mysqlEnum('category', ['MARKETING', 'UTILITY', 'AUTHENTICATION'])
    .notNull()
    .default('UTILITY'),
  content: text('content').notNull(),
  variables: text('variables'), // JSON array of variable names like ["name", "date", "time"]
  isActive: int('isActive').default(1).notNull(),
  usageCount: int('usageCount').default(0).notNull(),
  createdBy: int('createdBy').notNull(),
  // Meta Business Manager fields
  metaName: varchar('metaName', { length: 255 }), // Template name in Meta (snake_case)
  languageCode: varchar('languageCode', { length: 20 }), // e.g. "ar", "en_US"
  metaStatus: varchar('metaStatus', { length: 50 }), // APPROVED, PENDING, REJECTED
  metaCategory: varchar('metaCategory', { length: 50 }), // UTILITY, MARKETING, AUTHENTICATION
  metaTemplateId: varchar('metaTemplateId', { length: 64 }), // Meta's internal template ID (returned after creation)
  headerText: text('headerText'), // Optional header component
  footerText: varchar('footerText', { length: 255 }), // Optional footer component
  buttons: text('buttons'), // JSON array of buttons from template components
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type WhatsAppTemplate = typeof whatsappTemplates.$inferSelect;
export type InsertWhatsAppTemplate = typeof whatsappTemplates.$inferInsert;

/**
 * WhatsApp Broadcasts table - stores broadcast campaigns
 * جدول الرسائل الجماعية - يخزن حملات الرسائل الجماعية
 */

/**
 * WhatsApp Broadcasts table - stores broadcast campaigns
 * جدول الرسائل الجماعية - يخزن حملات الرسائل الجماعية
 */
export const whatsappBroadcasts = mysqlTable(
  'whatsapp_broadcasts',
  {
    id: int('id').autoincrement().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    message: text('message').notNull(),
    templateId: int('templateId'),
    targetFilter: text('targetFilter'), // JSON filter criteria
    recipientCount: int('recipientCount').default(0).notNull(),
    sentCount: int('sentCount').default(0).notNull(),
    deliveredCount: int('deliveredCount').default(0).notNull(),
    readCount: int('readCount').default(0).notNull(),
    failedCount: int('failedCount').default(0).notNull(),
    status: mysqlEnum('status', ['draft', 'scheduled', 'sending', 'completed', 'failed'])
      .default('draft')
      .notNull(),
    scheduledAt: timestamp('scheduledAt'),
    recipientSnapshot: text('recipientSnapshot'),
    headerImageUrl: varchar('headerImageUrl', { length: 2000 }),
    scheduleCronTaskUid: varchar('scheduleCronTaskUid', { length: 65 }),
    completedAt: timestamp('completedAt'),
    createdBy: int('createdBy').notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
  },
  (table) => ({
    scheduleCronTaskUidIdx: index('whatsapp_broadcasts_schedule_cron_task_uid_idx').on(
      table.scheduleCronTaskUid
    ),
    scheduledAtIdx: index('whatsapp_broadcasts_scheduled_at_idx').on(table.scheduledAt),
  })
);

export type WhatsAppBroadcast = typeof whatsappBroadcasts.$inferSelect;
export type InsertWhatsAppBroadcast = typeof whatsappBroadcasts.$inferInsert;

/**
 * WhatsApp Auto Replies table - stores automatic reply rules
 * جدول الردود التلقائية - يخزن قواعد الردود التلقائية
 */

/**
 * WhatsApp Auto Replies table - stores automatic reply rules
 * جدول الردود التلقائية - يخزن قواعد الردود التلقائية
 */
export const whatsappAutoReplies = mysqlTable('whatsapp_auto_replies', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  triggerType: mysqlEnum('triggerType', [
    'keyword',
    'outside_hours',
    'first_message',
    'faq',
  ]).notNull(),
  triggerValue: varchar('triggerValue', { length: 500 }), // Keyword or FAQ question
  replyMessage: text('replyMessage').notNull(),
  isActive: int('isActive').default(1).notNull(),
  priority: int('priority').default(0).notNull(), // Higher priority rules are checked first
  usageCount: int('usageCount').default(0).notNull(),
  createdBy: int('createdBy').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type WhatsAppAutoReply = typeof whatsappAutoReplies.$inferSelect;
export type InsertWhatsAppAutoReply = typeof whatsappAutoReplies.$inferInsert;

/**
 * WhatsApp Analytics table - stores daily analytics data
 * جدول تحليلات واتساب - يخزن بيانات التحليلات اليومية
 */

/**
 * WhatsApp Analytics table - stores daily analytics data
 * جدول تحليلات واتساب - يخزن بيانات التحليلات اليومية
 */
export const whatsappAnalytics = mysqlTable('whatsapp_analytics', {
  id: int('id').autoincrement().primaryKey(),
  date: varchar('date', { length: 10 }).notNull(), // YYYY-MM-DD
  messagesSent: int('messagesSent').default(0).notNull(),
  messagesReceived: int('messagesReceived').default(0).notNull(),
  conversationsStarted: int('conversationsStarted').default(0).notNull(),
  averageResponseTime: int('averageResponseTime').default(0).notNull(), // in minutes
  conversionRate: int('conversionRate').default(0).notNull(), // percentage * 100
  // New fields for enhanced analytics
  conversationCost: int('conversationCost').default(0).notNull(),
  billableConversations: int('billableConversations').default(0).notNull(),
  stickerMessages: int('stickerMessages').default(0).notNull(),
  reactionMessages: int('reactionMessages').default(0).notNull(),
  orderMessages: int('orderMessages').default(0).notNull(),
  productEnquiries: int('productEnquiries').default(0).notNull(),
  referralMessages: int('referralMessages').default(0).notNull(),
  contactsMessages: int('contactsMessages').default(0).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export type WhatsAppAnalytics = typeof whatsappAnalytics.$inferSelect;
export type InsertWhatsAppAnalytics = typeof whatsappAnalytics.$inferInsert;

/**
 * Scheduled Messages table - stores messages scheduled for future sending
 * جدول الرسائل المجدولة - يخزن الرسائل المقرر إرسالها مستقبلاً
 */

/**
 * Scheduled Messages table - stores messages scheduled for future sending
 * جدول الرسائل المجدولة - يخزن الرسائل المقرر إرسالها مستقبلاً
 */
export const scheduledMessages = mysqlTable('scheduled_messages', {
  id: int('id').autoincrement().primaryKey(),
  conversationId: int('conversationId').notNull(),
  phoneNumber: varchar('phoneNumber', { length: 20 }).notNull(),
  content: text('content').notNull(),
  messageType: mysqlEnum('messageType', ['text', 'template']).default('text').notNull(),
  templateId: int('templateId'),
  templateName: varchar('templateName', { length: 255 }),
  languageCode: varchar('languageCode', { length: 20 }),
  scheduledAt: timestamp('scheduledAt').notNull(),
  status: mysqlEnum('status', ['pending', 'sent', 'failed', 'cancelled'])
    .default('pending')
    .notNull(),
  sentAt: timestamp('sentAt'),
  errorInfo: text('errorInfo'),
  createdBy: int('createdBy').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export type ScheduledMessage = typeof scheduledMessages.$inferSelect;
export type InsertScheduledMessage = typeof scheduledMessages.$inferInsert;

/**
 * Quick Replies table - stores quick reply templates
 * جدول الردود السريعة - يخزن قوالب الردود السريعة
 */

/**
 * Quick Replies table - stores quick reply templates
 * جدول الردود السريعة - يخزن قوالب الردود السريعة
 */
export const quickReplies = mysqlTable('quick_replies', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  content: text('content').notNull(),
  category: varchar('category', { length: 50 }), // e.g., "greeting", "thanks", "info"
  isActive: int('isActive').default(1).notNull(),
  usageCount: int('usageCount').default(0).notNull(),
  createdBy: int('createdBy').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type QuickReply = typeof quickReplies.$inferSelect;
export type InsertQuickReply = typeof quickReplies.$inferInsert;

/**
 * Saved Searches table - stores saved search filters for conversations
 * جدول البحثات المحفوظة - يخزن فلاتر البحث المحفوظة للمحادثات
 */

/**
 * Message Settings table - stores automated message configurations
 * جدول إعدادات الرسائل - يخزن إعدادات الرسائل التلقائية
 */
export const messageSettings = mysqlTable('message_settings', {
  id: int('id').autoincrement().primaryKey(),
  // Message Type Identifier
  messageType: varchar('messageType', { length: 100 }).notNull().unique(),
  // Display name in Arabic
  displayName: varchar('displayName', { length: 255 }).notNull(),
  // Category: patient_journey, executive_reports, task_management, doctor_notifications
  category: mysqlEnum('category', [
    'patient_journey',
    'executive_reports',
    'task_management',
    'doctor_notifications',
  ]).notNull(),
  // Message content template
  messageContent: text('messageContent').notNull(),
  // Enabled/Disabled
  isEnabled: int('isEnabled').default(1).notNull(), // 1 = enabled, 0 = disabled
  // Delivery channel: whatsapp_api, whatsapp_integration, both
  deliveryChannel: mysqlEnum('deliveryChannel', ['whatsapp_api', 'whatsapp_integration', 'both'])
    .default('whatsapp_integration')
    .notNull(),
  // Variables available in template (JSON array)
  availableVariables: text('availableVariables'), // ["name", "date", "time", "doctor", "service"]
  // Description
  description: text('description'),
  // Entity type: which entity this message applies to
  entityType: mysqlEnum('entityType', [
    'appointment',
    'camp_registration',
    'offer_lead',
    'all',
  ]).default('all'),
  // Trigger event: which status change triggers this message
  triggerEvent: mysqlEnum('triggerEvent', [
    'on_create', // عند الحجز/التسجيل
    'on_confirmed', // عند تحديث الحالة إلى مؤكد
    'on_arrived', // عند تحديث الحالة إلى حضر
    'on_completed', // عند تحديث الحالة إلى مكتمل
    'on_cancelled', // عند تحديث الحالة إلى ملغي
    'on_reminder_24h', // تذكير 24 ساعة
    'on_reminder_1h', // تذكير ساعة
    'manual', // يدوي
  ]).default('manual'),
  // WhatsApp template ID (from whatsapp_templates table) - used when deliveryChannel is whatsapp_api
  whatsappTemplateId: int('whatsappTemplateId').references(() => whatsappTemplates.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type MessageSetting = typeof messageSettings.$inferSelect;
export type InsertMessageSetting = typeof messageSettings.$inferInsert;

/**
 * Message Templates table - stores WhatsApp Business API approved templates
 * جدول قوالب الرسائل - يخزن القوالب المعتمدة من Meta لـ WhatsApp Business API
 */

/**
 * Message Templates table - stores WhatsApp Business API approved templates
 * جدول قوالب الرسائل - يخزن القوالب المعتمدة من Meta لـ WhatsApp Business API
 */
export const messageTemplates = mysqlTable('message_templates', {
  id: int('id').autoincrement().primaryKey(),
  // Template name in Meta (must match exactly)
  templateName: varchar('templateName', { length: 255 }).notNull().unique(),
  // Display name in Arabic for UI
  displayName: varchar('displayName', { length: 255 }).notNull(),
  // Template category in Meta
  category: mysqlEnum('category', ['MARKETING', 'UTILITY', 'AUTHENTICATION']).notNull(),
  // Template language code (e.g., "ar", "en")
  languageCode: varchar('languageCode', { length: 10 }).default('ar').notNull(),
  // Template status from Meta
  status: mysqlEnum('status', ['PENDING', 'APPROVED', 'REJECTED', 'DISABLED'])
    .default('PENDING')
    .notNull(),
  // Template content (for reference)
  headerText: text('headerText'),
  bodyText: text('bodyText').notNull(),
  footerText: text('footerText'),
  // Buttons configuration (JSON)
  buttons: text('buttons'), // [{"type": "QUICK_REPLY", "text": "تأكيد الحجز ✅"}, {"type": "QUICK_REPLY", "text": "إلغاء الحجز ❌"}]
  // Variables in template (JSON array)
  variables: text('variables'), // ["name", "date", "time", "doctor"]
  // Meta template ID (if available)
  metaTemplateId: varchar('metaTemplateId', { length: 255 }),
  // Link to message_settings (optional)
  linkedMessageType: varchar('linkedMessageType', { length: 100 }),
  // Usage tracking
  usageCount: int('usageCount').default(0).notNull(),
  lastUsedAt: timestamp('lastUsedAt'),
  // Metadata
  description: text('description'),
  createdBy: int('createdBy').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type MessageTemplate = typeof messageTemplates.$inferSelect;
export type InsertMessageTemplate = typeof messageTemplates.$inferInsert;

/**
 * Comments table - stores comments on various entities (appointments, leads, etc.)
 * يخزن التعليقات على مختلف السجلات
 */

/**
 * Comments table - stores comments on various entities (appointments, leads, etc.)
 * يخزن التعليقات على مختلف السجلات
 */
export const comments = mysqlTable(
  'comments',
  {
    id: int('id').autoincrement().primaryKey(),
    // Entity type and ID (polymorphic relationship)
    entityType: mysqlEnum('entityType', [
      'appointment',
      'lead',
      'offerLead',
      'campRegistration',
    ]).notNull(),
    entityId: int('entityId').notNull(),
    // Comment content
    content: text('content').notNull(),
    // Author
    userId: int('userId').notNull(),
    userName: varchar('userName', { length: 255 }).notNull(),
    // Metadata
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    entityIdx: index('comments_entity_idx').on(table.entityType, table.entityId),
    createdAtIdx: index('comments_createdAt_idx').on(table.createdAt),
  })
);

export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;

/**
 * Follow-up Tasks table - stores follow-up tasks for various entities
 * جدول مهام المتابعة - يخزن مهام المتابعة للسجلات المختلفة
 */

/**
 * WhatsApp Notifications Table - تتبع إشعارات WhatsApp المرسلة
 * يربط كل رسالة واتساب بالسجل المرتبط بها (موعد، تسجيل مخيم، حجز عرض)
 */
export const whatsappNotifications = mysqlTable(
  'whatsapp_notifications',
  {
    id: int('id').autoincrement().primaryKey(),

    // نوع السجل المرتبط
    entityType: mysqlEnum('entityType', [
      'appointment',
      'camp_registration',
      'offer_lead',
    ]).notNull(),
    entityId: int('entityId').notNull(),

    // نوع الإشعار
    notificationType: mysqlEnum('notificationType', [
      'booking_confirmation', // تأكيد الحجز
      'reminder_24h', // تذكير قبل 24 ساعة
      'reminder_1h', // تذكير قبل ساعة
      'post_visit_followup', // متابعة بعد الزيارة
      'cancellation', // إلغاء
      'status_update', // تحديث الحالة
      'custom', // مخصص
    ]).notNull(),

    // بيانات الرسالة
    phone: varchar('phone', { length: 20 }).notNull(),
    recipientName: varchar('recipientName', { length: 255 }),
    templateName: varchar('templateName', { length: 255 }),
    messageContent: text('messageContent'),
    variables: text('variables'), // JSON متغيرات القالب

    // حالة الإرسال
    status: mysqlEnum('status', ['pending', 'sent', 'delivered', 'read', 'failed'])
      .default('pending')
      .notNull(),
    metaMessageId: varchar('metaMessageId', { length: 255 }), // معرف الرسالة من Meta
    errorMessage: text('errorMessage'),

    // معلومات الإرسال
    sentAt: timestamp('sentAt'),
    deliveredAt: timestamp('deliveredAt'),
    readAt: timestamp('readAt'),
    sentBy: int('sentBy'), // معرف المستخدم الذي أرسل (null = تلقائي)
    isAutomatic: boolean('isAutomatic').default(true).notNull(),

    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    entityIdx: index('wn_entity_idx').on(table.entityType, table.entityId),
    phoneIdx: index('wn_phone_idx').on(table.phone),
    statusIdx: index('wn_status_idx').on(table.status),
    createdAtIdx: index('wn_createdAt_idx').on(table.createdAt),
  })
);

export type WhatsappNotification = typeof whatsappNotifications.$inferSelect;
export type InsertWhatsappNotification = typeof whatsappNotifications.$inferInsert;

/**
 * WhatsApp Blocked Numbers - قائمة الأرقام المحظورة (opt-out)
 */

/**
 * WhatsApp Blocked Numbers - قائمة الأرقام المحظورة (opt-out)
 */
export const whatsappBlockedNumbers = mysqlTable('whatsapp_blocked_numbers', {
  id: int('id').autoincrement().primaryKey(),
  phone: varchar('phone', { length: 20 }).notNull().unique(),
  reason: varchar('reason', { length: 255 }),
  blockedBy: int('blockedBy'), // null = opt-out تلقائي
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});
export type WhatsappBlockedNumber = typeof whatsappBlockedNumbers.$inferSelect;
export type InsertWhatsappBlockedNumber = typeof whatsappBlockedNumbers.$inferInsert;

/**
 * WhatsApp Account Alerts - تنبيهات الحساب من Meta
 */

/**
 * WhatsApp Account Alerts - تنبيهات الحساب من Meta
 */
export const whatsappAccountAlerts = mysqlTable('whatsapp_account_alerts', {
  id: int('id').autoincrement().primaryKey(),
  alertType: varchar('alertType', { length: 100 }).notNull(),
  details: text('details'), // JSON string
  severity: mysqlEnum('severity', ['low', 'medium', 'high', 'critical'])
    .default('medium')
    .notNull(),
  resolved: boolean('resolved').default(false).notNull(),
  resolvedAt: timestamp('resolvedAt'),
  resolvedBy: int('resolvedBy'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});
export type WhatsappAccountAlert = typeof whatsappAccountAlerts.$inferSelect;
export type InsertWhatsappAccountAlert = typeof whatsappAccountAlerts.$inferInsert;

/**
 * WhatsApp Security Events - أحداث الأمان
 */

/**
 * WhatsApp Security Events - أحداث الأمان
 */
export const whatsappSecurityEvents = mysqlTable('whatsapp_security_events', {
  id: int('id').autoincrement().primaryKey(),
  eventType: varchar('eventType', { length: 100 }).notNull(),
  details: text('details'), // JSON string
  severity: mysqlEnum('severity', ['low', 'medium', 'high', 'critical'])
    .default('medium')
    .notNull(),
  phoneNumber: varchar('phoneNumber', { length: 20 }),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});
export type WhatsappSecurityEvent = typeof whatsappSecurityEvents.$inferSelect;
export type InsertWhatsappSecurityEvent = typeof whatsappSecurityEvents.$inferInsert;

/**
 * WhatsApp Phone Number Quality - جودة رقم الهاتف
 */

/**
 * WhatsApp Phone Number Quality - جودة رقم الهاتف
 */
export const whatsappPhoneQuality = mysqlTable('whatsapp_phone_quality', {
  id: int('id').autoincrement().primaryKey(),
  phoneNumber: varchar('phoneNumber', { length: 20 }).notNull(),
  qualityScore: int('qualityScore'), // 0-100
  qualityRating: mysqlEnum('qualityRating', ['unknown', 'yellow', 'green', 'gray', 'red'])
    .default('unknown')
    .notNull(),
  details: text('details'), // JSON string
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});
export type WhatsappPhoneQuality = typeof whatsappPhoneQuality.$inferSelect;
export type InsertWhatsappPhoneQuality = typeof whatsappPhoneQuality.$inferInsert;

/**
 * WhatsApp Conversation Quality - جودة المحادثات
 */

/**
 * WhatsApp Conversation Quality - جودة المحادثات
 */
export const whatsappConversationQuality = mysqlTable('whatsapp_conversation_quality', {
  id: int('id').autoincrement().primaryKey(),
  phoneNumber: varchar('phoneNumber', { length: 20 }).notNull(),
  qualityScore: int('qualityScore'), // 0-100
  details: text('details'), // JSON string
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});
export type WhatsappConversationQuality = typeof whatsappConversationQuality.$inferSelect;
export type InsertWhatsappConversationQuality = typeof whatsappConversationQuality.$inferInsert;

/**
 * WhatsApp User Opt-ins - اشتراكات المستخدمين
 */

/**
 * WhatsApp User Opt-ins - اشتراكات المستخدمين
 */
export const whatsappUserOptIns = mysqlTable('whatsapp_user_opt_ins', {
  id: int('id').autoincrement().primaryKey(),
  phoneNumber: varchar('phoneNumber', { length: 20 }).notNull(),
  optInType: mysqlEnum('optInType', ['general', 'marketing']).default('general').notNull(),
  status: mysqlEnum('status', ['opted_in', 'opted_out']).default('opted_in').notNull(),
  source: varchar('source', { length: 100 }), // e.g., "web", "whatsapp", "manual"
  details: text('details'), // JSON string
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});
export type WhatsappUserOptIn = typeof whatsappUserOptIns.$inferSelect;
export type InsertWhatsappUserOptIn = typeof whatsappUserOptIns.$inferInsert;

/**
 * WhatsApp Template Quality - جودة القوالب
 */

/**
 * WhatsApp Template Quality - جودة القوالب
 */
export const whatsappTemplateQuality = mysqlTable('whatsapp_template_quality', {
  id: int('id').autoincrement().primaryKey(),
  templateId: varchar('templateId', { length: 255 }).notNull(),
  qualityScore: int('qualityScore'), // 0-100
  details: text('details'), // JSON string
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});
export type WhatsappTemplateQuality = typeof whatsappTemplateQuality.$inferSelect;
export type InsertWhatsappTemplateQuality = typeof whatsappTemplateQuality.$inferInsert;

/**
 * WhatsApp Webhook Events Log - سجل جميع أحداث webhook من Meta
 * يستخدم لاكتشاف الأحداث الجديدة والتحليل
 */

/**
 * WhatsApp Webhook Events Log - سجل جميع أحداث webhook من Meta
 * يستخدم لاكتشاف الأحداث الجديدة والتحليل
 */
export const whatsappWebhookEvents = mysqlTable('whatsapp_webhook_events', {
  id: int('id').autoincrement().primaryKey(),
  eventId: varchar('eventId', { length: 255 }), // معرف الحدث من Meta إن وجد
  eventType: varchar('eventType', { length: 100 }).notNull(), // نوع الحدث (field)
  subType: varchar('subType', { length: 100 }), // النوع الفرعي إن وجد
  phoneNumber: varchar('phoneNumber', { length: 20 }), // رقم الهاتف المرتبط
  rawPayload: text('rawPayload').notNull(), // البيانات الخام الكاملة (JSON)
  processed: boolean('processed').default(false).notNull(), // هل تم معالجته
  handlerExists: boolean('handlerExists').default(false).notNull(), // هل يوجد معالج له
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  processedAt: timestamp('processedAt'),
});
export type WhatsappWebhookEvent = typeof whatsappWebhookEvents.$inferSelect;
export type InsertWhatsappWebhookEvent = typeof whatsappWebhookEvents.$inferInsert;

/**
 * WhatsApp Webhook Deliveries table - سجل تسليم واستئجار معالجة أحداث Webhook
 * يضمن عدم تكرار المعالجة ومنع التزامن عبر آلية التأجير (lease-based concurrency locking)
 */

/**
 * WhatsApp Webhook Deliveries table - سجل تسليم واستئجار معالجة أحداث Webhook
 * يضمن عدم تكرار المعالجة ومنع التزامن عبر آلية التأجير (lease-based concurrency locking)
 */
export const whatsappWebhookDeliveries = mysqlTable(
  'whatsapp_webhook_deliveries',
  {
    id: int('id').autoincrement().primaryKey(),
    deliveryKey: varchar('deliveryKey', { length: 64 }).notNull().unique(),
    eventType: varchar('eventType', { length: 16 }).notNull(),
    metaMessageId: varchar('metaMessageId', { length: 255 }).notNull(),
    /** processing يمنع التزامن؛ failed يسمح لإعادة تسليم Meta بالمحاولة مجدداً. */
    processingStatus: varchar('processingStatus', { length: 16 }).default('processing').notNull(),
    attempts: int('attempts').default(1).notNull(),
    processingStartedAt: timestamp('processingStartedAt').defaultNow().notNull(),
    processedAt: timestamp('processedAt'),
    lastError: varchar('lastError', { length: 1000 }),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    metaMessageIdIdx: index('whatsapp_webhook_deliveries_metaMessageId_idx').on(
      table.metaMessageId
    ),
    statusStartedIdx: index('whatsapp_webhook_deliveries_statusStarted_idx').on(
      table.processingStatus,
      table.processingStartedAt
    ),
  })
);

export type WhatsAppWebhookDelivery = typeof whatsappWebhookDeliveries.$inferSelect;
export type InsertWhatsAppWebhookDelivery = typeof whatsappWebhookDeliveries.$inferInsert;

/**
 * WhatsApp Flow Events - أحداث تدفقات WhatsApp Flows المنظمة
 * لا يحتفظ رد النموذج بقيمه الحساسة، بل بمفاتيحه فقط حفاظاً على الخصوصية.
 */

/**
 * WhatsApp Flow Events - أحداث تدفقات WhatsApp Flows المنظمة
 * لا يحتفظ رد النموذج بقيمه الحساسة، بل بمفاتيحه فقط حفاظاً على الخصوصية.
 */
export const whatsappFlowEvents = mysqlTable(
  'whatsapp_flow_events',
  {
    id: int('id').autoincrement().primaryKey(),
    flowId: varchar('flowId', { length: 255 }),
    eventName: varchar('eventName', { length: 100 }).notNull(),
    status: varchar('status', { length: 100 }),
    availability: varchar('availability', { length: 100 }),
    latencyMs: int('latencyMs'),
    errorCode: varchar('errorCode', { length: 100 }),
    errorMessage: varchar('errorMessage', { length: 1000 }),
    contextMessageId: varchar('contextMessageId', { length: 255 }),
    responseKeys: text('responseKeys'),
    flowTokenHash: varchar('flowTokenHash', { length: 64 }),
    rawPayload: text('rawPayload'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
  },
  (table) => ({
    flowCreatedIdx: index('whatsapp_flow_events_flowCreated_idx').on(table.flowId, table.createdAt),
    eventCreatedIdx: index('whatsapp_flow_events_eventCreated_idx').on(
      table.eventName,
      table.createdAt
    ),
  })
);

export type WhatsAppFlowEvent = typeof whatsappFlowEvents.$inferSelect;
export type InsertWhatsAppFlowEvent = typeof whatsappFlowEvents.$inferInsert;

/**
 * WhatsApp Contacts - جهات الاتصال المرسلة من المستخدمين
 */

/**
 * WhatsApp Contacts - جهات الاتصال المرسلة من المستخدمين
 */
export const whatsappContacts = mysqlTable('whatsapp_contacts', {
  id: int('id').autoincrement().primaryKey(),
  messageId: int('messageId').notNull(),
  conversationId: int('conversationId').notNull(),
  phoneNumber: varchar('phoneNumber', { length: 20 }).notNull(),
  addresses: text('addresses'), // JSON array
  birthday: text('birthday'),
  emails: text('emails'), // JSON array
  name: text('name'), // JSON object
  org: text('org'), // JSON object
  phones: text('phones'), // JSON array
  urls: text('urls'), // JSON array
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});
export type WhatsappContact = typeof whatsappContacts.$inferSelect;
export type InsertWhatsappContact = typeof whatsappContacts.$inferInsert;

/**
 * WhatsApp Orders - الطلبات الواردة من واتساب
 */

/**
 * WhatsApp Orders - الطلبات الواردة من واتساب
 */
export const whatsappOrders = mysqlTable('whatsapp_orders', {
  id: int('id').autoincrement().primaryKey(),
  messageId: int('messageId').notNull(),
  conversationId: int('conversationId').notNull(),
  phoneNumber: varchar('phoneNumber', { length: 20 }).notNull(),
  catalogId: varchar('catalogId', { length: 255 }),
  productItems: text('productItems'), // JSON array
  orderText: text('orderText'),
  status: mysqlEnum('status', ['pending', 'confirmed', 'completed', 'cancelled'])
    .default('pending')
    .notNull(),
  totalAmount: int('totalAmount'),
  currency: varchar('currency', { length: 10 }).default('YER'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});
export type WhatsappOrder = typeof whatsappOrders.$inferSelect;
export type InsertWhatsappOrder = typeof whatsappOrders.$inferInsert;

/**
 * WhatsApp Products - المنتجات من الكتالوج
 */

/**
 * WhatsApp Products - المنتجات من الكتالوج
 */
export const whatsappProducts = mysqlTable('whatsapp_products', {
  id: int('id').autoincrement().primaryKey(),
  catalogId: varchar('catalogId', { length: 255 }).notNull(),
  productRetailerId: varchar('productRetailerId', { length: 255 }).notNull(),
  productName: varchar('productName', { length: 255 }),
  productDescription: text('productDescription'),
  productImageUrl: text('productImageUrl'),
  price: int('price'),
  currency: varchar('currency', { length: 10 }).default('YER'),
  isAvailable: boolean('isAvailable').default(true).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});
export type WhatsappProduct = typeof whatsappProducts.$inferSelect;
export type InsertWhatsappProduct = typeof whatsappProducts.$inferInsert;

/**
 * WhatsApp Referrals - الإحالات من الإعلانات
 */

/**
 * WhatsApp Referrals - الإحالات من الإعلانات
 */
export const whatsappReferrals = mysqlTable('whatsapp_referrals', {
  id: int('id').autoincrement().primaryKey(),
  messageId: int('messageId').notNull(),
  conversationId: int('conversationId').notNull(),
  phoneNumber: varchar('phoneNumber', { length: 20 }).notNull(),
  sourceUrl: text('sourceUrl'),
  sourceId: varchar('sourceId', { length: 255 }),
  sourceType: varchar('sourceType', { length: 50 }),
  headline: text('headline'),
  body: text('body'),
  mediaType: varchar('mediaType', { length: 50 }),
  imageUrl: text('imageUrl'),
  videoUrl: text('videoUrl'),
  thumbnailUrl: text('thumbnailUrl'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});
export type WhatsappReferral = typeof whatsappReferrals.$inferSelect;
export type InsertWhatsappReferral = typeof whatsappReferrals.$inferInsert;

/**
 * WhatsApp Reactions - الردود العاطفية على الرسائل
 */

/**
 * WhatsApp Reactions - الردود العاطفية على الرسائل
 */
export const whatsappReactions = mysqlTable('whatsapp_reactions', {
  id: int('id').autoincrement().primaryKey(),
  messageId: int('messageId').notNull(),
  conversationId: int('conversationId').notNull(),
  phoneNumber: varchar('phoneNumber', { length: 20 }).notNull(),
  emoji: varchar('emoji', { length: 50 }).notNull(),
  reactedToMessageId: varchar('reactedToMessageId', { length: 255 }),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});
export type WhatsappReaction = typeof whatsappReactions.$inferSelect;
export type InsertWhatsappReaction = typeof whatsappReactions.$inferInsert;

/**
 * WhatsApp Transactions - المعاملات المالية
 */

/**
 * WhatsApp Transactions - المعاملات المالية
 */
export const whatsappTransactions = mysqlTable('whatsapp_transactions', {
  id: int('id').autoincrement().primaryKey(),
  conversationId: int('conversationId').notNull(),
  phoneNumber: varchar('phoneNumber', { length: 20 }).notNull(),
  transactionId: varchar('transactionId', { length: 255 }),
  status: varchar('status', { length: 50 }),
  amount: int('amount'),
  currency: varchar('currency', { length: 10 }).default('YER'),
  paymentMethod: varchar('paymentMethod', { length: 50 }),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});
export type WhatsappTransaction = typeof whatsappTransactions.$inferSelect;
export type InsertWhatsappTransaction = typeof whatsappTransactions.$inferInsert;

/**
 * Content Management System Tables
 * جداول نظام إدارة المحتوى
 */

/**
 * Text Content Table - جدول النصوص والعناوين
 * يخزّن جميع النصوص والعناوين في المنصة مع دعم متعدد اللغات
 */

/**
 * Social Inbox Accounts - حسابات المنصات الاجتماعية المرتبطة بصندوق البريد الموحد
 */
export const socialInboxAccounts = mysqlTable(
  'social_inbox_accounts',
  {
    id: int('id').autoincrement().primaryKey(),
    platform: mysqlEnum('platform', [
      'messenger',
      'instagram',
      'facebook',
      'x',
      'linkedin',
      'youtube',
    ]).notNull(),
    accountType: mysqlEnum('accountType', ['page', 'profile', 'business', 'channel'])
      .default('profile')
      .notNull(),
    displayName: varchar('displayName', { length: 255 }).notNull(),
    externalAccountId: varchar('externalAccountId', { length: 255 }).notNull(),
    status: mysqlEnum('status', ['disconnected', 'pending', 'connected', 'error'])
      .default('disconnected')
      .notNull(),
    lastSyncedAt: timestamp('lastSyncedAt'),
    lastError: text('lastError'),
    metadata: text('metadata'),
    isActive: boolean('isActive').default(true).notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    platformIdx: index('socialInboxAccounts_platform_idx').on(table.platform),
    statusIdx: index('socialInboxAccounts_status_idx').on(table.status),
    externalAccountIdx: index('socialInboxAccounts_externalAccount_idx').on(
      table.platform,
      table.externalAccountId
    ),
  })
);

export type SocialInboxAccount = typeof socialInboxAccounts.$inferSelect;
export type InsertSocialInboxAccount = typeof socialInboxAccounts.$inferInsert;

/**
 * Social Inbox Threads - سياق المحادثة أو سلسلة التعليقات
 */

/**
 * Social Inbox Threads - سياق المحادثة أو سلسلة التعليقات
 */
export const socialInboxThreads = mysqlTable(
  'social_inbox_threads',
  {
    id: int('id').autoincrement().primaryKey(),
    accountId: int('accountId')
      .notNull()
      .references(() => socialInboxAccounts.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    platform: mysqlEnum('platform', [
      'messenger',
      'instagram',
      'facebook',
      'x',
      'linkedin',
      'youtube',
    ]).notNull(),
    channelType: mysqlEnum('channelType', ['message', 'comment']).notNull(),
    externalThreadId: varchar('externalThreadId', { length: 255 }).notNull(),
    title: varchar('title', { length: 255 }),
    participantExternalId: varchar('participantExternalId', { length: 255 }),
    participantName: varchar('participantName', { length: 255 }),
    participantAvatarUrl: varchar('participantAvatarUrl', { length: 500 }),
    preview: text('preview'),
    postUrl: varchar('postUrl', { length: 500 }),
    commentContext: text('commentContext'),
    unreadCount: int('unreadCount').default(0).notNull(),
    isRead: boolean('isRead').default(false).notNull(),
    isArchived: boolean('isArchived').default(false).notNull(),
    isStarred: boolean('isStarred').default(false).notNull(),
    isFollowUpRequired: boolean('isFollowUpRequired').default(false).notNull(),
    assignedToUserId: int('assignedToUserId').references(() => users.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
    lastActivityAt: timestamp('lastActivityAt'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    accountIdx: index('socialInboxThreads_account_idx').on(table.accountId),
    platformChannelIdx: index('socialInboxThreads_platformChannel_idx').on(
      table.platform,
      table.channelType
    ),
    externalThreadIdx: index('socialInboxThreads_externalThread_idx').on(
      table.platform,
      table.externalThreadId
    ),
    activityIdx: index('socialInboxThreads_activity_idx').on(table.lastActivityAt),
    followUpIdx: index('socialInboxThreads_followUp_idx').on(table.isFollowUpRequired),
    assignedUserIdx: index('socialInboxThreads_assignedUser_idx').on(table.assignedToUserId),
  })
);

export type SocialInboxThread = typeof socialInboxThreads.$inferSelect;
export type InsertSocialInboxThread = typeof socialInboxThreads.$inferInsert;

/**
 * Social Inbox Items - رسالة أو تعليق موحّد قابل للبحث والتعيين والرد
 */

/**
 * Social Inbox Items - رسالة أو تعليق موحّد قابل للبحث والتعيين والرد
 */
export const socialInboxItems = mysqlTable(
  'social_inbox_items',
  {
    id: int('id').autoincrement().primaryKey(),
    threadId: int('threadId')
      .notNull()
      .references(() => socialInboxThreads.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    accountId: int('accountId')
      .notNull()
      .references(() => socialInboxAccounts.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    platform: mysqlEnum('platform', [
      'messenger',
      'instagram',
      'facebook',
      'x',
      'linkedin',
      'youtube',
    ]).notNull(),
    channelType: mysqlEnum('channelType', ['message', 'comment']).notNull(),
    direction: mysqlEnum('direction', ['inbound', 'outbound', 'system'])
      .default('inbound')
      .notNull(),
    externalItemId: varchar('externalItemId', { length: 255 }).notNull(),
    authorExternalId: varchar('authorExternalId', { length: 255 }),
    authorName: varchar('authorName', { length: 255 }),
    authorAvatarUrl: varchar('authorAvatarUrl', { length: 500 }),
    content: text('content'),
    mediaUrl: varchar('mediaUrl', { length: 500 }),
    parentExternalId: varchar('parentExternalId', { length: 255 }),
    commentMetadata: text('commentMetadata'),
    externalPublishedAt: timestamp('externalPublishedAt'),
    isRead: boolean('isRead').default(false).notNull(),
    status: mysqlEnum('status', ['received', 'sent', 'pending', 'failed', 'deleted'])
      .default('received')
      .notNull(),
    rawPayload: text('rawPayload'),
    sentByUserId: int('sentByUserId').references(() => users.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    threadIdx: index('socialInboxItems_thread_idx').on(table.threadId, table.createdAt),
    accountIdx: index('socialInboxItems_account_idx').on(table.accountId),
    platformChannelIdx: index('socialInboxItems_platformChannel_idx').on(
      table.platform,
      table.channelType
    ),
    externalItemIdx: index('socialInboxItems_externalItem_idx').on(
      table.platform,
      table.externalItemId
    ),
    statusIdx: index('socialInboxItems_status_idx').on(table.status),
  })
);

export type SocialInboxItem = typeof socialInboxItems.$inferSelect;
export type InsertSocialInboxItem = typeof socialInboxItems.$inferInsert;

/**
 * Social Inbox Webhook Events - سجل تدقيقي لأحداث المنصات الواردة
 * يحفظ الحمولة الخام ويمنع تكرار تسليم Meta قبل بدء التطبيع.
 */

/**
 * Social Inbox Webhook Events - سجل تدقيقي لأحداث المنصات الواردة
 * يحفظ الحمولة الخام ويمنع تكرار تسليم Meta قبل بدء التطبيع.
 */
export const socialInboxWebhookEvents = mysqlTable(
  'social_inbox_webhook_events',
  {
    id: int('id').autoincrement().primaryKey(),
    provider: mysqlEnum('provider', ['meta']).default('meta').notNull(),
    platform: mysqlEnum('platform', ['messenger', 'instagram', 'facebook']).notNull(),
    accountExternalId: varchar('accountExternalId', { length: 255 }).notNull(),
    eventType: varchar('eventType', { length: 100 }).notNull(),
    eventKey: varchar('eventKey', { length: 512 }).notNull(),
    rawPayload: text('rawPayload').notNull(),
    processingStatus: mysqlEnum('processingStatus', ['received', 'processed', 'ignored', 'failed'])
      .default('received')
      .notNull(),
    processingError: text('processingError'),
    processedAt: timestamp('processedAt'),
    receivedAt: timestamp('receivedAt').defaultNow().notNull(),
  },
  (table) => ({
    eventKeyUnique: uniqueIndex('socialInboxWebhookEvents_eventKey_unique').on(table.eventKey),
    accountIdx: index('socialInboxWebhookEvents_account_idx').on(
      table.platform,
      table.accountExternalId
    ),
    statusIdx: index('socialInboxWebhookEvents_status_idx').on(table.processingStatus),
  })
);

export type SocialInboxWebhookEvent = typeof socialInboxWebhookEvents.$inferSelect;
export type InsertSocialInboxWebhookEvent = typeof socialInboxWebhookEvents.$inferInsert;

/**
 * Meta Integration Settings - بيانات ربط Meta المشفّرة لصندوق البريد
 * لا تُعاد الحقول المشفّرة مطلقاً إلى الواجهة؛ تستخدمها نقطة Webhook على الخادم فقط.
 */
