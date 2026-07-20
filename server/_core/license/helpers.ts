/**
 * License Helpers
 * دوال مساعدة للتراخيص
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { createLogger } from '../logger';
import type { LicenseFile, LicensePayload, SignatureVerificationResult } from './types';

const logger = createLogger('license');

/**
 * Get Hardware ID (MAC Address)
 *
 * Reads the MAC address of the first non-internal network interface.
 * This serves as a unique hardware identifier for license binding.
 *
 * @returns Hardware ID (MAC Address in uppercase without colons)
 * @throws Error if no valid network interface is found
 */
export function getHardwareId(): string {
  try {
    const networkInterfaces = os.networkInterfaces();

    // Iterate through all network interfaces
    for (const interfaceName of Object.keys(networkInterfaces)) {
      const interfaces = networkInterfaces[interfaceName];

      if (!interfaces) {
        continue;
      }

      // Find first non-internal IPv4 interface
      for (const iface of interfaces) {
        if (
          iface.family === 'IPv4' &&
          !iface.internal &&
          iface.mac &&
          iface.mac !== '00:00:00:00:00:00' // Invalid MAC address
        ) {
          const hardwareId = iface.mac.replace(/:/g, '').toUpperCase();
          logger.info(`Hardware ID detected: ${hardwareId} (${interfaceName})`);
          return hardwareId;
        }
      }
    }

    // Fallback: use first available MAC address
    for (const interfaceName of Object.keys(networkInterfaces)) {
      const interfaces = networkInterfaces[interfaceName];

      if (!interfaces) {
        continue;
      }

      for (const iface of interfaces) {
        if (iface.mac && iface.mac !== '00:00:00:00:00:00') {
          const hardwareId = iface.mac.replace(/:/g, '').toUpperCase();
          logger.info(`Hardware ID (fallback): ${hardwareId} (${interfaceName})`);
          return hardwareId;
        }
      }
    }

    throw new Error('No valid network interface found for Hardware ID generation');
  } catch (error) {
    logger.error('Error getting Hardware ID:', error);
    throw new Error(
      `Failed to get Hardware ID: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { cause: error }
    );
  }
}

/**
 * Get license file path
 *
 * Returns the path to the license.json file.
 * First checks current directory, then checks root directory.
 *
 * @returns Path to license.json file
 */
export function getLicenseFilePath(): string {
  // Check current directory first
  const currentDirLicense = path.join(process.cwd(), 'license.json');
  if (fs.existsSync(currentDirLicense)) {
    return currentDirLicense;
  }

  // Check root directory
  const rootDirLicense = path.join(process.cwd(), '..', 'license.json');
  if (fs.existsSync(rootDirLicense)) {
    return rootDirLicense;
  }

  // Return default path in current directory
  return currentDirLicense;
}

/**
 * Check if license file exists
 *
 * Checks if the license.json file exists.
 *
 * @param licensePath - Path to license file
 * @returns True if license file exists, false otherwise
 */
export function licenseFileExists(licensePath?: string): boolean {
  try {
    const path = licensePath || getLicenseFilePath();
    return fs.existsSync(path);
  } catch {
    return false;
  }
}

/**
 * Load license file
 *
 * Reads and parses the license.json file.
 *
 * @param licensePath - Path to license file
 * @returns License file object
 * @throws Error if license file is not found or invalid
 */
export function loadLicenseFile(licensePath: string): LicenseFile {
  try {
    if (!fs.existsSync(licensePath)) {
      throw new Error(`License file not found: ${licensePath}`);
    }

    const licenseContent = fs.readFileSync(licensePath, 'utf-8');
    const licenseFile: LicenseFile = JSON.parse(licenseContent);

    // Validate license file structure
    if (
      !licenseFile.key ||
      !licenseFile.hardwareId ||
      !licenseFile.expiryDate ||
      !licenseFile.features
    ) {
      throw new Error('Invalid license file structure');
    }

    return licenseFile;
  } catch (error) {
    logger.error('Error loading license file:', error);
    throw new Error(
      `Failed to load license file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      { cause: error }
    );
  }
}

/**
 * Get public key for verification
 *
 * Returns the public key used for digital signature verification.
 * The public key is embedded in the application (secure).
 *
 * @returns Public key in PEM format
 * @throws Error if public key is not found
 */
export function getPublicKey(): string {
  // Try to load from file first
  const publicKeyPath = path.join(process.cwd(), 'license-keys', 'public-key.pem');
  if (fs.existsSync(publicKeyPath)) {
    return fs.readFileSync(publicKeyPath, 'utf-8');
  }

  // Fallback to root directory
  const rootPublicKeyPath = path.join(process.cwd(), '..', 'license-keys', 'public-key.pem');
  if (fs.existsSync(rootPublicKeyPath)) {
    return fs.readFileSync(rootPublicKeyPath, 'utf-8');
  }

  // Try loading from default location as last resort
  const defaultPath = path.join(process.cwd(), 'public-key.pem');
  if (fs.existsSync(defaultPath)) {
    return fs.readFileSync(defaultPath, 'utf-8');
  }

  throw new Error(`Public key not found. Please place the public key at ${publicKeyPath}`);
}

/**
 * Verify digital signature
 *
 * Verifies the RSA-2048 digital signature of the license.
 *
 * @param licenseKey - Base64 encoded license key
 * @returns Verification result
 */
export function verifySignature(licenseKey: string): SignatureVerificationResult {
  try {
    // Decode license key
    const licenseBuffer = Buffer.from(licenseKey, 'base64');
    const licenseObject = JSON.parse(licenseBuffer.toString('utf-8'));

    if (!licenseObject.payload || !licenseObject.signature) {
      return { valid: false, payload: null };
    }

    const payload: LicensePayload = licenseObject.payload;
    const signature = Buffer.from(licenseObject.signature, 'base64');

    // Get public key
    const publicKey = getPublicKey();

    // Verify signature
    const payloadString = JSON.stringify(payload);
    const isValid = crypto.verify(
      'sha256',
      Buffer.from(payloadString),
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST,
      },
      signature
    );

    return { valid: isValid, payload };
  } catch (error) {
    logger.error('Error verifying signature:', error);
    return { valid: false, payload: null };
  }
}
