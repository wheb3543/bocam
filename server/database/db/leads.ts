/**
 * Leads Database Functions
 * دوال قاعدة البيانات المتعلقة بالعملاء المحتملين (Leads)
 */

import { eq, desc, like, or, sql } from 'drizzle-orm';
import {
  leads,
  leadStatusHistory,
  InsertLead,
  InsertLeadStatusHistory,
} from '../../../drizzle/schema';
import { getDb } from './connection';

/**
 * الحصول على جميع العملاء المحتملين
 */
export async function getAllLeads() {
  const db = await getDb();
  if (!db) {
    return [];
  }
  return db.select().from(leads).orderBy(desc(leads.createdAt));
}

/**
 * الحصول على العملاء المحتملين حسب الحالة
 */
export async function getLeadsByStatus(status: string) {
  const db = await getDb();
  if (!db) {
    return [];
  }
  return db
    .select()
    .from(leads)
    .where(
      eq(leads.status, status as 'new' | 'contacted' | 'booked' | 'not_interested' | 'no_answer')
    )
    .orderBy(desc(leads.createdAt));
}

/**
 * الحصول على العملاء المحتملين حسب الحملة
 */
export async function getLeadsByCampaign(campaignId: number) {
  const db = await getDb();
  if (!db) {
    return [];
  }
  return db
    .select()
    .from(leads)
    .where(eq(leads.campaignId, campaignId))
    .orderBy(desc(leads.createdAt));
}

/**
 * الحصول على عميل محتمل حسب المعرف
 */
export async function getLeadById(id: number) {
  const db = await getDb();
  if (!db) {
    return undefined;
  }
  const result = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * إنشاء عميل محتمل جديد
 */
export async function createLead(lead: InsertLead) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }
  const result = await db.insert(leads).values(lead);
  return result;
}

/**
 * تحديث عميل محتمل
 */
export async function updateLead(id: number, lead: Partial<InsertLead>) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }
  return db.update(leads).set(lead).where(eq(leads.id, id));
}

/**
 * البحث في العملاء المحتملين
 */
export async function searchLeads(searchTerm: string) {
  const db = await getDb();
  if (!db) {
    return [];
  }
  return db
    .select()
    .from(leads)
    .where(
      or(
        like(leads.fullName, `%${searchTerm}%`),
        like(leads.phone, `%${searchTerm}%`),
        like(leads.email, `%${searchTerm}%`)
      )
    )
    .orderBy(desc(leads.createdAt));
}

/**
 * الحصول على سجل حالة عميل محتمل
 */
export async function getLeadStatusHistory(leadId: number) {
  const db = await getDb();
  if (!db) {
    return [];
  }
  return db
    .select()
    .from(leadStatusHistory)
    .where(eq(leadStatusHistory.leadId, leadId))
    .orderBy(desc(leadStatusHistory.createdAt));
}

/**
 * إنشاء سجل حالة عميل محتمل
 */
export async function createLeadStatusHistory(history: InsertLeadStatusHistory) {
  const db = await getDb();
  if (!db) {
    throw new Error('Database not available');
  }
  return db.insert(leadStatusHistory).values(history);
}

/**
 * الحصول على إحصائيات العملاء المحتملين
 */
export async function getLeadsStats() {
  const db = await getDb();
  if (!db) {
    return null;
  }

  const result = await db
    .select({
      total: sql<number>`count(*)`,
      new: sql<number>`sum(case when status = 'new' then 1 else 0 end)`,
      contacted: sql<number>`sum(case when status = 'contacted' then 1 else 0 end)`,
      booked: sql<number>`sum(case when status = 'booked' then 1 else 0 end)`,
      notInterested: sql<number>`sum(case when status = 'not_interested' then 1 else 0 end)`,
      noAnswer: sql<number>`sum(case when status = 'no_answer' then 1 else 0 end)`,
    })
    .from(leads);

  return result[0];
}
