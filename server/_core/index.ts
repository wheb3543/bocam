import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { registerOAuthRoutes } from './oauth';
import { createUploadRouter } from '../api/uploadRoute';
import { createWebhookRouter } from '../api/webhookRoutes';
import { createWhatsAppSseRouter } from '../integrations/whatsappSse';
import { appRouter } from '../routers/routers';
import { createContext } from './context';
import { serveStatic, setupVite } from './vite';
import { initializeLicense } from './license';
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

// Initialize Sentry for error tracking
initSentry();

const logger = createLogger('server');

async function startServer() {
  // Initialize license validation (Kill Switch)
  // Allow server to start in activation mode if license is missing
  const _licenseInfo = initializeLicense(true);

  // TEMPORARY: Disable heartbeat, update checker, and backup cron jobs for deployment
  // Initialize heartbeat system (Anti-Clock-Tampering) - only if license is valid
  // if (licenseInfo) {
  //   initializeHeartbeat();
  //   // Initialize update checker system - only if license is valid
  //   initializeUpdateChecker();
  //   // Initialize backup cron jobs - only if license is valid
  //   startBackupCronJobs();
  // }

  const app = express();
  const server = createServer(app);

  // Setup middleware
  setupSecurityMiddleware(app);
  setupCompressionMiddleware(app);
  setupBodyParser(app);
  setupAuthRateLimiting(app);

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // File upload route
  app.use(createUploadRouter());
  // WhatsApp Webhook routes (direct Express, not tRPC - Meta requirement)
  app.use(createWebhookRouter());
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
