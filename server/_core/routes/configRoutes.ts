/**
 * System Configuration Routes
 * مسارات تكوين النظام
 */

import express from 'express';
import { logActivity } from '../activityLogger';
import { cacheManager } from '../../services/redis';
import { CacheKeys, CacheTTL } from '../cacheHelper';

export function setupConfigRoutes(
  app: express.Express,
  apiLimiter: express.RequestHandler,
  sensitiveApiLimiter: express.RequestHandler
) {
  // System configuration API endpoints
  app.get('/api/config', apiLimiter, async (req, res) => {
    try {
      // Try to get from cache first
      const cachedConfig = await cacheManager.get(CacheKeys.CONFIG);
      if (cachedConfig) {
        return res.json({
          success: true,
          data: cachedConfig,
        });
      }

      // Mock data for now - in production, this would read from actual config
      const systemConfig = {
        sslEnabled: true,
        sslExpiry: Math.floor(Date.now() / 1000) + 90 * 24 * 60 * 60,
        sslIssuer: "Let's Encrypt",
        backupEnabled: true,
        backupSchedule: '0 2 * * *',
        backupRetention: 30,
        cloudBackupEnabled: true,
        cloudProvider: 'AWS S3',
        notificationsEnabled: true,
        notificationEmail: 'admin@example.com',
        maintenanceMode: false,
        debugMode: false,
      };

      // Cache the configuration
      await cacheManager.set(CacheKeys.CONFIG, systemConfig, CacheTTL.LONG);

      res.json({
        success: true,
        data: systemConfig,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  app.post('/api/config', sensitiveApiLimiter, async (req, res) => {
    try {
      // In production, this would update the actual config
      // For now, just return success

      // Invalidate cache after update
      await cacheManager.delete(CacheKeys.CONFIG);

      await logActivity({
        action: 'config_update',
        description: 'System configuration updated',
        metadata: req.body,
        ip_address: req.ip,
        user_agent: req.get('user-agent'),
      });
      res.json({
        success: true,
        message: 'Configuration updated successfully',
      });
    } catch (error) {
      await logActivity({
        action: 'config_update',
        description: 'System configuration update failed',
        status: 'error',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        metadata: req.body,
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
