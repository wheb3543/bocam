import { eq, and, like, or, sql, inArray } from 'drizzle-orm';
import { appointments, doctors, InsertAppointment } from '../../../drizzle/schema';
import { createLogger } from '../../_core/logger';
import { getDb } from './connection';

const logger = createLogger('database:appointments');

// Doctors queries
export async function getAllDoctors() {
  const db = await getDb();
  if (!db) {
    return [];
  }

  const result = await db.select().from(doctors).where(eq(doctors.available, 'yes'));
  return result;
}

export async function getDoctorById(id: number) {
  const db = await getDb();
  if (!db) {
    return undefined;
  }

  const result = await db.select().from(doctors).where(eq(doctors.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Appointments queries
export async function createAppointment(appointment: InsertAppointment) {
  const db = await getDb();
  if (!db) {
    logger.warn('Cannot create appointment: database not available');
    return null;
  }

  try {
    const result = await db.insert(appointments).values(appointment);
    return { success: true, insertId: Number(result[0].insertId) };
  } catch (error) {
    logger.error('Failed to create appointment:', error);
    throw error;
  }
}

export async function getAllAppointments() {
  const db = await getDb();
  if (!db) {
    return [];
  }

  const result = await db
    .select({
      id: appointments.id,
      campaignId: appointments.campaignId,
      doctorId: appointments.doctorId,
      fullName: appointments.fullName,
      phone: appointments.phone,
      email: appointments.email,
      age: appointments.age,
      procedure: appointments.procedure,
      preferredDate: appointments.preferredDate,
      preferredTime: appointments.preferredTime,
      additionalNotes: appointments.additionalNotes,
      staffNotes: appointments.staffNotes,
      notes: appointments.notes,
      status: appointments.status,
      statusNotes: appointments.staffNotes,
      contactedAt: appointments.contactedAt,
      confirmedAt: appointments.confirmedAt,
      attendedAt: appointments.attendedAt,
      completedAt: appointments.completedAt,
      cancelledAt: appointments.cancelledAt,
      patientMessage: appointments.patientMessage,
      source: appointments.source,
      receiptNumber: appointments.receiptNumber,
      appointmentDate: appointments.appointmentDate,
      utmSource: appointments.utmSource,
      utmMedium: appointments.utmMedium,
      utmCampaign: appointments.utmCampaign,
      utmTerm: appointments.utmTerm,
      utmContent: appointments.utmContent,
      utmPlacement: appointments.utmPlacement,
      referrer: appointments.referrer,
      fbclid: appointments.fbclid,
      gclid: appointments.gclid,
      createdAt: appointments.createdAt,
      updatedAt: appointments.updatedAt,
      doctorName: doctors.name,
      doctorSpecialty: doctors.specialty,
    })
    .from(appointments)
    .leftJoin(doctors, eq(appointments.doctorId, doctors.id));

  return result;
}

export async function getAppointmentsPaginated(
  page: number = 1,
  limit: number = 20,
  searchTerm?: string,
  doctorIds?: number[],
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
        like(appointments.fullName, searchPattern),
        like(appointments.phone, searchPattern),
        like(appointments.email, searchPattern)
      )
    );
  }

  if (doctorIds && doctorIds.length > 0) {
    whereConditions.push(inArray(appointments.doctorId, doctorIds));
  }

  if (sources && sources.length > 0) {
    whereConditions.push(inArray(appointments.source, sources));
  }

  if (statuses && statuses.length > 0) {
    whereConditions.push(
      inArray(
        appointments.status,
        statuses as (
          | 'pending'
          | 'contacted'
          | 'no_answer'
          | 'confirmed'
          | 'attended'
          | 'completed'
          | 'cancelled'
        )[]
      )
    );
  }

  if (dateFrom && dateTo) {
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    to.setHours(23, 59, 59, 999);
    whereConditions.push(
      and(
        sql`${appointments.createdAt} >= ${from.toISOString()}`,
        sql`${appointments.createdAt} <= ${to.toISOString()}`
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
      whereConditions.push(sql`${appointments.createdAt} >= ${startDate.toISOString()}`);
    }
  }

  const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

  const countQuery = db.select({ count: sql<number>`count(*)` }).from(appointments);
  if (whereClause) {
    countQuery.where(whereClause);
  }
  const [countResult] = await countQuery;
  const total = Number(countResult?.count || 0);

  const dataQuery = db
    .select({
      id: appointments.id,
      campaignId: appointments.campaignId,
      doctorId: appointments.doctorId,
      fullName: appointments.fullName,
      phone: appointments.phone,
      email: appointments.email,
      age: appointments.age,
      procedure: appointments.procedure,
      preferredDate: appointments.preferredDate,
      preferredTime: appointments.preferredTime,
      additionalNotes: appointments.additionalNotes,
      staffNotes: appointments.staffNotes,
      notes: appointments.notes,
      status: appointments.status,
      statusNotes: appointments.staffNotes,
      contactedAt: appointments.contactedAt,
      confirmedAt: appointments.confirmedAt,
      attendedAt: appointments.attendedAt,
      completedAt: appointments.completedAt,
      cancelledAt: appointments.cancelledAt,
      patientMessage: appointments.patientMessage,
      source: appointments.source,
      receiptNumber: appointments.receiptNumber,
      appointmentDate: appointments.appointmentDate,
      utmSource: appointments.utmSource,
      utmMedium: appointments.utmMedium,
      utmCampaign: appointments.utmCampaign,
      utmTerm: appointments.utmTerm,
      utmContent: appointments.utmContent,
      utmPlacement: appointments.utmPlacement,
      referrer: appointments.referrer,
      fbclid: appointments.fbclid,
      gclid: appointments.gclid,
      createdAt: appointments.createdAt,
      updatedAt: appointments.updatedAt,
      doctorName: doctors.name,
      doctorSpecialty: doctors.specialty,
    })
    .from(appointments)
    .leftJoin(doctors, eq(appointments.doctorId, doctors.id));

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

export async function updateAppointmentStatus(id: number, status: string, staffNotes?: string) {
  const db = await getDb();
  if (!db) {
    logger.warn('Cannot update appointment: database not available');
    return;
  }

  try {
    const now = new Date();
    const updateData: {
      status:
        | 'pending'
        | 'contacted'
        | 'no_answer'
        | 'confirmed'
        | 'attended'
        | 'completed'
        | 'cancelled';
      staffNotes?: string;
      contactedAt?: Date;
      confirmedAt?: Date;
      attendedAt?: Date;
      completedAt?: Date;
      cancelledAt?: Date;
    } = {
      status: status as
        | 'pending'
        | 'contacted'
        | 'no_answer'
        | 'confirmed'
        | 'attended'
        | 'completed'
        | 'cancelled',
    };
    if (staffNotes !== undefined) {
      updateData.staffNotes = staffNotes;
    }
    if (status === 'contacted') {
      updateData.contactedAt = now;
    } else if (status === 'confirmed') {
      updateData.confirmedAt = now;
    } else if (status === 'attended') {
      updateData.attendedAt = now;
    } else if (status === 'completed') {
      updateData.completedAt = now;
    } else if (status === 'cancelled') {
      updateData.cancelledAt = now;
    }
    await db.update(appointments).set(updateData).where(eq(appointments.id, id));
  } catch (error) {
    logger.error('Failed to update appointment:', error);
    throw error;
  }
}

export async function bulkUpdateAppointmentStatus(
  ids: number[],
  status: string,
  staffNotes?: string
) {
  const db = await getDb();
  if (!db) {
    logger.warn('Cannot bulk update appointments: database not available');
    return { success: false, count: 0 };
  }

  try {
    const now = new Date();
    const updateData: {
      status:
        | 'pending'
        | 'contacted'
        | 'no_answer'
        | 'confirmed'
        | 'attended'
        | 'completed'
        | 'cancelled';
      staffNotes?: string;
      contactedAt?: Date;
      confirmedAt?: Date;
      attendedAt?: Date;
      completedAt?: Date;
      cancelledAt?: Date;
    } = {
      status: status as
        | 'pending'
        | 'contacted'
        | 'no_answer'
        | 'confirmed'
        | 'attended'
        | 'completed'
        | 'cancelled',
    };
    if (staffNotes !== undefined) {
      updateData.staffNotes = staffNotes;
    }
    if (status === 'contacted') {
      updateData.contactedAt = now;
    } else if (status === 'confirmed') {
      updateData.confirmedAt = now;
    } else if (status === 'attended') {
      updateData.attendedAt = now;
    } else if (status === 'completed') {
      updateData.completedAt = now;
    } else if (status === 'cancelled') {
      updateData.cancelledAt = now;
    }

    for (const id of ids) {
      await db.update(appointments).set(updateData).where(eq(appointments.id, id));
    }

    return { success: true, count: ids.length };
  } catch (error) {
    logger.error('Failed to bulk update appointments:', error);
    throw error;
  }
}
