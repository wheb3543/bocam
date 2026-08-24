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
  primaryKey,
  uniqueIndex,
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable('users', {
  id: int('id').autoincrement().primaryKey(),
  openId: varchar('openId', { length: 64 }),
  username: varchar('username', { length: 50 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  name: text('name'),
  email: varchar('email', { length: 320 }),
  loginMethod: varchar('loginMethod', { length: 64 }),
  role: mysqlEnum('role', ['user', 'admin', 'manager', 'staff', 'viewer', 'team_leader'])
    .default('user')
    .notNull(),
  isActive: mysqlEnum('isActive', ['yes', 'no']).default('yes').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp('lastSignedIn'),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

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
 * Doctors table - stores information about hospital doctors
 */
export const doctors = mysqlTable('doctors', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  specialty: varchar('specialty', { length: 255 }).notNull(),
  image: varchar('image', { length: 500 }),
  bio: text('bio'),
  experience: varchar('experience', { length: 255 }),
  languages: varchar('languages', { length: 255 }),
  consultationFee: varchar('consultationFee', { length: 100 }),
  procedures: text('procedures'), // JSON array of available procedures
  isVisiting: mysqlEnum('isVisiting', ['yes', 'no']).default('no').notNull(), // Visiting doctor flag
  available: mysqlEnum('available', ['yes', 'no']).default('yes').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type Doctor = typeof doctors.$inferSelect;
export type InsertDoctor = typeof doctors.$inferInsert;

/**
 * Appointments table - stores appointment bookings
 */
export const appointments = mysqlTable(
  'appointments',
  {
    id: int('id').autoincrement().primaryKey(),
    campaignId: int('campaignId').notNull(),
    doctorId: int('doctorId').notNull(),
    fullName: varchar('fullName', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 20 }).notNull(),
    email: varchar('email', { length: 320 }),
    age: int('age'), // Patient age
    gender: mysqlEnum('gender', ['male', 'female']), // Patient gender
    procedure: text('procedure'), // Selected procedure
    preferredDate: varchar('preferredDate', { length: 50 }),
    preferredTime: varchar('preferredTime', { length: 50 }),
    appointmentDate: timestamp('appointmentDate'), // Confirmed appointment date/time
    patientMessage: text('patientMessage'), // رسالة المريض الاختيارية
    notes: text('notes'), // Patient notes
    additionalNotes: text('additionalNotes'), // Additional patient notes
    staffNotes: text('staffNotes'), // Staff notes (admin only)
    status: mysqlEnum('status', [
      'pending',
      'contacted',
      'no_answer',
      'confirmed',
      'attended',
      'completed',
      'cancelled',
    ])
      .default('pending')
      .notNull(),
    contactedAt: timestamp('contactedAt'),
    confirmedAt: timestamp('confirmedAt'),
    attendedAt: timestamp('attendedAt'),
    completedAt: timestamp('completedAt'),
    cancelledAt: timestamp('cancelledAt'),
    source: varchar('source', { length: 100 }), // Booking source (web, phone, manual)
    utmSource: varchar('utmSource', { length: 100 }),
    utmMedium: varchar('utmMedium', { length: 100 }),
    utmCampaign: varchar('utmCampaign', { length: 100 }),
    utmTerm: varchar('utmTerm', { length: 100 }),
    utmContent: varchar('utmContent', { length: 100 }),
    utmPlacement: varchar('utmPlacement', { length: 100 }),
    referrer: varchar('referrer', { length: 500 }),
    fbclid: varchar('fbclid', { length: 255 }),
    gclid: varchar('gclid', { length: 255 }),
    receiptNumber: varchar('receiptNumber', { length: 50 }), // رقم السند التسلسلي
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    phoneIdx: index('appointments_phone_idx').on(table.phone),
    emailIdx: index('appointments_email_idx').on(table.email),
    statusIdx: index('appointments_status_idx').on(table.status),
    createdAtIdx: index('appointments_createdAt_idx').on(table.createdAt),
    doctorIdIdx: index('appointments_doctorId_idx').on(table.doctorId),
  })
);

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;

/**
 * Access Requests table - stores access requests
 */
export const accessRequests = mysqlTable('accessRequests', {
  id: int('id').autoincrement().primaryKey(),
  openId: varchar('openId', { length: 64 }),
  name: text('name').notNull(),
  email: varchar('email', { length: 320 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  reason: text('reason'),
  status: mysqlEnum('status', ['pending', 'approved', 'rejected']).default('pending').notNull(),
  requestedAt: timestamp('requestedAt').defaultNow().notNull(),
  reviewedAt: timestamp('reviewedAt'),
  reviewedBy: int('reviewedBy'),
});

export type AccessRequest = typeof accessRequests.$inferSelect;
export type InsertAccessRequest = typeof accessRequests.$inferInsert;

/**
 * Offers table - stores special medical offers and promotions
 * يخزن العروض الطبية الخاصة والعروض الترويجية
 */
export const offers = mysqlTable('offers', {
  id: int('id').autoincrement().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  imageUrl: varchar('imageUrl', { length: 500 }),
  isActive: boolean('isActive').default(true).notNull(),
  startDate: timestamp('startDate'),
  endDate: timestamp('endDate'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type Offer = typeof offers.$inferSelect;
export type InsertOffer = typeof offers.$inferInsert;

/**
 * Camps table - stores information about medical camps
 * يخزن معلومات المخيمات الطبية
 */
export const camps = mysqlTable('camps', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  imageUrl: varchar('imageUrl', { length: 500 }),
  startDate: timestamp('startDate'),
  endDate: timestamp('endDate'),
  isActive: boolean('isActive').default(true).notNull(),
  // New fields for advanced camp management
  freeOffers: text('freeOffers'), // Free offers (one per line)
  discountedOffers: text('discountedOffers'), // Discounted offers (one per line)
  availableProcedures: text('availableProcedures'), // JSON array of available procedures
  galleryImages: text('galleryImages'), // JSON array of image URLs
  // Time slots for attendance
  morningTime: varchar('morningTime', { length: 20 }), // e.g. "08:00" - وقت الجلسة الصباحية
  eveningTime: varchar('eveningTime', { length: 20 }), // e.g. "14:00" - وقت الجلسة المسائية
  // Daily capacity per time slot (null = unlimited)
  dailyCapacity: int('dailyCapacity'), // الطاقة الاستيعابية اليومية لكل وقت
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type Camp = typeof camps.$inferSelect;
export type InsertCamp = typeof camps.$inferInsert;

/**
 * Offer Leads table - stores customer requests for special offers
 * يخزن طلبات العملاء للعروض الخاصة
 */
export const offerLeads = mysqlTable(
  'offerLeads',
  {
    id: int('id').autoincrement().primaryKey(),
    offerId: int('offerId').notNull(),
    campaignId: int('campaignId'), // Optional: link to campaign
    fullName: varchar('fullName', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 20 }).notNull(),
    email: varchar('email', { length: 320 }),
    age: int('age'), // Patient age
    gender: mysqlEnum('gender', ['male', 'female']).notNull(), // Patient gender (required)
    patientMessage: text('patientMessage'), // رسالة المريض الاختيارية
    notes: text('notes'),
    status: mysqlEnum('status', [
      'pending',
      'contacted',
      'no_answer',
      'confirmed',
      'attended',
      'completed',
      'cancelled',
    ])
      .default('pending')
      .notNull(),
    statusNotes: text('statusNotes'),
    contactedAt: timestamp('contactedAt'),
    confirmedAt: timestamp('confirmedAt'),
    attendedAt: timestamp('attendedAt'),
    completedAt: timestamp('completedAt'),
    cancelledAt: timestamp('cancelledAt'),
    source: varchar('source', { length: 100 }),
    utmSource: varchar('utmSource', { length: 100 }),
    utmMedium: varchar('utmMedium', { length: 100 }),
    utmCampaign: varchar('utmCampaign', { length: 100 }),
    utmTerm: varchar('utmTerm', { length: 100 }),
    utmContent: varchar('utmContent', { length: 100 }),
    utmPlacement: varchar('utmPlacement', { length: 100 }),
    referrer: varchar('referrer', { length: 500 }),
    fbclid: varchar('fbclid', { length: 255 }),
    gclid: varchar('gclid', { length: 255 }),
    receiptNumber: varchar('receiptNumber', { length: 50 }), // رقم السند التسلسلي
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    phoneIdx: index('offerLeads_phone_idx').on(table.phone),
    emailIdx: index('offerLeads_email_idx').on(table.email),
    statusIdx: index('offerLeads_status_idx').on(table.status),
    createdAtIdx: index('offerLeads_createdAt_idx').on(table.createdAt),
    offerIdIdx: index('offerLeads_offerId_idx').on(table.offerId),
  })
);

export type OfferLead = typeof offerLeads.$inferSelect;
export type InsertOfferLead = typeof offerLeads.$inferInsert;

/**
 * Camp Registrations table - stores registrations for medical camps
 * يخزن تسجيلات المخيمات الطبية
 */
export const campRegistrations = mysqlTable(
  'campRegistrations',
  {
    id: int('id').autoincrement().primaryKey(),
    campId: int('campId').notNull(),
    campaignId: int('campaignId'), // Optional: link to campaign
    fullName: varchar('fullName', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 20 }).notNull(),
    email: varchar('email', { length: 320 }),
    age: int('age'),
    gender: mysqlEnum('gender', ['male', 'female']),
    procedures: text('procedures'), // JSON array of selected procedures
    medicalCondition: text('medicalCondition'),
    patientMessage: text('patientMessage'), // رسالة المريض الاختيارية
    notes: text('notes'),
    status: mysqlEnum('status', [
      'pending',
      'contacted',
      'no_answer',
      'confirmed',
      'attended',
      'completed',
      'cancelled',
    ])
      .default('pending')
      .notNull(),
    statusNotes: text('statusNotes'),
    attendanceDate: timestamp('attendanceDate'),
    // Preferred attendance date and time slot chosen by patient during registration
    preferredDate: varchar('preferredDate', { length: 20 }), // YYYY-MM-DD format
    preferredTimeSlot: mysqlEnum('preferredTimeSlot', ['morning', 'evening']), // الوقت المفضل
    contactedAt: timestamp('contactedAt'),
    confirmedAt: timestamp('confirmedAt'),
    attendedAt: timestamp('attendedAt'),
    completedAt: timestamp('completedAt'),
    cancelledAt: timestamp('cancelledAt'),
    source: varchar('source', { length: 100 }),
    utmSource: varchar('utmSource', { length: 100 }),
    utmMedium: varchar('utmMedium', { length: 100 }),
    utmCampaign: varchar('utmCampaign', { length: 100 }),
    utmTerm: varchar('utmTerm', { length: 100 }),
    utmContent: varchar('utmContent', { length: 100 }),
    utmPlacement: varchar('utmPlacement', { length: 100 }),
    referrer: varchar('referrer', { length: 500 }),
    fbclid: varchar('fbclid', { length: 255 }),
    gclid: varchar('gclid', { length: 255 }),
    receiptNumber: varchar('receiptNumber', { length: 50 }), // رقم السند التسلسلي
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    phoneIdx: index('campRegistrations_phone_idx').on(table.phone),
    emailIdx: index('campRegistrations_email_idx').on(table.email),
    statusIdx: index('campRegistrations_status_idx').on(table.status),
    createdAtIdx: index('campRegistrations_createdAt_idx').on(table.createdAt),
    campIdIdx: index('campRegistrations_campId_idx').on(table.campId),
  })
);

export type CampRegistration = typeof campRegistrations.$inferSelect;
export type InsertCampRegistration = typeof campRegistrations.$inferInsert;

/**
 * Teams table - stores team information
 * جدول الفرق - يخزن معلومات الفرق
 */
export const teams = mysqlTable('teams', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  leaderId: int('leaderId'), // User ID of team leader
  isActive: boolean('isActive').default(true).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type Team = typeof teams.$inferSelect;
export type InsertTeam = typeof teams.$inferInsert;

/**
 * Team Members table - stores team membership
 * جدول أعضاء الفرق - يخزن عضوية الفرق
 */
export const teamMembers = mysqlTable('teamMembers', {
  id: int('id').autoincrement().primaryKey(),
  teamId: int('teamId').notNull(),
  userId: int('userId').notNull(),
  role: mysqlEnum('role', ['leader', 'member']).default('member').notNull(),
  joinedAt: timestamp('joinedAt').defaultNow().notNull(),
});

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = typeof teamMembers.$inferInsert;

/**
 * Projects table - stores project/campaign information for task management
 * جدول المشاريع - يخزن معلومات المشاريع/الحملات لإدارة المهام
 */
export const projects = mysqlTable('projects', {
  id: int('id').autoincrement().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  startDate: timestamp('startDate'),
  endDate: timestamp('endDate'),
  status: mysqlEnum('status', ['planning', 'active', 'completed', 'on_hold', 'cancelled'])
    .default('planning')
    .notNull(),
  priority: mysqlEnum('priority', ['low', 'medium', 'high', 'urgent']).default('medium').notNull(),
  createdBy: int('createdBy').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Tasks table - stores task information for digital marketing team
 * جدول المهام - يخزن معلومات مهام فريق التسويق الرقمي
 */
export const tasks = mysqlTable('tasks', {
  id: int('id').autoincrement().primaryKey(),
  projectId: int('projectId'), // Optional: link to project
  teamId: int('teamId'),
  campaignId: int('campaignId'), // Link to campaign
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  assignedTo: int('assignedTo'), // User ID
  priority: mysqlEnum('priority', ['low', 'medium', 'high', 'urgent']).default('medium').notNull(),
  status: mysqlEnum('status', ['todo', 'in_progress', 'review', 'completed', 'cancelled'])
    .default('todo')
    .notNull(),
  category: mysqlEnum('category', [
    'content',
    'design',
    'ads',
    'seo',
    'social_media',
    'analytics',
    'other',
  ])
    .default('other')
    .notNull(),
  dueDate: timestamp('dueDate'),
  completedAt: timestamp('completedAt'),
  estimatedHours: int('estimatedHours'),
  actualHours: int('actualHours'),
  tags: text('tags'), // JSON array of tags
  createdBy: int('createdBy').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

/**
 * Task Deliverables table - stores task deliverables/submissions
 * جدول تسليمات المهام - يخزن تسليمات/تقديمات المهام
 */
export const taskDeliverables = mysqlTable('taskDeliverables', {
  id: int('id').autoincrement().primaryKey(),
  taskId: int('taskId').notNull(),
  userId: int('userId').notNull(), // Who submitted
  fileUrl: varchar('fileUrl', { length: 500 }),
  notes: text('notes'),
  status: mysqlEnum('status', ['pending', 'approved', 'rejected', 'revision_needed'])
    .default('pending')
    .notNull(),
  reviewNotes: text('reviewNotes'),
  submittedAt: timestamp('submittedAt').defaultNow().notNull(),
  reviewedBy: int('reviewedBy'), // Who reviewed
  reviewedAt: timestamp('reviewedAt'),
});

export type TaskDeliverable = typeof taskDeliverables.$inferSelect;
export type InsertTaskDeliverable = typeof taskDeliverables.$inferInsert;

/**
 * Task Comments table - stores comments on tasks
 * جدول تعليقات المهام - يخزن التعليقات على المهام
 */
export const taskComments = mysqlTable('task_comments', {
  id: int('id').autoincrement().primaryKey(),
  taskId: int('taskId').notNull(),
  userId: int('userId').notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type TaskComment = typeof taskComments.$inferSelect;
export type InsertTaskComment = typeof taskComments.$inferInsert;

/**
 * Task Attachments table - stores attachments/deliverables for tasks
 * جدول مرفقات المهام - يخزن المرفقات والتسليمات للمهام
 */
export const taskAttachments = mysqlTable('task_attachments', {
  id: int('id').autoincrement().primaryKey(),
  taskId: int('taskId').notNull(),
  userId: int('userId').notNull(),
  fileName: varchar('fileName', { length: 255 }).notNull(),
  fileUrl: text('fileUrl').notNull(),
  fileType: varchar('fileType', { length: 100 }),
  fileSize: int('fileSize'),
  attachmentType: mysqlEnum('attachmentType', ['deliverable', 'reference', 'other'])
    .default('other')
    .notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export type TaskAttachment = typeof taskAttachments.$inferSelect;
export type InsertTaskAttachment = typeof taskAttachments.$inferInsert;

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
export const whatsappBroadcasts = mysqlTable('whatsapp_broadcasts', {
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
  completedAt: timestamp('completedAt'),
  createdBy: int('createdBy').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export type WhatsAppBroadcast = typeof whatsappBroadcasts.$inferSelect;
export type InsertWhatsAppBroadcast = typeof whatsappBroadcasts.$inferInsert;

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
export const followUpTasks = mysqlTable(
  'followUpTasks',
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
    // Task details
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    // Status and priority
    status: mysqlEnum('status', ['pending', 'in_progress', 'completed', 'cancelled'])
      .default('pending')
      .notNull(),
    priority: mysqlEnum('priority', ['low', 'medium', 'high']).default('medium').notNull(),
    // Due date
    dueDate: timestamp('dueDate'),
    // Assignment
    assignedToId: int('assignedToId'),
    assignedToName: varchar('assignedToName', { length: 255 }),
    // Creator
    createdById: int('createdById').notNull(),
    createdByName: varchar('createdByName', { length: 255 }).notNull(),
    // Completion
    completedAt: timestamp('completedAt'),
    completedById: int('completedById'),
    completedByName: varchar('completedByName', { length: 255 }),
    // Metadata
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    entityIdx: index('tasks_entity_idx').on(table.entityType, table.entityId),
    statusIdx: index('tasks_status_idx').on(table.status),
    dueDateIdx: index('tasks_dueDate_idx').on(table.dueDate),
    assignedToIdx: index('tasks_assignedTo_idx').on(table.assignedToId),
  })
);

export type FollowUpTask = typeof followUpTasks.$inferSelect;
export type InsertFollowUpTask = typeof followUpTasks.$inferInsert;

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
export const patients = mysqlTable(
  'patients',
  {
    id: int('id').autoincrement().primaryKey(),
    /** الاسم الكامل */
    fullName: varchar('fullName', { length: 255 }).notNull(),
    /** رقم الهاتف (فريد - يستخدم لتسجيل الدخول) */
    phone: varchar('phone', { length: 20 }).notNull().unique(),
    /** كلمة المرور (للدخول المباشر بدون OTP) */
    password: varchar('password', { length: 255 }),
    /** العنوان */
    address: text('address'),
    /** العمر */
    age: int('age'),
    /** الجنس */
    gender: mysqlEnum('gender', ['male', 'female']).notNull(),
    /** البريد الإلكتروني (اختياري) */
    email: varchar('email', { length: 320 }),
    /** حالة الحساب */
    isActive: boolean('isActive').default(true).notNull(),
    /** آخر تسجيل دخول */
    lastLoginAt: timestamp('lastLoginAt'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    phoneIdx: index('patients_phone_idx').on(table.phone),
  })
);

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = typeof patients.$inferInsert;

/**
 * جدول رموز التحقق للمرضى - يخزن رموز OTP لتسجيل الدخول
 * Patient OTP table - stores one-time passwords for patient login
 */
export const patientOtps = mysqlTable(
  'patientOtps',
  {
    id: int('id').autoincrement().primaryKey(),
    /** رقم الهاتف */
    phone: varchar('phone', { length: 20 }).notNull(),
    /** رمز التحقق */
    code: varchar('code', { length: 6 }).notNull(),
    /** تاريخ الانتهاء */
    expiresAt: timestamp('expiresAt').notNull(),
    /** هل تم استخدامه */
    isUsed: boolean('isUsed').default(false).notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
  },
  (table) => ({
    phoneIdx: index('patientOtps_phone_idx').on(table.phone),
  })
);

export type PatientOtp = typeof patientOtps.$inferSelect;
export type InsertPatientOtp = typeof patientOtps.$inferInsert;

/**
 * جدول نتائج المريض - يخزن نتائج التحاليل والأشعة والتقارير
 * Patient Results table - stores lab results, radiology, and reports
 */
export const patientResults = mysqlTable(
  'patientResults',
  {
    id: int('id').autoincrement().primaryKey(),
    /** معرف المريض */
    patientId: int('patientId').notNull(),
    /** نوع النتيجة */
    resultType: mysqlEnum('resultType', ['lab', 'radiology', 'report']).notNull(),
    /** عنوان النتيجة */
    title: varchar('title', { length: 255 }).notNull(),
    /** وصف */
    description: text('description'),
    /** رابط الملف */
    fileUrl: varchar('fileUrl', { length: 500 }),
    /** اسم الطبيب */
    doctorName: varchar('doctorName', { length: 255 }),
    /** تاريخ النتيجة */
    resultDate: timestamp('resultDate'),
    /** حالة النتيجة */
    status: mysqlEnum('status', ['pending', 'ready', 'delivered']).default('pending').notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    patientIdx: index('patientResults_patient_idx').on(table.patientId),
  })
);

export type PatientResult = typeof patientResults.$inferSelect;
export type InsertPatientResult = typeof patientResults.$inferInsert;

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
  ]),
  entityId: int('entityId'),
  action: mysqlEnum('action', ['create', 'update', 'delete']),
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
export const pages = mysqlTable(
  'pages',
  {
    id: int('id').autoincrement().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    type: mysqlEnum('type', ['main', 'sub']).default('main').notNull(),
    parentId: int('parentId').references((): any => pages.id, {
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
      'campaigns',
      'integrations',
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
 * Integration Connection Tokens - أسرار OAuth المشفرة؛ لا تعاد إلى الواجهة أو سجل التدقيق.
 */
export const integrationConnectionTokens = mysqlTable(
  'integration_connection_tokens',
  {
    id: int('id').autoincrement().primaryKey(),
    connectionId: int('connectionId')
      .notNull()
      .references(() => integrationConnections.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
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
export const integrationExternalAssets = mysqlTable(
  'integration_external_assets',
  {
    id: int('id').autoincrement().primaryKey(),
    connectionId: int('connectionId')
      .notNull()
      .references(() => integrationConnections.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
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
    connectionId: int('connectionId').references(() => integrationConnections.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
    expiresAt: timestamp('expiresAt').notNull(),
    consumedAt: timestamp('consumedAt'),
    failureReason: text('failureReason'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
  },
  (table) => ({
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
export const integrationWebhookSubscriptions = mysqlTable(
  'integration_webhook_subscriptions',
  {
    id: int('id').autoincrement().primaryKey(),
    connectionId: int('connectionId')
      .notNull()
      .references(() => integrationConnections.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    assetId: int('assetId').references(() => integrationExternalAssets.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
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
export const integrationDeliveryJobs = mysqlTable(
  'integration_delivery_jobs',
  {
    id: int('id').autoincrement().primaryKey(),
    destinationId: int('destinationId')
      .notNull()
      .references(() => socialPublishDestinations.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    connectionId: int('connectionId').references(() => integrationConnections.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
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
    connectionId: int('connectionId').references(() => integrationConnections.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
    assetId: int('assetId').references(() => integrationExternalAssets.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
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
export const metaLeadForms = mysqlTable(
  'meta_lead_forms',
  {
    id: int('id').autoincrement().primaryKey(),
    connectionId: int('connectionId')
      .notNull()
      .references(() => integrationConnections.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    pageAssetId: int('pageAssetId').references(() => integrationExternalAssets.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
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
    formUnique: uniqueIndex('metaLeadForms_external_form_unique').on(table.externalFormId),
    connectionIdx: index('metaLeadForms_connection_idx').on(table.connectionId),
  })
);

/** إشعارات Lead Ads؛ تحفظ الحقول المستلمة مشفرة حتى يتم إدخالها إلى CRM مع منع التكرار. */
export const metaLeadEvents = mysqlTable(
  'meta_lead_events',
  {
    id: int('id').autoincrement().primaryKey(),
    connectionId: int('connectionId')
      .notNull()
      .references(() => integrationConnections.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
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
    leadUnique: uniqueIndex('metaLeadEvents_external_lead_unique').on(table.externalLeadId),
    eventUnique: uniqueIndex('metaLeadEvents_event_key_unique').on(table.eventKey),
    statusIdx: index('metaLeadEvents_status_idx').on(table.status, table.receivedAt),
  })
);

/** Outbox مشفر لأحداث Conversions API؛ لا يحمل تشخيصات أو محتوى علاجي. */
export const metaConversionEvents = mysqlTable(
  'meta_conversion_events',
  {
    id: int('id').autoincrement().primaryKey(),
    connectionId: int('connectionId')
      .notNull()
      .references(() => integrationConnections.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    datasetAssetId: int('datasetAssetId').references(() => integrationExternalAssets.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
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
    eventUnique: uniqueIndex('metaConversionEvents_event_unique').on(table.eventId),
    dispatchIdx: index('metaConversionEvents_dispatch_idx').on(table.status, table.runAfter),
  })
);

/**
 * Social Publishing Accounts - حسابات النشر المتصلة لكل منصة
 * لا تُخزن الأسرار هنا بصيغة مكشوفة؛ تحفظ بيانات OAuth المشفرة لاحقاً في خدمة الاتصال.
 */
export const socialPublishAccounts = mysqlTable(
  'social_publish_accounts',
  {
    id: int('id').autoincrement().primaryKey(),
    connectionId: int('connectionId').references(() => integrationConnections.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
    integrationAssetId: int('integrationAssetId').references(() => integrationExternalAssets.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
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
export const socialPublishDestinations = mysqlTable(
  'social_publish_destinations',
  {
    id: int('id').autoincrement().primaryKey(),
    postId: int('postId')
      .notNull()
      .references(() => socialPublishPosts.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    accountId: int('accountId').references(() => socialPublishAccounts.id, {
      onDelete: 'set null',
      onUpdate: 'cascade',
    }),
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
export const socialPublishAttempts = mysqlTable(
  'social_publish_attempts',
  {
    id: int('id').autoincrement().primaryKey(),
    destinationId: int('destinationId')
      .notNull()
      .references(() => socialPublishDestinations.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
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
