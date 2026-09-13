/**
 * Contact Export Service
 * خدمة تصدير الجهات إلى VCF و CSV
 */

import { getDb, normalizePhoneNumber } from '../database/db';
import { contactExports } from '../../drizzle/schema';
import type { RecipientInfo } from './broadcastRecipientService';
import { buildRecipientList } from './broadcastRecipientService';
import type { BroadcastFilterCriteria } from '../_core/broadcastValidation';
import { eq, and, desc } from 'drizzle-orm';

/**
 * تصدير الجهات إلى VCF
 */
export async function exportToVCF(recipients: RecipientInfo[]): Promise<string> {
  let vcf = '';

  for (const recipient of recipients) {
    vcf += 'BEGIN:VCARD\n';
    vcf += 'VERSION:3.0\n';
    vcf += `FN:${escapeVCardValue(recipient.fullName || 'Unknown')}\n`;
    vcf += `TEL;TYPE=CELL:${recipient.phoneNumber}\n`;

    if (recipient.email) {
      vcf += `EMAIL:${recipient.email}\n`;
    }

    vcf += 'END:VCARD\n';
  }

  return vcf;
}

/**
 * تصدير الجهات إلى CSV
 */
export async function exportToCSV(recipients: RecipientInfo[]): Promise<string> {
  let csv = 'الاسم,رقم الهاتف,البريد الإلكتروني,نوع المستقبل,معرف المستقبل\n';

  for (const recipient of recipients) {
    const row = [
      escapeCSVValue(recipient.fullName || ''),
      recipient.phoneNumber,
      escapeCSVValue(recipient.email || ''),
      recipient.recipientType,
      recipient.recipientId,
    ];
    csv += row.join(',') + '\n';
  }

  return csv;
}

/**
 * الحصول على نوع MIME للملف
 */
export function getFileMimeType(exportType: 'vcf' | 'csv'): string {
  switch (exportType) {
    case 'vcf':
      return 'text/vcard';
    case 'csv':
      return 'text/csv';
    default:
      return 'text/plain';
  }
}

/**
 * الحصول على امتداد الملف
 */
export function getFileExtension(exportType: 'vcf' | 'csv'): string {
  switch (exportType) {
    case 'vcf':
      return '.vcf';
    case 'csv':
      return '.csv';
    default:
      return '.txt';
  }
}

/**
 * إنشاء اسم الملف
 */
export function generateFileName(exportType: 'vcf' | 'csv'): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
  const ext = getFileExtension(exportType);
  return `contacts-${timestamp}${ext}`;
}

/**
 * الهروب من قيم VCard
 */
function escapeVCardValue(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n');
}

/**
 * الهروب من قيم CSV
 */
function escapeCSVValue(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * تسجيل عملية التصدير
 */
export async function logExport(
  exportType: 'vcf' | 'csv',
  filterCriteria: BroadcastFilterCriteria | undefined,
  totalContacts: number,
  exportedContacts: number,
  failedContacts: number,
  fileUrl: string | undefined,
  fileKey: string | undefined,
  createdBy: number,
  status: 'pending' | 'processing' | 'completed' | 'failed' = 'completed',
  errorInfo?: string
): Promise<number> {
  const db = await getDb();
  if (!db) {
    throw new Error('قاعدة البيانات غير متاحة');
  }

  const result = await db.insert(contactExports).values({
    exportType,
    filterCriteria: filterCriteria ? JSON.stringify(filterCriteria) : null,
    totalContacts,
    exportedContacts,
    failedContacts,
    fileUrl,
    fileKey,
    status,
    errorInfo,
    createdBy,
  });

  const resultHeader = Array.isArray(result) ? result[0] : result;
  const insertId = Number((resultHeader as any)?.insertId);
  return Number.isSafeInteger(insertId) ? insertId : 0;
}

/**
 * الحصول على سجل التصديرات
 */
export async function getExportLogs(
  page: number = 1,
  limit: number = 20,
  exportType?: 'vcf' | 'csv' | 'google_sync',
  status?: 'pending' | 'processing' | 'completed' | 'failed'
): Promise<{
  logs: any[];
  total: number;
  page: number;
  limit: number;
}> {
  const db = await getDb();
  if (!db) {
    throw new Error('قاعدة البيانات غير متاحة');
  }

  const conditions = [];
  if (exportType) {
    conditions.push(eq(contactExports.exportType, exportType));
  }
  if (status) {
    conditions.push(eq(contactExports.status, status));
  }

  let query = db.select().from(contactExports);

  if (conditions.length > 0) {
    query = (query as any).where(and(...conditions));
  }

  const offset = (page - 1) * limit;
  const logs = await (query as any)
    .orderBy(desc(contactExports.createdAt))
    .limit(limit)
    .offset(offset);

  const countResult = await db.select({ count: contactExports.id }).from(contactExports);
  const total = countResult.length || 0;

  return {
    logs,
    total,
    page,
    limit,
  };
}

/**
 * تنسيق رقم الهاتف للتصدير
 */
export function formatPhoneForExport(phone: string): string {
  const normalized = normalizePhoneNumber(phone);
  if (!normalized) {
    return phone;
  }

  if (!normalized.startsWith('+')) {
    return `+${normalized}`;
  }

  return normalized;
}

/**
 * بناء قائمة الجهات للتصدير
 */
export async function buildExportList(
  filterCriteria?: BroadcastFilterCriteria
): Promise<RecipientInfo[]> {
  if (!filterCriteria) {
    return [];
  }

  const result = await buildRecipientList(filterCriteria);
  return result.recipients;
}
