/**
 * Google Contacts Sync Service
 * خدمة مزامنة جهات الاتصال مع Google Contacts
 */

import type { ContactSyncLog } from '../../../../drizzle/schema';
import { getDb, normalizePhoneNumber } from '../../../database/db';
import type { Database } from '../../../database/db/connection';
import {
  contactSyncLogs,
  appointments,
  campRegistrations,
  offerLeads,
  leads,
} from '../../../../drizzle/schema';
import { eq, inArray, desc } from 'drizzle-orm';

interface GoogleContact {
  id?: string;
  name: string;
  email?: string | null;
  phone?: string;
  notes?: string;
}

interface SyncResult {
  success: boolean;
  syncedCount: number;
  failedCount: number;
  duplicateCount: number;
  error?: string;
  syncLogId?: number;
}

export class GoogleContactsSyncService {
  /**
   * مزامنة الجهات مع Google Contacts
   */
  static async syncContacts(
    accessToken: string,
    filterCriteria:
      | {
          recipientSources?: ('appointments' | 'camp_registrations' | 'offer_leads' | 'leads')[];
          statuses?: string[];
        }
      | undefined,
    createdBy: number
  ): Promise<SyncResult> {
    const db = await getDb();
    if (!db) {
      return {
        success: false,
        syncedCount: 0,
        failedCount: 0,
        duplicateCount: 0,
        error: 'فشل الاتصال بقاعدة البيانات',
      };
    }

    try {
      // جلب الجهات من قاعدة البيانات
      const contacts = await this.getContactsFromSources(db, filterCriteria);

      // دمج الأرقام المكررة
      const uniqueContacts = this.deduplicateContacts(contacts);

      // إنشاء سجل المزامنة
      const syncLog = await db.insert(contactSyncLogs).values({
        syncType: 'export_to_google',
        totalContacts: uniqueContacts.length,
        syncedContacts: 0,
        failedContacts: 0,
        status: 'processing',
        createdBy,
      });

      const syncLogHeader = Array.isArray(syncLog) ? syncLog[0] : syncLog;
      const syncLogId =
        Number((syncLogHeader as { insertId?: unknown } | undefined)?.insertId) || 0;

      // مزامنة الجهات مع Google
      let syncedCount = 0;
      let failedCount = 0;

      for (const contact of uniqueContacts) {
        try {
          await this.syncContactToGoogle(accessToken, contact);
          syncedCount++;
        } catch (error) {
          failedCount++;
          console.error('فشل مزامنة الجهة:', contact.name, error);
        }
      }

      // تحديث سجل المزامنة
      if (syncLogId > 0) {
        await db
          .update(contactSyncLogs)
          .set({
            syncedContacts: syncedCount,
            failedContacts: failedCount,
            status: failedCount === 0 ? 'completed' : 'failed',
            errorInfo: failedCount > 0 ? `فشل إرسال ${failedCount} جهة اتصال إلى Google` : null,
            completedAt: new Date(),
          })
          .where(eq(contactSyncLogs.id, syncLogId));
      }

      return {
        success: failedCount === 0,
        syncedCount,
        failedCount,
        duplicateCount: contacts.length - uniqueContacts.length,
        syncLogId,
      };
    } catch (error) {
      return {
        success: false,
        syncedCount: 0,
        failedCount: 0,
        duplicateCount: 0,
        error: String(error),
      };
    }
  }

  /**
   * جلب الجهات من المصادر المختلفة
   */
  private static async getContactsFromSources(
    db: Database,
    filterCriteria?: {
      recipientSources?: ('appointments' | 'camp_registrations' | 'offer_leads' | 'leads')[];
      statuses?: string[];
    }
  ): Promise<GoogleContact[]> {
    const contacts: GoogleContact[] = [];
    const statuses = filterCriteria?.statuses;
    const sources = filterCriteria?.recipientSources || [
      'appointments',
      'camp_registrations',
      'offer_leads',
      'leads',
    ];

    const appointmentsQuery = statuses?.length
      ? db
          .select()
          .from(appointments)
          .where(
            inArray(
              appointments.status,
              statuses as Array<(typeof appointments.status.enumValues)[number]>
            )
          )
      : db.select().from(appointments);
    if (sources.includes('appointments')) {
      const appointmentsList = await appointmentsQuery;
      contacts.push(
        ...appointmentsList.map((a) => ({
          name: a.fullName,
          email: a.email,
          phone: normalizePhoneNumber(a.phone),
          notes: `حجز طبيب - ${a.status}`,
        }))
      );
    }

    const campRegistrationsQuery = statuses?.length
      ? db
          .select()
          .from(campRegistrations)
          .where(
            inArray(
              campRegistrations.status,
              statuses as Array<(typeof campRegistrations.status.enumValues)[number]>
            )
          )
      : db.select().from(campRegistrations);
    if (sources.includes('camp_registrations')) {
      const campRegsList = await campRegistrationsQuery;
      contacts.push(
        ...campRegsList.map((c) => ({
          name: c.fullName,
          email: c.email,
          phone: normalizePhoneNumber(c.phone),
          notes: `تسجيل مخيم - ${c.status}`,
        }))
      );
    }

    const offerLeadsQuery = statuses?.length
      ? db
          .select()
          .from(offerLeads)
          .where(
            inArray(
              offerLeads.status,
              statuses as Array<(typeof offerLeads.status.enumValues)[number]>
            )
          )
      : db.select().from(offerLeads);
    if (sources.includes('offer_leads')) {
      const offerLeadsList = await offerLeadsQuery;
      contacts.push(
        ...offerLeadsList.map((o) => ({
          name: o.fullName,
          email: o.email,
          phone: normalizePhoneNumber(o.phone),
          notes: `طلب عرض - ${o.status}`,
        }))
      );
    }

    const leadsQuery = statuses?.length
      ? db
          .select()
          .from(leads)
          .where(inArray(leads.status, statuses as Array<(typeof leads.status.enumValues)[number]>))
      : db.select().from(leads);
    if (sources.includes('leads')) {
      const leadsList = await leadsQuery;
      contacts.push(
        ...leadsList.map((l) => ({
          name: l.fullName,
          email: l.email,
          phone: normalizePhoneNumber(l.phone),
          notes: `عميل محتمل - ${l.status}`,
        }))
      );
    }

    return contacts;
  }

  /**
   * دمج الجهات المكررة
   */
  private static deduplicateContacts(contacts: GoogleContact[]): GoogleContact[] {
    const seen = new Set<string>();
    const unique: GoogleContact[] = [];

    for (const contact of contacts) {
      const normalizedPhone = contact.phone ? normalizePhoneNumber(contact.phone) : '';
      const normalizedContact = normalizedPhone ? { ...contact, phone: normalizedPhone } : contact;
      const key =
        normalizedPhone || contact.email?.trim().toLowerCase() || contact.name.trim().toLowerCase();
      if (key && !seen.has(key)) {
        seen.add(key);
        unique.push(normalizedContact);
      }
    }

    return unique;
  }

  /**
   * مزامنة جهة واحدة مع Google
   */
  private static async syncContactToGoogle(
    accessToken: string,
    contact: GoogleContact
  ): Promise<void> {
    const googleContactData = {
      names: [
        {
          givenName: contact.name,
        },
      ],
      phoneNumbers: contact.phone
        ? [
            {
              value: contact.phone,
              type: 'mobile',
            },
          ]
        : [],
      emailAddresses: contact.email
        ? [
            {
              value: contact.email,
              type: 'work',
            },
          ]
        : [],
      notes: contact.notes
        ? [
            {
              value: contact.notes,
            },
          ]
        : [],
    };

    const response = await fetch('https://people.googleapis.com/v1/people:createContact', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(googleContactData),
    });

    if (!response.ok) {
      throw new Error(`فشل مزامنة الجهة: ${response.statusText}`);
    }
  }

  /**
   * جلب سجلات المزامنة
   */
  static async getSyncLogs(limit: number = 20): Promise<ContactSyncLog[]> {
    const db = await getDb();
    if (!db) {
      return [];
    }

    return db.select().from(contactSyncLogs).orderBy(desc(contactSyncLogs.createdAt)).limit(limit);
  }

  /**
   * حذف سجل مزامنة
   */
  static async deleteSyncLog(syncLogId: number): Promise<boolean> {
    const db = await getDb();
    if (!db) {
      return false;
    }

    try {
      await db.delete(contactSyncLogs).where(eq(contactSyncLogs.id, syncLogId));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * الحصول على حالة المزامنة
   */
  static async getSyncStatus(syncLogId: number): Promise<ContactSyncLog | null> {
    const db = await getDb();
    if (!db) {
      return null;
    }

    const result = await db
      .select()
      .from(contactSyncLogs)
      .where(eq(contactSyncLogs.id, syncLogId))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  }
}
