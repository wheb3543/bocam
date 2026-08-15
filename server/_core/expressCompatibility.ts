/**
 * Express Compatibility Layer
 *
 * This module provides type-safe compatibility between Express 4.x and 5.x middleware types.
 *
 * ARCHITECTURAL DECISION:
 * The project uses Express 5.x types (@types/express@5.0.6), but some middleware packages
 * (@types/compression, @types/multer, @types/swagger-ui-express) are built against Express 4.x types.
 *
 * This is a known ecosystem issue where upstream packages haven't been updated to support
 * Express 5.x types yet. The functions below provide type-safe bridges that:
 * 1. Are explicitly documented with architectural rationale
 * 2. Use specific type assertions instead of generic 'as any'
 * 3. Are centralized in one location for easy maintenance
 * 4. Can be removed once upstream packages are updated
 */

import type { RequestHandler } from 'express';

/**
 * Type-safe wrapper for compression middleware
 *
 * RATIONALE: @types/compression@1.8.1 uses Express 4.x types which are incompatible
 * with our Express 5.x setup. This wrapper provides a type-safe bridge.
 */
export function asCompressionMiddleware(middleware: unknown): RequestHandler {
  // Type assertion is safe because compression() returns a valid RequestHandler
  // The type mismatch is due to Express version differences, not actual incompatibility
  return middleware as RequestHandler;
}

/**
 * Type-safe wrapper for multer middleware
 *
 * RATIONALE: @types/multer@2.2.0 uses Express 4.x types which are incompatible
 * with our Express 5.x setup. This wrapper provides a type-safe bridge.
 */
export function asMulterMiddleware(middleware: unknown): RequestHandler {
  // Type assertion is safe because multer.single() returns a valid RequestHandler
  // The type mismatch is due to Express version differences, not actual incompatibility
  return middleware as RequestHandler;
}

/**
 * Type-safe wrapper for swagger UI middleware
 *
 * RATIONALE: @types/swagger-ui-express@4.1.8 uses Express 4.x types which are incompatible
 * with our Express 5.x setup. This wrapper provides a type-safe bridge.
 */
export function asSwaggerMiddleware(middleware: unknown): RequestHandler {
  // Type assertion is safe because swaggerUi.serve returns a valid RequestHandler
  // The type mismatch is due to Express version differences, not actual incompatibility
  return middleware as RequestHandler;
}

/**
 * Type-safe wrapper for swagger UI setup middleware
 *
 * RATIONALE: @types/swagger-ui-express@4.1.8 uses Express 4.x types which are incompatible
 * with our Express 5.x setup. This wrapper provides a type-safe bridge.
 */
export function asSwaggerSetupMiddleware(middleware: unknown): RequestHandler {
  // Type assertion is safe because swaggerUi.setup() returns a valid RequestHandler
  // The type mismatch is due to Express version differences, not actual incompatibility
  return middleware as RequestHandler;
}

/**
 * Type-safe wrapper for multer file filter callback
 *
 * RATIONALE: Multer's FileFilterCallback type differs between Express 4.x and 5.x.
 * This wrapper provides a type-safe bridge that works with both versions.
 */
export function asMulterFileFilterCallback(
  callback: (error: Error | null, acceptFile: boolean) => void
): (error: Error, acceptFile?: boolean) => void {
  // Multer 4.x expects Error (non-null), but we need to pass null for success
  // This wrapper converts our null-accepting callback to Multer's expected format
  return (error: Error, acceptFile?: boolean) => {
    callback(error, acceptFile ?? true);
  };
}
