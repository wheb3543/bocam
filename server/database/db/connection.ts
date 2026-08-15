/**
 * Database Connection Functions
 * دوال الاتصال بقاعدة البيانات
 */

import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from '../../../drizzle/schema';
import { createLogger } from '../../_core/logger';

const logger = createLogger('database');

export type Database = ReturnType<typeof drizzle>;
let _db: Database | null = null;
export async function getDb(): Promise<Database | null> {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL, { schema, mode: 'default' });
    } catch (error) {
      logger.warn('Failed to connect:', error);
      _db = null;
    }
  }
  return _db;
}

let _hospitalDb: ReturnType<typeof drizzle> | null = null;

export async function getHospitalDb(): Promise<Database | null> {
  if (!_hospitalDb && process.env.HOSPITAL_DB_URL) {
    try {
      _hospitalDb = drizzle(process.env.HOSPITAL_DB_URL, { schema, mode: 'default' });
    } catch (error) {
      logger.warn('Hospital Database Failed to connect:', error);
      _hospitalDb = null;
    }
  }
  return _hospitalDb;
}
