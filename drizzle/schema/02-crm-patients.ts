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
 * جدول المرضى - يخزن بيانات المرضى المسجلين في بوابة المريض
 * Patients table - stores patient portal registered users
 */
export const patients = mysqlTable(
  'patients',
  {
    id: int('id').autoincrement().primaryKey(),
    /** الاسم الكامل */
    fullName: varchar('fullName', { length: 255 }).notNull(),
    /** رقم الهاتف (مشترك بين أفراد الأسرة - يستخدم لتسجيل الدخول للحساب الأساسي) */
    phone: varchar('phone', { length: 20 }).notNull(),
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
    phoneNameIdx: index('idx_patients_phone_name').on(table.phone, table.fullName),
  })
);

export type Patient = typeof patients.$inferSelect;
export type InsertPatient = typeof patients.$inferInsert;

/**
 * جدول علاقات أفراد العائلة - يربط الحساب الأساسي بالأفراد التابعين
 * Patient Relationships table - links primary patient account to family dependents
 */

/**
 * جدول علاقات أفراد العائلة - يربط الحساب الأساسي بالأفراد التابعين
 * Patient Relationships table - links primary patient account to family dependents
 */
export const patientRelationships = mysqlTable(
  'patientRelationships',
  {
    id: int('id').autoincrement().primaryKey(),
    /** معرف الحساب الأساسي (ولي الأمر / صاحب الحساب) */
    primaryPatientId: int('primaryPatientId').notNull(),
    /** معرف فرد العائلة التابع */
    relatedPatientId: int('relatedPatientId').notNull(),
    /** صلة القرابة */
    relationship: mysqlEnum('relationship', [
      'self',
      'father',
      'mother',
      'son',
      'daughter',
      'husband',
      'wife',
      'brother',
      'sister',
      'grandfather',
      'grandmother',
      'other',
    ])
      .default('other')
      .notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    primaryPatientIdx: index('patient_rel_primary_idx').on(table.primaryPatientId),
    relatedPatientIdx: index('patient_rel_related_idx').on(table.relatedPatientId),
    uniqueRelIdx: uniqueIndex('patient_rel_unique_idx').on(
      table.primaryPatientId,
      table.relatedPatientId
    ),
  })
);

export type PatientRelationship = typeof patientRelationships.$inferSelect;
export type InsertPatientRelationship = typeof patientRelationships.$inferInsert;

/**
 * جدول رموز التحقق للمرضى - يخزن رموز OTP لتسجيل الدخول
 * Patient OTP table - stores one-time passwords for patient login
 */

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
