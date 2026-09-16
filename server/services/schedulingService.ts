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
  type Patient,
} from '../../drizzle/schema';
import { ensureDatabaseAvailable } from '../_core/databaseGuard';
import { createLogger } from '../_core/logger';
import { normalizePhoneNumber } from '../database/db';

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
  durationMinutes: number
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
    const period = sH < 13 ? 'morning' : 'evening';

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

  // Determine effective working hours
  let startTime = schedule?.startTime;
  let endTime = schedule?.endTime;
  let slotDuration = schedule?.slotDurationMinutes || 30;
  let capacityPerSlot = schedule?.maxCapacityPerSlot || 1;

  if (exception && !exception.isOff && exception.customStartTime && exception.customEndTime) {
    startTime = exception.customStartTime;
    endTime = exception.customEndTime;
  }

  // If no schedule exists, provide standard clinic fallback if available, or mark as off
  if (!startTime || !endTime) {
    // Default fallback: If it's a weekday (Sat-Thu in Yemen: 0,1,2,3,4,6) and no custom schedule is set,
    // provide default clinic hours (09:00 - 14:00) so doctors without custom schedules are still bookable
    if (dayOfWeek !== 5) {
      // 5 = Friday (عطلة الجمعة)
      startTime = '09:00';
      endTime = '14:00';
      slotDuration = 30;
      capacityPerSlot = 1;
    } else {
      return {
        ...baseResult,
        reason: 'عطلة نهاية الأسبوع (الجمعة)',
      };
    }
  }

  // 4. Generate all raw slots for the day
  const rawSlots = generateTimeSlots(startTime, endTime, slotDuration);

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
 * Ensure patient record exists in `patients` table (Auto-provisioning)
 * Returns the matched or newly created Patient
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

  try {
    // Check if patient already exists
    const [existing] = await db
      .select()
      .from(patients)
      .where(eq(patients.phone, normalizedPhone))
      .limit(1);

    if (existing) {
      return existing;
    }

    // Auto-create new patient record
    const [inserted] = await db.insert(patients).values({
      phone: normalizedPhone,
      fullName: data.fullName,
      gender: data.gender || 'male',
      age: data.age,
      email: data.email,
      isActive: true,
    });

    const newId = Number(inserted.insertId);
    const [newPatient] = await db.select().from(patients).where(eq(patients.id, newId)).limit(1);

    logger.info(`Auto-created patient record #${newId} for ${normalizedPhone}`);
    return newPatient || null;
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
 * Save or replace doctor's weekly schedules
 */
export async function saveDoctorWeeklySchedules(
  doctorId: number,
  schedulesList: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
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
    await db.insert(doctorSchedules).values({
      doctorId,
      dayOfWeek: s.dayOfWeek,
      startTime: s.startTime,
      endTime: s.endTime,
      slotDurationMinutes: s.slotDurationMinutes || 30,
      maxCapacityPerSlot: s.maxCapacityPerSlot || 1,
      isActive: s.isActive !== false,
    });
  }

  return { success: true };
}

/**
 * Add or replace a doctor's schedule exception (e.g., leave, holiday, custom day)
 */
export async function addDoctorScheduleException(
  doctorId: number,
  data: {
    exceptionDate: string;
    isOff?: boolean;
    customStartTime?: string;
    customEndTime?: string;
    reason?: string;
  }
) {
  const db = await ensureDatabaseAvailable();

  // Delete any existing exception for that specific date first
  await db
    .delete(doctorScheduleExceptions)
    .where(
      and(
        eq(doctorScheduleExceptions.doctorId, doctorId),
        eq(doctorScheduleExceptions.exceptionDate, data.exceptionDate)
      )
    );

  const [res] = await db.insert(doctorScheduleExceptions).values({
    doctorId,
    exceptionDate: data.exceptionDate,
    isOff: data.isOff !== false,
    customStartTime: data.customStartTime || null,
    customEndTime: data.customEndTime || null,
    reason: data.reason || null,
  });

  return { success: true, id: res.insertId };
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
