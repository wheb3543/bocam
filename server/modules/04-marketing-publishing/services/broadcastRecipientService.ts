/**
 * Broadcast Recipient Service
 * خدمة بناء قائمة المستقبلين ودمج الأرقام المكررة
 */

import { getDb, normalizePhoneNumber } from '../../../database/db';
import type { Database } from '../../../database/db/connection';
import { appointments, campRegistrations, offerLeads, leads } from '../../../../drizzle/schema';
import { inArray, and } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';
import type { BroadcastFilterCriteria } from '../../../_core/broadcastValidation';

/**
 * معلومات المستقبل
 */
export interface RecipientInfo {
  phoneNumber: string;
  fullName?: string;
  email?: string | null;
  recipientType: 'appointment' | 'camp_registration' | 'offer_lead' | 'lead';
  recipientId: number;
  sourceId: number;
  sourceType: 'appointment' | 'camp_registration' | 'offer_lead' | 'lead';
  templateVariables?: Record<string, string>;
}

/**
 * نتائج بناء قائمة المستقبلين
 */
export interface BuildRecipientsResult {
  recipients: RecipientInfo[];
  totalCount: number;
  deduplicatedCount: number;
  phoneNumbers: Set<string>;
  duplicateCount: number;
  errors: string[];
}

/**
 * بناء قائمة المستقبلين من معايير التصفية
 */
export async function buildRecipientList(
  filterCriteria: BroadcastFilterCriteria
): Promise<BuildRecipientsResult> {
  const db = await getDb();
  if (!db) {
    throw new Error('قاعدة البيانات غير متاحة');
  }

  const recipients: RecipientInfo[] = [];
  const phoneNumbers = new Set<string>();
  const errors: string[] = [];
  let duplicateCount = 0;

  try {
    // 1. جلب المستقبلين من حجوزات الأطباء
    if (filterCriteria.recipientSources.includes('appointments')) {
      try {
        const appointmentRecipients = await getAppointmentRecipients(
          db,
          filterCriteria.appointmentFilter
        );
        for (const recipient of appointmentRecipients) {
          const normalized = normalizePhoneNumber(recipient.phoneNumber);
          if (normalized) {
            if (phoneNumbers.has(normalized)) {
              duplicateCount++;
            } else {
              phoneNumbers.add(normalized);
              recipients.push({
                ...recipient,
                phoneNumber: normalized,
              });
            }
          }
        }
      } catch (error) {
        errors.push(`خطأ في جلب حجوزات الأطباء: ${error}`);
      }
    }

    // 2. جلب المستقبلين من تسجيلات المخيمات
    if (filterCriteria.recipientSources.includes('camp_registrations')) {
      try {
        const campRecipients = await getCampRegistrationRecipients(db, filterCriteria.campFilter);
        for (const recipient of campRecipients) {
          const normalized = normalizePhoneNumber(recipient.phoneNumber);
          if (normalized) {
            if (phoneNumbers.has(normalized)) {
              duplicateCount++;
            } else {
              phoneNumbers.add(normalized);
              recipients.push({
                ...recipient,
                phoneNumber: normalized,
              });
            }
          }
        }
      } catch (error) {
        errors.push(`خطأ في جلب تسجيلات المخيمات: ${error}`);
      }
    }

    // 3. جلب المستقبلين من طلبات العروض
    if (filterCriteria.recipientSources.includes('offer_leads')) {
      try {
        const offerRecipients = await getOfferLeadRecipients(db, filterCriteria.offerFilter);
        for (const recipient of offerRecipients) {
          const normalized = normalizePhoneNumber(recipient.phoneNumber);
          if (normalized) {
            if (phoneNumbers.has(normalized)) {
              duplicateCount++;
            } else {
              phoneNumbers.add(normalized);
              recipients.push({
                ...recipient,
                phoneNumber: normalized,
              });
            }
          }
        }
      } catch (error) {
        errors.push(`خطأ في جلب طلبات العروض: ${error}`);
      }
    }

    // 4. جلب المستقبلين من العملاء المحتملين
    if (filterCriteria.recipientSources.includes('leads')) {
      try {
        const leadRecipients = await getLeadRecipients(db, filterCriteria.leadFilter);
        for (const recipient of leadRecipients) {
          const normalized = normalizePhoneNumber(recipient.phoneNumber);
          if (normalized) {
            if (phoneNumbers.has(normalized)) {
              duplicateCount++;
            } else {
              phoneNumbers.add(normalized);
              recipients.push({
                ...recipient,
                phoneNumber: normalized,
              });
            }
          }
        }
      } catch (error) {
        errors.push(`خطأ في جلب العملاء المحتملين: ${error}`);
      }
    }

    // 5. تطبيق الفلاتر الإضافية
    let filteredRecipients = recipients;

    // استبعاد أرقام معينة
    if (filterCriteria.excludePhoneNumbers && filterCriteria.excludePhoneNumbers.length > 0) {
      const excludedNumbers = new Set(
        filterCriteria.excludePhoneNumbers.map((n) => normalizePhoneNumber(n))
      );
      filteredRecipients = filteredRecipients.filter((r) => !excludedNumbers.has(r.phoneNumber));
    }

    // تضمين أرقام معينة فقط
    if (filterCriteria.includePhoneNumbers && filterCriteria.includePhoneNumbers.length > 0) {
      const includedNumbers = new Set(
        filterCriteria.includePhoneNumbers.map((n) => normalizePhoneNumber(n))
      );
      filteredRecipients = filteredRecipients.filter((r) => includedNumbers.has(r.phoneNumber));
    }

    return {
      recipients: filteredRecipients,
      totalCount: recipients.length,
      deduplicatedCount: filteredRecipients.length,
      phoneNumbers,
      duplicateCount,
      errors,
    };
  } catch (error) {
    throw new Error(`خطأ في بناء قائمة المستقبلين: ${error}`, { cause: error });
  }
}

/**
 * جلب المستقبلين من حجوزات الأطباء
 */
async function getAppointmentRecipients(
  db: Database,
  filter?: BroadcastFilterCriteria['appointmentFilter']
): Promise<RecipientInfo[]> {
  const baseQuery = db
    .select({
      phoneNumber: appointments.phone,
      fullName: appointments.fullName,
      email: appointments.email,
      recipientId: appointments.id,
      sourceId: appointments.id,
    })
    .from(appointments);
  const conditions: SQL[] = [];

  if (filter?.statuses?.length) {
    conditions.push(
      inArray(
        appointments.status,
        filter.statuses as Array<(typeof appointments.status.enumValues)[number]>
      )
    );
  }
  if (filter && !filter.allDoctors && filter.doctorIds?.length) {
    conditions.push(inArray(appointments.doctorId, filter.doctorIds));
  }

  const query = conditions.length ? baseQuery.where(and(...conditions)) : baseQuery;
  const results = await query;
  return results.map((r) => ({
    ...r,
    recipientType: 'appointment' as const,
    sourceType: 'appointment' as const,
  }));
}

/**
 * جلب المستقبلين من تسجيلات المخيمات
 */
async function getCampRegistrationRecipients(
  db: Database,
  filter?: BroadcastFilterCriteria['campFilter']
): Promise<RecipientInfo[]> {
  const baseQuery = db
    .select({
      phoneNumber: campRegistrations.phone,
      fullName: campRegistrations.fullName,
      email: campRegistrations.email,
      recipientId: campRegistrations.id,
      sourceId: campRegistrations.campId,
    })
    .from(campRegistrations);
  const conditions: SQL[] = [];

  if (filter?.statuses?.length) {
    conditions.push(
      inArray(
        campRegistrations.status,
        filter.statuses as Array<(typeof campRegistrations.status.enumValues)[number]>
      )
    );
  }
  if (filter && !filter.allCamps && filter.campIds?.length) {
    conditions.push(inArray(campRegistrations.campId, filter.campIds));
  }

  const query = conditions.length ? baseQuery.where(and(...conditions)) : baseQuery;
  const results = await query;
  return results.map((r) => ({
    ...r,
    recipientType: 'camp_registration' as const,
    sourceType: 'camp_registration' as const,
  }));
}

/**
 * جلب المستقبلين من طلبات العروض
 */
async function getOfferLeadRecipients(
  db: Database,
  filter?: BroadcastFilterCriteria['offerFilter']
): Promise<RecipientInfo[]> {
  const baseQuery = db
    .select({
      phoneNumber: offerLeads.phone,
      fullName: offerLeads.fullName,
      email: offerLeads.email,
      recipientId: offerLeads.id,
      sourceId: offerLeads.offerId,
    })
    .from(offerLeads);
  const conditions: SQL[] = [];

  if (filter?.statuses?.length) {
    conditions.push(
      inArray(
        offerLeads.status,
        filter.statuses as Array<(typeof offerLeads.status.enumValues)[number]>
      )
    );
  }
  if (filter && !filter.allOffers && filter.offerIds?.length) {
    conditions.push(inArray(offerLeads.offerId, filter.offerIds));
  }

  const query = conditions.length ? baseQuery.where(and(...conditions)) : baseQuery;
  const results = await query;
  return results.map((r) => ({
    ...r,
    recipientType: 'offer_lead' as const,
    sourceType: 'offer_lead' as const,
  }));
}

/**
 * جلب المستقبلين من العملاء المحتملين
 */
async function getLeadRecipients(
  db: Database,
  filter?: BroadcastFilterCriteria['leadFilter']
): Promise<RecipientInfo[]> {
  const baseQuery = db
    .select({
      phoneNumber: leads.phone,
      fullName: leads.fullName,
      email: leads.email,
      recipientId: leads.id,
      sourceId: leads.id,
    })
    .from(leads);
  const conditions: SQL[] = [];

  if (filter?.statuses?.length) {
    conditions.push(
      inArray(leads.status, filter.statuses as Array<(typeof leads.status.enumValues)[number]>)
    );
  }
  if (filter?.campaignIds?.length) {
    conditions.push(inArray(leads.campaignId, filter.campaignIds));
  }

  const query = conditions.length ? baseQuery.where(and(...conditions)) : baseQuery;
  const results = await query;
  return results.map((r) => ({
    ...r,
    recipientType: 'lead' as const,
    sourceType: 'lead' as const,
  }));
}

/**
 * التحقق من صحة أرقام الهاتف
 */
export function validatePhoneNumbers(phoneNumbers: string[]): {
  valid: string[];
  invalid: string[];
} {
  const valid: string[] = [];
  const invalid: string[] = [];

  for (const phone of phoneNumbers) {
    const normalized = normalizePhoneNumber(phone);
    if (normalized && normalized.length >= 9) {
      valid.push(normalized);
    } else {
      invalid.push(phone);
    }
  }

  return { valid, invalid };
}

/**
 * دمج الأرقام المكررة
 */
export function deduplicatePhoneNumbers(phoneNumbers: string[]): string[] {
  const seen = new Set<string>();
  const deduplicated: string[] = [];

  for (const phone of phoneNumbers) {
    const normalized = normalizePhoneNumber(phone);
    if (normalized && !seen.has(normalized)) {
      seen.add(normalized);
      deduplicated.push(normalized);
    }
  }

  return deduplicated;
}
