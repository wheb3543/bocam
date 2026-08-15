/**
 * License Validation
 * منطق التحقق من التراخيص
 */

import { createLogger } from '../logger';
import { getHardwareId, verifySignature } from './helpers';
import type { LicensePayload, LicenseInfo, ValidationErrorType } from './types';

const logger = createLogger('license');

/**
 * Create invalid license info
 *
 * Creates a LicenseInfo object with isValid=false
 *
 * @param message - Validation error message
 * @param payload - Optional license payload to use for partial info
 * @param currentHardwareId - Current hardware ID
 * @returns Invalid license info
 */
export function createInvalidLicenseInfo(
  message: string,
  payload?: LicensePayload,
  currentHardwareId?: string
): LicenseInfo {
  return {
    hardwareId: payload?.hid || currentHardwareId || getHardwareId(),
    expiryDate: payload?.exp || 0,
    features: payload?.feat || [],
    issuedAt: payload?.iat || 0,
    version: payload?.ver || '1.0',
    isValid: false,
    validationMessage: message,
  };
}

/**
 * Log validation error
 *
 * Logs a formatted validation error message
 *
 * @param errorType - Type of validation error
 * @param message - Error message
 * @param details - Additional details to log
 */
function logValidationError(
  errorType: ValidationErrorType,
  message: string,
  details?: Record<string, unknown>
): void {
  logger.error('LICENSE VALIDATION FAILED:', errorType);
  logger.error('');
  logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  logger.error(`LICENSE INVALID: ${message}`);
  logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  logger.error('');

  if (details) {
    Object.entries(details).forEach(([key, value]) => {
      logger.error(`${key}: ${value}`);
    });
    logger.error('');
  }
}

/**
 * Validate digital signature
 *
 * Verifies the RSA-2048 digital signature of the license.
 *
 * @param licenseKey - Base64 encoded license key
 * @returns License payload if valid, null otherwise
 */
function _validateDigitalSignature(licenseKey: string): LicensePayload | null {
  logger.info('Verifying digital signature...');
  const { valid, payload } = verifySignature(licenseKey);

  if (!valid || !payload) {
    logValidationError('signature_invalid', 'License signature is invalid');
    return null;
  }

  logger.info('Digital signature verified');
  return payload;
}

/**
 * Validate hardware ID
 *
 * Checks if the license hardware ID matches the current hardware ID.
 *
 * @param payload - License payload
 * @returns True if hardware ID matches, false otherwise
 */
function validateHardwareId(payload: LicensePayload): boolean {
  logger.info('Validating Hardware ID...');
  const currentHardwareId = getHardwareId();

  logger.info(`- License Hardware ID: ${payload.hid}`);
  logger.info(`- Current Hardware ID: ${currentHardwareId}`);

  if (payload.hid !== currentHardwareId) {
    logValidationError('hardware_id_mismatch', 'Hardware ID does not match license', {
      Expected: payload.hid,
      Current: currentHardwareId,
    });
    logger.error('To fix this issue:');
    logger.error('1. Generate a new license for this machine');
    logger.error('2. Run: pnpm license:generate <hardwareId> <expiry> <features>');
    logger.error('');
    return false;
  }

  logger.info('Hardware ID matched');
  return true;
}

/**
 * Validate expiry date
 *
 * Checks if the license has expired.
 *
 * @param payload - License payload
 * @returns True if license is not expired, false otherwise
 */
function validateExpiryDate(payload: LicensePayload): boolean {
  logger.info('Validating expiry date...');
  const currentTime = Math.floor(Date.now() / 1000);

  logger.info(`- License expiry: ${new Date(payload.exp * 1000).toISOString()}`);
  logger.info(`- Current time: ${new Date(currentTime * 1000).toISOString()}`);

  if (payload.exp < currentTime) {
    logValidationError('license_expired', 'License has expired', {
      'License expired on': new Date(payload.exp * 1000).toISOString(),
    });
    logger.error('To fix this issue:');
    logger.error('1. Renew your license');
    logger.error('2. Contact support for a new license key');
    logger.error('');
    return false;
  }

  logger.info('License is valid (not expired)');

  // Calculate days until expiry
  const daysUntilExpiry = Math.floor((payload.exp - currentTime) / (24 * 60 * 60));
  logger.info(`License valid for: ${daysUntilExpiry} days`);

  return true;
}

/**
 * Validate features
 *
 * Checks if the license has enabled features.
 *
 * @param payload - License payload
 * @returns True if features are enabled, false otherwise
 */
function validateFeatures(payload: LicensePayload): boolean {
  logger.info('Validating features...');
  logger.info(`- Enabled features: ${payload.feat.join(', ')}`);

  if (!payload.feat || payload.feat.length === 0) {
    logValidationError('no_features_enabled', 'No features enabled in license');
    return false;
  }

  logger.info(`Features validated (${payload.feat.length} features enabled)`);
  return true;
}

/**
 * Validate license payload
 *
 * Comprehensive license validation including:
 * - Hardware ID matching
 * - Expiry date check
 * - Feature flag validation
 *
 * @param payload - License payload
 * @returns License information
 */
export function validateLicensePayload(payload: LicensePayload): LicenseInfo {
  const currentHardwareId = getHardwareId();

  // Validate hardware ID
  if (!validateHardwareId(payload)) {
    return createInvalidLicenseInfo('Hardware ID mismatch', payload, currentHardwareId);
  }

  // Validate expiry date
  if (!validateExpiryDate(payload)) {
    return createInvalidLicenseInfo('License has expired', payload, currentHardwareId);
  }

  // Validate features
  if (!validateFeatures(payload)) {
    return createInvalidLicenseInfo('No features enabled', payload, currentHardwareId);
  }

  logger.info('');
  logger.info('LICENSE VALIDATION SUCCESSFUL');
  logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  logger.info('');

  // Return valid license info
  return {
    hardwareId: payload.hid,
    expiryDate: payload.exp,
    features: payload.feat,
    issuedAt: payload.iat,
    version: payload.ver,
    isValid: true,
    validationMessage: 'License is valid',
  };
}
