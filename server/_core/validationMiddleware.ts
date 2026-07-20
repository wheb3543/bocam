/**
 * Request Validation Middleware
 * Middleware للتحقق من صحة الطلبات
 */

import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';
import { createLogger } from './logger';

const logger = createLogger('validation');

/**
 * Middleware للتحقق من صحة الطلب باستخدام Zod
 */
export function validateRequest<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // التحقق من body
      if (req.body) {
        const result = schema.safeParse(req.body);
        if (!result.success) {
          logger.warn('Validation failed', {
            errors: result.error.issues,
            path: req.path,
            method: req.method,
          });
          return res.status(400).json({
            error: 'Validation failed',
            details: result.error.issues,
          });
        }
        req.body = result.data;
      }

      next();
    } catch (error) {
      logger.error('Validation error:', error);
      return res.status(500).json({
        error: 'Internal validation error',
      });
    }
  };
}

/**
 * Middleware للتحقق من صحة query parameters
 */
export function validateQuery<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.query) {
        const result = schema.safeParse(req.query);
        if (!result.success) {
          logger.warn('Query validation failed', {
            errors: result.error.issues,
            path: req.path,
            method: req.method,
          });
          return res.status(400).json({
            error: 'Query validation failed',
            details: result.error.issues,
          });
        }
        Object.assign(req.query, result.data);
      }

      next();
    } catch (error) {
      logger.error('Query validation error:', error);
      return res.status(500).json({
        error: 'Internal validation error',
      });
    }
  };
}

/**
 * Middleware للتحقق من صحة route parameters
 */
export function validateParams<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.params) {
        const result = schema.safeParse(req.params);
        if (!result.success) {
          logger.warn('Params validation failed', {
            errors: result.error.issues,
            path: req.path,
            method: req.method,
          });
          return res.status(400).json({
            error: 'Params validation failed',
            details: result.error.issues,
          });
        }
        Object.assign(req.params, result.data);
      }

      next();
    } catch (error) {
      logger.error('Params validation error:', error);
      return res.status(500).json({
        error: 'Internal validation error',
      });
    }
  };
}

/**
 * Schemas شائعة للاستخدام
 */
export const commonSchemas = {
  // Pagination
  pagination: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 10)),
  }),

  // ID
  id: z.object({
    id: z.string().transform((val) => parseInt(val, 10)),
  }),

  // Email
  email: z.object({
    email: z.string().email('Invalid email format'),
  }),

  // Phone
  phone: z.object({
    phone: z.string().regex(/^\+?[0-9]{10,15}$/, 'Invalid phone format'),
  }),

  // Date range
  dateRange: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),

  // Sort
  sort: z.object({
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }),
};

/**
 * Middleware للتحقق من Content-Type
 */
export function validateContentType(allowedTypes: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentType = req.get('Content-Type');

    if (!contentType || !allowedTypes.some((type) => contentType.includes(type))) {
      logger.warn('Invalid content type', {
        contentType,
        allowedTypes,
        path: req.path,
      });
      return res.status(415).json({
        error: 'Unsupported Media Type',
        allowedTypes,
      });
    }

    next();
  };
}

/**
 * Middleware للتحقق من حجم الطلب
 */
export function validateRequestSize(maxSize: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.get('Content-Length') || '0', 10);

    if (contentLength > maxSize) {
      logger.warn('Request too large', {
        contentLength,
        maxSize,
        path: req.path,
      });
      return res.status(413).json({
        error: 'Payload Too Large',
        maxSize,
      });
    }

    next();
  };
}

/**
 * Middleware للتحقق من الرؤوس المطلوبة
 */
export function validateRequiredHeaders(headers: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const missingHeaders = headers.filter((header) => !req.get(header));

    if (missingHeaders.length > 0) {
      logger.warn('Missing required headers', {
        missingHeaders,
        path: req.path,
      });
      return res.status(400).json({
        error: 'Missing required headers',
        missingHeaders,
      });
    }

    next();
  };
}
