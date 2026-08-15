/**
 * License Management System
 *
 * Local cryptographic license validation system that works offline.
 * Uses Hardware-ID binding with RSA-2048 digital signatures.
 * Acts as a Kill Switch - terminates server if license is invalid.
 *
 * Security Features:
 * - Hardware-ID based licensing (MAC Address)
 * - RSA-2048 digital signature verification
 * - Offline validation (no internet required)
 * - Kill Switch on invalid license
 * - Feature flag support
 *
 * @module license
 */

import { createLogger } from './logger';
import {
  getHardwareId,
  getLicenseFilePath,
  licenseFileExists,
  loadLicenseFile,
  verifySignature,
} from './license/helpers';
import { validateLicensePayload, createInvalidLicenseInfo } from './license/validation';
import type { LicenseInfo } from './license/types';

const logger = createLogger('license');

/**
 * Validate license
 *
 * Comprehensive license validation including:
 * - Digital signature verification
 * - Hardware ID matching
 * - Expiry date check
 * - Feature flag validation
 *
 * Acts as a Kill Switch - terminates server if license is invalid.
 *
 * @returns License information
 * @throws Error and terminates process if license is invalid
 */
export function validateLicense(): LicenseInfo {
  logger.info('License Validation Starting...');
  logger.info('');

  try {
    // Get license file path
    const licensePath = getLicenseFilePath();
    logger.info(`License file path: ${licensePath}`);

    // Load license file
    const licenseFile = loadLicenseFile(licensePath);
    logger.info('License file loaded successfully');

    // Verify digital signature and validate payload
    const { valid, payload } = verifySignature(licenseFile.key);

    if (!valid || !payload) {
      return createInvalidLicenseInfo('Invalid digital signature', undefined, getHardwareId());
    }

    // Validate license payload
    return validateLicensePayload(payload);
  } catch (error) {
    // TEMPORARY: Disable Kill Switch for deployment until central server is ready
    // Return invalid license info instead of crashing server
    if (error instanceof Error && error.message.includes('process.exit')) {
      // Re-throw process.exit errors
      throw error;
    }

    logger.error('LICENSE VALIDATION FAILED:', error);
    logger.error('');
    logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.error('LICENSE INVALID: License validation error');
    logger.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.error('');
    logger.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    logger.error('');

    return createInvalidLicenseInfo(
      error instanceof Error ? error.message : 'Unknown error',
      undefined,
      getHardwareId()
    );
  }
}

/**
 * Check if a feature is enabled
 *
 * Checks if a specific feature is enabled in the current license.
 *
 * @param feature - Feature name to check
 * @returns True if feature is enabled, false otherwise
 */
export function isFeatureEnabled(feature: string): boolean {
  try {
    const licenseInfo = validateLicense();
    return licenseInfo.features.includes(feature) || licenseInfo.features.includes('*');
  } catch (error) {
    logger.error('Error checking feature:', error);
    return false;
  }
}

/**
 * Get enabled features
 *
 * Returns list of all enabled features from the current license.
 *
 * @returns Array of enabled feature names
 */
export function getEnabledFeatures(): string[] {
  try {
    const licenseInfo = validateLicense();
    return licenseInfo.features;
  } catch (error) {
    logger.error('Error getting features:', error);
    return [];
  }
}

/**
 * License middleware initialization
 *
 * Initializes the license validation system.
 * This should be called during application startup.
 *
 * @param allowMissing - If true, allows server to start even if license file is missing
 * @returns License information or null if license is missing and allowMissing is true
 */
export function initializeLicense(allowMissing: boolean = false): LicenseInfo | null {
  try {
    logger.info('Initializing License System...');
    logger.info('');

    // Check if license file exists
    const licensePath = getLicenseFilePath();
    if (!licenseFileExists(licensePath)) {
      if (allowMissing) {
        logger.warn('License file not found. Server will start in activation mode.');
        logger.info(`Expected path: ${licensePath}`);
        logger.info('');
        return null;
      } else {
        throw new Error(`License file not found: ${licensePath}`);
      }
    }

    const licenseInfo = validateLicense();

    logger.info('License System initialized successfully');
    logger.info('');

    return licenseInfo;
  } catch (error) {
    logger.error('Failed to initialize license system:', error);
    throw error;
  }
}

// Re-export helper functions for backward compatibility
export { getHardwareId, licenseFileExists } from './license/helpers';

// Re-export types
export type {
  LicensePayload,
  LicenseInfo,
  LicenseFile,
  SignatureVerificationResult,
  ValidationErrorType,
  ValidationError,
} from './license/types';
