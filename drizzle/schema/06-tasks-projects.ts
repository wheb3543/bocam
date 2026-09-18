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
  dueReminderSentAt: timestamp('dueReminderSentAt'),
  overdueReminderSentAt: timestamp('overdueReminderSentAt'),
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
    dueReminderSentAt: timestamp('dueReminderSentAt'),
    overdueReminderSentAt: timestamp('overdueReminderSentAt'),
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
 * Task reminder scheduler configuration - إعداد مهمة التذكير الدوري بالمهام
 */

/**
 * Task reminder scheduler configuration - إعداد مهمة التذكير الدوري بالمهام
 */
export const taskReminderSchedules = mysqlTable(
  'taskReminderSchedules',
  {
    id: int('id').autoincrement().primaryKey(),
    enabled: mysqlEnum('enabled', ['yes', 'no']).default('yes').notNull(),
    leadTimeHours: int('leadTimeHours').default(24).notNull(),
    scheduleCronTaskUid: varchar('scheduleCronTaskUid', { length: 65 }),
    lastRunAt: timestamp('lastRunAt'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    scheduleTaskUidIdx: index('task_reminder_schedule_task_uid_idx').on(table.scheduleCronTaskUid),
  })
);

export type TaskReminderSchedule = typeof taskReminderSchedules.$inferSelect;

/** حالة انتقالات تنبيهات عمليات النظام لمنع التكرار وإظهار التعافي مرة واحدة. */
