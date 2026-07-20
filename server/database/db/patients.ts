import { eq, and, gt, desc } from 'drizzle-orm';
import { getDb } from './connection';
import { normalizePhoneNumber } from './whatsapp';
import {
  patients,
  patientOtps,
  patientResults,
  appointments,
  offerLeads,
  campRegistrations,
  type Patient,
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

// ============ Patient Appointments ============

export async function getPatientAppointments(phone: string) {
  const db = await getDb();
  if (!db) {
    return [];
  }
  const normalizedPhone = normalizePatientPhone(phone);

  const result = await db
    .select()
    .from(appointments)
    .where(eq(appointments.phone, normalizedPhone))
    .orderBy(desc(appointments.createdAt));

  return result;
}

// ============ Patient Offer Leads ============

export async function getPatientOfferLeads(phone: string) {
  const db = await getDb();
  if (!db) {
    return [];
  }
  const normalizedPhone = normalizePatientPhone(phone);

  const result = await db
    .select()
    .from(offerLeads)
    .where(eq(offerLeads.phone, normalizedPhone))
    .orderBy(desc(offerLeads.createdAt));

  return result;
}

// ============ Patient Camp Registrations ============

export async function getPatientCampRegistrations(phone: string) {
  const db = await getDb();
  if (!db) {
    return [];
  }
  const normalizedPhone = normalizePatientPhone(phone);

  const result = await db
    .select()
    .from(campRegistrations)
    .where(eq(campRegistrations.phone, normalizedPhone))
    .orderBy(desc(campRegistrations.createdAt));

  return result;
}

// ============ Patient Results ============

export async function getPatientResults(patientId: number) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  const result = await db
    .select()
    .from(patientResults)
    .where(eq(patientResults.patientId, patientId))
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
