/**
 * Offer Leads Database Functions
 * دوال قاعدة البيانات المتعلقة بعروض العملاء
 */

import { eq, and, like, or, inArray, sql } from 'drizzle-orm';
import { offerLeads, offers } from '../../../drizzle/schema';
import { getDb } from './connection';

/**
 * الحصول على عروض العملاء بشكل مقسم
 */
export async function getOfferLeadsPaginated(
  page: number = 1,
  limit: number = 20,
  searchTerm?: string,
  offerIds?: number[],
  sources?: string[],
  statuses?: string[],
  dateFilter?: 'all' | 'today' | 'week' | 'month',
  dateFrom?: string,
  dateTo?: string
) {
  const db = await getDb();
  if (!db) {
    return { data: [], total: 0, page, limit, totalPages: 0 };
  }

  const isShowAll = limit === -1;
  const offset = isShowAll ? 0 : (page - 1) * limit;

  const whereConditions = [];
  if (searchTerm && searchTerm.trim()) {
    const searchPattern = `%${searchTerm.trim()}%`;
    whereConditions.push(
      or(
        like(offerLeads.fullName, searchPattern),
        like(offerLeads.phone, searchPattern),
        like(offerLeads.email, searchPattern)
      )
    );
  }

  if (offerIds && offerIds.length > 0) {
    whereConditions.push(inArray(offerLeads.offerId, offerIds));
  }

  if (sources && sources.length > 0) {
    whereConditions.push(inArray(offerLeads.source, sources));
  }

  if (statuses && statuses.length > 0) {
    const { sql } = await import('drizzle-orm');
    whereConditions.push(sql`${offerLeads.status} IN ${sql.raw(`('${statuses.join("','")}')`)}`);
  }

  if (dateFrom && dateTo) {
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    to.setHours(23, 59, 59, 999);
    whereConditions.push(
      and(
        sql`${offerLeads.createdAt} >= ${from.toISOString()}`,
        sql`${offerLeads.createdAt} <= ${to.toISOString()}`
      )
    );
  } else if (dateFilter && dateFilter !== 'all') {
    const now = new Date();
    let startDate: Date | undefined;

    if (dateFilter === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (dateFilter === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (dateFilter === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    if (startDate) {
      whereConditions.push(sql`${offerLeads.createdAt} >= ${startDate.toISOString()}`);
    }
  }

  const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

  const countQuery = db.select({ count: sql<number>`count(*)` }).from(offerLeads);
  if (whereClause) {
    countQuery.where(whereClause);
  }
  const [countResult] = await countQuery;
  const total = Number(countResult?.count || 0);

  const dataQuery = db
    .select({
      id: offerLeads.id,
      fullName: offerLeads.fullName,
      phone: offerLeads.phone,
      email: offerLeads.email,
      notes: offerLeads.notes,
      status: offerLeads.status,
      statusNotes: offerLeads.statusNotes,
      contactedAt: offerLeads.contactedAt,
      confirmedAt: offerLeads.confirmedAt,
      attendedAt: offerLeads.attendedAt,
      completedAt: offerLeads.completedAt,
      cancelledAt: offerLeads.cancelledAt,
      source: offerLeads.source,
      offerId: offerLeads.offerId,
      offerTitle: offers.title,
      campaignId: offerLeads.campaignId,
      receiptNumber: offerLeads.receiptNumber,
      utmSource: offerLeads.utmSource,
      utmMedium: offerLeads.utmMedium,
      utmCampaign: offerLeads.utmCampaign,
      utmTerm: offerLeads.utmTerm,
      utmContent: offerLeads.utmContent,
      utmPlacement: offerLeads.utmPlacement,
      referrer: offerLeads.referrer,
      fbclid: offerLeads.fbclid,
      gclid: offerLeads.gclid,
      createdAt: offerLeads.createdAt,
      updatedAt: offerLeads.updatedAt,
    })
    .from(offerLeads)
    .leftJoin(offers, eq(offers.id, offerLeads.offerId));

  if (whereClause) {
    dataQuery.where(whereClause);
  }

  let result;
  if (isShowAll) {
    result = await dataQuery;
  } else {
    result = await dataQuery.limit(limit).offset(offset);
  }

  return {
    data: result,
    total,
    page,
    limit,
    totalPages: isShowAll ? 1 : Math.ceil(total / limit),
  };
}
