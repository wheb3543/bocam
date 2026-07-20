/**
 * Backup Management Routes
 * مسارات إدارة النسخ الاحتياطية
 */

import express from 'express';
import { getBackupHistory, restoreBackup, deleteBackup } from '../backupManager';
import { runManualBackup } from '../../tasks/cron/backupJob';
import { logActivity } from '../activityLogger';
import { cacheManager } from '../../services/redis';
import { CacheKeys, CacheTTL } from '../cacheHelper';

export function setupBackupRoutes(
  app: express.Express,
  apiLimiter: express.RequestHandler,
  sensitiveApiLimiter: express.RequestHandler
) {
  // Backup management API endpoints
  app.get('/api/backup/status', apiLimiter, async (req, res) => {
    try {
      // Try to get from cache first
      const cachedStatus = await cacheManager.get(CacheKeys.BACKUP_STATUS);
      if (cachedStatus) {
        return res.json({
          success: true,
          data: cachedStatus,
        });
      }

      const backupHistory = await getBackupHistory(10);
      const status = {
        lastBackup: backupHistory[0] || null,
        totalBackups: backupHistory.length,
        enabled: true,
      };

      // Cache the status
      await cacheManager.set(CacheKeys.BACKUP_STATUS, status, CacheTTL.SHORT);

      res.json({
        success: true,
        data: status,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  app.get('/api/backup/history', apiLimiter, async (req, res) => {
    try {
      // Try to get from cache first
      const cachedHistory = await cacheManager.get(CacheKeys.BACKUP_HISTORY);
      if (cachedHistory) {
        return res.json({
          success: true,
          data: cachedHistory,
        });
      }

      const backupHistory = await getBackupHistory(50);

      // Cache the history
      await cacheManager.set(CacheKeys.BACKUP_HISTORY, backupHistory, CacheTTL.MEDIUM);

      res.json({
        success: true,
        data: backupHistory,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  app.post('/api/backup/create', sensitiveApiLimiter, async (req, res) => {
    try {
      const { type = 'manual' } = req.body;

      await logActivity({
        action: 'backup_create',
        description: 'Manual backup started',
        ip_address: req.ip,
        user_agent: req.get('user-agent'),
      });

      // Invalidate cache
      await cacheManager.delete(CacheKeys.BACKUP_STATUS);
      await cacheManager.delete(CacheKeys.BACKUP_HISTORY);

      // Run backup in background
      runManualBackup(type).catch((error) => {
        console.error('Manual backup failed:', error);
      });

      res.json({
        success: true,
        message: 'Backup started successfully',
      });
    } catch (error) {
      await logActivity({
        action: 'backup_create',
        description: 'Manual backup failed',
        status: 'error',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        ip_address: req.ip,
        user_agent: req.get('user-agent'),
      });
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  app.post('/api/backup/restore', sensitiveApiLimiter, async (req, res) => {
    try {
      const { backupId } = req.body;

      if (!backupId) {
        return res.status(400).json({
          success: false,
          error: 'Backup ID is required',
        });
      }

      await logActivity({
        action: 'backup_restore',
        description: `Restore backup ${backupId} started`,
        ip_address: req.ip,
        user_agent: req.get('user-agent'),
      });

      await restoreBackup(backupId);

      await logActivity({
        action: 'backup_restore',
        description: `Restore backup ${backupId} completed`,
        ip_address: req.ip,
        user_agent: req.get('user-agent'),
      });

      res.json({
        success: true,
        message: 'Backup restored successfully',
      });
    } catch (error) {
      await logActivity({
        action: 'backup_restore',
        description: 'Backup restore failed',
        status: 'error',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        ip_address: req.ip,
        user_agent: req.get('user-agent'),
      });
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  app.delete('/api/backup/:id', sensitiveApiLimiter, async (req, res) => {
    try {
      const backupId = parseInt(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);

      await logActivity({
        action: 'backup_delete',
        description: `Delete backup ${backupId} started`,
        ip_address: req.ip,
        user_agent: req.get('user-agent'),
      });

      await deleteBackup(backupId);

      // Invalidate cache
      await cacheManager.delete(CacheKeys.BACKUP_STATUS);
      await cacheManager.delete(CacheKeys.BACKUP_HISTORY);

      await logActivity({
        action: 'backup_delete',
        description: `Delete backup ${backupId} completed`,
        ip_address: req.ip,
        user_agent: req.get('user-agent'),
      });

      res.json({
        success: true,
        message: 'Backup deleted successfully',
      });
    } catch (error) {
      await logActivity({
        action: 'backup_delete',
        description: 'Backup delete failed',
        status: 'error',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        ip_address: req.ip,
        user_agent: req.get('user-agent'),
      });
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });
}
