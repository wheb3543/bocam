/**
 * WhatsApp Settings Utilities
 * أدوات إعدادات واتساب
 */

import { createLogger } from '../../../_core/logger';

const logger = createLogger('whatsapp-settings');

// Logging helper for sensitive operations
export function logOperation(operation: string, userId: number, details: unknown) {
  logger.info(`${operation} | User: ${userId} | Details:`, JSON.stringify(details));
}
