/**
 * Camp Registrations Database Functions
 * دوال قاعدة البيانات المتعلقة بتسجيلات المخيمات
 */

import { and, like, or, inArray, sql } from 'drizzle-orm';
import { campRegistrations } from '../../../drizzle/schema';
import { getDb } from './connection';

/**
 * الحصول على تسجيلات المخيمات بشكل مقسم
 */
export async function getCampRegistrationsPaginated(
  page: number = 1,
  limit: number = 20,
  searchTerm?: string,
  campIds?: number[],
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
        like(campRegistrations.fullName, searchPattern),
        like(campRegistrations.phone, searchPattern),
        like(campRegistrations.email, searchPattern)
      )
    );
  }

  if (campIds && campIds.length > 0) {
    whereConditions.push(inArray(campRegistrations.campId, campIds));
  }

  if (sources && sources.length > 0) {
    whereConditions.push(inArray(campRegistrations.source, sources));
  }

  if (statuses && statuses.length > 0) {
    const { sql } = await import('drizzle-orm');
    whereConditions.push(
      sql`${campRegistrations.status} IN ${sql.raw(`('${statuses.join("','")}')`)}`
    );
  }

  if (dateFrom && dateTo) {
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    to.setHours(23, 59, 59, 999);
    whereConditions.push(
      and(
        sql`${campRegistrations.createdAt} >= ${from.toISOString()}`,
        sql`${campRegistrations.createdAt} <= ${to.toISOString()}`
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
      whereConditions.push(sql`${campRegistrations.createdAt} >= ${startDate.toISOString()}`);
    }
  }

  const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

  const countQuery = db.select({ count: sql<number>`count(*)` }).from(campRegistrations);
  if (whereClause) {
    countQuery.where(whereClause);
  }
  const [countResult] = await countQuery;
  const total = Number(countResult?.count || 0);

  const dataQuery = db
    .select({
      id: campRegistrations.id,
      fullName: campRegistrations.fullName,
      phone: campRegistrations.phone,
      email: campRegistrations.email,
      age: campRegistrations.age,
      notes: campRegistrations.notes,
      status: campRegistrations.status,
      source: campRegistrations.source,
      campId: campRegistrations.campId,
      createdAt: campRegistrations.createdAt,
      updatedAt: campRegistrations.updatedAt,
    })
    .from(campRegistrations);

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
