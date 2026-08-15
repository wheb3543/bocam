/**
 * Unified Leads Database Functions
 * دوال قاعدة البيانات المتعلقة بالعملاء الموحدين من جميع المصادر
 */

import { desc } from 'drizzle-orm';
import { appointments, offerLeads, campRegistrations } from '../../../drizzle/schema';
import { getDb } from './connection';

/**
 * الحصول على جميع العملاء الموحدين من جميع المصادر
 * يجمع بين: المواعيد، عروض العملاء، تسجيلات المخيمات
 */
export async function getAllUnifiedLeads() {
  const db = await getDb();
  if (!db) {
    return [];
  }

  try {
    // Get appointments
    const appointmentsData = await db
      .select({
        id: appointments.id,
        fullName: appointments.fullName,
        phone: appointments.phone,
        email: appointments.email,
        notes: appointments.notes,
        status: appointments.status,
        createdAt: appointments.createdAt,
        utmSource: appointments.utmSource,
        utmMedium: appointments.utmMedium,
        utmCampaign: appointments.utmCampaign,
        doctorId: appointments.doctorId,
      })
      .from(appointments)
      .orderBy(desc(appointments.createdAt));

    // Get offer leads
    const offerLeadsData = await db
      .select({
        id: offerLeads.id,
        fullName: offerLeads.fullName,
        phone: offerLeads.phone,
        email: offerLeads.email,
        notes: offerLeads.notes,
        status: offerLeads.status,
        createdAt: offerLeads.createdAt,
        source: offerLeads.source,
        offerId: offerLeads.offerId,
      })
      .from(offerLeads)
      .orderBy(desc(offerLeads.createdAt));

    // Get camp registrations
    const campRegistrationsData = await db
      .select({
        id: campRegistrations.id,
        fullName: campRegistrations.fullName,
        phone: campRegistrations.phone,
        email: campRegistrations.email,
        notes: campRegistrations.notes,
        status: campRegistrations.status,
        createdAt: campRegistrations.createdAt,
        source: campRegistrations.source,
        campId: campRegistrations.campId,
      })
      .from(campRegistrations)
      .orderBy(desc(campRegistrations.createdAt));

    // Combine all leads with type indicator
    const unifiedLeads = [
      ...appointmentsData.map((a) => ({
        ...a,
        type: 'appointment' as const,
        typeLabel: 'موعد طبيب',
        relatedId: a.doctorId,
      })),
      ...offerLeadsData.map((o) => ({
        ...o,
        type: 'offer' as const,
        typeLabel: 'حجز عرض',
        relatedId: o.offerId,
        utmSource: o.source || '',
        utmMedium: '',
        utmCampaign: '',
      })),
      ...campRegistrationsData.map((c) => ({
        ...c,
        type: 'camp' as const,
        typeLabel: 'تسجيل مخيم',
        relatedId: c.campId,
        utmSource: c.source || '',
        utmMedium: '',
        utmCampaign: '',
      })),
    ];

    // Sort by createdAt descending
    unifiedLeads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return unifiedLeads;
  } catch (error) {
    console.error('Error getting unified leads:', error);
    return [];
  }
}
