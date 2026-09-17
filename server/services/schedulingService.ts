/**
 * Smart Scheduling Service
 * خدمة الجدولة الذكية وضبط السعة الاستيعابية وحساب الفترات الزمنية
 */

import { and, eq, or, sql } from 'drizzle-orm';
import {
  appointments,
  doctors,
  doctorSchedules,
  doctorScheduleExceptions,
  patients,
  patientRelationships,
  type Patient,
  type InsertPatient,
} from '../../drizzle/schema';
import { ensureDatabaseAvailable } from '../_core/databaseGuard';
import { createLogger } from '../_core/logger';
import { normalizePhoneNumber } from '../database/db';
import { normalizeArabicText } from '../utils/textNormalization';

const logger = createLogger('schedulingService');

export interface TimeSlot {
  slotStartTime: string;
  slotEndTime: string;
  period: 'morning' | 'evening';
  maxCapacity: number;
  bookedCount: number;
  isAvailable: boolean;
}

export interface DaySlotsResult {
  doctorId: number;
  doctorName: string;
  specialty: string;
  date: string;
  isWorking: boolean;
  reason?: string;
  slotDurationMinutes: number;
  slots: TimeSlot[];
}

/**
 * Generate time slots between start and end times
 */
function generateTimeSlots(
  startTime: string,
  endTime: string,
  durationMinutes: number,
  forcedPeriod?: 'morning' | 'evening'
): { start: string; end: string; period: 'morning' | 'evening' }[] {
  const slots: { start: string; end: string; period: 'morning' | 'evening' }[] = [];

  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  let currentMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  while (currentMinutes + durationMinutes <= endMinutes) {
    const sH = Math.floor(currentMinutes / 60);
    const sM = currentMinutes % 60;
    const eMinutes = currentMinutes + durationMinutes;
    const eH = Math.floor(eMinutes / 60);
    const eM = eMinutes % 60;

    const startStr = `${String(sH).padStart(2, '0')}:${String(sM).padStart(2, '0')}`;
    const endStr = `${String(eH).padStart(2, '0')}:${String(eM).padStart(2, '0')}`;
    const period = forcedPeriod || (sH < 13 ? 'morning' : 'evening');

    slots.push({
      start: startStr,
      end: endStr,
      period,
    });

    currentMinutes += durationMinutes;
  }

  return slots;
}

/**
 * Get available time slots for a doctor on a specific date (YYYY-MM-DD)
 */
export async function getAvailableSlots(
  doctorId: number,
  dateStr: string
): Promise<DaySlotsResult> {
  const db = await ensureDatabaseAvailable();

  // 1. Fetch doctor details
  const [doctor] = await db.select().from(doctors).where(eq(doctors.id, doctorId)).limit(1);

  if (!doctor) {
    throw new Error('الطبيب غير موجود');
  }

  const baseResult: DaySlotsResult = {
    doctorId: doctor.id,
    doctorName: doctor.name,
    specialty: doctor.specialty,
    date: dateStr,
    isWorking: false,
    slotDurationMinutes: 30,
    slots: [],
  };

  if (doctor.available === 'no') {
    return {
      ...baseResult,
      reason: 'الطبيب غير متاح للحجوزات حالياً',
    };
  }

  // Check visiting doctor dates if configured
  const targetDate = new Date(`${dateStr}T00:00:00`);
  if (doctor.isVisiting === 'yes') {
    if (doctor.visitingStartDate && targetDate < new Date(doctor.visitingStartDate)) {
      return {
        ...baseResult,
        reason: 'تاريخ الموعد قبل بداية فترة زيارة الطبيب الزائر',
      };
    }
    if (doctor.visitingEndDate && targetDate > new Date(doctor.visitingEndDate)) {
      return {
        ...baseResult,
        reason: 'تاريخ الموعد بعد انتهاء فترة زيارة الطبيب الزائر',
      };
    }
  }

  // 2. Check for date-specific exceptions (vacations, emergency leaves, or custom hours)
  const [exception] = await db
    .select()
    .from(doctorScheduleExceptions)
    .where(
      and(
        eq(doctorScheduleExceptions.doctorId, doctorId),
        eq(doctorScheduleExceptions.exceptionDate, dateStr)
      )
    )
    .limit(1);

  if (exception) {
    if (exception.isOff) {
      return {
        ...baseResult,
        reason: exception.reason || 'إجازة الطبيب في هذا اليوم',
      };
    }
  }

  // 3. Check regular weekly schedule
  // dayOfWeek: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const dayOfWeek = targetDate.getDay();

  const [schedule] = await db
    .select()
    .from(doctorSchedules)
    .where(
      and(
        eq(doctorSchedules.doctorId, doctorId),
        eq(doctorSchedules.dayOfWeek, dayOfWeek),
        eq(doctorSchedules.isActive, true)
      )
    )
    .limit(1);

  // 4. Generate all raw slots for the day (supporting Morning & Evening dual shifts)
  let rawSlots: { start: string; end: string; period: 'morning' | 'evening' }[] = [];
  const slotDuration = schedule?.slotDurationMinutes || 30;
  const capacityPerSlot = schedule?.maxCapacityPerSlot || 1;

  if (exception && !exception.isOff && exception.customStartTime && exception.customEndTime) {
    rawSlots = generateTimeSlots(exception.customStartTime, exception.customEndTime, slotDuration);
  } else if (schedule) {
    const morningActive = schedule.isMorningActive;
    const eveningActive = schedule.isEveningActive;

    if (morningActive) {
      const mSlots = generateTimeSlots(
        schedule.morningStartTime,
        schedule.morningEndTime,
        slotDuration,
        'morning'
      );
      rawSlots.push(...mSlots);
    }

    if (eveningActive) {
      const eSlots = generateTimeSlots(
        schedule.eveningStartTime,
        schedule.eveningEndTime,
        slotDuration,
        'evening'
      );
      rawSlots.push(...eSlots);
    }

    // Fallback if neither morning nor evening is marked active, but schedule.isActive was true
    if (!morningActive && !eveningActive && schedule.startTime && schedule.endTime) {
      rawSlots = generateTimeSlots(schedule.startTime, schedule.endTime, slotDuration);
    }
  } else {
    // Default fallback: If it's a weekday (Sat-Thu in Yemen: 0,1,2,3,4,6) and no custom schedule is set,
    // provide default clinic morning hours (09:00 - 13:00) so doctors without custom schedules are still bookable
    if (dayOfWeek !== 5) {
      // 5 = Friday (عطلة الجمعة)
      rawSlots = generateTimeSlots('09:00', '13:00', 30, 'morning');
    } else {
      return {
        ...baseResult,
        reason: 'عطلة نهاية الأسبوع (الجمعة)',
      };
    }
  }

  if (rawSlots.length === 0) {
    return {
      ...baseResult,
      reason: 'لا توجد فترات عمل متاحة للطبيب في هذا اليوم',
    };
  }

  // 5. Fetch existing active bookings for this doctor on this day
  const activeBookings = await db
    .select({
      id: appointments.id,
      slotStartTime: appointments.slotStartTime,
      preferredDate: appointments.preferredDate,
      appointmentDate: appointments.appointmentDate,
      status: appointments.status,
    })
    .from(appointments)
    .where(
      and(
        eq(appointments.doctorId, doctorId),
        sql`${appointments.status} NOT IN ('cancelled')`,
        or(
          eq(appointments.preferredDate, dateStr),
          sql`DATE(${appointments.appointmentDate}) = ${dateStr}`
        )
      )
    );

  // Map bookings count per slot
  const bookingCountMap = new Map<string, number>();
  for (const b of activeBookings) {
    if (b.slotStartTime) {
      bookingCountMap.set(b.slotStartTime, (bookingCountMap.get(b.slotStartTime) || 0) + 1);
    }
  }

  // 6. Build available slots
  const slots: TimeSlot[] = rawSlots.map((slot) => {
    const bookedCount = bookingCountMap.get(slot.start) || 0;
    const isAvailable = bookedCount < capacityPerSlot;

    return {
      slotStartTime: slot.start,
      slotEndTime: slot.end,
      period: slot.period,
      maxCapacity: capacityPerSlot,
      bookedCount,
      isAvailable,
    };
  });

  return {
    doctorId: doctor.id,
    doctorName: doctor.name,
    specialty: doctor.specialty,
    date: dateStr,
    isWorking: true,
    slotDurationMinutes: slotDuration,
    slots,
  };
}

/**
 * Validate that a slot is currently available before saving
 */
export async function validateSlotAvailability(
  doctorId: number,
  dateStr: string,
  slotStartTime: string
): Promise<{ valid: boolean; slotEndTime: string; message?: string }> {
  const daySlots = await getAvailableSlots(doctorId, dateStr);

  if (!daySlots.isWorking) {
    return {
      valid: false,
      slotEndTime: '',
      message: daySlots.reason || 'الطبيب غير متاح في هذا التاريخ',
    };
  }

  const slot = daySlots.slots.find((s) => s.slotStartTime === slotStartTime);

  if (!slot) {
    return {
      valid: false,
      slotEndTime: '',
      message: 'الوقت المحدد خارج ساعات دوام الطبيب',
    };
  }

  if (!slot.isAvailable) {
    return {
      valid: false,
      slotEndTime: slot.slotEndTime,
      message: 'هذا الوقت محجوز بالكامل، يرجى اختيار فترة زمنية أخرى',
    };
  }

  return {
    valid: true,
    slotEndTime: slot.slotEndTime,
  };
}

/**
 * Ensure patient record exists in `patients` table (Auto-provisioning with Family Member Support)
 * 1. Normalizes phone via normalizePhoneNumber and name via normalizeArabicText.
 * 2. Fetches all patients sharing this normalized phone.
 * 3. Matches existing patient by normalized name.
 * 4. If matched: returns patient (and updates missing age/gender/email if provided).
 * 5. If new family member with shared phone:
 *    - Creates a new patient record with their distinct name, age, and gender.
 *    - Links them automatically to the primary patient (first registered with this phone) in `patientRelationships`.
 *    - Returns the new patient record for independent patientId assignment.
 */
export async function ensurePatientAccount(data: {
  phone: string;
  fullName: string;
  gender?: 'male' | 'female';
  age?: number;
  email?: string;
}): Promise<Patient | null> {
  const db = await ensureDatabaseAvailable();
  const normalizedPhone = normalizePhoneNumber(data.phone);
  const normalizedInputName = normalizeArabicText(data.fullName);

  try {
    // Fetch all existing patients registered with this phone
    const existingPatients = await db
      .select()
      .from(patients)
      .where(eq(patients.phone, normalizedPhone))
      .orderBy(patients.id);

    // Look for exact/normalized match on name
    const matched = existingPatients.find(
      (p) => normalizeArabicText(p.fullName) === normalizedInputName
    );

    if (matched) {
      // Update missing demographic fields if supplied
      const updates: Partial<InsertPatient> = {};
      if (
        (matched.age === null || matched.age === undefined) &&
        data.age !== undefined &&
        data.age !== null
      ) {
        updates.age = data.age;
      }
      if (!matched.email && data.email) {
        updates.email = data.email;
      }

      if (Object.keys(updates).length > 0) {
        await db.update(patients).set(updates).where(eq(patients.id, matched.id));
        const [refreshed] = await db
          .select()
          .from(patients)
          .where(eq(patients.id, matched.id))
          .limit(1);
        return refreshed || matched;
      }
      return matched;
    }

    // Identify primary patient (the first patient registered with this phone number)
    const primaryPatient = existingPatients.length > 0 ? existingPatients[0] : null;

    // Auto-create new patient record for the family member
    const [inserted] = await db.insert(patients).values({
      phone: normalizedPhone,
      fullName: data.fullName.trim(),
      gender: data.gender || 'male',
      age: data.age,
      email: data.email,
      isActive: true,
    });

    const newId = Number(inserted.insertId);
    const [newPatient] = await db.select().from(patients).where(eq(patients.id, newId)).limit(1);

    if (!newPatient) {
      return null;
    }

    // Automatically establish relationship with primary patient if applicable
    if (primaryPatient && primaryPatient.id !== newPatient.id) {
      const [existingRel] = await db
        .select()
        .from(patientRelationships)
        .where(
          and(
            eq(patientRelationships.primaryPatientId, primaryPatient.id),
            eq(patientRelationships.relatedPatientId, newPatient.id)
          )
        )
        .limit(1);

      if (!existingRel) {
        await db.insert(patientRelationships).values({
          primaryPatientId: primaryPatient.id,
          relatedPatientId: newPatient.id,
          relationship: 'other',
        });
        logger.info(
          `Auto-linked family member #${newPatient.id} (${newPatient.fullName}) to primary patient #${primaryPatient.id} (${primaryPatient.fullName})`
        );
      }
    }

    logger.info(`Auto-created patient record #${newId} for ${normalizedPhone} (${data.fullName})`);
    return newPatient;
  } catch (error) {
    logger.error('Failed to ensure patient account:', error);
    return null;
  }
}

/**
 * Get doctor's full weekly schedule and future exceptions
 */
export async function getDoctorScheduleDetails(doctorId: number) {
  const db = await ensureDatabaseAvailable();

  const schedules = await db
    .select()
    .from(doctorSchedules)
    .where(eq(doctorSchedules.doctorId, doctorId))
    .orderBy(doctorSchedules.dayOfWeek);

  const exceptions = await db
    .select()
    .from(doctorScheduleExceptions)
    .where(eq(doctorScheduleExceptions.doctorId, doctorId))
    .orderBy(doctorScheduleExceptions.exceptionDate);

  return {
    doctorId,
    schedules,
    exceptions,
  };
}

/**
 * Save or replace doctor's weekly schedules (supporting Morning & Evening dual shifts)
 */
export async function saveDoctorWeeklySchedules(
  doctorId: number,
  schedulesList: {
    dayOfWeek: number;
    startTime?: string;
    endTime?: string;
    isMorningActive?: boolean;
    morningStartTime?: string | null;
    morningEndTime?: string | null;
    isEveningActive?: boolean;
    eveningStartTime?: string | null;
    eveningEndTime?: string | null;
    slotDurationMinutes?: number;
    maxCapacityPerSlot?: number;
    isActive?: boolean;
  }[]
) {
  const db = await ensureDatabaseAvailable();

  // Delete existing schedules for this doctor
  await db.delete(doctorSchedules).where(eq(doctorSchedules.doctorId, doctorId));

  if (schedulesList.length === 0) {
    return { success: true };
  }

  // Insert new schedules
  for (const s of schedulesList) {
    const isMorning = s.isMorningActive ?? true;
    const isEvening = s.isEveningActive ?? false;
    const mStart = s.morningStartTime || '09:00';
    const mEnd = s.morningEndTime || '13:00';
    const eStart = s.eveningStartTime || '16:00';
    const eEnd = s.eveningEndTime || '20:00';

    const fallbackStart = isMorning ? mStart : eStart;
    const fallbackEnd = isEvening ? eEnd : mEnd;

    await db.insert(doctorSchedules).values({
      doctorId,
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime || fallbackStart,
      endTime: s.endTime || fallbackEnd,
      isMorningActive: isMorning,
      morningStartTime: mStart,
      morningEndTime: mEnd,
      isEveningActive: isEvening,
      eveningStartTime: eStart,
      eveningEndTime: eEnd,
      slotDurationMinutes: s.slotDurationMinutes || 30,
      maxCapacityPerSlot: s.maxCapacityPerSlot || 1,
      isActive: s.isActive !== false && (isMorning || isEvening),
    });
  }

  return { success: true };
}

/**
 * Helper to generate date strings between startDate and endDate inclusive
 */
function getDatesInRange(startDateStr: string, endDateStr: string): string[] {
  const dates: string[] = [];
  const start = new Date(`${startDateStr}T00:00:00`);
  const end = new Date(`${endDateStr}T00:00:00`);

  if (start > end) {
    return [startDateStr];
  }

  const maxDays = 90;
  const current = new Date(start);
  let count = 0;

  while (current <= end && count < maxDays) {
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const d = String(current.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${d}`);
    current.setDate(current.getDate() + 1);
    count++;
  }

  return dates;
}

/**
 * Add or replace a doctor's schedule exception (supports single date or date range)
 */
export async function addDoctorScheduleException(
  doctorId: number,
  data: {
    exceptionDate?: string;
    startDate?: string;
    endDate?: string;
    isOff?: boolean;
    customStartTime?: string | null;
    customEndTime?: string | null;
    reason?: string | null;
  }
) {
  const db = await ensureDatabaseAvailable();

  const datesToProcess =
    data.startDate && data.endDate
      ? getDatesInRange(data.startDate, data.endDate)
      : data.exceptionDate
        ? [data.exceptionDate]
        : [];

  if (datesToProcess.length === 0) {
    throw new Error('يرجى تحديد تاريخ أو نطاق تواريخ للاستثناء');
  }

  for (const dateStr of datesToProcess) {
    // Delete any existing exception for that specific date first
    await db
      .delete(doctorScheduleExceptions)
      .where(
        and(
          eq(doctorScheduleExceptions.doctorId, doctorId),
          eq(doctorScheduleExceptions.exceptionDate, dateStr)
        )
      );

    await db.insert(doctorScheduleExceptions).values({
      doctorId,
      exceptionDate: dateStr,
      isOff: data.isOff !== false,
      customStartTime: data.customStartTime || null,
      customEndTime: data.customEndTime || null,
      reason: data.reason || null,
    });
  }

  return { success: true, count: datesToProcess.length };
}

/**
 * Check for conflicting active appointments when adding an exception/leave
 */
export async function checkDoctorScheduleConflicts(
  doctorId: number,
  startDate: string,
  endDate?: string
) {
  const db = await ensureDatabaseAvailable();

  const dates = endDate ? getDatesInRange(startDate, endDate) : [startDate];

  if (dates.length === 0) {
    return { hasConflicts: false, conflictCount: 0, conflicts: [] };
  }

  const conflictingAppointments = await db
    .select({
      id: appointments.id,
      fullName: appointments.fullName,
      phone: appointments.phone,
      preferredDate: appointments.preferredDate,
      preferredTime: appointments.preferredTime,
      slotStartTime: appointments.slotStartTime,
      appointmentDate: appointments.appointmentDate,
      status: appointments.status,
    })
    .from(appointments)
    .where(
      and(
        eq(appointments.doctorId, doctorId),
        sql`${appointments.status} NOT IN ('cancelled', 'completed')`,
        or(
          sql`${appointments.preferredDate} IN (${sql.join(
            dates.map((d) => sql`${d}`),
            sql`, `
          )})`,
          sql`DATE(${appointments.appointmentDate}) IN (${sql.join(
            dates.map((d) => sql`${d}`),
            sql`, `
          )})`
        )
      )
    );

  return {
    hasConflicts: conflictingAppointments.length > 0,
    conflictCount: conflictingAppointments.length,
    conflicts: conflictingAppointments.map((app) => ({
      id: app.id,
      fullName: app.fullName,
      phone: app.phone,
      date:
        app.preferredDate ||
        (app.appointmentDate ? new Date(app.appointmentDate).toISOString().split('T')[0] : ''),
      time: app.slotStartTime || app.preferredTime || '',
      status: app.status,
    })),
  };
}

/**
 * Delete a doctor's schedule exception
 */
export async function deleteDoctorScheduleException(doctorId: number, exceptionId: number) {
  const db = await ensureDatabaseAvailable();

  await db
    .delete(doctorScheduleExceptions)
    .where(
      and(
        eq(doctorScheduleExceptions.id, exceptionId),
        eq(doctorScheduleExceptions.doctorId, doctorId)
      )
    );

  return { success: true };
}

export interface DoctorPublicScheduleDetails {
  doctorId: number;
  doctorName: string;
  specialty: string;
  isVisiting: boolean;
  visitingStartDate?: string | null;
  visitingEndDate?: string | null;
  workingDays: {
    dayOfWeek: number;
    dayName: string;
    isMorningActive: boolean;
    morningHours?: string;
    isEveningActive: boolean;
    eveningHours?: string;
    slotDurationMinutes: number;
  }[];
  upcomingLeaves: {
    date: string;
    reason?: string | null;
  }[];
}

const ARABIC_DAYS: Record<number, string> = {
  0: 'الأحد',
  1: 'الإثنين',
  2: 'الثلاثاء',
  3: 'الأربعاء',
  4: 'الخميس',
  5: 'الجمعة',
  6: 'السبت',
};

/**
 * Get public doctor schedule and upcoming holidays/leaves
 */
export async function getDoctorPublicScheduleDetails(
  doctorId: number
): Promise<DoctorPublicScheduleDetails | null> {
  const db = await ensureDatabaseAvailable();

  const [doctor] = await db
    .select({
      id: doctors.id,
      name: doctors.name,
      specialty: doctors.specialty,
      isVisiting: doctors.isVisiting,
      visitingStartDate: doctors.visitingStartDate,
      visitingEndDate: doctors.visitingEndDate,
    })
    .from(doctors)
    .where(eq(doctors.id, doctorId))
    .limit(1);

  if (!doctor) {
    return null;
  }

  const schedules = await db
    .select()
    .from(doctorSchedules)
    .where(and(eq(doctorSchedules.doctorId, doctorId), eq(doctorSchedules.isActive, true)))
    .orderBy(doctorSchedules.dayOfWeek);

  const todayStr = new Date().toISOString().split('T')[0];

  const exceptions = await db
    .select()
    .from(doctorScheduleExceptions)
    .where(
      and(
        eq(doctorScheduleExceptions.doctorId, doctorId),
        eq(doctorScheduleExceptions.isOff, true),
        sql`${doctorScheduleExceptions.exceptionDate} >= ${todayStr}`
      )
    )
    .orderBy(doctorScheduleExceptions.exceptionDate)
    .limit(10);

  const workingDays = schedules.map((s) => ({
    dayOfWeek: s.dayOfWeek,
    dayName: ARABIC_DAYS[s.dayOfWeek] || `يوم ${s.dayOfWeek}`,
    isMorningActive: s.isMorningActive,
    morningHours: s.isMorningActive ? `${s.morningStartTime} - ${s.morningEndTime}` : undefined,
    isEveningActive: s.isEveningActive,
    eveningHours: s.isEveningActive ? `${s.eveningStartTime} - ${s.eveningEndTime}` : undefined,
    slotDurationMinutes: s.slotDurationMinutes,
  }));

  const upcomingLeaves = exceptions.map((e) => ({
    date: e.exceptionDate,
    reason: e.reason,
  }));

  return {
    doctorId: doctor.id,
    doctorName: doctor.name,
    specialty: doctor.specialty,
    isVisiting: doctor.isVisiting === 'yes',
    visitingStartDate: doctor.visitingStartDate
      ? new Date(doctor.visitingStartDate).toISOString().split('T')[0]
      : null,
    visitingEndDate: doctor.visitingEndDate
      ? new Date(doctor.visitingEndDate).toISOString().split('T')[0]
      : null,
    workingDays,
    upcomingLeaves,
  };
}
