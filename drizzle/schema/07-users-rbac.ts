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

/** تعريفات الأدوار النظامية والمخصصة وصلاحياتها القابلة للإدارة. */

/** تعريفات الأدوار النظامية والمخصصة وصلاحياتها القابلة للإدارة. */
export const roleDefinitions = mysqlTable(
  'roleDefinitions',
  {
    id: int('id').autoincrement().primaryKey(),
    key: varchar('key', { length: 80 }).notNull().unique(),
    name: varchar('name', { length: 120 }).notNull(),
    description: text('description'),
    baseRole: mysqlEnum('baseRole', [
      'user',
      'admin',
      'manager',
      'staff',
      'viewer',
      'team_leader',
    ]).notNull(),
    permissions: text('permissions').notNull(),
    isSystem: boolean('isSystem').default(false).notNull(),
    isActive: boolean('isActive').default(true).notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    keyIdx: uniqueIndex('role_definitions_key_idx').on(table.key),
    activeIdx: index('role_definitions_active_idx').on(table.isActive),
  })
);

/** يحتفظ بدور مخصص اختياري فوق الدور التشغيلي الأساسي للمستخدم. */

/** يحتفظ بدور مخصص اختياري فوق الدور التشغيلي الأساسي للمستخدم. */
export const userRoleAssignments = mysqlTable(
  'userRoleAssignments',
  {
    id: int('id').autoincrement().primaryKey(),
    userId: int('userId')
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: 'cascade' }),
    roleDefinitionId: int('roleDefinitionId')
      .notNull()
      .references(() => roleDefinitions.id, { onDelete: 'restrict' }),
    assignedBy: int('assignedBy').references(() => users.id, { onDelete: 'set null' }),
    assignedAt: timestamp('assignedAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    roleIdx: index('user_role_assignments_role_idx').on(table.roleDefinitionId),
  })
);

/**
 * Campaigns table - stores comprehensive marketing campaign information
 * يخزّن معلومات شاملة عن الحملات التسويقية
 */

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
