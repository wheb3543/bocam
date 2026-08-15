/**
 * Update Management Routes
 * مسارات إدارة التحديثات
 */

import express from 'express';
import { getUpdateStatus, startManualUpdate, startManualRollback } from '../updateChecker';
import { logActivity } from '../activityLogger';
import { cacheManager } from '../../services/redis';
import { CacheKeys, CacheTTL } from '../cacheHelper';

export function setupUpdateRoutes(
  app: express.Express,
  apiLimiter: express.RequestHandler,
  sensitiveApiLimiter: express.RequestHandler
) {
  // Update management API endpoints
  app.get('/api/update/status', apiLimiter, async (req, res) => {
    try {
      // Try to get from cache first
      const cachedStatus = await cacheManager.get(CacheKeys.UPDATE_STATUS);
      if (cachedStatus) {
        return res.json({
          success: true,
          data: cachedStatus,
        });
      }

      const status = getUpdateStatus();

      // Cache the status
      await cacheManager.set(CacheKeys.UPDATE_STATUS, status, CacheTTL.SHORT);

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

  app.post('/api/update/install', sensitiveApiLimiter, async (req, res) => {
    try {
      await startManualUpdate();
      await logActivity({
        action: 'update_install',
        description: 'Manual update started',
        ip_address: req.ip,
        user_agent: req.get('user-agent'),
      });
      res.json({
        success: true,
        message: 'Update started successfully',
      });
    } catch (error) {
      await logActivity({
        action: 'update_install',
        description: 'Manual update failed',
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

  app.post('/api/update/rollback', sensitiveApiLimiter, async (req, res) => {
    try {
      await startManualRollback();
      await logActivity({
        action: 'update_rollback',
        description: 'Manual rollback started',
        ip_address: req.ip,
        user_agent: req.get('user-agent'),
      });
      res.json({
        success: true,
        message: 'Rollback started successfully',
      });
    } catch (error) {
      await logActivity({
        action: 'update_rollback',
        description: 'Manual rollback failed',
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
