import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { registerOAuthRoutes } from './oauth';
import { createUploadRouter } from '../api/uploadRoute';
import { createWebhookRouter } from '../api/webhookRoutes';
import { createMetaSocialWebhookRouter } from '../api/metaSocialWebhookRoute';
import { createMetaBusinessOAuthCallbackRouter } from '../api/metaBusinessOAuthRoute';
import { createExternalPlatformOAuthCallbackRouter } from '../api/externalPlatformOAuthRoute';
import { createSocialPublishingScheduledRouter } from '../api/socialPublishingScheduledRoute';
import { createCmsPublishingScheduledRouter } from '../api/cmsPublishingScheduledRoute';
import { createCmsTrashRetentionScheduledRouter } from '../api/cmsTrashRetentionScheduledRoute';
import { createNotificationDigestScheduledRouter } from '../api/notificationDigestScheduledRoute';
import { createTaskReminderScheduledRouter } from '../api/taskReminderScheduledRoute';
import { createIntegrationAlertScheduledRouter } from '../api/integrationAlertScheduledRoute';
import { createWhatsAppSseRouter } from '../integrations/whatsappSse';
import { appRouter } from '../routers/routers';
import { createContext } from './context';
import { serveStatic, setupVite } from './vite';
import { initializeLicense } from './license';
import { initializeHeartbeat } from './heartbeat';
import { createLogger } from './logger';
import { initSentry } from './sentry';
import { setupHealthCheckRoutes } from './health';
import { setupSwaggerDocs } from './swagger';
import { findAvailablePort } from './utils/portUtils';
import {
  setupSecurityMiddleware,
  setupCompressionMiddleware,
  setupBodyParser,
  setupAuthRateLimiting,
  createApiLimiter,
  createSensitiveApiLimiter,
} from './middleware';
import { setupUpdateRoutes } from './routes/updateRoutes';
import { setupBackupRoutes } from './routes/backupRoutes';
import { setupConfigRoutes } from './routes/configRoutes';
import { createLicenseDeliveryRouter } from '../api/licenseDeliveryRoute';
import { reportUnauthorizedStartup } from './unauthorizedStartupReport';

// Initialize Sentry for error tracking
initSentry();

const logger = createLogger('server');

async function startServer() {
  // Initialize license validation (Kill Switch)
  // Allow server to start in activation mode if license is missing
  const _licenseInfo = initializeLicense(true);

  // Initialize the outbound heartbeat only for a locally valid signed license.
  if (_licenseInfo?.isValid) {
    initializeHeartbeat();
  } else if (_licenseInfo) {
    void reportUnauthorizedStartup(
      _licenseInfo.validationMessage || 'فشل التحقق المحلي من الترخيص'
    );
  }

  const app = express();
  const server = createServer(app);

  // Setup middleware
  setupSecurityMiddleware(app);
  setupCompressionMiddleware(app);
  setupBodyParser(app);
  setupAuthRateLimiting(app);

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // Meta Business OAuth callback runs before tRPC and static fallthrough.
  app.use(createMetaBusinessOAuthCallbackRouter());
  app.use(createExternalPlatformOAuthCallbackRouter());
  // File upload route
  app.use(createUploadRouter());
  // WhatsApp Webhook routes (direct Express, not tRPC - Meta requirement)
  app.use(createWebhookRouter());
  // Meta Social Webhook routes for Messenger, Instagram, and Facebook Page events
  app.use(createMetaSocialWebhookRouter());
  // Heartbeat callback for social publishing schedules. It is activated after deployment.
  app.use(createSocialPublishingScheduledRouter());
  // Heartbeat callback for deferred CMS publication. It is activated after deployment.
  app.use(createCmsPublishingScheduledRouter());
  // Heartbeat callback for irreversible CMS trash cleanup after the retention window.
  app.use(createCmsTrashRetentionScheduledRouter());
  // Heartbeat callback for opt-in daily unread-notification digests.
  app.use(createNotificationDigestScheduledRouter());
  // Heartbeat callback for task due-date reminders and overdue alerts.
  app.use(createTaskReminderScheduledRouter());
  // Heartbeat callback for integration error and authorization expiry alerts.
  app.use(createIntegrationAlertScheduledRouter());
  // WhatsApp SSE endpoints for realtime chat updates
  app.use(createWhatsAppSseRouter());
  // Health check and metrics endpoints
  setupHealthCheckRoutes(app);
  // API documentation with Swagger
  setupSwaggerDocs(app);

  // Setup rate limiters
  const apiLimiter = createApiLimiter();
  const sensitiveApiLimiter = createSensitiveApiLimiter();

  // Setup API routes
  setupUpdateRoutes(app, apiLimiter, sensitiveApiLimiter);
  setupBackupRoutes(app, apiLimiter, sensitiveApiLimiter);
  setupConfigRoutes(app, apiLimiter, sensitiveApiLimiter);
  // Idea Hub can deliver a signed license directly; bocam verifies the RSA signature and hardware ID locally.
  app.use(createLicenseDeliveryRouter());

  // tRPC API
  app.use(
    '/api/trpc',
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  // NOTE: SW routes and manifest routes are handled inside serveStatic/setupVite
  if (process.env.NODE_ENV === 'development') {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || '3000');
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    logger.info(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    logger.info(`Server running on http://localhost:${port}/`);

    // Initialize cron scheduler for automatic deactivation
    // initSimpleCronScheduler(); // Disabled: Auto-deactivation feature removed per user request

    // Initialize WhatsApp appointment reminders scheduler (every 30 minutes)
    import('../tasks/cron/appointmentReminders')
      .then(({ initAppointmentRemindersScheduler }) => {
        try {
          initAppointmentRemindersScheduler();
        } catch (error) {
          logger.error('[AppointmentReminders] Failed to initialize scheduler:', error);
        }
      })
      .catch((error) => {
        logger.error('[AppointmentReminders] Failed to load appointment reminders module:', error);
      });
  });
}

startServer().catch((error) => {
  logger.error('Server failed to start:', error);
});
