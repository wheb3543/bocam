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
 * Departments table - stores medical departments and clinics
 */
export const departments = mysqlTable('departments', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  nameEn: varchar('nameEn', { length: 255 }),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),
  icon: varchar('icon', { length: 100 }),
  sortOrder: int('sortOrder').default(0).notNull(),
  isActive: boolean('isActive').default(true).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type Department = typeof departments.$inferSelect;
export type InsertDepartment = typeof departments.$inferInsert;

/**
 * Doctors table - stores information about hospital doctors
 */

/**
 * Doctors table - stores information about hospital doctors
 */
export const doctors = mysqlTable('doctors', {
  id: int('id').autoincrement().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  specialty: varchar('specialty', { length: 255 }).notNull(),
  departmentId: int('departmentId'), // Optional link to department
  image: varchar('image', { length: 500 }),
  bio: text('bio'),
  experience: varchar('experience', { length: 255 }),
  languages: varchar('languages', { length: 255 }),
  consultationFee: varchar('consultationFee', { length: 100 }),
  procedures: text('procedures'), // JSON array of available procedures
  isVisiting: mysqlEnum('isVisiting', ['yes', 'no']).default('no').notNull(), // Visiting doctor flag
  visitingStartDate: timestamp('visitingStartDate'), // Start date for visiting doctor campaign
  visitingEndDate: timestamp('visitingEndDate'), // End date for visiting doctor campaign
  available: mysqlEnum('available', ['yes', 'no']).default('yes').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type Doctor = typeof doctors.$inferSelect;
export type InsertDoctor = typeof doctors.$inferInsert;

/**
 * Doctor Schedules table - stores weekly working hours and capacity per doctor
 */

/**
 * Doctor Schedules table - stores weekly working hours and capacity per doctor
 */
export const doctorSchedules = mysqlTable(
  'doctorSchedules',
  {
    id: int('id').autoincrement().primaryKey(),
    doctorId: int('doctorId').notNull(),
    dayOfWeek: int('dayOfWeek').notNull(), // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    startTime: varchar('startTime', { length: 10 }).notNull(), // "09:00"
    endTime: varchar('endTime', { length: 10 }).notNull(), // "17:00"
    // Dual shift support (Morning & Evening)
    isMorningActive: boolean('isMorningActive').default(true).notNull(),
    morningStartTime: varchar('morningStartTime', { length: 10 }).default('09:00').notNull(),
    morningEndTime: varchar('morningEndTime', { length: 10 }).default('13:00').notNull(),
    isEveningActive: boolean('isEveningActive').default(false).notNull(),
    eveningStartTime: varchar('eveningStartTime', { length: 10 }).default('16:00').notNull(),
    eveningEndTime: varchar('eveningEndTime', { length: 10 }).default('20:00').notNull(),
    slotDurationMinutes: int('slotDurationMinutes').default(30).notNull(),
    maxCapacityPerSlot: int('maxCapacityPerSlot').default(1).notNull(),
    isActive: boolean('isActive').default(true).notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    doctorIdIdx: index('doctorSchedules_doctorId_idx').on(table.doctorId),
  })
);

export type DoctorSchedule = typeof doctorSchedules.$inferSelect;
export type InsertDoctorSchedule = typeof doctorSchedules.$inferInsert;

/**
 * Doctor Schedule Exceptions table - stores vacations, leaves, or custom working hours for specific dates
 */

/**
 * Doctor Schedule Exceptions table - stores vacations, leaves, or custom working hours for specific dates
 */
export const doctorScheduleExceptions = mysqlTable(
  'doctorScheduleExceptions',
  {
    id: int('id').autoincrement().primaryKey(),
    doctorId: int('doctorId').notNull(),
    exceptionDate: varchar('exceptionDate', { length: 20 }).notNull(), // YYYY-MM-DD
    isOff: boolean('isOff').default(true).notNull(), // true = vacation/off, false = custom hours
    customStartTime: varchar('customStartTime', { length: 10 }),
    customEndTime: varchar('customEndTime', { length: 10 }),
    reason: varchar('reason', { length: 255 }),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    doctorIdIdx: index('doctorScheduleExceptions_doctorId_idx').on(table.doctorId),
    exceptionDateIdx: index('doctorScheduleExceptions_date_idx').on(table.exceptionDate),
  })
);

export type DoctorScheduleException = typeof doctorScheduleExceptions.$inferSelect;
export type InsertDoctorScheduleException = typeof doctorScheduleExceptions.$inferInsert;

/**
 * Appointments table - stores appointment bookings
 */

/**
 * Appointments table - stores appointment bookings
 */
export const appointments = mysqlTable(
  'appointments',
  {
    id: int('id').autoincrement().primaryKey(),
    campaignId: int('campaignId').notNull(),
    doctorId: int('doctorId').notNull(),
    departmentId: int('departmentId'), // Optional link to department
    patientId: int('patientId'), // Optional standard link to patients table
    leadId: int('leadId'), // Optional link to originating lead if converted
    fullName: varchar('fullName', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 20 }).notNull(),
    email: varchar('email', { length: 320 }),
    age: int('age'), // Patient age
    gender: mysqlEnum('gender', ['male', 'female']), // Patient gender
    procedure: text('procedure'), // Selected procedure
    preferredDate: varchar('preferredDate', { length: 50 }),
    preferredTime: varchar('preferredTime', { length: 50 }),
    slotStartTime: varchar('slotStartTime', { length: 10 }), // Scheduled slot start time e.g. "09:30"
    slotEndTime: varchar('slotEndTime', { length: 10 }), // Scheduled slot end time e.g. "10:00"
    appointmentDate: timestamp('appointmentDate'), // Confirmed appointment date/time
    patientMessage: text('patientMessage'), // رسالة المريض الاختيارية
    notes: text('notes'), // Patient notes
    additionalNotes: text('additionalNotes'), // Additional patient notes
    staffNotes: text('staffNotes'), // Staff notes (admin only)
    assignedToUserId: int('assignedToUserId'),
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
    patientIdIdx: index('appointments_patientId_idx').on(table.patientId),
    appointmentDateIdx: index('appointments_appointmentDate_idx').on(table.appointmentDate),
  })
);

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;

/** إعداد مهمة Heartbeat لتذكيرات المواعيد. */

/** إعداد مهمة Heartbeat لتذكيرات المواعيد. */
export const appointmentReminderSchedules = mysqlTable(
  'appointmentReminderSchedules',
  {
    id: int('id').autoincrement().primaryKey(),
    enabled: mysqlEnum('enabled', ['yes', 'no']).default('yes').notNull(),
    scheduleCronTaskUid: varchar('scheduleCronTaskUid', { length: 65 }),
    lastRunAt: timestamp('lastRunAt'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    taskUidIdx: index('appointment_reminder_schedule_task_uid_idx').on(table.scheduleCronTaskUid),
  })
);

/**
 * Access Requests table - stores access requests
 */

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
