import "dotenv/config";
import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { createServer } from "http";
import net from "net";
import path from "path";
import fs from "fs";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { createUploadRouter } from "../uploadRoute";
import { createWebhookRouter } from "../webhookRoutes";
import { createWhatsAppSseRouter } from "../whatsappSse";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { initializeLicense } from "./license";
import { initializeHeartbeat } from "./heartbeat";
import { initializeUpdateChecker, getUpdateStatus, startManualUpdate, startManualRollback } from "./updateChecker";
import { logActivity, logUpdate, updateUpdateLog, logBackup, updateBackupLog, createNotification } from "./activityLogger";
import { cacheManager } from "../redis";
import { CacheKeys, CacheTTL, cachedQuery } from "./cacheHelper";
// import { initSimpleCronScheduler } from "../cron/scheduler";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  // Initialize license validation (Kill Switch)
  // Allow server to start in activation mode if license is missing
  const licenseInfo = initializeLicense(true);
  
  // Initialize heartbeat system (Anti-Clock-Tampering) - only if license is valid
  if (licenseInfo) {
    initializeHeartbeat();
    // Initialize update checker system - only if license is valid
    initializeUpdateChecker();
  }
  
  const app = express();
  const server = createServer(app);

  // Security headers
  app.use(helmet({
    contentSecurityPolicy: false, // CSP is managed separately for Vite dev/prod
  }));

  // Rate limiting for auth endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // limit each IP to 20 auth requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later" },
  });
  app.use("/api/trpc/auth.login", authLimiter);
  app.use("/api/trpc/auth.register", authLimiter);
  app.use("/api/trpc/patientPortal.sendOtp", authLimiter);
  app.use("/api/trpc/patientPortal.verifyOtp", authLimiter);
  app.use("/api/trpc/patientPortal.loginWithPassword", authLimiter);

  // Configure body parser with larger size limit for file uploads
  // Capture raw body for WhatsApp webhook signature verification (X-Hub-Signature-256)
  app.use(express.json({
    limit: "50mb",
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // File upload route
  app.use(createUploadRouter());
  // WhatsApp Webhook routes (direct Express, not tRPC - Meta requirement)
  app.use(createWebhookRouter());
  // WhatsApp SSE endpoints for realtime chat updates
  app.use(createWhatsAppSseRouter());

  // Rate limiting for API endpoints
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
  });

  const sensitiveApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs for sensitive operations
    message: 'Too many requests from this IP, please try again later.',
  });

  // Update management API endpoints
  app.get("/api/update/status", apiLimiter, async (req, res) => {
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
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.post("/api/update/install", sensitiveApiLimiter, async (req, res) => {
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
        message: "Update started successfully",
      });
    } catch (error) {
      await logActivity({
        action: 'update_install',
        description: 'Manual update failed',
        status: 'error',
        error_message: error instanceof Error ? error.message : "Unknown error",
        ip_address: req.ip,
        user_agent: req.get('user-agent'),
      });
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.post("/api/update/rollback", sensitiveApiLimiter, async (req, res) => {
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
        message: "Rollback started successfully",
      });
    } catch (error) {
      await logActivity({
        action: 'update_rollback',
        description: 'Manual rollback failed',
        status: 'error',
        error_message: error instanceof Error ? error.message : "Unknown error",
        ip_address: req.ip,
        user_agent: req.get('user-agent'),
      });
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Backup management API endpoints
  app.get("/api/backup/status", apiLimiter, (req, res) => {
    try {
      // Mock data for now - in production, this would read from actual backup system
      const backupStatus = {
        lastBackup: Math.floor(Date.now() / 1000) - 3600,
        lastBackupSize: 256,
        nextBackup: Math.floor(Date.now() / 1000) + (23 * 60 * 60),
        backupEnabled: true,
        cloudEnabled: true,
        retentionDays: 30,
        totalBackups: 45,
        totalSize: 10240,
      };
      res.json({
        success: true,
        data: backupStatus,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.get("/api/backup/history", apiLimiter, (req, res) => {
    try {
      // Mock data for now - in production, this would read from actual backup system
      const backupHistory = [
        {
          id: '1',
          timestamp: Math.floor(Date.now() / 1000) - 3600,
          type: 'daily',
          size: 256,
          status: 'completed',
          location: 'both',
        },
        {
          id: '2',
          timestamp: Math.floor(Date.now() / 1000) - (25 * 60 * 60),
          type: 'daily',
          size: 255,
          status: 'completed',
          location: 'both',
        },
        {
          id: '3',
          timestamp: Math.floor(Date.now() / 1000) - (49 * 60 * 60),
          type: 'daily',
          size: 254,
          status: 'completed',
          location: 'both',
        },
      ];
      res.json({
        success: true,
        data: backupHistory,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.post("/api/backup/create", sensitiveApiLimiter, async (req, res) => {
    try {
      // In production, this would trigger the backup script
      // For now, just return success
      await logActivity({
        action: 'backup_create',
        description: 'Manual backup started',
        ip_address: req.ip,
        user_agent: req.get('user-agent'),
      });
      res.json({
        success: true,
        message: "Backup started successfully",
      });
    } catch (error) {
      await logActivity({
        action: 'backup_create',
        description: 'Manual backup failed',
        status: 'error',
        error_message: error instanceof Error ? error.message : "Unknown error",
        ip_address: req.ip,
        user_agent: req.get('user-agent'),
      });
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // System configuration API endpoints
  app.get("/api/config", apiLimiter, async (req, res) => {
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
        sslExpiry: Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60),
        sslIssuer: "Let's Encrypt",
        backupEnabled: true,
        backupSchedule: "0 2 * * *",
        backupRetention: 30,
        cloudBackupEnabled: true,
        cloudProvider: "AWS S3",
        notificationsEnabled: true,
        notificationEmail: "admin@example.com",
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
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  app.post("/api/config", sensitiveApiLimiter, async (req, res) => {
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
        message: "Configuration updated successfully",
      });
    } catch (error) {
      await logActivity({
        action: 'config_update',
        description: 'System configuration update failed',
        status: 'error',
        error_message: error instanceof Error ? error.message : "Unknown error",
        metadata: req.body,
        ip_address: req.ip,
        user_agent: req.get('user-agent'),
      });
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  // NOTE: SW routes and manifest routes are handled inside serveStatic/setupVite
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    
    // Initialize cron scheduler for automatic deactivation
    // initSimpleCronScheduler(); // Disabled: Auto-deactivation feature removed per user request

    // Initialize WhatsApp appointment reminders scheduler (every 30 minutes)
    import("../cron/appointmentReminders").then(({ initAppointmentRemindersScheduler }) => {
      try {
        initAppointmentRemindersScheduler();
      } catch (error) {
        console.error("[AppointmentReminders] Failed to initialize scheduler:", error);
      }
    }).catch((error) => {
      console.error("[AppointmentReminders] Failed to load appointment reminders module:", error);
    });
  });
}

startServer().catch(console.error);
