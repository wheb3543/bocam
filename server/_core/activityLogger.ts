import { getDb } from '../database/db';
import { sql } from 'drizzle-orm';

interface ActivityLog {
  user_id?: number;
  action: string;
  entity_type?: string;
  entity_id?: string;
  description?: string;
  metadata?: any;
  ip_address?: string;
  user_agent?: string;
  status?: 'success' | 'error';
  error_message?: string;
}

interface UpdateLog {
  version: string;
  previous_version?: string;
  update_type: 'manual' | 'automatic' | 'mandatory';
  status: 'pending' | 'downloading' | 'installing' | 'completed' | 'failed' | 'rolling_back';
  progress?: number;
  download_path?: string;
  backup_path?: string;
  error_message?: string;
  release_notes?: string;
  started_by?: number;
}

interface BackupLog {
  backup_type: 'daily' | 'weekly' | 'manual';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  database_size?: number;
  files_size?: number;
  total_size?: number;
  backup_path?: string;
  cloud_provider?: string;
  cloud_path?: string;
  retention_days?: number;
  error_message?: string;
  started_by?: number;
  expires_at?: Date;
}

interface SystemNotification {
  type: string;
  title: string;
  message: string;
  severity?: 'info' | 'warning' | 'error' | 'success';
  action_url?: string;
  metadata?: any;
}

export async function logActivity(data: ActivityLog) {
  try {
    const db = await getDb();
    if (!db) return;

    await db.execute(
      sql`INSERT INTO activity_log (user_id, action, entity_type, entity_id, description, metadata, ip_address, user_agent, status, error_message) VALUES (${data.user_id || null}, ${data.action}, ${data.entity_type || null}, ${data.entity_id || null}, ${data.description || null}, ${data.metadata ? JSON.stringify(data.metadata) : null}, ${data.ip_address || null}, ${data.user_agent || null}, ${data.status || 'success'}, ${data.error_message || null})`
    );
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
}

export async function logUpdate(data: UpdateLog): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    await db.execute(
      sql`INSERT INTO update_log (version, previous_version, update_type, status, progress, download_path, backup_path, error_message, release_notes, started_by) VALUES (${data.version}, ${data.previous_version || null}, ${data.update_type}, ${data.status}, ${data.progress || 0}, ${data.download_path || null}, ${data.backup_path || null}, ${data.error_message || null}, ${data.release_notes || null}, ${data.started_by || null})`
    );
    return true;
  } catch (error) {
    console.error('Failed to log update:', error);
    throw error;
  }
}

export async function updateUpdateLog(id: number, data: Partial<UpdateLog>) {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const updates: string[] = [];
    const values: any[] = [];

    if (data.status !== undefined) {
      updates.push(`status = ${data.status}`);
    }
    if (data.progress !== undefined) {
      updates.push(`progress = ${data.progress}`);
    }
    if (data.download_path !== undefined) {
      updates.push(`download_path = ${data.download_path}`);
    }
    if (data.backup_path !== undefined) {
      updates.push(`backup_path = ${data.backup_path}`);
    }
    if (data.error_message !== undefined) {
      updates.push(`error_message = ${data.error_message}`);
    }
    if (data.status === 'completed' || data.status === 'failed') {
      updates.push('completed_at = NOW()');
    }

    if (updates.length > 0) {
      await db.execute(sql`UPDATE update_log SET ${sql.raw(updates.join(', '))} WHERE id = ${id}`);
    }
  } catch (error) {
    console.error('Failed to update update log:', error);
    throw error;
  }
}

export async function logBackup(data: BackupLog): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    await db.execute(
      sql`INSERT INTO backup_log (backup_type, status, database_size, files_size, total_size, backup_path, cloud_provider, cloud_path, retention_days, error_message, started_by, expires_at) VALUES (${data.backup_type}, ${data.status}, ${data.database_size || null}, ${data.files_size || null}, ${data.total_size || null}, ${data.backup_path || null}, ${data.cloud_provider || null}, ${data.cloud_path || null}, ${data.retention_days || 30}, ${data.error_message || null}, ${data.started_by || null}, ${data.expires_at || null})`
    );
    return true;
  } catch (error) {
    console.error('Failed to log backup:', error);
    throw error;
  }
}

export async function updateBackupLog(id: number, data: Partial<BackupLog>) {
  try {
    const db = await getDb();
    if (!db) throw new Error('Database not available');

    const updates: string[] = [];
    const values: any[] = [];

    if (data.status !== undefined) {
      updates.push(`status = ${data.status}`);
    }
    if (data.database_size !== undefined) {
      updates.push(`database_size = ${data.database_size}`);
    }
    if (data.files_size !== undefined) {
      updates.push(`files_size = ${data.files_size}`);
    }
    if (data.total_size !== undefined) {
      updates.push(`total_size = ${data.total_size}`);
    }
    if (data.backup_path !== undefined) {
      updates.push(`backup_path = ${data.backup_path}`);
    }
    if (data.cloud_path !== undefined) {
      updates.push(`cloud_path = ${data.cloud_path}`);
    }
    if (data.error_message !== undefined) {
      updates.push(`error_message = ${data.error_message}`);
    }
    if (data.status === 'completed' || data.status === 'failed') {
      updates.push('completed_at = NOW()');
    }

    if (updates.length > 0) {
      await db.execute(sql`UPDATE backup_log SET ${sql.raw(updates.join(', '))} WHERE id = ${id}`);
    }
  } catch (error) {
    console.error('Failed to update backup log:', error);
    throw error;
  }
}

export async function createNotification(data: SystemNotification) {
  try {
    const db = await getDb();
    if (!db) return;

    await db.execute(
      sql`INSERT INTO system_notifications (type, title, message, severity, action_url, metadata) VALUES (${data.type}, ${data.title}, ${data.message}, ${data.severity || 'info'}, ${data.action_url || null}, ${data.metadata ? JSON.stringify(data.metadata) : null})`
    );
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}

export async function getRecentActivity(limit: number = 50) {
  try {
    const db = await getDb();
    if (!db) return [];

    const results = await db.execute(
      sql`SELECT * FROM activity_log ORDER BY created_at DESC LIMIT ${limit}`
    );
    return results;
  } catch (error) {
    console.error('Failed to get recent activity:', error);
    return [];
  }
}

export async function getRecentUpdates(limit: number = 10) {
  try {
    const db = await getDb();
    if (!db) return [];

    const results = await db.execute(
      sql`SELECT * FROM update_log ORDER BY started_at DESC LIMIT ${limit}`
    );
    return results;
  } catch (error) {
    console.error('Failed to get recent updates:', error);
    return [];
  }
}

export async function getRecentBackups(limit: number = 10) {
  try {
    const db = await getDb();
    if (!db) return [];

    const results = await db.execute(
      sql`SELECT * FROM backup_log ORDER BY started_at DESC LIMIT ${limit}`
    );
    return results;
  } catch (error) {
    console.error('Failed to get recent backups:', error);
    return [];
  }
}

export async function getUnreadNotifications(limit: number = 20) {
  try {
    const db = await getDb();
    if (!db) return [];

    const results = await db.execute(
      sql`SELECT * FROM system_notifications WHERE is_read = FALSE ORDER BY created_at DESC LIMIT ${limit}`
    );
    return results;
  } catch (error) {
    console.error('Failed to get unread notifications:', error);
    return [];
  }
}

export async function markNotificationAsRead(id: number) {
  try {
    const db = await getDb();
    if (!db) return;

    await db.execute(
      sql`UPDATE system_notifications SET is_read = TRUE, read_at = NOW() WHERE id = ${id}`
    );
  } catch (error) {
    console.error('Failed to mark notification as read:', error);
  }
}
