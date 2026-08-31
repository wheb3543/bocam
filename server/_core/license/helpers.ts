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
    const hasAnyNetworkInterface = Object.values(networkInterfaces).some(
      (interfaces) =>
        Array.isArray(interfaces) &&
        interfaces.some((iface) => iface && typeof iface.mac === 'string')
    );

    const configuredHardwareId = process.env.LICENSE_HARDWARE_ID?.trim();
    if (configuredHardwareId && hasAnyNetworkInterface) {
      const normalizedHardwareId = configuredHardwareId.replace(/:/g, '').toUpperCase();
      logger.info('Using configured License Hardware ID');
      return normalizedHardwareId;
    }

    const licenseFile = getLicenseFilePath();
    if (fs.existsSync(licenseFile)) {
      try {
        const parsed = JSON.parse(fs.readFileSync(licenseFile, 'utf-8')) as {
          hardwareId?: string;
        };
        const fileHardwareId = parsed.hardwareId?.trim();
        if (fileHardwareId && hasAnyNetworkInterface) {
          const normalizedHardwareId = fileHardwareId.replace(/:/g, '').toUpperCase();
          logger.info('Using hardware ID from license file fallback');
          return normalizedHardwareId;
        }
      } catch {
        // Ignore malformed local license file; continue with system detection.
      }
    }

    const networkInterfacesNow = os.networkInterfaces();

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
    for (const interfaceName of Object.keys(networkInterfacesNow)) {
      const interfaces = networkInterfacesNow[interfaceName];

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
export function getVerificationPublicKeys(): string[] {
  const roots = [process.cwd(), path.join(process.cwd(), '..')];
  const keyNames = ['public-key.pem', 'previous-public-key.pem'];
  const keys: string[] = [];

  for (const root of roots) {
    for (const keyName of keyNames) {
      const keyPath = path.join(root, 'license-keys', keyName);
      if (fs.existsSync(keyPath)) {
        const key = fs.readFileSync(keyPath, 'utf-8');
        if (!keys.includes(key)) {
          keys.push(key);
        }
      }
    }
  }

  const legacyPath = path.join(process.cwd(), 'public-key.pem');
  if (fs.existsSync(legacyPath)) {
    const key = fs.readFileSync(legacyPath, 'utf-8');
    if (!keys.includes(key)) {
      keys.push(key);
    }
  }

  if (keys.length === 0) {
    throw new Error(
      `Public key not found. Please place the public key at ${path.join(process.cwd(), 'license-keys', 'public-key.pem')}`
    );
  }
  return keys;
}

export function getPublicKey(): string {
  return getVerificationPublicKeys()[0];
}

export function verifySignatureWithPublicKeys(
  licenseKey: string,
  publicKeys: string[]
): SignatureVerificationResult {
  const licenseBuffer = Buffer.from(licenseKey, 'base64');
  const licenseObject = JSON.parse(licenseBuffer.toString('utf-8'));
  if (!licenseObject.payload || !licenseObject.signature) {
    return { valid: false, payload: null };
  }

  const payload: LicensePayload = licenseObject.payload;
  const signature = Buffer.from(licenseObject.signature, 'base64');
  const payloadString = JSON.stringify(payload);
  const valid = publicKeys.some((publicKey) =>
    crypto.verify(
      'sha256',
      Buffer.from(payloadString),
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST,
      },
      signature
    )
  );
  return { valid, payload };
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
    return verifySignatureWithPublicKeys(licenseKey, getVerificationPublicKeys());
  } catch (error) {
    logger.error('Error verifying signature:', error);
    return { valid: false, payload: null };
  }
}
