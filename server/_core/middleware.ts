/**
 * Express Middleware Configuration
 * إعدادات البرمجيات الوسيطة لـ Express
 */

import express from 'express';
import type { IncomingMessage } from 'http';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import { asCompressionMiddleware } from './expressCompatibility';

export function setupSecurityMiddleware(app: express.Express) {
  // Security headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // CSP is managed separately for Vite dev/prod
    })
  );
}

export function setupCompressionMiddleware(app: express.Express) {
  // Response compression
  app.use(asCompressionMiddleware(compression()));
}

export function setupBodyParser(app: express.Express) {
  // Configure body parser with larger size limit for file uploads
  // Capture raw body for WhatsApp webhook signature verification (X-Hub-Signature-256)
  app.use(
    express.json({
      limit: '50mb',
      verify: (req: IncomingMessage & { rawBody?: Buffer }, _res, buf) => {
        req.rawBody = buf;
      },
    })
  );
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
}

export function createAuthLimiter() {
  // Rate limiting for auth endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // limit each IP to 20 auth requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later' },
  });
  return authLimiter;
}

export function createApiLimiter() {
  // Rate limiting for API endpoints
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
  });
  return apiLimiter;
}

export function createSensitiveApiLimiter() {
  // Rate limiting for sensitive API endpoints
  const sensitiveApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs for sensitive operations
    message: 'Too many requests from this IP, please try again later.',
  });
  return sensitiveApiLimiter;
}

export function setupAuthRateLimiting(app: express.Express) {
  const authLimiter = createAuthLimiter();
  app.use('/api/trpc/auth.login', authLimiter);
  app.use('/api/trpc/auth.register', authLimiter);
  app.use('/api/trpc/patientPortal.sendOtp', authLimiter);
  app.use('/api/trpc/patientPortal.verifyOtp', authLimiter);
  app.use('/api/trpc/patientPortal.loginWithPassword', authLimiter);
}
