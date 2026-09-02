import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { applyTenantRuntimeConfig } from './tenant';

const logger = {
  info: (...args: unknown[]) => console.info(...args),
  error: (...args: unknown[]) => console.error(...args),
};

async function startServer() {
  await applyTenantRuntimeConfig();

  const [
    { registerOAuthRoutes },
    { createUploadRouter },
    { createWebhookRouter },
    { createMetaSocialWebhookRouter },
    { createMetaBusinessOAuthCallbackRouter },
    { createExternalPlatformOAuthCallbackRouter },
    { createSocialPublishingScheduledRouter },
    { createCmsPublishingScheduledRouter },
    { createCmsTrashRetentionScheduledRouter },
    { createNotificationDigestScheduledRouter },
    { createTaskReminderScheduledRouter },
    { createIntegrationAlertScheduledRouter },
    { createCampaignAlertScheduledRouter },
    { createAppointmentReminderScheduledRouter },
    { createUpdateCheckScheduledRouter },
    { createWhatsAppSseRouter },
    { appRouter },
    { createContext },
    { serveStatic, setupVite },
    { initializeLicense },
    { initializeHeartbeat },
    { createLogger },
    { initSentry },
    { setupHealthCheckRoutes },
    { setupSwaggerDocs },
    { findAvailablePort },
    {
      setupSecurityMiddleware,
      setupCompressionMiddleware,
      setupBodyParser,
      setupAuthRateLimiting,
      createApiLimiter,
      createSensitiveApiLimiter,
    },
    { setupUpdateRoutes },
    { setupBackupRoutes },
    { setupConfigRoutes },
    { createLicenseDeliveryRouter },
    { reportUnauthorizedStartup },
  ] = await Promise.all([
    import('./oauth'),
    import('../api/uploadRoute'),
    import('../api/webhookRoutes'),
    import('../api/metaSocialWebhookRoute'),
    import('../api/metaBusinessOAuthRoute'),
    import('../api/externalPlatformOAuthRoute'),
    import('../api/socialPublishingScheduledRoute'),
    import('../api/cmsPublishingScheduledRoute'),
    import('../api/cmsTrashRetentionScheduledRoute'),
    import('../api/notificationDigestScheduledRoute'),
    import('../api/taskReminderScheduledRoute'),
    import('../api/integrationAlertScheduledRoute'),
    import('../api/campaignAlertScheduledRoute'),
    import('../api/appointmentReminderScheduledRoute'),
    import('../api/updateCheckScheduledRoute'),
    import('../integrations/whatsappSse'),
    import('../routers/routers'),
    import('./context'),
    import('./vite'),
    import('./license'),
    import('./heartbeat'),
    import('./logger'),
    import('./sentry'),
    import('./health'),
    import('./swagger'),
    import('./utils/portUtils'),
    import('./middleware'),
    import('./routes/updateRoutes'),
    import('./routes/backupRoutes'),
    import('./routes/configRoutes'),
    import('../api/licenseDeliveryRoute'),
    import('./unauthorizedStartupReport'),
  ]);

  initSentry();
  const serverLogger = createLogger('server');

  // Initialize license validation (Kill Switch)
  const _licenseInfo = initializeLicense(true);
  void (async () => {
    try {
      const [{ getDb }, { recordOperationalResult }] = await Promise.all([
        import('../database/db'),
        import('../services/operationalAlertService'),
      ]);
      const db = await getDb();
      if (!db) {
        return;
      }
      await recordOperationalResult(db, {
        key: 'license_validation',
        succeeded: _licenseInfo?.isValid === true,
        title: 'التحقق من الترخيص',
        failureMessage:
          'تعذر التحقق من الترخيص المحلي أو أنه غير صالح. راجع إعدادات الترخيص قبل تشغيل الميزات المقيدة.',
        recoveryMessage: 'عاد التحقق من الترخيص المحلي للعمل بنجاح بعد إخفاق سابق.',
        actionUrl: '/admin/management',
        actionLabel: 'عرض حالة النظام',
      });
    } catch {
      // لا يوقف تسجيل تنبيه الترخيص إقلاع الخادم.
    }
  })();

  if (_licenseInfo?.isValid) {
    initializeHeartbeat();
  } else if (_licenseInfo) {
    void reportUnauthorizedStartup(
      _licenseInfo.validationMessage || 'فشل التحقق المحلي من الترخيص'
    );
  }

  const app = express();
  const server = createServer(app);

  setupSecurityMiddleware(app);
  setupCompressionMiddleware(app);
  setupBodyParser(app);
  setupAuthRateLimiting(app);

  registerOAuthRoutes(app);
  app.use(createMetaBusinessOAuthCallbackRouter());
  app.use(createExternalPlatformOAuthCallbackRouter());
  app.use(createUploadRouter());
  app.use(createWebhookRouter());
  app.use(createMetaSocialWebhookRouter());
  app.use(createSocialPublishingScheduledRouter());
  app.use(createCmsPublishingScheduledRouter());
  app.use(createCmsTrashRetentionScheduledRouter());
  app.use(createNotificationDigestScheduledRouter());
  app.use(createTaskReminderScheduledRouter());
  app.use(createIntegrationAlertScheduledRouter());
  app.use(createCampaignAlertScheduledRouter());
  app.use(createAppointmentReminderScheduledRouter());
  app.use(createUpdateCheckScheduledRouter());
  app.use(createWhatsAppSseRouter());
  setupHealthCheckRoutes(app);
  setupSwaggerDocs(app);

  const apiLimiter = createApiLimiter();
  const sensitiveApiLimiter = createSensitiveApiLimiter();

  setupUpdateRoutes(app, apiLimiter, sensitiveApiLimiter);
  setupBackupRoutes(app, apiLimiter, sensitiveApiLimiter);
  setupConfigRoutes(app, apiLimiter, sensitiveApiLimiter);
  app.use(createLicenseDeliveryRouter());

  app.use(
    '/api/trpc',
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  if (process.env.NODE_ENV === 'development') {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || '3000');
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    serverLogger.info(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    serverLogger.info(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch((error) => {
  logger.error('Server failed to start:', error);
});
