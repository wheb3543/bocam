/**
 * Camp Registration Helpers - دوال مساعدة لتسجيلات المخيمات
 * دوال مساعدة للتعامل مع تعيين التاريخ والوقت وإرسال الرسائل
 */

import { eq, sql, and } from 'drizzle-orm';
import { campRegistrations } from '../../drizzle/schema';
import { sendNewCampRegistrationTelegram } from '../services/telegram';
import { dispatchWhatsAppMessage } from '../services/whatsappMessageDispatcher';
import { sendCampRegistrationEvent, sendStatusChangeEvent } from '../api/facebookCAPI';
import { createAuditLog } from './auditLogs';
import { createLogger } from '../_core/logger';
import { invalidateEntityCache } from '../services/cacheInvalidator';

const logger = createLogger('campRegistrations');

export type WhatsAppMessageVariables = Record<string, string>;

/**
 * تعيين التاريخ والوقت تلقائياً للتسجيل
 *
 * تقوم هذه الدالة بتعيين التاريخ والوقت الأمثل للتسجيل بناءً على السعة المتاحة في المخيم
 * وإذا لم يتم تحديد تاريخ مفضل، تقوم باختيار أول تاريخ متاح مع فترة زمنية مناسبة.
 *
 * @param campId - معرف المخيم
 * @param preferredDate - التاريخ المفضل للتسجيل (اختياري)
 * @param preferredTimeSlot - الفترة الزمنية المفضلة (morning/evening) (اختياري)
 * @returns كائن يحتوي على التاريخ المعين والفترة الزمنية المعينة
 * @returns assignedDate - التاريخ المعين للتسجيل
 * @returns assignedTimeSlot - الفترة الزمنية المعينة (morning/evening)
 */
export async function assignCampDateAndTime(
  campId: number,
  preferredDate: string | undefined,
  preferredTimeSlot: 'morning' | 'evening' | undefined
): Promise<{
  assignedDate: Date | undefined;
  assignedTimeSlot: 'morning' | 'evening' | undefined;
}> {
  const { getDb } = await import('../database/db');
  const db = await getDb();
  if (!db) {
    return { assignedDate: undefined, assignedTimeSlot: undefined };
  }

  let assignedDate: Date | undefined = preferredDate ? new Date(preferredDate) : undefined;
  let assignedTimeSlot: 'morning' | 'evening' | undefined = preferredTimeSlot;

  if (!assignedDate) {
    const { camps: campsTable } = await import('../../drizzle/schema');
    const [campForDate] = await db
      .select()
      .from(campsTable)
      .where(eq(campsTable.id, campId))
      .limit(1);

    if (campForDate && campForDate.startDate && campForDate.endDate) {
      const morningTime = (campForDate as { morningTime?: string | null }).morningTime as Record<
        string,
        unknown
      > | null;
      const eveningTime = (campForDate as { eveningTime?: string | null }).eveningTime as Record<
        string,
        unknown
      > | null;
      const dailyCapacity = (campForDate as { dailyCapacity?: number | null }).dailyCapacity as
        number | null;
      const start = new Date(campForDate.startDate);
      const end = new Date(campForDate.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const allDays: string[] = [];
      const d = new Date(start);
      while (d <= end) {
        if (d >= today) {
          allDays.push(d.toISOString().split('T')[0]);
        }
        d.setDate(d.getDate() + 1);
      }

      if (allDays.length > 0) {
        if (dailyCapacity && (morningTime || eveningTime)) {
          const confirmedRegs = await db
            .select({
              preferredDate: campRegistrations.preferredDate,
              preferredTimeSlot: campRegistrations.preferredTimeSlot,
              count: sql<number>`count(*)`,
            })
            .from(campRegistrations)
            .where(
              and(
                eq(campRegistrations.campId, campId),
                sql`status IN ('confirmed', 'attended', 'completed')`,
                sql`preferredDate IS NOT NULL`
              )
            )
            .groupBy(campRegistrations.preferredDate, campRegistrations.preferredTimeSlot);

          const countMap: Record<string, { morning: number; evening: number }> = {};
          for (const row of confirmedRegs) {
            const dk = row.preferredDate
              ? new Date(row.preferredDate).toISOString().split('T')[0]
              : null;
            if (!dk) {
              continue;
            }
            if (!countMap[dk]) {
              countMap[dk] = { morning: 0, evening: 0 };
            }
            if (row.preferredTimeSlot === 'morning') {
              countMap[dk].morning += Number(row.count);
            } else if (row.preferredTimeSlot === 'evening') {
              countMap[dk].evening += Number(row.count);
            }
          }

          for (const day of allDays) {
            const counts = countMap[day] || { morning: 0, evening: 0 };
            if (morningTime && counts.morning < dailyCapacity) {
              assignedDate = new Date(day);
              assignedTimeSlot = 'morning';
              break;
            }
            if (eveningTime && counts.evening < dailyCapacity) {
              assignedDate = new Date(day);
              assignedTimeSlot = 'evening';
              break;
            }
          }
        } else {
          assignedDate = new Date(allDays[0]);
          assignedTimeSlot = morningTime ? 'morning' : eveningTime ? 'evening' : undefined;
        }
      }
    }
  }

  return { assignedDate, assignedTimeSlot };
}

/**
 * إرسال إشعار Telegram لتسجيل مخيم جديد
 *
 * تقوم هذه الدالة بإرسال إشعار إلى قناة Telegram عند تسجيل مخيم جديد
 * يحتوي على تفاصيل المريض والتسجيل.
 *
 * @param fullName - الاسم الكامل للمريض
 * @param phone - رقم هاتف المريض
 * @param email - البريد الإلكتروني للمريض (اختياري)
 * @param campTitle - عنوان المخيم
 * @param age - عمر المريض (اختياري)
 * @param procedures - الإجراءات الطبية المطلوبة (اختياري)
 * @param patientMessage - رسالة المريض (اختياري)
 * @returns Promise<void>
 */
export async function sendTelegramNotification(
  fullName: string,
  phone: string,
  email: string | undefined,
  campTitle: string,
  age: number | undefined,
  procedures: string | undefined,
  patientMessage: string | undefined
) {
  await sendNewCampRegistrationTelegram({
    fullName,
    phone,
    email,
    campTitle,
    age,
    procedures,
    patientMessage,
  });
}

/**
 * إرسال رسالة WhatsApp للتسجيل
 *
 * تقوم هذه الدالة بإرسال رسالة WhatsApp للمريض تحتوي على تفاصيل التسجيل
 * بما في ذلك التاريخ والوقت المعينين وموقع المخيم.
 *
 * @param phone - رقم هاتف المريض
 * @param fullName - الاسم الكامل للمريض
 * @param campName - اسم المخيم
 * @param assignedDate - التاريخ المعين للتسجيل (اختياري)
 * @param assignedTimeSlot - الفترة الزمنية المعينة (morning/evening) (اختياري)
 * @param campStartDate - تاريخ بدء المخيم (اختياري)
 * @param campMorningTime - وقت الصباح (اختياري)
 * @param campEveningTime - وقت المساء (اختياري)
 * @param triggerEvent - الحدث الذي أرسل الرسالة (on_create/on_confirmed/on_arrived/on_completed/on_cancelled)
 * @param registrationId - معرف التسجيل
 * @returns Promise<void>
 */
export async function sendCampRegistrationWhatsApp(
  phone: string,
  fullName: string,
  campName: string,
  assignedDate: Date | undefined,
  assignedTimeSlot: 'morning' | 'evening' | undefined,
  campStartDate: string | undefined,
  campMorningTime: string | undefined,
  campEveningTime: string | undefined,
  triggerEvent: 'on_create' | 'on_confirmed' | 'on_arrived' | 'on_completed' | 'on_cancelled',
  registrationId: number
) {
  const variables: WhatsAppMessageVariables = {
    name: fullName,
    camp_name: campName,
    date: assignedDate
      ? assignedDate.toLocaleDateString('ar-YE')
      : campStartDate
        ? new Date(campStartDate).toLocaleDateString('ar-YE')
        : 'غير محدد',
    time:
      assignedTimeSlot === 'morning'
        ? `صباحاً ${campMorningTime || ''}`.trim()
        : assignedTimeSlot === 'evening'
          ? `مساءً ${campEveningTime || ''}`.trim()
          : 'غير محدد',
    location: 'صنعاء - الستين الشمالي - قبل جولة الجمنه',
  };

  await dispatchWhatsAppMessage({
    entityType: 'camp_registration',
    triggerEvent,
    phone,
    recipientName: fullName,
    variables,
    entityId: registrationId,
  });
}

/**
 * إرسال حدث Facebook CAPI للتسجيل
 *
 * تقوم هذه الدالة بإرسال حدث تسجيل مخيم إلى Facebook Conversions API
 * لتتبع التحويلات والإعلانات.
 *
 * @param fullName - الاسم الكامل للمريض
 * @param phone - رقم هاتف المريض
 * @param email - البريد الإلكتروني للمريض (اختياري)
 * @param clientIpAddress - عنوان IP الخاص بالعميل (اختياري)
 * @param clientUserAgent - User Agent الخاص بالعميل (اختياري)
 * @param fbc - Facebook Click ID (اختياري)
 * @param fbp - Facebook Browser ID (اختياري)
 * @param eventSourceUrl - رابط مصدر الحدث (اختياري)
 * @param eventId - معرف الحدث الفريد
 * @returns Promise<void>
 */
export async function sendCampRegistrationCAPI(
  fullName: string,
  phone: string,
  email: string | undefined,
  clientIpAddress: string | undefined,
  clientUserAgent: string | undefined,
  fbc: string | undefined,
  fbp: string | undefined,
  eventSourceUrl: string | undefined,
  eventId: string
) {
  await sendCampRegistrationEvent({
    fullName,
    phone,
    email,
    clientIpAddress,
    clientUserAgent,
    fbc,
    fbp,
    eventSourceUrl,
    eventId,
  }).catch((err: Error) => logger.error('Camp registration error:', err));
}

/**
 * إرسال حدث Facebook CAPI لتغيير الحالة
 *
 * تقوم هذه الدالة بإرسال حدث تغيير حالة التسجيل إلى Facebook Conversions API
 * لتتبع التغييرات في حالة الحجز.
 *
 * @param status - الحالة الجديدة للتسجيل
 * @param fullName - الاسم الكامل للمريض
 * @param phone - رقم هاتف المريض
 * @param email - البريد الإلكتروني للمريض (اختياري)
 * @param bookingId - معرف الحجز
 * @returns Promise<void>
 */
export async function sendStatusChangeCAPI(
  status: string,
  fullName: string,
  phone: string,
  email: string | undefined,
  bookingId: number
) {
  await sendStatusChangeEvent({
    status,
    fullName,
    phone,
    email,
    serviceType: 'camp',
    bookingId,
  }).catch((err: Error) => logger.error('Camp status change error:', err));
}

/**
 * إنشاء سجل تدقيق لتسجيل المخيم
 *
 * تقوم هذه الدالة بإنشاء سجل تدقيق لتتبع التغييرات في تسجيلات المخيم
 * بما في ذلك من قام بالتغيير وما هي التغييرات.
 *
 * @param entityId - معرف الكيان (التسجيل)
 * @param action - الإجراء المنفذ (create/update/delete/status_change)
 * @param oldValue - القيمة القديمة قبل التغيير
 * @param newValue - القيمة الجديدة بعد التغيير
 * @param userId - معرف المستخدم الذي قام بالتغيير (اختياري)
 * @param userName - اسم المستخدم الذي قام بالتغيير (اختياري)
 * @param notes - ملاحظات إضافية (اختياري)
 * @returns Promise<void>
 */
export async function createCampAuditLog(
  entityId: number,
  action: string,
  oldValue: string,
  newValue: string,
  userId: number | undefined,
  userName: string | undefined,
  notes: string | undefined
) {
  await createAuditLog({
    entityType: 'campRegistration',
    entityId,
    action,
    oldValue,
    newValue,
    userId,
    userName,
    notes,
  });
}

/**
 * إبطال ذاكرة التخزين المؤقت لتسجيلات المخيمات
 *
 * تقوم هذه الدالة بإبطال جميع المفاتيح المتعلقة بتسجيلات المخيمات في ذاكرة التخزين المؤقت
 * لضمان تحديث البيانات بعد أي تغيير.
 *
 * @returns void
 */
export function invalidateCampRegistrationCache() {
  invalidateEntityCache('campRegistrations');
}

/**
 * إنشاء طوابع زمنية للحالة
 *
 * تقوم هذه الدالة بإنشاء طابع زمني مناسب للحالة المحددة
 * لتتبع وقت حدوث التغيير في الحالة.
 *
 * @param status - الحالة الحالية (contacted/confirmed/attended/completed/cancelled)
 * @returns كائن يحتوي على الطابع الزمني المناسب للحالة
 * @example
 * createStatusTimestamps('confirmed')
 * // Returns: { confirmedAt: Date }
 */
export function createStatusTimestamps(status: string): Record<string, Date> {
  const now = new Date();
  const timestamps: Record<string, Date> = {};

  if (status === 'contacted') {
    timestamps.contactedAt = now;
  } else if (status === 'confirmed') {
    timestamps.confirmedAt = now;
  } else if (status === 'attended') {
    timestamps.attendedAt = now;
  } else if (status === 'completed') {
    timestamps.completedAt = now;
  } else if (status === 'cancelled') {
    timestamps.cancelledAt = now;
  }

  return timestamps;
}
