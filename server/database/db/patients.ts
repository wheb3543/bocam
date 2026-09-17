import { eq, and, or, gt, desc, inArray } from 'drizzle-orm';
import { getDb } from './connection';
import { normalizePhoneNumber } from './whatsapp';
import {
  patients,
  patientOtps,
  patientResults,
  patientRelationships,
  appointments,
  offerLeads,
  campRegistrations,
  doctors,
  departments,
  offers,
  camps,
  type Patient,
  type PatientRelationship,
} from '../../../drizzle/schema';
import bcrypt from 'bcrypt';

export type SafePatient = Omit<Patient, 'password'>;

export function sanitizePatient(patient: Patient | null): SafePatient | null {
  if (!patient) {
    return null;
  }
  const { password: _password, ...safe } = patient;
  return safe;
}

function normalizePatientPhone(phone: string): string {
  return normalizePhoneNumber(phone);
}

// ============ Patient CRUD ============

export async function getPatientByPhone(phone: string) {
  const db = await getDb();
  if (!db) {
    return null;
  }
  const normalizedPhone = normalizePatientPhone(phone);
  const result = await db
    .select()
    .from(patients)
    .where(eq(patients.phone, normalizedPhone))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getPatientById(id: number) {
  const db = await getDb();
  if (!db) {
    return null;
  }
  const result = await db.select().from(patients).where(eq(patients.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createPatient(data: {
  fullName: string;
  phone: string;
  address?: string;
  age?: number;
  gender: 'male' | 'female';
  email?: string;
  password?: string;
}) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }
  const normalizedPhone = normalizePatientPhone(data.phone);

  let hashedPassword: string | null = null;
  if (data.password) {
    hashedPassword = await bcrypt.hash(data.password, 10);
  }

  await db.insert(patients).values({
    fullName: data.fullName,
    phone: normalizedPhone,
    address: data.address || null,
    age: data.age || null,
    gender: data.gender,
    email: data.email || null,
    password: hashedPassword,
  });

  return getPatientByPhone(normalizedPhone);
}

export async function updatePatientLastLogin(patientId: number) {
  const db = await getDb();
  if (!db) {
    return;
  }
  await db.update(patients).set({ lastLoginAt: new Date() }).where(eq(patients.id, patientId));
}

export async function updatePatientProfile(
  patientId: number,
  data: {
    fullName?: string;
    address?: string;
    age?: number;
    email?: string;
  }
) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  const updateData: Partial<{
    fullName: string;
    address: string | null;
    age: number | null;
    email: string | null;
  }> = {};
  if (data.fullName) {
    updateData.fullName = data.fullName;
  }
  if (data.address !== undefined) {
    updateData.address = data.address;
  }
  if (data.age !== undefined) {
    updateData.age = data.age;
  }
  if (data.email !== undefined) {
    updateData.email = data.email;
  }

  if (Object.keys(updateData).length > 0) {
    await db.update(patients).set(updateData).where(eq(patients.id, patientId));
  }

  return getPatientById(patientId);
}

// ============ OTP Management ============

export async function createOtp(phone: string): Promise<string> {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }
  const normalizedPhone = normalizePatientPhone(phone);

  // Generate 6-digit OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Expire in 5 minutes
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // Invalidate old OTPs for this phone
  await db
    .update(patientOtps)
    .set({ isUsed: true })
    .where(and(eq(patientOtps.phone, normalizedPhone), eq(patientOtps.isUsed, false)));

  // Create new OTP
  await db.insert(patientOtps).values({
    phone: normalizedPhone,
    code,
    expiresAt,
  });

  return code;
}

export async function verifyOtp(
  phone: string,
  code: string,
  options?: { consume?: boolean }
): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    return false;
  }
  const normalizedPhone = normalizePatientPhone(phone);
  const consume = options?.consume !== false;

  const result = await db
    .select()
    .from(patientOtps)
    .where(
      and(
        eq(patientOtps.phone, normalizedPhone),
        eq(patientOtps.code, code),
        eq(patientOtps.isUsed, false),
        gt(patientOtps.expiresAt, new Date())
      )
    )
    .limit(1);

  if (result.length === 0) {
    return false;
  }

  if (consume) {
    await db.update(patientOtps).set({ isUsed: true }).where(eq(patientOtps.id, result[0].id));
  }

  return true;
}

export async function verifyPatientPassword(
  phone: string,
  password: string
): Promise<{ success: boolean; hasPassword: boolean }> {
  const db = await getDb();
  if (!db) {
    return { success: false, hasPassword: false };
  }
  const normalizedPhone = normalizePatientPhone(phone);

  const patient = await getPatientByPhone(normalizedPhone);
  if (!patient) {
    return { success: false, hasPassword: false };
  }
  if (!patient.password) {
    return { success: false, hasPassword: false };
  }

  const isValid = await bcrypt.compare(password, patient.password);
  return { success: isValid, hasPassword: true };
}

// ============ Family Relationships ============

export interface FamilyMember {
  id: number;
  fullName: string;
  phone: string;
  age: number | null;
  gender: 'male' | 'female';
  email: string | null;
  relationship: PatientRelationship['relationship'];
  isPrimary: boolean;
}

/**
 * Get primary patient and all linked family members
 */
export async function getFamilyMembersForPatient(
  primaryPatientId: number
): Promise<FamilyMember[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  const primary = await getPatientById(primaryPatientId);
  if (!primary) {
    return [];
  }

  const relationships = await db
    .select()
    .from(patientRelationships)
    .where(eq(patientRelationships.primaryPatientId, primaryPatientId));

  const relMap = new Map<number, PatientRelationship['relationship']>();
  const relatedIds: number[] = [];
  for (const r of relationships) {
    relMap.set(r.relatedPatientId, r.relationship);
    relatedIds.push(r.relatedPatientId);
  }

  let relatedPatients: Patient[] = [];
  if (relatedIds.length > 0) {
    relatedPatients = await db.select().from(patients).where(inArray(patients.id, relatedIds));
  }

  const members: FamilyMember[] = [
    {
      id: primary.id,
      fullName: primary.fullName,
      phone: primary.phone,
      age: primary.age,
      gender: primary.gender,
      email: primary.email,
      relationship: 'self',
      isPrimary: true,
    },
  ];

  for (const rp of relatedPatients) {
    members.push({
      id: rp.id,
      fullName: rp.fullName,
      phone: rp.phone,
      age: rp.age,
      gender: rp.gender,
      email: rp.email,
      relationship: relMap.get(rp.id) || 'other',
      isPrimary: false,
    });
  }

  return members;
}

/**
 * Update family member relationship (e.g. set relationship to 'son', 'wife', etc.)
 */
export async function updatePatientRelationship(
  primaryPatientId: number,
  relatedPatientId: number,
  relationship: PatientRelationship['relationship']
) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  const [existing] = await db
    .select()
    .from(patientRelationships)
    .where(
      and(
        eq(patientRelationships.primaryPatientId, primaryPatientId),
        eq(patientRelationships.relatedPatientId, relatedPatientId)
      )
    )
    .limit(1);

  if (existing) {
    await db
      .update(patientRelationships)
      .set({ relationship, updatedAt: new Date() })
      .where(eq(patientRelationships.id, existing.id));
  } else {
    await db.insert(patientRelationships).values({
      primaryPatientId,
      relatedPatientId,
      relationship,
    });
  }

  return { success: true };
}

/**
 * Add a new family member under primary patient
 */
export async function addFamilyMemberForPatient(
  primaryPatientId: number,
  data: {
    fullName: string;
    gender: 'male' | 'female';
    age?: number;
    relationship: PatientRelationship['relationship'];
  }
) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }
  const primary = await getPatientById(primaryPatientId);
  if (!primary) {
    throw new Error('Primary patient not found');
  }

  const insertResult = await db.insert(patients).values({
    fullName: data.fullName,
    phone: primary.phone,
    gender: data.gender,
    age: data.age || null,
    isActive: true,
  });

  const relatedPatientId = Number(insertResult[0].insertId);

  await db.insert(patientRelationships).values({
    primaryPatientId,
    relatedPatientId,
    relationship: data.relationship,
  });

  return {
    id: relatedPatientId,
    fullName: data.fullName,
    phone: primary.phone,
    gender: data.gender,
    age: data.age || null,
    relationship: data.relationship,
    isPrimary: false,
  };
}

/**
 * Update family member profile and relationship
 */
export async function updateFamilyMemberForPatient(
  primaryPatientId: number,
  relatedPatientId: number,
  data: {
    fullName?: string;
    gender?: 'male' | 'female';
    age?: number;
    relationship?: PatientRelationship['relationship'];
  }
) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  const [existingRel] = await db
    .select()
    .from(patientRelationships)
    .where(
      and(
        eq(patientRelationships.primaryPatientId, primaryPatientId),
        eq(patientRelationships.relatedPatientId, relatedPatientId)
      )
    )
    .limit(1);

  if (!existingRel) {
    throw new Error('Family member not linked to this account');
  }

  const patientUpdates: Partial<{
    fullName: string;
    gender: 'male' | 'female';
    age: number | null;
    updatedAt: Date;
  }> = {};

  if (data.fullName) {
    patientUpdates.fullName = data.fullName;
  }
  if (data.gender) {
    patientUpdates.gender = data.gender;
  }
  if (data.age !== undefined) {
    patientUpdates.age = data.age;
  }

  if (Object.keys(patientUpdates).length > 0) {
    patientUpdates.updatedAt = new Date();
    await db.update(patients).set(patientUpdates).where(eq(patients.id, relatedPatientId));
  }

  if (data.relationship) {
    await db
      .update(patientRelationships)
      .set({ relationship: data.relationship, updatedAt: new Date() })
      .where(eq(patientRelationships.id, existingRel.id));
  }

  const updatedPatient = await getPatientById(relatedPatientId);
  return {
    id: relatedPatientId,
    fullName: updatedPatient?.fullName,
    gender: updatedPatient?.gender,
    age: updatedPatient?.age,
    relationship: data.relationship || existingRel.relationship,
  };
}

// ============ Patient Appointments ============

export async function getPatientAppointments(phone: string, patientIds?: number | number[]) {
  const db = await getDb();
  if (!db) {
    return [];
  }
  const normalizedPhone = normalizePatientPhone(phone);

  let condition;
  if (Array.isArray(patientIds) && patientIds.length > 0) {
    condition = or(
      inArray(appointments.patientId, patientIds),
      eq(appointments.phone, normalizedPhone)
    );
  } else if (typeof patientIds === 'number' && patientIds > 0) {
    condition = or(eq(appointments.patientId, patientIds), eq(appointments.phone, normalizedPhone));
  } else {
    condition = eq(appointments.phone, normalizedPhone);
  }

  const rows = await db
    .select({
      appointment: appointments,
      doctorName: doctors.name,
      doctorSpecialty: doctors.specialty,
      doctorImage: doctors.image,
      departmentName: departments.name,
    })
    .from(appointments)
    .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
    .leftJoin(departments, eq(appointments.departmentId, departments.id))
    .where(condition)
    .orderBy(desc(appointments.createdAt));

  return rows.map((r) => ({
    ...r.appointment,
    doctorName: r.doctorName || undefined,
    doctorSpecialty: r.doctorSpecialty || undefined,
    doctorImage: r.doctorImage || undefined,
    departmentName: r.departmentName || undefined,
  }));
}

// ============ Patient Offer Leads ============

export async function getPatientOfferLeads(phone: string) {
  const db = await getDb();
  if (!db) {
    return [];
  }
  const normalizedPhone = normalizePatientPhone(phone);

  const rows = await db
    .select({
      lead: offerLeads,
      offerTitle: offers.title,
      offerImage: offers.imageUrl,
    })
    .from(offerLeads)
    .leftJoin(offers, eq(offerLeads.offerId, offers.id))
    .where(eq(offerLeads.phone, normalizedPhone))
    .orderBy(desc(offerLeads.createdAt));

  return rows.map((r) => ({
    ...r.lead,
    offerTitle: r.offerTitle || undefined,
    offerImage: r.offerImage || undefined,
  }));
}

// ============ Patient Camp Registrations ============

export async function getPatientCampRegistrations(phone: string) {
  const db = await getDb();
  if (!db) {
    return [];
  }
  const normalizedPhone = normalizePatientPhone(phone);

  const rows = await db
    .select({
      registration: campRegistrations,
      campName: camps.name,
      campImage: camps.imageUrl,
    })
    .from(campRegistrations)
    .leftJoin(camps, eq(campRegistrations.campId, camps.id))
    .where(eq(campRegistrations.phone, normalizedPhone))
    .orderBy(desc(campRegistrations.createdAt));

  return rows.map((r) => ({
    ...r.registration,
    campName: r.campName || undefined,
    campImage: r.campImage || undefined,
  }));
}

// ============ Change Patient Password ============

export async function changePatientPassword(
  patientId: number,
  newPasswordPlain: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    return false;
  }
  const hashedPassword = await bcrypt.hash(newPasswordPlain, 10);
  await db
    .update(patients)
    .set({ password: hashedPassword, updatedAt: new Date() })
    .where(eq(patients.id, patientId));
  return true;
}

// ============ Patient Results ============

export async function getPatientResults(patientIds: number | number[]) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  let condition;
  if (Array.isArray(patientIds)) {
    if (patientIds.length === 0) {
      return [];
    }
    condition = inArray(patientResults.patientId, patientIds);
  } else {
    condition = eq(patientResults.patientId, patientIds);
  }

  const result = await db
    .select()
    .from(patientResults)
    .where(condition)
    .orderBy(desc(patientResults.createdAt));

  return result;
}

export async function createPatientResult(data: {
  patientId: number;
  resultType: 'lab' | 'radiology' | 'report';
  title: string;
  description?: string;
  fileUrl?: string;
  doctorName?: string;
  resultDate?: Date;
  status?: 'pending' | 'ready' | 'delivered';
}) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  await db.insert(patientResults).values({
    patientId: data.patientId,
    resultType: data.resultType,
    title: data.title,
    description: data.description || null,
    fileUrl: data.fileUrl || null,
    doctorName: data.doctorName || null,
    resultDate: data.resultDate || null,
    status: data.status || 'pending',
  });

  return getPatientResults(data.patientId);
}

export async function updatePatientResultStatus(
  resultId: number,
  status: 'pending' | 'ready' | 'delivered'
) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }

  await db
    .update(patientResults)
    .set({ status, updatedAt: new Date() })
    .where(eq(patientResults.id, resultId));

  const updated = await db
    .select()
    .from(patientResults)
    .where(eq(patientResults.id, resultId))
    .limit(1);
  return updated.length > 0 ? updated[0] : null;
}
